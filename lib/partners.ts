/**
 * Partners (specification 3.1 / 3.4): pure rules for the admin editor and the public pages.
 * The home page shows the featured, published partners; /partnerek lists every published one.
 */

export const PARTNERS_PATH = "/partnerek"
export const PARTNERS_INTRO_KEY = "partnerek_bevezeto"
export const PARTNERS_INTRO_MAX = 1000
export const PARTNER_NAME_MAX = 120

export const DEFAULT_PARTNERS_INTRO =
  "Hiszünk az együttműködés erejében. Köszönjük mindazoknak a szervezeteknek, intézményeknek és partnereknek a bizalmát és támogatását, akikkel együtt dolgozhatunk a vidék egészségügyének fejlesztéséért."

/** Logo uploads: raster or SVG, up to 4 MB; stored normalised (see lib/server/partner-logo.ts). */
export const LOGO_MAX_BYTES = 4 * 1024 * 1024
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const
export const LOGO_ACCEPT = LOGO_TYPES.join(",")
/** Every logo is fitted into this box (no cropping), so the tiles render alike. */
export const LOGO_BOX = { width: 800, height: 400 } as const

export const LOGO_MESSAGES = {
  missing: "Válasszon egy logófájlt.",
  type: "PNG, JPEG, WebP vagy SVG logó tölthető fel.",
  tooLarge: "A logó legfeljebb 4 MB lehet.",
  unreadable: "A képet nem sikerült feldolgozni; próbáljon másik fájlt.",
  notConfigured: "A fájltároló nincs beállítva ezen a környezeten.",
  storage: "A logó mentése nem sikerült. Próbálja újra.",
  deleteFailed: "A logó törlése a tárolóból nem sikerült.",
} as const

export function logoFileError(file: { type: string; size: number } | null | undefined): string | null {
  if (!file || file.size === 0) return LOGO_MESSAGES.missing
  if (!(LOGO_TYPES as readonly string[]).includes(file.type)) return LOGO_MESSAGES.type
  if (file.size > LOGO_MAX_BYTES) return LOGO_MESSAGES.tooLarge
  return null
}

export interface PartnerInput {
  name: string
  websiteUrl: string
}
export type PartnerErrors = Partial<Record<keyof PartnerInput, string>>

const str = (v: unknown) => (typeof v === "string" ? v : "")
export const isHttpUrl = (v: string) => /^https?:\/\/\S+$/i.test(v)

export function normalizePartner(raw: Partial<Record<keyof PartnerInput, unknown>>): PartnerInput {
  return { name: str(raw.name).trim().slice(0, PARTNER_NAME_MAX), websiteUrl: str(raw.websiteUrl).trim() }
}

export function validatePartner(input: PartnerInput): PartnerErrors {
  const e: PartnerErrors = {}
  if (!input.name) e.name = "Adja meg a partner nevét."
  if (input.websiteUrl && !isHttpUrl(input.websiteUrl)) e.websiteUrl = "Teljes webcím kell (https://…)."
  return e
}

export interface PartnerView {
  id: string
  name: string
  logoUrl: string | null
  websiteUrl: string | null
  featured: boolean
}
