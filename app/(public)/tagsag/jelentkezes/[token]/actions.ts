"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db-connect"
import { privacyNoticeVersion } from "@/lib/data/site"
import { MembershipApplicationModel, unfinishedApplicationStatuses, type MembershipApplicationCategory } from "@/lib/models/membership-application"
import { categoryName, continueUrl, findByContinueToken, formatDateTime, fullName, siteUrl } from "@/lib/server/applications"
import { sendTemplatedMail } from "@/lib/server/email/send"
import { getNotificationRecipient } from "@/lib/server/mail"
import { hashIp, rateLimit } from "@/lib/server/rate-limit"
import { normalizePhone } from "@/lib/validation/phone"
import { normalizeFullForm, parseIsoDate, validateFullForm, type FullFormErrors, type FullFormInput } from "@/lib/validation/membership-application"

export type SaveResult = { ok: true; savedAt: string } | { ok: false; message: string }
export type FinalizeResult = { ok: true } | { ok: false; message?: string; errors?: FullFormErrors }

async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown"
}

function toUpdate(input: FullFormInput) {
  return {
    birthDate: parseIsoDate(input.birthDate) ?? undefined,
    "address.postalCode": input.postalCode,
    "address.city": input.city,
    "address.street": input.street,
    "address.country": input.country,
    // A draft may hold a half-typed number; it is kept as typed until it parses.
    phone: normalizePhone(input.phone) ?? input.phone,
    specialty: input.specialty,
    workplace: input.noWorkplace ? "" : input.workplace,
    noWorkplace: input.noWorkplace,
    medicalDegree: input.medicalDegree === "" ? undefined : input.medicalDegree === "orvos",
    lastActivityAt: new Date(),
  }
}

/** Saves the form as a draft; nothing is required yet. */
export async function saveApplicationDraft(token: string, raw: Partial<Record<keyof FullFormInput, unknown>>): Promise<SaveResult> {
  const limit = await rateLimit("application-draft", await clientIp(), 60, "10 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok mentés rövid idő alatt. Próbálja újra kicsit később." }

  const app = await findByContinueToken(token)
  if (!app || !(unfinishedApplicationStatuses as readonly string[]).includes(app.status)) {
    return { ok: false, message: "A jelentkezés már nem módosítható." }
  }
  const input = normalizeFullForm(raw)
  await dbConnect()
  await MembershipApplicationModel.updateOne({ _id: app._id }, { $set: toUpdate(input) })
  return { ok: true, savedAt: new Date().toISOString() }
}

/** Validates, stores the declarations, moves the application to review and sends the mails. */
export async function finalizeApplication(
  token: string,
  raw: Partial<Record<keyof FullFormInput, unknown>>,
  declarations: { statutes: boolean; privacy: boolean },
): Promise<FinalizeResult> {
  const ip = await clientIp()
  const limit = await rateLimit("application-finalize", ip, 10, "10 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok próbálkozás. Próbálja újra néhány perc múlva." }

  const app = await findByContinueToken(token)
  if (!app || !(unfinishedApplicationStatuses as readonly string[]).includes(app.status)) {
    return { ok: false, message: "A jelentkezés már nem módosítható." }
  }

  const input = normalizeFullForm(raw)
  const errors = validateFullForm(input, app.category as MembershipApplicationCategory)
  if (!declarations.statutes) errors.statutes = "Az Alapszabály elfogadása szükséges."
  if (!declarations.privacy) errors.privacy = "Az adatkezelési tájékoztató elfogadása szükséges."
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const now = new Date()
  await dbConnect()
  const result = await MembershipApplicationModel.updateOne(
    { _id: app._id, status: { $in: [...unfinishedApplicationStatuses] } },
    {
      $set: {
        ...toUpdate(input),
        status: "bekuldott",
        submittedAt: now,
        "declarations.statutesAcceptedAt": now,
        "declarations.privacyAcceptedAt": now,
        "declarations.privacyNoticeVersion": privacyNoticeVersion,
        "declarations.ipHash": hashIp(ip),
      },
    },
  )
  if (result.modifiedCount === 0) return { ok: false, message: "A jelentkezés már nem módosítható." }

  const vars = {
    nev: fullName(app),
    kategoria: categoryName(app.category),
    link: continueUrl(token),
    bekuldesIdopont: formatDateTime(now),
  }
  await sendTemplatedMail({ key: "jelentkezes_beerkezett", to: app.email, vars, applicationId: app._id })

  const recipient = getNotificationRecipient()
  if (recipient) {
    await sendTemplatedMail({
      key: "admin_uj_jelentkezes",
      to: recipient,
      replyTo: app.email,
      applicationId: app._id,
      vars: { ...vars, email: app.email, adminLink: siteUrl(`/admin/jelentkezesek/${app._id.toString()}`) },
    })
  } else {
    console.warn("⚠️ [membership-application] MAIL_TO missing — no admin notification sent")
  }

  revalidatePath(`/tagsag/jelentkezes/${token}`)
  return { ok: true }
}
