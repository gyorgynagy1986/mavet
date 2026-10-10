"use server"

import mongoose from "mongoose"
import type { Session } from "next-auth"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { MembershipApplicationModel, membershipApplicationCategories, type MembershipApplicationCategory } from "@/lib/models/membership-application"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { categoryName } from "@/lib/server/applications"
import { actorFromSession, logAdminAudit } from "@/lib/server/auth/admin-audit"
import { getServerAuthSession, isAdmin, isSuperAdmin } from "@/lib/server/auth/session"
import { sendTemplatedMail } from "@/lib/server/email/send"
import { ensureProfileSlug } from "@/lib/server/directory"
import { purgeProfilePhotos } from "@/lib/server/profile-photo"
import { revalidatePublicPages } from "@/lib/server/revalidate-public"

export type MemberActionResult = { ok: true; message: string } | { ok: false; message: string }

type Guarded =
  | { error: { ok: false; message: string } }
  | { error?: undefined; session: Session; user: UserDocument; meta: { ip: string | null; userAgent: string | null } }

async function guard(id: string, superOnly = false): Promise<Guarded> {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) return { error: { ok: false, message: "Nincs jogosultsága." } }
  if (superOnly && !isSuperAdmin(session)) return { error: { ok: false, message: "Ehhez a művelethez főadminisztrátori jogosultság szükséges." } }
  if (!mongoose.isValidObjectId(id)) return { error: { ok: false, message: "Érvénytelen azonosító." } }
  await dbConnect()
  const user = await UserModel.findById(id).lean<UserDocument | null>()
  if (!user || user.role !== "USER" || !user.membership?.status) return { error: { ok: false, message: "A tag nem található." } }
  const h = await headers()
  return {
    session,
    user,
    meta: { ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, userAgent: h.get("user-agent") },
  }
}

function refresh(id: string) {
  revalidatePath(`${ADMIN_HOME_PATH}/tagok/${id}`)
  revalidatePath(`${ADMIN_HOME_PATH}/tagok`)
  revalidatePublicPages()
}

function displayName(u: UserDocument): string {
  return [u.title, u.lastName, u.firstName].filter(Boolean).join(" ") || u.name
}

/** Category change (7.3): fee effect from the next membership year, so only the category is touched. */
export async function changeMemberCategory(id: string, category: string, medicalDegree: boolean | null): Promise<MemberActionResult> {
  const g = await guard(id)
  if (g.error) return g.error
  const { user, session, meta } = g
  if (!(membershipApplicationCategories as readonly string[]).includes(category)) return { ok: false, message: "Érvénytelen kategória." }
  const next = category as MembershipApplicationCategory
  const before = user.membership!
  if (before.category === next && (next !== "rendes" || before.medicalDegree === medicalDegree)) return { ok: true, message: "Nincs változás." }

  await UserModel.updateOne(
    { _id: user._id },
    { $set: { "membership.category": next, "membership.medicalDegree": next === "rendes" ? Boolean(medicalDegree) : undefined } },
  )
  await logAdminAudit({
    ...actorFromSession(session),
    ...meta,
    action: "member_category_change",
    targetUserId: user._id,
    targetEmail: user.email,
    targetName: displayName(user),
    changes: [{ field: "membership.category", from: before.category ?? null, to: next }],
    summary: `Tagsági kategória módosítva: ${categoryName(before.category)} → ${categoryName(next)}. Díjhatás a következő tagsági évtől.`,
  })
  refresh(id)
  return { ok: true, message: "Kategória módosítva." }
}

/** Revocation: membership → megszunt; the account and the login stay. Optional mail to the member. */
export async function revokeMembership(id: string, reason: string, notify: boolean): Promise<MemberActionResult> {
  const g = await guard(id)
  if (g.error) return g.error
  const { user, session, meta } = g
  if (user.membership!.status === "megszunt") return { ok: false, message: "A tagság már megszűnt." }
  const trimmed = reason.trim().slice(0, 2000)
  const now = new Date()

  await UserModel.updateOne(
    { _id: user._id },
    { $set: { "membership.status": "megszunt", "membership.revokedAt": now, "membership.revokedByEmail": session.user.email ?? null, "membership.revokeReason": trimmed || null } },
  )
  await logAdminAudit({
    ...actorFromSession(session),
    ...meta,
    action: "membership_revoke",
    targetUserId: user._id,
    targetEmail: user.email,
    targetName: displayName(user),
    changes: [{ field: "membership.status", from: user.membership!.status ?? null, to: "megszunt" }],
    summary: trimmed ? `Tagság visszavonva. Indoklás: ${trimmed}` : "Tagság visszavonva.",
  })

  let mailNote = ""
  if (notify) {
    const mail = await sendTemplatedMail({
      key: "tagsag_megszunt",
      to: user.email,
      triggeredBy: `admin:${session.user.email ?? session.user.id}`,
      userId: user._id,
      vars: { nev: displayName(user), kategoria: categoryName(user.membership!.category), indoklas: trimmed },
    })
    mailNote = mail.status === "sent" ? " A tag értesítést kapott." : " Az értesítő e-mail nem ment ki (lásd az E-mail naplót)."
  }
  refresh(id)
  return { ok: true, message: `Tagság visszavonva.${mailNote}` }
}

