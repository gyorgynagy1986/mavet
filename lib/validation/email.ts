/**
 * Shared e-mail validation for the public forms (client + route handlers).
 * Stricter than a bare regex: checks the TLD, warns about well-known typo TLDs
 * and domains (gmail.con, gmial.com …) and rejects throwaway mailbox providers.
 */

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/

/** TLDs that are not real ones and are almost always a typo → the intended TLD. */
const TYPO_TLD_FIXES: Record<string, string> = {
  con: "com", cmo: "com", ocm: "com", comm: "com", coom: "com", cpm: "com", vom: "com", xom: "com", cim: "com",
  nte: "net", ent: "net", nt: "net",
  ogr: "org", rog: "org", orgg: "org",
  hi: "hu", ju: "hu", uh: "hu", hzu: "hu",
  ed: "edu", eud: "edu",
  dee: "de",
}

/** Domains that are known typos of the big providers → the intended domain. */
const TYPO_DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmali.com": "gmail.com", "gnail.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.hu": "gmail.com", "gemail.com": "gmail.com", "gmaill.com": "gmail.com",
  "hotmal.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmial.com": "hotmail.com", "hotmail.co": "hotmail.com", "homail.com": "hotmail.com",
  "yaho.com": "yahoo.com", "yahou.com": "yahoo.com", "yahoo.co": "yahoo.com", "yhoo.com": "yahoo.com",
  "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.co": "outlook.com",
  "freemal.hu": "freemail.hu", "freemai.hu": "freemail.hu", "fremail.hu": "freemail.hu", "freemail.com": "freemail.hu",
  "citromai.hu": "citromail.hu", "citromail.com": "citromail.hu", "indamai.hu": "indamail.hu",
}

/** Throwaway / disposable mailbox providers (short, high-signal list). */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "yopmail.com", "yopmail.fr", "trashmail.com", "trashmail.de", "getnada.com", "dispostable.com", "maildrop.cc", "sharklasers.com",
  "throwawaymail.com", "fakeinbox.com", "mailnesia.com", "mintemail.com", "emailondeck.com", "tempr.email", "discard.email", "mohmal.com",
  "tmpmail.org", "tmpmail.net", "burnermail.io", "spamgourmet.com", "mailcatch.com", "inboxkitten.com", "harakirimail.com",
])

export type EmailValidation =
  | { ok: true; email: string }
  | { ok: false; reason: "format" | "typo" | "disposable"; suggestion?: string }

/** "Did you mean" domain for a suspected typo, if there is one. */
function suggestDomain(domain: string): string | undefined {
  if (TYPO_DOMAIN_FIXES[domain]) return TYPO_DOMAIN_FIXES[domain]
  const dot = domain.lastIndexOf(".")
  const tldFix = TYPO_TLD_FIXES[domain.slice(dot + 1)]
  return tldFix ? domain.slice(0, dot + 1) + tldFix : undefined
}

/**
 * A suspected typo is a warning, not a verdict (the lists can be wrong about a
 * real address): the forms show it once and pass `allowTypo` when the sender
 * submits the same address again; the route handlers always allow it.
 */
export function validateEmail(raw: string, { allowTypo = false }: { allowTypo?: boolean } = {}): EmailValidation {
  const email = raw.trim().toLowerCase()
  if (email.length === 0 || email.length > 254 || !EMAIL_PATTERN.test(email)) return { ok: false, reason: "format" }
  const [local, domain] = email.split("@")
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return { ok: false, reason: "format" }
  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, reason: "disposable" }
  const suggestion = allowTypo ? undefined : suggestDomain(domain)
  if (suggestion) return { ok: false, reason: "typo", suggestion }
  return { ok: true, email }
}

/** Hungarian, user-facing message for a failed validation. */
export function emailErrorMessage(result: Exclude<EmailValidation, { ok: true }>): string {
  if (result.reason === "typo") return `Elírásnak tűnik. Erre gondolt: ${result.suggestion}? Ha a cím így helyes, küldje el újra.`
  if (result.reason === "disposable") return "Eldobható e-mail-cím nem használható."
  return "Adjon meg egy érvényes e-mail-címet."
}

/** Convenience for the route handlers. */
export function isValidEmail(raw: string): boolean {
  return validateEmail(raw, { allowTypo: true }).ok
}
