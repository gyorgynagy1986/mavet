import { describe, expect, it } from "vitest"
import { formatPhone, isValidPhone, normalizePhone } from "./phone"

describe("phone validation", () => {
  it("normalises the usual Hungarian spellings to E.164", () => {
    for (const ok of ["+36 30 123 4567", "06 30 123 4567", "0036301234567", "30/123-4567", "+36.30.123.4567", " 06-30-123-4567 "]) {
      expect(normalizePhone(ok)).toBe("+36301234567")
    }
    expect(normalizePhone("(1) 234-5678")).toBe("+3612345678")
  })

  it("accepts foreign numbers with a country code", () => {
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958")
  })

  it("rejects values that are not phone numbers", () => {
    for (const bad of ["", "abc", "------", "( ) ( )", "000000", "12345", "+36 30 123"]) {
      expect(isValidPhone(bad)).toBe(false)
    }
  })

  it("formats for display and leaves legacy values alone", () => {
    expect(formatPhone("+36301234567")).toBe("+36 30 123 4567")
    expect(formatPhone("nincs")).toBe("nincs")
    expect(formatPhone(undefined)).toBe("")
  })
})
