import { describe, expect, it } from "vitest"
import { isPlausibleEmail, isValidCodeFormat, normalizeEmail, secureCodeCompare, hasExceededMaxAttempts, MAX_ATTEMPTS } from "./verification"

describe("admin login code helpers", () => {
  it("normalizes e-mail addresses", () => {
    expect(normalizeEmail("  Admin@Example.HU ")).toBe("admin@example.hu")
  })

  it("accepts only plausible e-mail addresses", () => {
    expect(isPlausibleEmail("admin@example.hu")).toBe(true)
    expect(isPlausibleEmail("nope")).toBe(false)
    expect(isPlausibleEmail("a@b")).toBe(false)
    expect(isPlausibleEmail(`${"a".repeat(250)}@x.hu`)).toBe(false)
  })

  it("accepts only six digits as a code", () => {
    expect(isValidCodeFormat("123456")).toBe(true)
    expect(isValidCodeFormat("12345")).toBe(false)
    expect(isValidCodeFormat("1234567")).toBe(false)
    expect(isValidCodeFormat("12a456")).toBe(false)
    expect(isValidCodeFormat(123456)).toBe(false)
    expect(isValidCodeFormat(undefined)).toBe(false)
  })

  it("compares codes in constant time without throwing on odd lengths", () => {
    expect(secureCodeCompare("123456", "123456")).toBe(true)
    expect(secureCodeCompare("123456", "123457")).toBe(false)
    expect(secureCodeCompare("1", "123456")).toBe(false)
    expect(secureCodeCompare("1234567", "123456")).toBe(true) // extra input digits are ignored, format check runs first
  })

  it("locks after the maximum number of attempts", () => {
    const base = { code: "000000", createdAt: new Date().toISOString() }
    expect(hasExceededMaxAttempts({ ...base, attempts: MAX_ATTEMPTS - 1 })).toBe(false)
    expect(hasExceededMaxAttempts({ ...base, attempts: MAX_ATTEMPTS })).toBe(true)
  })
})
