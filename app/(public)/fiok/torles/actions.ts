"use server"

import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { MembershipApplicationModel } from "@/lib/models/membership-application"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { logAdminAudit } from "@/lib/server/auth/admin-audit"
import { getServerAuthSession } from "@/lib/server/auth/session"
import { sendTemplatedMail } from "@/lib/server/email/send"
import { verifyPassword } from "@/lib/server/members"
import { purgeProfilePhotos } from "@/lib/server/profile-photo"
import { revalidatePublicPages } from "@/lib/server/revalidate-public"
import { rateLimit } from "@/lib/server/rate-limit"

export type DeleteAccountResult = { ok: true } | { ok: false; message: string }

/**
 * Self-service deletion (9.5): current password + explicit confirmation. The
 * account is removed at once; the application records stay anonymised for the
 * retained decision history; a confirmation mail is sent.
 */
export async function deleteOwnAccount(password: string, confirmation: string): Promise<DeleteAccountResult> {
  const session = await getServerAuthSession()
  if (!session || session.user.role !== "USER") return { ok: false, message: "Bejelentkezés szükséges." }
  const h = await headers()
  const limit = await rateLimit("account-delete", session.user.id, 5, "15 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok próbálkozás. Próbálja újra később." }
  if (confirmation.trim().toUpperCase() !== "TÖRLÉS") return { ok: false, message: "A megerősítéshez írja be: TÖRLÉS" }

  await dbConnect()
  const user = await UserModel.findById(session.user.id).lean<UserDocument | null>()
  if (!user) return { ok: false, message: "A fiók nem található." }
  if (!(await verifyPassword(password, user.passwordHash))) return { ok: false, message: "A jelszó nem megfelelő." }

  const name = [user.title, user.lastName, user.firstName].filter(Boolean).join(" ") || user.name
  await MembershipApplicationModel.updateMany(
    { email: user.email },
    { $set: { title: "", lastName: "Törölt", firstName: "tag", email: `torolt-${user._id.toString()}@anonim.mavet`, birthDate: undefined, address: undefined, phone: undefined, specialty: undefined, workplace: undefined, internalNote: null, continueTokenHash: null, continueTokenExpiresAt: null } },
  )
  await purgeProfilePhotos(user._id.toString())
  revalidatePublicPages()
  await UserModel.deleteOne({ _id: user._id })

  await sendTemplatedMail({ key: "fiok_torolve", to: user.email, triggeredBy: "system", vars: { nev: name } })
  await logAdminAudit({
    actorUserId: user._id.toString(),
    actorEmail: user.email,
    actorName: name,
    actorRole: "USER",
    action: "member_self_delete",
    targetUserId: user._id,
    targetEmail: user.email,
    targetName: name,
    changes: [{ field: "account", from: "létezik", to: "törölve" }],
    summary: "A tag saját kérésére törölte a fiókját.",
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  })
  return { ok: true }
}
