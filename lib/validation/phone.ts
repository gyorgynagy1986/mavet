import { parsePhoneNumberFromString } from "libphonenumber-js"

/**
 * Shared phone validation for the application and the profile form (client +
 * server). Numbers without a country code are read as Hungarian, so
 * "06 30 123 4567" and "30/123-4567" are fine. Pure: no server imports.
 */

const DEFAULT_COUNTRY = "HU"

export const PHONE_ERROR = "Adjon meg egy érvényes telefonszámot, pl. +36 30 123 4567."

/** E.164 form ("+36301234567") of a valid number, otherwise null. This is what gets stored. */
export function normalizePhone(raw: string): string | null {
  const parsed = parsePhoneNumberFromString(raw.trim(), DEFAULT_COUNTRY)
  return parsed?.isValid() ? parsed.number : null
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null
}

/** Display form ("+36 30 123 4567"); a number saved before the normalisation is shown as it is. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return ""
  const parsed = parsePhoneNumberFromString(value, DEFAULT_COUNTRY)
  return parsed?.isValid() ? parsed.formatInternational() : value
}
