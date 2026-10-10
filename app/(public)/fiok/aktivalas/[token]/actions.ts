"use server"

import { headers } from "next/headers"
import { createAuthLogger } from "@/lib/server/auth/auth-logger"
import { activateMember, findByActivationToken } from "@/lib/server/members"
import { rateLimit } from "@/lib/server/rate-limit"
import { passwordError } from "@/lib/validation/password"

export type ActivateResult = { ok: true; email: string; status: "aktiv" | "fizetesre_var" } | { ok: false; message: string }

/** Sets the member's password from the activation link and activates the membership. */
export async function activateAccount(token: string, password: string, passwordAgain: string): Promise<ActivateResult> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown"
  const limit = await rateLimit("account-activate", ip, 10, "10 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok próbálkozás. Próbálja újra néhány perc múlva." }

  const error = passwordError(password)
  if (error) return { ok: false, message: error }
  if (password !== passwordAgain) return { ok: false, message: "A két jelszó nem egyezik." }

  const user = await findByActivationToken(token)
  if (!user || user.membership?.status !== "aktivalasra_var") return { ok: false, message: "Az aktiváló link érvénytelen vagy lejárt." }

  const status = await activateMember(user, password)
  createAuthLogger("member-password", h.get("user-agent")).accountActivated(ip, user.email, user._id.toString())
  return { ok: true, email: user.email, status }
}
