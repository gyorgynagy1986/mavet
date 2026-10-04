"use server"

import mongoose from "mongoose"
import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import {
  MembershipApplicationModel,
  membershipApplicationCategories,
  unfinishedApplicationStatuses,
  type MembershipApplicationCategory,
  type MembershipApplicationDocument,
} from "@/lib/models/membership-application"
import { categoryName, fullName, sendContinueLink, siteUrl } from "@/lib/server/applications"
import { createMemberFromApplication, sendAcceptanceMail } from "@/lib/server/members"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { getServerAuthSession, isAdmin, isSuperAdmin } from "@/lib/server/auth/session"
import { actorFromSession, logAdminAudit } from "@/lib/server/auth/admin-audit"
import { EmailLogModel } from "@/lib/models/email-log"
import { sendTemplatedMail } from "@/lib/server/email/send"

export type ActionResult = { ok: true; message: string } | { ok: false; message: string }

async function guard(id: string): Promise<{ app: MembershipApplicationDocument; actor: string } | { error: ActionResult }> {
  const session = await getServerAuthSession()
  if (!isAdmin(session) || !session) return { error: { ok: false, message: "Nincs jogosultsága." } }
  if (!mongoose.isValidObjectId(id)) return { error: { ok: false, message: "Érvénytelen azonosító." } }
  await dbConnect()
  const app = await MembershipApplicationModel.findById(id).lean<MembershipApplicationDocument | null>()
  if (!app) return { error: { ok: false, message: "A jelentkezés nem található." } }
  return { app, actor: `admin:${session.user.email ?? session.user.id}` }
}

function refresh(id: string) {
  revalidatePath(`${ADMIN_HOME_PATH}/jelentkezesek/${id}`)
  revalidatePath(`${ADMIN_HOME_PATH}/jelentkezesek`)
}

/**
 * Accept (specification 7.3): optional category override, member account
 * created from the application, activation link mailed (fee-free or fee-paying
 * variant depending on the acceptance date and category).
 */
export async function acceptApplication(id: string, category: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  const { app, actor } = g
  if (app.status !== "bekuldott") return { ok: false, message: "Csak elbírálásra váró jelentkezés fogadható el." }
  if (!(membershipApplicationCategories as readonly string[]).includes(category)) return { ok: false, message: "Érvénytelen kategória." }
  const acceptedCategory = category as MembershipApplicationCategory

  // An existing admin account with this address cannot become a member record silently.
  const existing = await UserModel.findOne({ email: app.email }).select({ role: 1, membership: 1 }).lean<UserDocument | null>()
  if (existing && existing.role !== "USER") return { ok: false, message: "Ehhez az e-mail-címhez adminisztrátori fiók tartozik; a tagság nem rögzíthető rá." }
  if (existing?.membership?.status && existing.membership.status !== "megszunt" && existing.membership.status !== "lejart") {
    return { ok: false, message: `Ehhez a címhez már tartozik tagság (${existing.membership.status}).` }
  }

  const acceptedAt = new Date()
  const result = await MembershipApplicationModel.updateOne(
    { _id: app._id, status: "bekuldott" },
    { $set: { status: "elfogadva", acceptedCategory, decidedAt: acceptedAt, decidedByEmail: actor.replace(/^admin:/, ""), lastActivityAt: acceptedAt } },
  )
  if (result.modifiedCount === 0) return { ok: false, message: "A jelentkezés közben megváltozott." }

  const user = await createMemberFromApplication(app, acceptedCategory, acceptedAt)
  const mail = await sendAcceptanceMail(user, app, actor)
  refresh(id)
  return { ok: true, message: mail.status === "sent" ? "Elfogadva, a jelentkező megkapta az aktiváló linket." : "Elfogadva, de az értesítő e-mail nem ment ki (lásd az E-mail naplót)." }
}

/** Re-sends the activation link to an accepted applicant who has not activated yet. */
export async function resendActivationLink(id: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  const { app, actor } = g
  if (app.status !== "elfogadva") return { ok: false, message: "Csak elfogadott jelentkezéshez küldhető aktiváló link." }
  const user = await UserModel.findOne({ "membership.applicationId": app._id }).lean<UserDocument | null>()
  if (!user) return { ok: false, message: "Nem található a jelentkezéshez tartozó fiók." }
  if (user.membership?.status !== "aktivalasra_var") return { ok: false, message: "A fiók már aktiválva van." }
  const mail = await sendAcceptanceMail(user, app, actor)
  refresh(id)
  return mail.status === "sent" ? { ok: true, message: "Az aktiváló linket újraküldtük." } : { ok: false, message: "A levél nem ment ki (lásd az E-mail naplót)." }
}

