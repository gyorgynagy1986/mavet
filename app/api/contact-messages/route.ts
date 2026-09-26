import dbConnect, { markPoolPoisoned } from "@/lib/db-connect"
import { CONTACT_MESSAGE_MAX, CONTACT_NAME_MAX, ContactMessageModel } from "@/lib/models/contact-message"
import { contactNotificationMail } from "@/lib/server/contact-message-mails"
import { getNotificationRecipient, sendMail } from "@/lib/server/mail"
import { getClientIp, hashIp, rateLimit } from "@/lib/server/rate-limit"
import { isValidEmail } from "@/lib/validation/email"

export const runtime = "nodejs"

const MESSAGE_MIN = 10

type Payload = {
  name: string
  email: string
  message: string
  privacyNoticeVersion: string
}

function parsePayload(body: unknown): Payload | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  const name = typeof b.name === "string" ? b.name.trim() : ""
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : ""
  const message = typeof b.message === "string" ? b.message.trim() : ""
  const privacyNoticeVersion =
    typeof b.privacyNoticeVersion === "string" && b.privacyNoticeVersion.trim() ? b.privacyNoticeVersion.trim() : "unknown"

  const valid =
    name.length >= 2 &&
    name.length <= CONTACT_NAME_MAX &&
    isValidEmail(email) &&
    message.length >= MESSAGE_MIN &&
    message.length <= CONTACT_MESSAGE_MAX &&
    b.consent === true
  if (!valid) return null

  return { name, email, message, privacyNoticeVersion }
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  // Abuse limit: 5 messages per IP per 10 minutes.
  const limit = await rateLimit("contact-message", ip, 5, "10 m")
  if (!limit.allowed) {
    return Response.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

  const body = await request.json().catch(() => null)
  const payload = parsePayload(body)
  if (!payload) return Response.json({ ok: false, error: "invalid" }, { status: 400 })

  try {
    await dbConnect()
  } catch (error) {
    markPoolPoisoned(error)
    console.error("❌ [contact-message] db connect failed:", error)
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 })
  }

  let saved
  try {
    saved = await ContactMessageModel.create({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      consent: {
        accepted: true,
        acceptedAt: new Date(),
        privacyNoticeVersion: payload.privacyNoticeVersion,
        ipHash: hashIp(ip),
        userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? undefined,
      },
    })
  } catch (error) {
    if (markPoolPoisoned(error)) {
      console.error("❌ [contact-message] pool failure:", error)
      return Response.json({ ok: false, error: "unavailable" }, { status: 503 })
    }
    console.error("❌ [contact-message] save failed:", error)
    return Response.json({ ok: false, error: "server_error" }, { status: 500 })
  }

  // The notification is best effort: the message is already saved, delivery is tracked on it.
  const createdAt = saved.createdAt ?? new Date()
  const notifications: Record<string, unknown> = {}
  const recipient = getNotificationRecipient()
  if (recipient) {
    try {
      await sendMail(contactNotificationMail(recipient, { ...payload, createdAt }))
      notifications["notifications.adminEmailSentAt"] = new Date()
    } catch (error) {
      console.error("❌ [contact-message] notification e-mail failed:", error)
      notifications["notifications.lastError"] = `admin: ${(error as Error).message}`.slice(0, 512)
    }
  } else {
    console.warn("⚠️ [contact-message] MAIL_TO missing — no internal notification sent")
  }

  if (Object.keys(notifications).length) {
    await ContactMessageModel.updateOne({ _id: saved._id }, { $set: notifications }).catch((error) => {
      console.error("❌ [contact-message] notification bookkeeping failed:", error)
    })
  }

  return Response.json({ ok: true, id: String(saved._id) }, { status: 201 })
}
