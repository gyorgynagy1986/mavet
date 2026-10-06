import type { MembershipApplicationCategory } from "@/lib/models/membership-application"
import { PHONE_ERROR, isValidPhone } from "@/lib/validation/phone"

/**
 * Validation of the full application form (specification 7.1). Shared by the
 * client form (field-level messages) and the server actions (authoritative).
 * Pure: no server imports.
 */

export interface FullFormInput {
  birthDate: string // ISO date (YYYY-MM-DD)
  postalCode: string
  city: string
  street: string
  country: string
  phone: string
  specialty: string
  workplace: string
  noWorkplace: boolean
  medicalDegree: "orvos" | "nem_orvos" | ""
}

export type FullFormField = keyof FullFormInput
export type FullFormErrors = Partial<Record<FullFormField | "statutes" | "privacy", string>>

export const fullFormFields: FullFormField[] = ["birthDate", "postalCode", "city", "street", "country", "phone", "specialty", "workplace", "noWorkplace", "medicalDegree"]

export const IFJUSAGI_MAX_AGE = 35
export const MIN_AGE = 18

export function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Full years between the birth date and `at` (UTC calendar arithmetic). */
export function ageAt(birthDate: Date, at: Date): number {
  let age = at.getUTCFullYear() - birthDate.getUTCFullYear()
  const beforeBirthday =
    at.getUTCMonth() < birthDate.getUTCMonth() ||
    (at.getUTCMonth() === birthDate.getUTCMonth() && at.getUTCDate() < birthDate.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

export function normalizeFullForm(raw: Partial<Record<FullFormField, unknown>>): FullFormInput {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
  const medical = raw.medicalDegree
  return {
    birthDate: s(raw.birthDate, 10),
    postalCode: s(raw.postalCode, 16),
    city: s(raw.city, 100),
    street: s(raw.street, 200),
    country: s(raw.country, 100),
    phone: s(raw.phone, 40),
    specialty: s(raw.specialty, 200),
    workplace: s(raw.workplace, 200),
    noWorkplace: raw.noWorkplace === true || raw.noWorkplace === "true" || raw.noWorkplace === "on",
    medicalDegree: medical === "orvos" || medical === "nem_orvos" ? medical : "",
  }
}

/**
 * Validates for finalization. `now` is injectable for tests. Returns an empty
 * object when the form is complete.
 */
export function validateFullForm(input: FullFormInput, category: MembershipApplicationCategory, now = new Date()): FullFormErrors {
  const errors: FullFormErrors = {}

  const birth = parseIsoDate(input.birthDate)
  if (!birth) errors.birthDate = "Adja meg a születési dátumát."
  else if (birth.getTime() > now.getTime()) errors.birthDate = "A születési dátum nem lehet a jövőben."
  else {
    const age = ageAt(birth, now)
    if (age < MIN_AGE) errors.birthDate = `A tagsághoz a ${MIN_AGE}. életév betöltése szükséges.`
    else if (category === "ifjusagi" && age >= IFJUSAGI_MAX_AGE)
      errors.birthDate = `Az Ifjúsági tagság a ${IFJUSAGI_MAX_AGE}. életév betöltéséig választható; kérjük, válasszon Rendes tagságot.`
  }

  if (!input.postalCode) errors.postalCode = "Adja meg az irányítószámot."
  if (!input.city) errors.city = "Adja meg a települést."
  if (!input.street) errors.street = "Adja meg a címet (utca, házszám)."
  if (!input.country) errors.country = "Adja meg az országot."
  if (!input.phone) errors.phone = "Adja meg a telefonszámát."
  else if (!isValidPhone(input.phone)) errors.phone = PHONE_ERROR
  if (!input.specialty) errors.specialty = category === "hallgatoi" ? "Adja meg a tanulmányi területét." : "Adja meg a szakterületét."

  if (category !== "hallgatoi" && !input.noWorkplace && !input.workplace) {
    errors.workplace = "Adja meg a munkahelyét, vagy jelölje, hogy nincs állandó munkahelye."
  }
  if (category === "rendes" && !input.medicalDegree) {
    errors.medicalDegree = "Jelölje meg, hogy orvos vagy gyógyszerész végzettségű-e (ez határozza meg az éves tagdíjat)."
  }

  return errors
}

export function isFullFormComplete(input: FullFormInput, category: MembershipApplicationCategory, now = new Date()): boolean {
  return Object.keys(validateFullForm(input, category, now)).length === 0
}
