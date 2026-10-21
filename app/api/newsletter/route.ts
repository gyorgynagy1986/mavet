import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import { NewsletterConsentModel } from "@/lib/models/newsletter-consent"
import { subscribeNewsletter } from "@/lib/server/newsletter"
import { getClientIp, hashIp, rateLimit } from "@/lib/server/rate-limit"
import { isValidEmail } from "@/lib/validation/email"

export const dynamic = "force-dynamic"

/**
 * Newsletter sign-up (10.2): e-mail + explicit consent. The provider key stays on the server. A
 * duplicate is a neutral success; on any failure nothing is recorded and the form keeps its fields.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request)
  const limit = await rateLimit("newsletter", ip, 5, "10 m")
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited", message: "Túl sok próbálkozás. Próbálja újra néhány perc múlva." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: "invalid", message: "Hibás kérés." }, { status: 400 })
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : ""
  const consent = body.consent === true
  const privacyNoticeVersion = typeof body.privacyNoticeVersion === "string" && body.privacyNoticeVersion.trim() ? body.privacyNoticeVersion.trim().slice(0, 64) : "unknown"
  if (!isValidEmail(email)) return NextResponse.json({ ok: false, error: "invalid", message: "Adjon meg érvényes e-mail-címet." }, { status: 400 })
  if (!consent) return NextResponse.json({ ok: false, error: "consent", message: "A hírlevél-feliratkozási nyilatkozat elfogadása szükséges." }, { status: 400 })

  const result = await subscribeNewsletter(email)
  if (!result.ok) {
    const status = result.status === "rate_limited" ? 429 : result.status === "unavailable" ? 503 : result.status === "limit" ? 403 : 400
    return NextResponse.json({ ok: false, error: result.status, message: result.message }, { status })
  }

  try {
    await dbConnect()
    await NewsletterConsentModel.create({ email, privacyNoticeVersion, consentedAt: new Date(), ipHash: hashIp(ip), userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null, providerStatus: result.status })
  } catch (error) {
    // The subscription went through at the provider; a missing consent record is logged, not shown.
    console.error("[newsletter] consent record failed:", error)
  }
  return NextResponse.json({ ok: true })
}
