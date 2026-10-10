import { describe, expect, it } from "vitest"
import { ageAt, normalizeFullForm, validateFullForm, type FullFormInput } from "./membership-application"

const now = new Date("2026-10-04T10:00:00Z")

const complete: FullFormInput = {
  birthDate: "1990-05-20",
  postalCode: "6750",
  city: "Algyő",
  street: "Fő utca 1.",
  country: "Magyarország",
  phone: "+36 30 123 4567",
  specialty: "Háziorvos",
  workplace: "Algyői rendelő",
  noWorkplace: false,
  medicalDegree: "orvos",
}

describe("full application form validation", () => {
  it("accepts a complete rendes application", () => {
    expect(validateFullForm(complete, "rendes", now)).toEqual({})
  })

  it("requires the medical-degree choice only for rendes", () => {
    const input = { ...complete, medicalDegree: "" as const }
    expect(validateFullForm(input, "rendes", now).medicalDegree).toBeTruthy()
    expect(validateFullForm(input, "partolo", now)).toEqual({})
  })

  it("requires a workplace unless 'no permanent workplace' is ticked; students are exempt", () => {
    const input = { ...complete, workplace: "" }
    expect(validateFullForm(input, "rendes", now).workplace).toBeTruthy()
    expect(validateFullForm({ ...input, noWorkplace: true }, "rendes", now).workplace).toBeUndefined()
    expect(validateFullForm(input, "hallgatoi", now).workplace).toBeUndefined()
  })

  it("enforces the age rules", () => {
    expect(validateFullForm({ ...complete, birthDate: "2010-01-01" }, "rendes", now).birthDate).toContain("18")
    expect(validateFullForm({ ...complete, birthDate: "1991-10-04" }, "ifjusagi", now).birthDate).toContain("35") // turned 35 today
    expect(validateFullForm({ ...complete, birthDate: "1991-10-05" }, "ifjusagi", now)).toEqual({}) // 34, turns 35 tomorrow
    expect(validateFullForm({ ...complete, birthDate: "2030-01-01" }, "rendes", now).birthDate).toContain("jövőben")
    expect(validateFullForm({ ...complete, birthDate: "nem-datum" }, "rendes", now).birthDate).toBeTruthy()
  })

  it("computes full years correctly around the birthday", () => {
    expect(ageAt(new Date("1991-10-04T00:00:00Z"), now)).toBe(35)
    expect(ageAt(new Date("1991-10-05T00:00:00Z"), now)).toBe(34)
  })

  it("normalizes raw input from the client", () => {
    const n = normalizeFullForm({ birthDate: " 1990-05-20 ", city: "  Algyő ", noWorkplace: "true", medicalDegree: "bármi" })
    expect(n.birthDate).toBe("1990-05-20")
    expect(n.city).toBe("Algyő")
    expect(n.noWorkplace).toBe(true)
    expect(n.medicalDegree).toBe("")
  })
})
