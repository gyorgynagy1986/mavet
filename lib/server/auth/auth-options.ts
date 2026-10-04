import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { headers } from "next/headers"
import mongoose from "mongoose"
import dbConnect from "@/lib/db-connect"
import { UserModel, type UserRole, isAdminRole } from "@/lib/models/user"
import { rateLimit } from "@/lib/server/rate-limit"
import { createAuthLogger } from "@/lib/server/auth/auth-logger"
import {
  deleteVerificationCode,
  getVerificationData,
  hasExceededMaxAttempts,
  incrementAttempts,
  isPlausibleEmail,
  isValidCodeFormat,
  normalizeEmail,
  secureCodeCompare,
  MAX_ATTEMPTS,
} from "@/lib/server/auth/verification"

import { MEMBER_LOGIN_PATH } from "@/lib/auth-paths"
import { verifyPassword } from "@/lib/server/members"

/** Admin session lifetime. Shorter than a consumer app: this is an admin tool. */
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

/**
 * How often the role is re-read from the database while a session is alive.
 * Without this a revoked admin would keep API access until the JWT expires.
 * The process-level cache makes the throttle real for server-side
 * `getServerSession` calls, where the refreshed cookie is never written back.
 */
const ROLE_REFRESH_MS = 60_000
const roleCache = new Map<string, { role: UserRole; at: number }>()
const ROLE_CACHE_MAX = 500

async function requestContext(): Promise<{ ip: string; userAgent: string | null }> {
  try {
    const h = await headers()
    return {
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown",
      userAgent: h.get("user-agent"),
    }
  } catch {
    return { ip: "unknown", userAgent: null }
  }
}

