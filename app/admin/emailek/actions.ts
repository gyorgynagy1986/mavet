"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { EmailTemplateModel } from "@/lib/models/email-template"
import { EmailLogModel } from "@/lib/models/email-log"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import type { Session } from "next-auth"
import { EMAIL_TEMPLATES, exampleVars, isEmailTemplateKey, type EmailTemplateKey } from "@/lib/server/email/registry"
import { renderMail, resolveTemplate } from "@/lib/server/email/send"
import { isPlausibleEmail, normalizeEmail } from "@/lib/server/auth/verification"
import { sendMail } from "@/lib/server/mail"
import { MailSendError } from "@/lib/server/mail-retry"

export type TemplateActionResult = { ok: true; message: string } | { ok: false; message: string }

type Guarded = { error: { ok: false; message: string } } | { error?: undefined; session: Session; key: EmailTemplateKey }

async function guard(key: string): Promise<Guarded> {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) return { error: { ok: false, message: "Nincs jogosultsága." } }
  if (!isEmailTemplateKey(key)) return { error: { ok: false, message: "Ismeretlen sablon." } }
  return { session, key }
}

function refresh(key: string) {
  revalidatePath(`${ADMIN_HOME_PATH}/emailek`)
  revalidatePath(`${ADMIN_HOME_PATH}/emailek/${key}`)
}

export async function saveEmailTemplate(key: string, input: { subject: string; html: string; enabled: boolean }): Promise<TemplateActionResult> {
  const g = await guard(key)
  if (g.error) return g.error
  const subject = input.subject.trim()
  const html = input.html.trim()
  if (!subject || subject.length > 300) return { ok: false, message: "A tárgy kötelező (legfeljebb 300 karakter)." }
  if (!html || html.length > 100_000) return { ok: false, message: "A törzs kötelező (legfeljebb 100 000 karakter)." }
  if (/<script\b/i.test(html)) return { ok: false, message: "A sablon nem tartalmazhat <script> elemet." }

  await dbConnect()
  await EmailTemplateModel.updateOne(
    { key: g.key },
    { $set: { subject, html, enabled: input.enabled, updatedByEmail: g.session.user.email ?? null }, $setOnInsert: { key: g.key } },
    { upsert: true },
  )
  refresh(g.key)
  return { ok: true, message: "Sablon mentve." }
}

export async function setEmailTemplateEnabled(key: string, enabled: boolean): Promise<TemplateActionResult> {
  const g = await guard(key)
  if (g.error) return g.error
  const spec = EMAIL_TEMPLATES[g.key]
  await dbConnect()
  await EmailTemplateModel.updateOne(
    { key: g.key },
    { $set: { enabled, updatedByEmail: g.session.user.email ?? null }, $setOnInsert: { key: g.key, subject: spec.defaultSubject, html: spec.defaultHtml } },
    { upsert: true },
  )
  refresh(g.key)
  return { ok: true, message: enabled ? "A sablon aktív." : "A sablon letiltva; a rendszer nem küldi ki." }
}

/** Deletes the saved override; the code default applies again. */
export async function resetEmailTemplate(key: string): Promise<TemplateActionResult> {
  const g = await guard(key)
  if (g.error) return g.error
  await dbConnect()
  await EmailTemplateModel.deleteOne({ key: g.key })
  refresh(g.key)
  return { ok: true, message: "Visszaállítva az alapértelmezett sablonra." }
}

/** Sends the saved (or default) template with example values; the subject is prefixed with [TESZT]. */
export async function sendTestEmail(key: string, rawTo: string): Promise<TemplateActionResult> {
  const g = await guard(key)
  if (g.error) return g.error
  const to = normalizeEmail(rawTo)
  if (!isPlausibleEmail(to)) return { ok: false, message: "Érvénytelen e-mail-cím." }
  const spec = EMAIL_TEMPLATES[g.key]
  try {
    const template = await resolveTemplate(g.key)
    const rendered = renderMail(template, exampleVars(spec))
    const subject = `[TESZT] ${rendered.subject}`
    const { attempts } = await sendMail({ to, subject, text: rendered.text, html: rendered.html })
    await EmailLogModel.create({ templateKey: g.key, to, subject, status: "sent", attempts, triggeredBy: `test:${g.session.user.email ?? g.session.user.id}` })
    return { ok: true, message: `Teszt e-mail elküldve: ${to}` }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const attempts = error instanceof MailSendError ? error.attempts : 1
    await EmailLogModel.create({ templateKey: g.key, to, subject: `[TESZT] ${spec.defaultSubject}`, status: "failed", error: message.slice(0, 1000), attempts, triggeredBy: `test:${g.session.user.email ?? g.session.user.id}` }).catch(() => {})
    return { ok: false, message: `A küldés nem sikerült: ${message}` }
  }
}
