import type { Types } from "mongoose"
import dbConnect from "@/lib/db-connect"
import { EmailLogModel } from "@/lib/models/email-log"
import { EmailTemplateModel } from "@/lib/models/email-template"
import { sendMail } from "@/lib/server/mail"
import { EMAIL_TEMPLATES, type EmailTemplateKey } from "@/lib/server/email/registry"
import { htmlToText, renderTemplate, wrapInMailLayout, type TemplateVars } from "@/lib/server/email/render"

export interface ResolvedTemplate {
  key: EmailTemplateKey
  subject: string
  html: string
  enabled: boolean
  customized: boolean
  updatedAt: Date | null
  updatedByEmail: string | null
}

/** The effective template: the admin's saved version, or the code default. */
export async function resolveTemplate(key: EmailTemplateKey): Promise<ResolvedTemplate> {
  const spec = EMAIL_TEMPLATES[key]
  await dbConnect()
  const doc = await EmailTemplateModel.findOne({ key })
    .lean<{ subject: string; html: string; enabled: boolean; updatedAt: Date; updatedByEmail: string | null } | null>()
  if (!doc) {
    return { key, subject: spec.defaultSubject, html: spec.defaultHtml, enabled: true, customized: false, updatedAt: null, updatedByEmail: null }
  }
  return { key, subject: doc.subject, html: doc.html, enabled: doc.enabled, customized: true, updatedAt: doc.updatedAt, updatedByEmail: doc.updatedByEmail ?? null }
}

export interface RenderedMail {
  subject: string
  html: string
  text: string
}

export function renderMail(template: { subject: string; html: string }, vars: TemplateVars): RenderedMail {
  const subject = renderTemplate(template.subject, vars, { html: false })
  const body = renderTemplate(template.html, vars)
  return { subject, html: wrapInMailLayout(body), text: htmlToText(body) }
}

export interface SendTemplatedOptions {
  key: EmailTemplateKey
  to: string
  vars: TemplateVars
  triggeredBy?: string
  applicationId?: Types.ObjectId | string | null
  userId?: Types.ObjectId | string | null
  replyTo?: string
}

export type SendTemplatedResult = { status: "sent" | "skipped" } | { status: "failed"; error: string }

/**
 * Renders and sends a templated mail and records the outcome in `email_logs`.
 * Never throws: callers decide what a failed mail means for their flow.
 */
export async function sendTemplatedMail(options: SendTemplatedOptions): Promise<SendTemplatedResult> {
  const { key, to, vars, triggeredBy = "system", applicationId = null, userId = null, replyTo } = options
  let subject = EMAIL_TEMPLATES[key].defaultSubject
  try {
    const template = await resolveTemplate(key)
    const rendered = renderMail(template, vars)
    subject = rendered.subject

    if (!template.enabled) {
      await EmailLogModel.create({ templateKey: key, to, subject, status: "skipped", error: "A sablon le van tiltva.", triggeredBy, applicationId, userId })
      return { status: "skipped" }
    }

    await sendMail({ to, subject, text: rendered.text, html: rendered.html, replyTo })
    await EmailLogModel.create({ templateKey: key, to, subject, status: "sent", triggeredBy, applicationId, userId })
    return { status: "sent" }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ [email] ${key} → ${to} failed:`, message)
    try {
      await dbConnect()
      await EmailLogModel.create({ templateKey: key, to, subject, status: "failed", error: message.slice(0, 1000), triggeredBy, applicationId, userId })
    } catch (logError) {
      console.error("❌ [email] log write failed:", logError)
    }
    return { status: "failed", error: message }
  }
}
