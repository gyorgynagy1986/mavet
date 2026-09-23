import dbConnect, { markPoolPoisoned } from "@/lib/db-connect"
import {
  MembershipApplicationModel,
  membershipApplicationCategories,
  membershipApplicationTitles,
  type MembershipApplicationCategory,
  type MembershipApplicationTitle,
} from "@/lib/models/membership-application"
import { getNotificationRecipient, sendMail } from "@/lib/server/mail"
import { adminNotificationMail, applicantConfirmationMail } from "@/lib/server/membership-application-mails"
import { getClientIp, hashIp, rateLimit } from "@/lib/server/rate-limit"
import { isValidEmail } from "@/lib/validation/email"

export const runtime = "nodejs"

const NAME_MAX = 100

type Payload = {
  category: MembershipApplicationCategory
  title: MembershipApplicationTitle
  lastName: string
  firstName: string
  email: string
  privacyNoticeVersion: string
}

function parsePayload(body: unknown): Payload | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  const category = typeof b.category === "string" ? b.category : ""
  const title = typeof b.title === "string" ? b.title : ""
  const lastName = typeof b.lastName === "string" ? b.lastName.trim() : ""
  const firstName = typeof b.firstName === "string" ? b.firstName.trim() : ""
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : ""
  const privacyNoticeVersion = typeof b.privacyNoticeVersion === "string" && b.privacyNoticeVersion.trim() ? b.privacyNoticeVersion.trim() : "unknown"

  const valid =
    (membershipApplicationCategories as readonly string[]).includes(category) &&
    (membershipApplicationTitles as readonly string[]).includes(title) &&
    lastName.length > 0 &&
    lastName.length <= NAME_MAX &&
    firstName.length > 0 &&
    firstName.length <= NAME_MAX &&
    isValidEmail(email) &&
    b.consent === true
  if (!valid) return null

  return {
    category: category as MembershipApplicationCategory,
    title: title as MembershipApplicationTitle,
    lastName,
    firstName,
    email,
    privacyNoticeVersion,
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  // Abuse limit: 5 submissions per IP per 10 minutes.
  const limit = await rateLimit("membership-application", ip, 5, "10 m")
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
    console.error("❌ [membership-application] db connect failed:", error)
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 })
  }

  let application
  try {
    application = await MembershipApplicationModel.create({
      ...payload,
      status: "tagjelolt",
      consent: {
        accepted: true,
        acceptedAt: new Date(),
        privacyNoticeVersion: payload.privacyNoticeVersion,
        ipHash: hashIp(ip),
        userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? undefined,
      },
    })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      // Same e-mail already applied: no new record, identical response (the
      // existence of an address must not be inferable), but the confirmation
      // is re-sent so the owner learns the application is on file. Bounded to
      // one re-send per address per day to prevent mail bombing.
      const resend = await rateLimit("membership-application-resend", hashIp(payload.email), 1, "1 d")
      if (resend.allowed) {
        try {
          await sendMail(applicantConfirmationMail(payload.email))
          await MembershipApplicationModel.updateOne(
            { email: payload.email },
            { $set: { "notifications.applicantEmailSentAt": new Date() } },
          )
        } catch (mailError) {
          console.error("❌ [membership-application] duplicate re-send failed:", mailError)
        }
      }
      return Response.json({ ok: true, duplicate: true }, { status: 200 })
    }
    if (markPoolPoisoned(error)) {
      console.error("❌ [membership-application] pool failure:", error)
      return Response.json({ ok: false, error: "unavailable" }, { status: 503 })
    }
    console.error("❌ [membership-application] save failed:", error)
    return Response.json({ ok: false, error: "server_error" }, { status: 500 })
  }

  // E-mails are best effort: the record is already saved, delivery is tracked on it.
  const createdAt = application.createdAt ?? new Date()
  const notifications: Record<string, unknown> = {}

  try {
    await sendMail(applicantConfirmationMail(application.email))
    notifications["notifications.applicantEmailSentAt"] = new Date()
  } catch (error) {
    console.error("❌ [membership-application] applicant e-mail failed:", error)
    notifications["notifications.lastError"] = `applicant: ${(error as Error).message}`.slice(0, 512)
  }

  const recipient = getNotificationRecipient()
  if (recipient) {
    try {
      await sendMail(adminNotificationMail(recipient, { ...payload, createdAt }))
      notifications["notifications.adminEmailSentAt"] = new Date()
    } catch (error) {
      console.error("❌ [membership-application] admin e-mail failed:", error)
      notifications["notifications.lastError"] = `admin: ${(error as Error).message}`.slice(0, 512)
    }
  } else {
    console.warn("⚠️ [membership-application] MAIL_TO missing — no internal notification sent")
  }

  if (Object.keys(notifications).length) {
    await MembershipApplicationModel.updateOne({ _id: application._id }, { $set: notifications }).catch((error) => {
      console.error("❌ [membership-application] notification bookkeeping failed:", error)
    })
  }

  return Response.json({ ok: true, id: String(application._id) }, { status: 201 })
}
