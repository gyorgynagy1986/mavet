import { describe, expect, it } from "vitest"
import { isValidEmail, validateEmail } from "@/lib/validation/email"

describe("validateEmail", () => {
  it("accepts ordinary addresses and normalises them", () => {
    expect(validateEmail("  Kovacs.Anna@Example.hu ")).toEqual({ ok: true, email: "kovacs.anna@example.hu" })
    expect(validateEmail("dr.nagy@semmelweis.hu").ok).toBe(true)
    expect(validateEmail("first+tag@sub.domain.co.uk").ok).toBe(true)
  })

  it("rejects malformed addresses", () => {
    for (const bad of ["", "a", "a@b", "a@b.", "a@.hu", "a@b..hu", ".a@b.hu", "a b@c.hu", "a@b.h", "a@b.c0m1"]) {
      expect(validateEmail(bad)).toMatchObject({ ok: false, reason: "format" })
    }
  })

  it("does not flag real domains and country TLDs", () => {
    for (const real of ["x@hotmail.hu", "x@valami.cm", "x@valami.om", "x@valami.et", "x@yahoo.co.uk"]) {
      expect(validateEmail(real).ok).toBe(true)
    }
  })

  it("treats a typo as a warning the sender can confirm", () => {
    expect(validateEmail("X@gmail.con", { allowTypo: true })).toEqual({ ok: true, email: "x@gmail.con" })
    expect(isValidEmail("x@gmail.con")).toBe(true)
    expect(validateEmail("x@mailinator.com", { allowTypo: true }).ok).toBe(false)
  })

  it("flags typo TLDs and domains with a suggestion", () => {
    expect(validateEmail("x@gmail.con")).toMatchObject({ ok: false, reason: "typo", suggestion: "gmail.com" })
    expect(validateEmail("x@gmial.com")).toMatchObject({ ok: false, reason: "typo", suggestion: "gmail.com" })
    expect(validateEmail("x@freemail.com")).toMatchObject({ ok: false, reason: "typo", suggestion: "freemail.hu" })
    expect(validateEmail("x@valami.hi")).toMatchObject({ ok: false, reason: "typo", suggestion: "valami.hu" })
  })

  it("rejects disposable providers", () => {
    expect(validateEmail("x@mailinator.com")).toMatchObject({ ok: false, reason: "disposable" })
  })
})
