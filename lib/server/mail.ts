import sgMail from "@sendgrid/mail"

export type MailMessage = {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
}

function getSender(): { email: string; name: string } {
  return {
    email: process.env.MAIL_FROM || "no-reply@videkegeszseg.hu",
    name: process.env.MAIL_FROM_NAME || "MAVET",
  }
}

/** Address that receives the internal notifications (new application, contact message). */
export function getNotificationRecipient(): string | null {
  return process.env.MAIL_TO?.trim() || null
}

let configured = false

/**
 * Sends one e-mail through SendGrid. Without SENDGRID_API_KEY (local dev) the
 * message is logged instead of sent, so the flow can be exercised end to end.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.warn("⚠️ [mail] SENDGRID_API_KEY missing — e-mail not sent:", {
      to: message.to,
      subject: message.subject,
    })
    return
  }
  if (!configured) {
    sgMail.setApiKey(apiKey)
    configured = true
  }
  await sgMail.send({
    from: getSender(),
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html ?? textToHtml(message.text),
  })
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

/** Minimal, mail-client-safe HTML body: paragraphs from blank-line separated text. */
export function textToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 1em">${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
    .join("")
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">${paragraphs}</div>`
}
