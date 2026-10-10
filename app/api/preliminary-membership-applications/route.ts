import dbConnect, { markPoolPoisoned } from "@/lib/db-connect"
import {
  MembershipApplicationModel,
  membershipApplicationCategories,
  membershipApplicationTitles,
  openApplicationStatuses,
  unfinishedApplicationStatuses,
  type MembershipApplicationCategory,
  type MembershipApplicationDocument,
  type MembershipApplicationTitle,
} from "@/lib/models/membership-application"
import { ensureApplicationIndexes, sendContinueLink } from "@/lib/server/applications"
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

/**
 * Step 1 of the membership application (D-018): the short form. Saves the
 * applicant in `elozetes` state and e-mails the continuation link that verifies
 * the address and leads to the full form. A second submission for an address
 * with an OPEN application creates nothing and answers identically (the
 * existence of an address must not be inferable); an unfinished application
 * gets its link re-sent, at most once a day.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request)

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
  await ensureApplicationIndexes()

  let application: MembershipApplicationDocument
  try {
    const created = await MembershipApplicationModel.create({
      ...payload,
      status: "elozetes",
      lastActivityAt: new Date(),
      consent: {
        accepted: true,
        acceptedAt: new Date(),
        privacyNoticeVersion: payload.privacyNoticeVersion,
        ipHash: hashIp(ip),
        userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? undefined,
      },
    })
    application = created.toObject ? (created.toObject() as MembershipApplicationDocument) : (created as unknown as MembershipApplicationDocument)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const resend = await rateLimit("membership-application-resend", hashIp(payload.email), 1, "1 d")
      if (resend.allowed) {
        try {
          const existing = await MembershipApplicationModel.findOne({ email: payload.email, status: { $in: [...openApplicationStatuses] } })
            .select({ email: 1, title: 1, lastName: 1, firstName: 1, category: 1, status: 1 })
            .lean<MembershipApplicationDocument | null>()
          if (existing && (unfinishedApplicationStatuses as readonly string[]).includes(existing.status)) {
            await sendContinueLink(existing, "folytatas", "system:resend")
          } else if (!existing) {
            // Duplicate key without an open application = a stale unique index. Loud, not silent.
            console.error("❌ [membership-application] duplicate key but no open application for this address — check the email_1 index (npm run migrate:applications)")
            return Response.json({ ok: false, error: "server_error" }, { status: 500 })
          }
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

  // The record is saved; the mail is best effort and tracked in email_logs.
  await sendContinueLink(application, "folytatas", "system")

  return Response.json({ ok: true, id: String(application._id) }, { status: 201 })
}
