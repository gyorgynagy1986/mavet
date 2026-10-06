import { workgroupOptions } from "@/lib/data/site"

/** Mirrors `membershipApplicationTitles` in the model; kept here so the client bundle stays free of mongoose. */
export const profileTitles = ["", "Dr.", "Prof."] as const
export type MembershipApplicationTitle = (typeof profileTitles)[number]

/** Profile fields a member edits (specification 9.2). Pure, shared by client and server. */
export interface ProfileInput {
  title: MembershipApplicationTitle
  lastName: string
  firstName: string
  birthDate: string
  birthPlace: string
  postalCode: string
  city: string
  street: string
  country: string
  phone: string
  specialty: string
  workplace: string
  bio: string
  interests: string
  workgroups: string[]
}

export type ProfileErrors = Partial<Record<keyof ProfileInput, string>>

export const BIO_MAX = 500
export const INTERESTS_MAX = 10

const PHONE_PATTERN = /^\+?[0-9 ()/-]{6,30}$/
const workgroupIds = new Set<string>(workgroupOptions.map((w) => w.id))

export function normalizeProfile(raw: Partial<Record<keyof ProfileInput, unknown>>): ProfileInput {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
  const title = typeof raw.title === "string" && (profileTitles as readonly string[]).includes(raw.title) ? (raw.title as MembershipApplicationTitle) : ""
  const workgroups = Array.isArray(raw.workgroups) ? raw.workgroups.filter((w): w is string => typeof w === "string" && workgroupIds.has(w)) : []
  return {
    title,
    lastName: s(raw.lastName, 100),
    firstName: s(raw.firstName, 100),
    birthDate: s(raw.birthDate, 10),
    birthPlace: s(raw.birthPlace, 120),
    postalCode: s(raw.postalCode, 16),
    city: s(raw.city, 100),
    street: s(raw.street, 200),
    country: s(raw.country, 100),
    phone: s(raw.phone, 40),
    specialty: s(raw.specialty, 200),
    workplace: s(raw.workplace, 200),
    bio: s(raw.bio, BIO_MAX + 100),
    interests: s(raw.interests, 500),
    workgroups: [...new Set(workgroups)],
  }
}

/** Comma-separated interests → trimmed, deduplicated list. */
export function parseInterests(value: string): string[] {
  const out: string[] = []
  for (const item of value.split(/[,;\n]/)) {
    const v = item.trim().slice(0, 60)
    if (v && !out.includes(v)) out.push(v)
  }
  return out.slice(0, INTERESTS_MAX)
}

export function validateProfile(input: ProfileInput): ProfileErrors {
  const errors: ProfileErrors = {}
  if (!input.lastName) errors.lastName = "Adja meg a vezetéknevét."
  if (!input.firstName) errors.firstName = "Adja meg a keresztnevét."
  if (input.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) errors.birthDate = "Érvénytelen dátum."
  if (input.phone && !PHONE_PATTERN.test(input.phone)) errors.phone = "Adjon meg egy érvényes telefonszámot."
  if (input.bio.length > BIO_MAX) errors.bio = `A bemutatkozás legfeljebb ${BIO_MAX} karakter lehet.`
  return errors
}
