import type { MembershipApplicationCategory } from "@/lib/models/membership-application"

/**
 * Fee rules (specification 4.2, 7.3, 8.1, 8.2). Amounts in HUF per calendar
 * year; no pro-rata. Pure module: shared by the public pages, the admin and the
 * activation flow.
 */

/** No fee is due for this calendar year; the first mandatory year is the next one. */
export const FEE_WAIVED_THROUGH_YEAR = 2026

export const FEE_RENDES_MEDICAL = 10_000
export const FEE_RENDES_OTHER = 5_000
export const FEE_IFJUSAGI = 5_000

/** Days the applicant has to settle the first fee (8.1: "egy hónap"). */
export const FIRST_FEE_DAYS = 30

export function annualFee(category: MembershipApplicationCategory, medicalDegree?: boolean | null): number {
  if (category === "rendes") return medicalDegree ? FEE_RENDES_MEDICAL : FEE_RENDES_OTHER
  if (category === "ifjusagi") return FEE_IFJUSAGI
  return 0
}

export function isFeePaying(category: MembershipApplicationCategory): boolean {
  return category === "rendes" || category === "ifjusagi"
}

/**
 * Which membership year a payment made at `at` covers: a payment in December
 * covers the rest of that year and the whole next year (4.2, 8.2).
 */
export function membershipYearFor(at: Date): number {
  const y = at.getUTCFullYear()
  return at.getUTCMonth() === 11 ? y + 1 : y
}

export interface ActivationOutcome {
  /** Whether the membership is active right away. */
  active: boolean
  /** Year through which the membership is paid/valid (when active). */
  paidThroughYear: number | null
  /** Amount due now (0 when nothing is due). */
  amountDue: number
  /** Which year the due amount covers. */
  dueForYear: number | null
}

/**
 * What happens when an accepted applicant activates the account at `at`:
 *  - fee-free category → active, valid through the current year (renewal rules
 *    do not apply to fee-free categories anyway);
 *  - fee-paying but activated in a waived year → active through that year
 *    without payment (7.3: "2026. december 31-ig elfogadott ... díjfizetés nélkül");
 *  - otherwise → waits for the first fee for the year the payment would cover.
 */
export function activationOutcome(category: MembershipApplicationCategory, medicalDegree: boolean | null | undefined, at: Date): ActivationOutcome {
  const year = at.getUTCFullYear()
  if (!isFeePaying(category)) return { active: true, paidThroughYear: year, amountDue: 0, dueForYear: null }
  if (year <= FEE_WAIVED_THROUGH_YEAR) return { active: true, paidThroughYear: FEE_WAIVED_THROUGH_YEAR, amountDue: 0, dueForYear: null }
  const dueForYear = membershipYearFor(at)
  return { active: false, paidThroughYear: null, amountDue: annualFee(category, medicalDegree), dueForYear }
}

export function formatHuf(amount: number): string {
  return `${amount.toLocaleString("hu-HU")} Ft`
}
