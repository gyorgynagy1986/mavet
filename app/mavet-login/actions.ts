"use server"

import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { UserModel, isAdminRole, type UserRole } from "@/lib/models/user"
import { createAuthLogger } from "@/lib/server/auth/auth-logger"
import { loginCodeMail } from "@/lib/server/auth/login-code-mail"
import { createVerificationCode, isPlausibleEmail, normalizeEmail } from "@/lib/server/auth/verification"
import { sendMail } from "@/lib/server/mail"
import { rateLimit } from "@/lib/server/rate-limit"

export type RequestLoginCodeResult = { ok: true } | { ok: false; message: string }

/**
 * Step 1 of the admin login: send a one-time code to an admin's e-mail.
 *
 * The response is identical for unknown addresses (with a small random delay),
 * so the form cannot be used to find out who is an admin. Limits: 5 requests
 * per minute per IP, plus the per-address cooldown and daily cap in Redis.
 */
export async function requestLoginCode(rawEmail: string): Promise<RequestLoginCodeResult> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown"
  const log = createAuthLogger("admin-otp", h.get("user-agent"))

  try {
    if (typeof rawEmail !== "string" || !isPlausibleEmail(rawEmail.trim())) {
      log.loginFailed(ip, rawEmail || "empty", "invalid_email_format")
      return { ok: false, message: "Adjon meg egy érvényes e-mail-címet." }
    }
    const email = normalizeEmail(rawEmail)

    const ipLimit = await rateLimit("admin-otp-request", ip, 5, "60 s")
    if (!ipLimit.allowed) {
      log.ipRateLimited(ip, email)
      return { ok: false, message: "Túl sok kérés. Kérjük, várjon egy percet." }
    }

    await dbConnect()
    const user = await UserModel.findOne({ email }).select({ name: 1, role: 1 }).lean<{
      _id: { toString(): string }
      name: string
      role: UserRole
    } | null>()

    if (!user || !isAdminRole(user.role)) {
      log.codeRequestUnknownUser(ip, email)
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
      return { ok: true }
    }

    log.codeRequested(ip, email)
    const created = await createVerificationCode(email)
    if (!created.ok) {
      log.emailRateLimited(ip, email, created.reason)
      return {
        ok: false,
        message:
          created.reason === "cooldown"
            ? `Már küldtünk kódot. Új kód ${created.waitSeconds ?? 60} másodperc múlva kérhető.`
            : "Elérte a napi kódkérési limitet. Próbálja újra holnap.",
      }
    }

    await sendMail(loginCodeMail(email, user.name, created.code))
    log.codeSent(ip, email, user._id.toString())
    return { ok: true }
  } catch (error) {
    console.error("[auth] requestLoginCode failed:", error)
    return { ok: false, message: "Hiba történt a kérés feldolgozása során. Próbálja újra később." }
  }
}
