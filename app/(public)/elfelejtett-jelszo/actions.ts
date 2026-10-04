"use server"

import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { UserModel } from "@/lib/models/user"
import { createAuthLogger } from "@/lib/server/auth/auth-logger"
import { isPlausibleEmail, normalizeEmail } from "@/lib/server/auth/verification"
import { sendPasswordResetMail } from "@/lib/server/members"
import { rateLimit } from "@/lib/server/rate-limit"

export type ForgotPasswordResult = { ok: true } | { ok: false; message: string }

/**
 * Always answers "ok" for a well-formed address (9.1: the response must not
 * reveal whether an account exists). Limits: 5 requests / 10 min per IP and
 * 3 / hour per address.
 */
export async function requestPasswordReset(rawEmail: string): Promise<ForgotPasswordResult> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown"
  const log = createAuthLogger("member-password", h.get("user-agent"))
  const email = normalizeEmail(typeof rawEmail === "string" ? rawEmail : "")
  if (!isPlausibleEmail(email)) return { ok: false, message: "Adjon meg egy érvényes e-mail-címet." }

  const [ipLimit, emailLimit] = await Promise.all([rateLimit("password-reset-ip", ip, 5, "10 m"), rateLimit("password-reset-email", email, 3, "1 h")])
  if (!ipLimit.allowed || !emailLimit.allowed) return { ok: false, message: "Túl sok kérés. Kérjük, próbálja újra később." }

  try {
    const outcome = await sendPasswordResetMail(email, "system")
    if (outcome === "no_account") {
      log.passwordResetUnknownUser(ip, email)
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
    } else if (outcome === "sent") {
      await dbConnect()
      const user = await UserModel.findOne({ email }).select({ _id: 1 }).lean<{ _id: { toString(): string } } | null>()
      log.passwordResetRequested(ip, email, user?._id.toString() ?? "")
    }
  } catch (error) {
    console.error("[auth] password reset request failed:", error)
  }
  return { ok: true }
}
