import { describe, expect, it } from "vitest"
import { documentFileError, normalizeMaterial, validateMaterial, youtubeId } from "./materials"
import { entriesToText, parseEntries, visibleAwards } from "./awards"

describe("youtubeId", () => {
  it("accepts the usual address forms and a bare id", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
  })
  it("rejects other addresses", () => {
    expect(youtubeId("https://vimeo.com/123")).toBeNull()
    expect(youtubeId("https://www.youtube.com/channel/abc")).toBeNull()
    expect(youtubeId("")).toBeNull()
  })
})

describe("validateMaterial (6.2)", () => {
  const base = normalizeMaterial({ title: "Ajánlás", categoryId: "66f0c0ffee0000000000000a", summary: "Rövid", kind: "dokumentum", access: "tagi" })
  it("a hidden material needs only a title", () => {
    expect(validateMaterial(normalizeMaterial({ title: "x" }), false, false)).toEqual({})
    expect(validateMaterial(normalizeMaterial({}), false, false)).toHaveProperty("title")
  })
  it("publishing a document needs the file or the address", () => {
    expect(validateMaterial(base, true, false)).toHaveProperty("file")
    expect(validateMaterial(base, true, true)).toEqual({})
    expect(validateMaterial({ ...base, documentSource: "link" }, true, false)).toHaveProperty("externalUrl")
    expect(validateMaterial({ ...base, documentSource: "link", externalUrl: "https://example.org/a.pdf" }, true, false)).toEqual({})
    expect(validateMaterial({ ...base, documentSource: "link", externalUrl: "nem-url" }, false, false)).toHaveProperty("externalUrl")
  })
  it("publishing a video needs a recognisable YouTube video; Bunny is refused until wired up", () => {
    expect(validateMaterial({ ...base, kind: "video", videoRef: "" }, true, false)).toHaveProperty("videoRef")
    expect(validateMaterial({ ...base, kind: "video", videoRef: "https://youtu.be/dQw4w9WgXcQ" }, true, false)).toEqual({})
    expect(validateMaterial({ ...base, kind: "video", videoProvider: "bunny", videoRef: "abc" }, false, false)).toHaveProperty("videoProvider")
  })
  it("publishing needs category and summary", () => {
    expect(validateMaterial({ ...base, categoryId: "", summary: "" }, true, true)).toMatchObject({ categoryId: expect.any(String), summary: expect.any(String) })
  })
})

describe("documentFileError", () => {
  it("accepts PDF and Office files up to 25 MB", () => {
    expect(documentFileError({ type: "application/pdf", size: 1000 })).toBeNull()
    expect(documentFileError({ type: "image/png", size: 1000 })).not.toBeNull()
    expect(documentFileError({ type: "application/pdf", size: 26 * 1024 * 1024 })).not.toBeNull()
    expect(documentFileError(null)).not.toBeNull()
  })
})

describe("awards (4.4)", () => {
  it("parses year lines with several names and merges repeated years, newest first", () => {
    const r = parseEntries("2026 Dr. Minta Anna; Minta Kft.\n2027. Példa Béla\n2026: Harmadik Cili")
    expect(r.errors).toEqual([])
    expect(r.entries).toEqual([
      { year: 2027, names: ["Példa Béla"] },
      { year: 2026, names: ["Dr. Minta Anna", "Minta Kft.", "Harmadik Cili"] },
    ])
    expect(entriesToText(r.entries)).toBe("2027 Példa Béla\n2026 Dr. Minta Anna; Minta Kft.; Harmadik Cili")
  })
  it("reports lines without a year or a name", () => {
    const r = parseEntries("Minta Anna\n2027\n2027 ;")
    expect(r.errors).toHaveLength(3)
    expect(r.entries).toEqual([])
  })
  it("hides hidden awards, empty years and nameless entries on the public page", () => {
    const v = visibleAwards([
      { id: "a", name: "MAVET Díj", description: "", hidden: false, entries: [{ year: 2026, names: [" "] }, { year: 2027, names: ["X"] }] },
      { id: "b", name: "Rejtett", description: "", hidden: true, entries: [{ year: 2027, names: ["Y"] }] },
      { id: "c", name: "Üres", description: "", hidden: false, entries: [] },
    ])
    expect(v.map((a) => a.id)).toEqual(["a", "c"])
    expect(v[0].entries).toEqual([{ year: 2027, names: ["X"] }])
  })
})
