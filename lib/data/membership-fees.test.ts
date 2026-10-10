import { describe, expect, it } from "vitest"
import { activationOutcome, annualFee, membershipYearFor } from "./membership-fees"

describe("membership fee rules", () => {
  it("annual fees by category (4.2)", () => {
    expect(annualFee("rendes", true)).toBe(10_000)
    expect(annualFee("rendes", false)).toBe(5_000)
    expect(annualFee("ifjusagi")).toBe(5_000)
    expect(annualFee("hallgatoi")).toBe(0)
    expect(annualFee("erdemes")).toBe(0)
    expect(annualFee("partolo")).toBe(0)
  })

  it("a December payment covers the next year too (8.2)", () => {
    expect(membershipYearFor(new Date("2027-12-05T10:00:00Z"))).toBe(2028)
    expect(membershipYearFor(new Date("2027-11-30T10:00:00Z"))).toBe(2027)
  })

  it("fee-free categories activate immediately", () => {
    expect(activationOutcome("hallgatoi", null, new Date("2027-03-01T00:00:00Z"))).toEqual({ active: true, paidThroughYear: 2027, amountDue: 0, dueForYear: null })
  })

  it("fee-paying members accepted in 2026 activate without payment (7.3)", () => {
    expect(activationOutcome("rendes", true, new Date("2026-12-31T20:00:00Z"))).toEqual({ active: true, paidThroughYear: 2026, amountDue: 0, dueForYear: null })
  })

  it("fee-paying members from 2027 wait for the first fee", () => {
    expect(activationOutcome("rendes", true, new Date("2027-01-10T00:00:00Z"))).toEqual({ active: false, paidThroughYear: null, amountDue: 10_000, dueForYear: 2027 })
    expect(activationOutcome("ifjusagi", null, new Date("2027-12-10T00:00:00Z"))).toEqual({ active: false, paidThroughYear: null, amountDue: 5_000, dueForYear: 2028 })
  })
})
