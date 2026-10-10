import { describe, expect, it } from "vitest"
import { loginPathWithReturn, safeReturnPath } from "./auth-paths"

describe("return path after login", () => {
  it("accepts our own member pages", () => {
    expect(safeReturnPath("/tagok")).toBe("/tagok")
    expect(safeReturnPath("/tagok?q=kov&oldal=2")).toBe("/tagok?q=kov&oldal=2")
    expect(safeReturnPath("/tagok/6ac222372573de4ea0928baa")).toBe("/tagok/6ac222372573de4ea0928baa")
    expect(safeReturnPath("/fiok/profil")).toBe("/fiok/profil")
  })

  it("falls back to the account page for anything else", () => {
    for (const bad of [undefined, "", "https://example.test", "//example.test", "/\\example.test", "/admin", "/tagokx", "tagok"]) {
      expect(safeReturnPath(bad)).toBe("/fiok")
    }
  })

  it("builds the login link", () => {
    expect(loginPathWithReturn("/tagok?q=a b")).toBe("/belepes?vissza=%2Ftagok%3Fq%3Da%20b")
  })
})