/** Reverses a revocation: back to aktiv (or fizetesre_var when a first fee is still open). */
export async function restoreMembership(id: string): Promise<MemberActionResult> {
  const g = await guard(id)
  if (g.error) return g.error
  const { user, session, meta } = g
  if (user.membership!.status !== "megszunt") return { ok: false, message: "Csak megszűnt tagság állítható helyre." }
  const next = user.membership!.feeDue?.amount && !user.membership!.paidThroughYear ? "fizetesre_var" : "aktiv"
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { "membership.status": next }, $unset: { "membership.revokedAt": "", "membership.revokedByEmail": "", "membership.revokeReason": "" } },
  )
  await logAdminAudit({
    ...actorFromSession(session),
    ...meta,
    action: "membership_restore",
    targetUserId: user._id,
    targetEmail: user.email,
    targetName: displayName(user),
    changes: [{ field: "membership.status", from: "megszunt", to: next }],
    summary: "Tagság helyreállítva a visszavonás után.",
  })
  refresh(id)
  return { ok: true, message: "Tagság helyreállítva." }
}

/**
 * Permanent deletion (SUPERADMIN): the account is removed, the login stops at
 * once (the role refresh treats a missing user as USER and the account page
 * finds nothing). The application records stay for the decision history, but
 * their personal fields are anonymised (9.5: retained records kept apart).
 */
export async function deleteMember(id: string, confirmEmail: string): Promise<MemberActionResult> {
  const g = await guard(id, true)
  if (g.error) return g.error
  const { user, session, meta } = g
  if (confirmEmail.trim().toLowerCase() !== user.email) return { ok: false, message: "A megerősítéshez írja be a tag e-mail-címét." }

  const label = displayName(user)
  const anonymised = {
    title: "",
    lastName: "Törölt",
    firstName: "tag",
    email: `torolt-${user._id.toString()}@anonim.mavet`,
    birthDate: undefined,
    address: undefined,
    phone: undefined,
    specialty: undefined,
    workplace: undefined,
    noWorkplace: false,
    internalNote: null,
    continueTokenHash: null,
    continueTokenExpiresAt: null,
  }
  await MembershipApplicationModel.updateMany({ email: user.email }, { $set: anonymised })
  await purgeProfilePhotos(user._id.toString())
  await UserModel.deleteOne({ _id: user._id })

  await logAdminAudit({
    ...actorFromSession(session),
    ...meta,
    action: "member_delete",
    targetUserId: user._id,
    targetEmail: user.email,
    targetName: label,
    changes: [{ field: "account", from: "létezik", to: "törölve" }],
    summary: "Tagi fiók véglegesen törölve; a jelentkezési rekordok anonimizálva.",
  })
  revalidatePath(`${ADMIN_HOME_PATH}/tagok`)
  revalidatePublicPages()
  return { ok: true, message: "A fiók törölve." }
}

/** Organisational office (elnök, bizottsági tag…) and the board flag that allows public appearance (4.1, 9.2). */
export async function updateMemberOffice(id: string, office: string, boardMember: boolean): Promise<MemberActionResult> {
  const g = await guard(id)
  if (g.error) return g.error
  const { user, session, meta } = g
  const next = office.trim().slice(0, 120) || null
  const before = { office: user.office ?? null, boardMember: user.boardMember ?? false }
  if (before.office === next && before.boardMember === boardMember) return { ok: true, message: "Nincs változás." }
  await UserModel.updateOne({ _id: user._id }, { $set: { office: next, boardMember } })
  // The readable public address is fixed the first time someone becomes a board member.
  if (boardMember) await ensureProfileSlug(user)
  await logAdminAudit({
    ...actorFromSession(session),
    ...meta,
    action: "member_office_change",
    targetUserId: user._id,
    targetEmail: user.email,
    targetName: displayName(user),
    changes: [
      { field: "office", from: before.office, to: next },
      { field: "boardMember", from: String(before.boardMember), to: String(boardMember) },
    ],
    summary: `Tisztség: ${next ?? "–"}; vezetőségi/bizottsági megjelenés: ${boardMember ? "igen" : "nem"}.`,
  })
  refresh(id)
  return { ok: true, message: "Tisztség mentve." }
}
