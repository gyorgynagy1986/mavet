import { describe, expect, it } from "vitest"
import { passwordError } from "./password"

describe("password rule", () => {
  it("accepts 8+ characters with a letter and a digit", () => {
    expect(passwordError("mavet2026")).toBeNull()
    expect(passwordError("Vidék-Egészség1")).toBeNull()
  })
  it("rejects short, letter-only or digit-only passwords", () => {
    expect(passwordError("ab12345")).toContain("8")
    expect(passwordError("csakbetuk")).toContain("betűt és számot")
    expect(passwordError("12345678")).toContain("betűt és számot")
    expect(passwordError("a".repeat(130) + "1")).toContain("128")
  })
})
