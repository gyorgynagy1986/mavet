/**
 * Newsletter (specification 10.2): subscriptions go to hirlevelek-kuldese.hu through its partner API.
 * The key never reaches the browser; our route (app/api/newsletter) calls this server-side with the
 * Origin header the provider checks against its allowed-domain list.
 *
 * Environment: NEWSLETTER_API_KEY (Bearer), NEWSLETTER_USERNAME (the provider account's username),
 * NEWSLETTER_ORIGIN (exactly as registered at the provider, e.g. https://videkegeszseg.hu).
 * The provider has no unsubscribe or status endpoint: unsubscribing happens through the link in the
 * newsletter itself, so the member account cannot show or change the subscription (10.2, partially).
 */

const PARTNER_API_URL = "https://www.hirlevelek-kuldese.hu/api/partnerSubscribe"

export type SubscribeResult = { ok: true; status: "subscribed" | "already" } | { ok: false; status: "rate_limited" | "limit" | "invalid" | "unavailable"; message: string }

export function isNewsletterConfigured(): boolean {
  return Boolean(process.env.NEWSLETTER_API_KEY && process.env.NEWSLETTER_USERNAME && process.env.NEWSLETTER_ORIGIN)
}

/** Duplicates are blocked by the provider; we report them as a neutral success (10.2). */
function looksLikeDuplicate(text: string): boolean {
  return /already|exist|duplicate|m[aá]r fel|m[aá]r szerepel|m[aá]r regisztr/i.test(text)
}

export async function subscribeNewsletter(email: string): Promise<SubscribeResult> {
  if (!isNewsletterConfigured()) return { ok: false, status: "unavailable", message: "A hírlevél-feliratkozás nincs beállítva ezen a környezeten." }
  let response: Response
  try {
    response = await fetch(PARTNER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NEWSLETTER_API_KEY}`, Origin: process.env.NEWSLETTER_ORIGIN as string },
      body: JSON.stringify({ email, username: process.env.NEWSLETTER_USERNAME }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    })
  } catch (error) {
    console.error("[newsletter] provider unreachable:", error)
    return { ok: false, status: "unavailable", message: "A hírlevél-szolgáltatás most nem érhető el. Próbálja újra később." }
  }
  const text = await response.text()
  if (response.ok) return { ok: true, status: "subscribed" }
  let message = text
  try {
    const parsed = JSON.parse(text) as { error?: unknown; message?: unknown }
    if (typeof parsed.error === "string") message = parsed.error
    else if (typeof parsed.message === "string") message = parsed.message
  } catch {
    // plain text error
  }
  if (response.status === 429) return { ok: false, status: "rate_limited", message: "Túl sok kérés érkezett. Próbálja újra néhány perc múlva." }
  if (looksLikeDuplicate(message)) return { ok: true, status: "already" }
  if (response.status === 403) {
    console.error("[newsletter] provider refused (403):", message)
    return { ok: false, status: "limit", message: "A feliratkozás most nem lehetséges. Kérjük, próbálja újra később." }
  }
  console.warn("[newsletter] provider rejected:", response.status, message)
  return { ok: false, status: "invalid", message: "Ezzel az e-mail-címmel nem sikerült feliratkozni. Ellenőrizze a címet, és próbálja újra." }
}
