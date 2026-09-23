/**
 * Shared e-mail validation for the public forms (client + route handlers).
 * Stricter than a bare regex: checks the TLD, rejects well-known typo TLDs
 * and domains (gmail.con, gmial.com …) and throwaway mailbox providers.
 */

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/

/** TLDs that are almost always a typo of a real one. */
const TYPO_TLDS = new Set([
  "con", "cmo", "ocm", "comm", "coom", "cpm", "vom", "xom", "co,", "cim", "om", "cm", "c0m",
  "nte", "ent", "nt", "et",
  "ogr", "rog", "orgg",
  "hi", "ju", "uh", "hzu",
  "ed", "eud", "eu.",
  "dee", "ed.",
])

/** Domains that are known typos of the big providers. */
const TYPO_DOMAINS = new Set([
  "gmial.com", "gmai.com", "gamil.com", "gmali.com", "gnail.com", "gmail.co", "gmail.cm", "gmail.hu", "gemail.com", "gmaill.com", "gmailcom",
  "hotmal.com", "hotmai.com", "hotmial.com", "hotmail.co", "homail.com", "hotmail.hu",
  "yaho.com", "yahou.com", "yahoo.co", "yhoo.com",
  "outlok.com", "outloo.com", "outlook.co",
  "freemal.hu", "freemai.hu", "fremail.hu", "freemail.com", "citromai.hu", "citromail.com", "indamai.hu",
])

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

/** Builds a "did you mean" suggestion for the common typo domains. */
function suggestDomain(domain: string): string | undefined {
  const fixes: Record<string, string> = {
    "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmali.com": "gmail.com", "gnail.com": "gmail.com",
    "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.hu": "gmail.com", "gemail.com": "gmail.com", "gmaill.com": "gmail.com", "gmailcom": "gmail.com",
    "hotmal.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmial.com": "hotmail.com", "hotmail.co": "hotmail.com", "homail.com": "hotmail.com", "hotmail.hu": "hotmail.com",
    "yaho.com": "yahoo.com", "yahou.com": "yahoo.com", "yahoo.co": "yahoo.com", "yhoo.com": "yahoo.com",
    "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.co": "outlook.com",
    "freemal.hu": "freemail.hu", "freemai.hu": "freemail.hu", "fremail.hu": "freemail.hu", "freemail.com": "freemail.hu",
    "citromai.hu": "citromail.hu", "citromail.com": "citromail.hu", "indamai.hu": "indamail.hu",
  }
  if (fixes[domain]) return fixes[domain]
  const tld = domain.slice(domain.lastIndexOf(".") + 1)
  const tldFixes: Record<string, string> = { con: "com", cmo: "com", ocm: "com", comm: "com", coom: "com", cpm: "com", vom: "com", xom: "com", cim: "com", om: "com", cm: "com", c0m: "com", nte: "net", ent: "net", ogr: "org", rog: "org", orgg: "org", hi: "hu", ju: "hu", uh: "hu", hzu: "hu" }
  if (tldFixes[tld]) return domain.slice(0, domain.lastIndexOf(".") + 1) + tldFixes[tld]
  return undefined
}

export function validateEmail(raw: string): EmailValidation {
  const email = raw.trim().toLowerCase()
  if (email.length === 0 || email.length > 254 || !EMAIL_PATTERN.test(email)) return { ok: false, reason: "format" }
  const [local, domain] = email.split("@")
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return { ok: false, reason: "format" }
  const tld = domain.slice(domain.lastIndexOf(".") + 1)
  if (TYPO_TLDS.has(tld) || TYPO_DOMAINS.has(domain)) return { ok: false, reason: "typo", suggestion: suggestDomain(domain) }
  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, reason: "disposable" }
  return { ok: true, email }
}

/** Hungarian, user-facing message for a failed validation. */
export function emailErrorMessage(result: Exclude<EmailValidation, { ok: true }>): string {
  if (result.reason === "typo") return result.suggestion ? `Elírt e-mail-cím. Erre gondolt: ${result.suggestion}?` : "Elírt e-mail-cím. Ellenőrizze a domain végződését."
  if (result.reason === "disposable") return "Eldobható e-mail-címmel nem lehet jelentkezni."
  return "Adjon meg egy érvényes e-mail-címet."
}

/** Convenience for the route handlers. */
export function isValidEmail(raw: string): boolean {
  return validateEmail(raw).ok
}