async function readRole(userId: string): Promise<UserRole> {
  await dbConnect()
  const doc = await UserModel.findById(userId).select({ role: 1 }).lean<{ role?: UserRole } | null>()
  // Deleted user or missing role → USER: fails every admin gate.
  return doc?.role ?? "USER"
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  // Admins sign in on the hidden page, members on /belepes; both providers
  // return the same session shape, the role decides what the account can do.
  pages: { signIn: MEMBER_LOGIN_PATH, error: MEMBER_LOGIN_PATH },
  providers: [
    CredentialsProvider({
      id: "admin-otp",
      name: "E-mail és belépési kód",
      credentials: {
        email: { label: "E-mail", type: "email" },
        code: { label: "Kód", type: "text" },
      },
      async authorize(credentials) {
        const { ip, userAgent } = await requestContext()
        const log = createAuthLogger("admin-otp", userAgent)

        const rawEmail = typeof credentials?.email === "string" ? credentials.email : ""
        const code = credentials?.code

        if (!rawEmail || !code) {
          log.loginFailed(ip, rawEmail || "unknown", "missing_credentials")
          throw new Error("Hiányzó adatok.")
        }
        const email = normalizeEmail(rawEmail)
        if (!isPlausibleEmail(email)) {
          log.loginFailed(ip, email, "invalid_email_format")
          throw new Error("Érvénytelen e-mail-cím.")
        }
        if (!isValidCodeFormat(code)) {
          log.invalidCodeFormat(ip, email)
          throw new Error("A kód 6 számjegy.")
        }

        // Per-IP brake on code guessing across many addresses (fails open on Redis outage).
        const ipLimit = await rateLimit("admin-otp-verify", ip, 20, "60 s")
        if (!ipLimit.allowed) {
          log.ipRateLimited(ip, email)
          throw new Error("Túl sok próbálkozás. Várjon egy percet.")
        }

        const stored = await getVerificationData(email)
        if (!stored) {
          log.codeExpired(ip, email)
          throw new Error("Érvénytelen vagy lejárt kód. Kérjen újat.")
        }
        if (hasExceededMaxAttempts(stored)) {
          log.bruteForceDetected(ip, email)
          await deleteVerificationCode(email)
          throw new Error("Túl sok hibás próbálkozás. Kérjen új kódot.")
        }

        if (!secureCodeCompare(code, stored.code)) {
          const attempts = await incrementAttempts(email, stored)
          log.invalidCodeAttempt(ip, email, attempts)
          if (attempts >= MAX_ATTEMPTS) {
            await deleteVerificationCode(email)
            throw new Error("Túl sok hibás próbálkozás. Kérjen új kódot.")
          }
          throw new Error(`Érvénytelen kód. Még ${MAX_ATTEMPTS - attempts} próbálkozása maradt.`)
        }

        await deleteVerificationCode(email)

        await dbConnect()
        const user = await UserModel.findOne({ email }).select({ email: 1, name: 1, role: 1 }).lean<{
          _id: mongoose.Types.ObjectId
          email: string
          name: string
          role: UserRole
        } | null>()

        // The code mail only goes to existing admins, so this is defensive.
        if (!user || !isAdminRole(user.role)) {
          log.userNotFound(ip, email)
          throw new Error("Ehhez a címhez nem tartozik adminisztrátori fiók.")
        }

        const id = user._id.toString()
        await UserModel.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } }).catch(() => {})
        log.loginSuccess(ip, email, id)

        return { id, email: user.email, name: user.name, role: user.role }
      },
    }),

    /**
     * Member login (specification 9.1): e-mail + password, neutral error on
     * failure, brute-force limits per IP and per address.
     */
    CredentialsProvider({
      id: "member-password",
      name: "E-mail és jelszó",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Jelszó", type: "password" },
      },
      async authorize(credentials) {
        const { ip, userAgent } = await requestContext()
        const log = createAuthLogger("member-password", userAgent)
        const NEUTRAL = "Hibás e-mail-cím vagy jelszó."

        const rawEmail = typeof credentials?.email === "string" ? credentials.email : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""
        const email = normalizeEmail(rawEmail)
        if (!isPlausibleEmail(email) || !password) {
          log.loginFailed(ip, email || "unknown", "missing_credentials")
          throw new Error(NEUTRAL)
        }

        const [ipLimit, emailLimit] = await Promise.all([
          rateLimit("member-login-ip", ip, 20, "60 s"),
          rateLimit("member-login-email", email, 10, "15 m"),
        ])
        if (!ipLimit.allowed || !emailLimit.allowed) {
          log.ipRateLimited(ip, email)
          throw new Error("Túl sok próbálkozás. Kérjük, próbálja újra néhány perc múlva.")
        }

        await dbConnect()
        const user = await UserModel.findOne({ email }).select({ email: 1, name: 1, role: 1, passwordHash: 1 }).lean<{
          _id: mongoose.Types.ObjectId
          email: string
          name: string
          role: UserRole
          passwordHash: string | null
        } | null>()

        const ok = await verifyPassword(password, user?.passwordHash)
        if (!user || !ok) {
          log.loginFailed(ip, email, user ? "invalid_password" : "user_not_found")
          throw new Error(NEUTRAL)
        }

        const id = user._id.toString()
        await UserModel.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } }).catch(() => {})
        log.loginSuccess(ip, email, id)
        return { id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.roleCheckedAt = Date.now()
        return token
      }

      const id = typeof token.id === "string" ? token.id : null
      const stale = typeof token.roleCheckedAt !== "number" || Date.now() - token.roleCheckedAt > ROLE_REFRESH_MS
      if (id && stale && mongoose.isValidObjectId(id)) {
        const cached = roleCache.get(id)
        if (cached && Date.now() - cached.at <= ROLE_REFRESH_MS) {
          token.role = cached.role
          token.roleCheckedAt = cached.at
        } else {
          try {
            const role = await readRole(id)
            const at = Date.now()
            token.role = role
            token.roleCheckedAt = at
            if (roleCache.size >= ROLE_CACHE_MAX) roleCache.clear()
            roleCache.set(id, { role, at })
          } catch (error) {
            // Keep the previous role; the next call retries. A DB hiccup must not log everyone out.
            console.error("[auth] role refresh failed:", error)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : ""
        session.user.role = token.role ?? "USER"
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      console.info(JSON.stringify({ level: "info", event: "LOGOUT", service: "auth", userId: token?.id, timestamp: new Date().toISOString() }))
    },
  },
}
