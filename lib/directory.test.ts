import { describe, expect, it } from "vitest"
import { isListed, isPublicProfile, nameSearchPatterns, pageWindow, slugCandidate, slugifyName, parsePage, visibleProfile, type DirectorySource } from "./directory"

const member = (over: Partial<DirectorySource> = {}): DirectorySource => ({
  _id: "abc123",
  role: "USER",
  name: "Minta Anna",
  title: "Dr.",
  lastName: "Minta",
  firstName: "Anna",
  specialty: "Háziorvostan",
  workplace: "Mintafalvi rendelő",
  bio: "Bemutatkozás",
  interests: ["telemedicina", " prevenció "],
  workgroups: ["telemedicina", "nem-letezo"],
  office: null,
  boardMember: false,
  photo: { url: "https://example.test/kep.webp" },
  visibility: { enabled: true, photo: true, specialty: true, workplace: true, bio: true, interests: true, workgroups: true },
  membership: { status: "aktiv" },
  ...over,
})

describe("directory visibility", () => {
  it("lists only active members who enabled their appearance", () => {
    expect(isListed(member())).toBe(true)
    expect(isListed(member({ visibility: { enabled: false } }))).toBe(false)
    expect(isListed(member({ visibility: null }))).toBe(false)
    expect(isListed(member({ membership: { status: "lejart" } }))).toBe(false)
    expect(isListed(member({ membership: { status: "fizetesre_var" } }))).toBe(false)
    expect(isListed(member({ role: "ADMIN" }))).toBe(false)
    expect(isListed(null)).toBe(false)
  })

  it("makes a profile public only with both the admin designation and the member's consent", () => {
    expect(isPublicProfile(member())).toBe(false)
    expect(isPublicProfile(member({ boardMember: true }))).toBe(true)
    expect(isPublicProfile(member({ boardMember: true, visibility: { enabled: false } }))).toBe(false)
    expect(isPublicProfile(member({ boardMember: true, membership: { status: "megszunt" } }))).toBe(false)
  })

  it("shows the name always and the other fields only when allowed", () => {
    const all = visibleProfile(member())
    expect(all).toMatchObject({ id: "abc123", name: "Dr. Minta Anna", initials: "MA", specialty: "Háziorvostan", workplace: "Mintafalvi rendelő", bio: "Bemutatkozás", photoUrl: "https://example.test/kep.webp" })
    expect(all.interests).toEqual(["telemedicina", "prevenció"])
    expect(all.workgroups).toEqual(["Telemedicina"])

    const hidden = visibleProfile(member({ visibility: { enabled: true, photo: false, specialty: false, workplace: false, bio: false, interests: false, workgroups: false } }))
    expect(hidden).toMatchObject({ name: "Dr. Minta Anna", photoUrl: null, specialty: null, workplace: null, bio: null, interests: [], workgroups: [] })
  })

  it("never carries contact or birth data", () => {
    const source = { ...member(), email: "anna@example.test", phone: "+36301234567", birthDate: new Date(), address: { city: "Mintafalva" } }
    const serialised = JSON.stringify(visibleProfile(source))
    expect(serialised).not.toContain("anna@example.test")
    expect(serialised).not.toContain("36301234567")
    expect(serialised).not.toContain("Mintafalva\"")
  })
})

describe("profile address", () => {
  it("builds a readable slug from the name", () => {
    expect(slugifyName("Kovács-Nagy Éva")).toBe("kovacs-nagy-eva")
    expect(slugifyName("  Ősz   Ödön ")).toBe("osz-odon")
    expect(slugifyName("Szűcs Győző")).toBe("szucs-gyozo")
    expect(slugifyName("!!!")).toBe("tag")
    expect(slugifyName(null)).toBe("tag")
    expect(slugifyName("a".repeat(100)).length).toBe(60)
  })

  it("numbers people who share a name", () => {
    expect(slugCandidate("minta-anna", 1)).toBe("minta-anna")
    expect(slugCandidate("minta-anna", 2)).toBe("minta-anna-2")
  })

  it("gives the readable public address only to a visible board member with a slug", () => {
    expect(visibleProfile(member()).href).toBe("/tagok/abc123")
    expect(visibleProfile(member({ slug: "minta-anna" })).href).toBe("/tagok/abc123")
    expect(visibleProfile(member({ boardMember: true })).href).toBe("/tagok/abc123")
    expect(visibleProfile(member({ boardMember: true, slug: "minta-anna" })).href).toBe("/a-tarsasagrol/vezetoseg/minta-anna")
  })
})

describe("name search", () => {
  const matches = (query: string, name: string) => nameSearchPatterns(query).every((source) => new RegExp(source).test(name))

  it("matches partially, case-insensitively and without accents", () => {
    expect(matches("kov", "Kovács Éva")).toBe(true)
    expect(matches("KOVACS", "Kovács Éva")).toBe(true)
    expect(matches("eva kovacs", "Kovács Éva")).toBe(true)
    expect(matches("szabo", "Kovács Éva")).toBe(false)
    expect(matches("ősz", "Ősz Ödön")).toBe(true)
  })

  it("treats special characters literally", () => {
    expect(matches(".*", "Kovács Éva")).toBe(false)
    expect(matches("nagy-kis", "Nagy-Kis Pál")).toBe(true)
    expect(() => nameSearchPatterns("a(b[c").map((s) => new RegExp(s))).not.toThrow()
  })

  it("returns nothing for an empty query", () => {
    expect(nameSearchPatterns("   ")).toEqual([])
    expect(nameSearchPatterns(undefined)).toEqual([])
  })
})

describe("paging", () => {
  it("parses the page number defensively", () => {
    expect(parsePage("3")).toBe(3)
    expect(parsePage("0")).toBe(1)
    expect(parsePage("abc")).toBe(1)
    expect(parsePage(undefined)).toBe(1)
    expect(parsePage(["2", "5"])).toBe(2)
  })

  it("builds a compact page list", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3])
    expect(pageWindow(10, 20)).toEqual([1, 2, 0, 9, 10, 11, 0, 19, 20])
  })
})