/** Reject with an optional message to the applicant. Érdemes gets its own template (7.4). */
export async function rejectApplication(id: string, message: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  const { app, actor } = g
  if (app.status !== "bekuldott") return { ok: false, message: "Csak elbírálásra váró jelentkezés utasítható el." }
  const decisionMessage = message.trim().slice(0, 2000)

  const result = await MembershipApplicationModel.updateOne(
    { _id: app._id, status: "bekuldott" },
    { $set: { status: "elutasitva", decisionMessage: decisionMessage || null, decidedAt: new Date(), decidedByEmail: actor.replace(/^admin:/, ""), lastActivityAt: new Date() } },
  )
  if (result.modifiedCount === 0) return { ok: false, message: "A jelentkezés közben megváltozott." }

  const mail = await sendTemplatedMail({
    key: app.category === "erdemes" ? "jelentkezes_elutasitva_erdemes" : "jelentkezes_elutasitva",
    to: app.email,
    triggeredBy: actor,
    applicationId: app._id,
    vars: { nev: fullName(app), kategoria: categoryName(app.category), indoklas: decisionMessage, ujraJelentkezesLink: siteUrl("/tagsag/jelentkezes") },
  })
  refresh(id)
  return { ok: true, message: mail.status === "sent" ? "Elutasítva, a jelentkező értesítést kapott." : "Elutasítva, de az értesítő e-mail nem ment ki (lásd az E-mail naplót)." }
}

/** Re-sends the continuation link (new token) to an unfinished application. */
export async function resendContinueLink(id: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  const { app, actor } = g
  if (!(unfinishedApplicationStatuses as readonly string[]).includes(app.status)) return { ok: false, message: "Csak folyamatban lévő jelentkezéshez küldhető link." }
  const mail = await sendContinueLink(app, "folytatas", actor)
  refresh(id)
  return mail.status === "sent" ? { ok: true, message: "A folytató linket újraküldtük." } : { ok: false, message: "A levél nem ment ki (lásd az E-mail naplót)." }
}

/** Manual reminder (counts towards the reminder history shown on the list). */
export async function sendManualReminder(id: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  const { app, actor } = g
  if (!(unfinishedApplicationStatuses as readonly string[]).includes(app.status)) return { ok: false, message: "Csak folyamatban lévő jelentkezéshez küldhető emlékeztető." }
  const mail = await sendContinueLink(app, "emlekezteto", actor)
  if (mail.status === "sent") {
    await MembershipApplicationModel.updateOne({ _id: app._id }, { $push: { reminders: { sentAt: new Date(), kind: "manual" } } })
  }
  refresh(id)
  return mail.status === "sent" ? { ok: true, message: "Emlékeztető elküldve." } : { ok: false, message: "A levél nem ment ki (lásd az E-mail naplót)." }
}

/** Closes an open application without a decision (e.g. applicant asked for deletion). */
export async function withdrawApplication(id: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  const { app, actor } = g
  if (!["elozetes", "megerositett", "bekuldott"].includes(app.status)) return { ok: false, message: "Csak nyitott jelentkezés zárható le." }
  await MembershipApplicationModel.updateOne(
    { _id: app._id },
    { $set: { status: "visszavont", decidedAt: new Date(), decidedByEmail: actor.replace(/^admin:/, ""), continueTokenHash: null, continueTokenExpiresAt: null } },
  )
  refresh(id)
  return { ok: true, message: "A jelentkezés lezárva." }
}

export async function saveInternalNote(id: string, note: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  await MembershipApplicationModel.updateOne({ _id: g.app._id }, { $set: { internalNote: note.trim().slice(0, 4000) || null } })
  refresh(id)
  return { ok: true, message: "Jegyzet mentve." }
}

/**
 * Permanent deletion of a closed application (SUPERADMIN; e.g. a GDPR erasure
 * request). Only non-open states; an accepted application that still has a
 * member account must be handled by deleting the member instead. A closed or
 * rejected application does not block a new one, so this is about data
 * hygiene, not about letting someone re-apply.
 */
export async function deleteApplication(id: string): Promise<ActionResult> {
  const g = await guard(id)
  if ("error" in g) return g.error
  const session = await getServerAuthSession()
  if (!isSuperAdmin(session)) return { ok: false, message: "A végleges törléshez főadminisztrátori jogosultság szükséges." }
  const { app, actor } = g
  if (["elozetes", "megerositett", "bekuldott"].includes(app.status)) return { ok: false, message: "Nyitott jelentkezés nem törölhető; előbb zárja le vagy bírálja el." }
  const member = await UserModel.findOne({ "membership.applicationId": app._id }).select({ _id: 1 }).lean<{ _id: unknown } | null>()
  if (member) return { ok: false, message: "Ehhez a jelentkezéshez tagi fiók tartozik; a Tagok oldalon a fiók törlésével együtt anonimizálódik." }

  await EmailLogModel.deleteMany({ applicationId: app._id })
  await MembershipApplicationModel.deleteOne({ _id: app._id })
  await logAdminAudit({
    ...actorFromSession(session),
    action: "application_delete",
    targetEmail: app.email,
    targetName: fullName(app),
    changes: [{ field: "application", from: app.status, to: "törölve" }],
    summary: `Jelentkezés véglegesen törölve (${categoryName(app.category)}, ${app.status}). Kiváltó: ${actor}.`,
  })
  revalidatePath(`${ADMIN_HOME_PATH}/jelentkezesek`)
  return { ok: true, message: "A jelentkezés véglegesen törölve." }
}
