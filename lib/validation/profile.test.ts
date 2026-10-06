import { describe, expect, it } from "vitest"
import { normalizeProfile, parseInterests, validateProfile } from "./profile"

describe("profile validation", () => {
  const base = normalizeProfile({ lastName: "Minta", firstName: "Anna", title: "Dr.", workgroups: ["telemedicina", "nem-letezo"] })

  it("normalizes and keeps only known workgroup ids", () => {
    expect(base.title).toBe("Dr.")
    expect(base.workgroups).toEqual(["telemedicina"])
    expect(normalizeProfile({ title: "Mr." }).title).toBe("")
  })

  it("requires the name parts and checks formats", () => {
    expect(validateProfile(base)).toEqual({})
    expect(validateProfile({ ...base, lastName: "" }).lastName).toBeTruthy()
    expect(validateProfile({ ...base, birthDate: "2026/01/01" }).birthDate).toBeTruthy()
    expect(validateProfile({ ...base, phone: "abc" }).phone).toBeTruthy()
    expect(validateProfile({ ...base, bio: "x".repeat(501) }).bio).toContain("500")
  })

  it("parses interests into a deduplicated, capped list", () => {
    expect(parseInterests("alapellátás, prevenció; alapellátás\ntelemedicina")).toEqual(["alapellátás", "prevenció", "telemedicina"])
    expect(parseInterests(Array.from({ length: 15 }, (_, i) => `t${i}`).join(",")).length).toBe(10)
  })
})
