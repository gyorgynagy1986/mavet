"use server"

import { headers } from "next/headers"
import { createAuthLogger } from "@/lib/server/auth/auth-logger"
import { findByPasswordResetToken, setPassword } from "@/lib/server/members"
import { rateLimit } from "@/lib/server/rate-limit"
import { passwordError } from "@/lib/validation/password"

export type ResetPasswordResult = { ok: true; email: string } | { ok: false; message: string }

export async function resetPassword(token: string, password: string, passwordAgain: string): Promise<ResetPasswordResult> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown"
  const limit = await rateLimit("password-reset-set", ip, 10, "10 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok próbálkozás. Próbálja újra néhány perc múlva." }

  const error = passwordError(password)
  if (error) return { ok: false, message: error }
  if (password !== passwordAgain) return { ok: false, message: "A két jelszó nem egyezik." }

  const user = await findByPasswordResetToken(token)
  if (!user) return { ok: false, message: "A link érvénytelen vagy lejárt. Kérjen újat." }

  await setPassword(user._id, password)
  createAuthLogger("member-password", h.get("user-agent")).passwordResetDone(ip, user.email, user._id.toString())
  return { ok: true, email: user.email }
}
