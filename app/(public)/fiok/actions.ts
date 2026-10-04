"use server"

import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { createAuthLogger } from "@/lib/server/auth/auth-logger"
import { getServerAuthSession } from "@/lib/server/auth/session"
import { setPassword, verifyPassword } from "@/lib/server/members"
import { rateLimit } from "@/lib/server/rate-limit"
import { passwordError } from "@/lib/validation/password"

export type ChangePasswordResult = { ok: true } | { ok: false; message: string }

/** Logged-in password change (9.1): current password + the new one twice. */
export async function changePassword(current: string, next: string, nextAgain: string): Promise<ChangePasswordResult> {
  const session = await getServerAuthSession()
  if (!session || session.user.role !== "USER") return { ok: false, message: "Bejelentkezés szükséges." }

  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown"
  const limit = await rateLimit("password-change", session.user.id, 5, "15 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok próbálkozás. Próbálja újra később." }

  const error = passwordError(next)
  if (error) return { ok: false, message: error }
  if (next !== nextAgain) return { ok: false, message: "A két új jelszó nem egyezik." }

  await dbConnect()
  const user = await UserModel.findById(session.user.id).select({ email: 1, passwordHash: 1 }).lean<UserDocument | null>()
  if (!user || !(await verifyPassword(current, user.passwordHash))) return { ok: false, message: "A jelenlegi jelszó nem megfelelő." }

  await setPassword(user._id, next)
  createAuthLogger("member-password", h.get("user-agent")).passwordChanged(ip, user.email, user._id.toString())
  return { ok: true }
}
