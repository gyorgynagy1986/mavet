import { describe, expect, it } from "vitest"
import {
  addDays,
  budapestDate,
  budapestToUtc,
  composeHomePreview,
  eventPhase,
  eventWindow,
  formatEventWhen,
  formatHuDate,
  isClockTime,
  isIsoDate,
  normalizePost,
  slugifyTitle,
  splitParagraphs,
  toPostView,
  validatePost,
  type PostSource,
  type PostView,
} from "./posts"

describe("Hungarian local time", () => {
  it("converts wall-clock time in summer and winter", () => {
    expect(budapestToUtc("2026-07-29", "12:00").toISOString()).toBe("2026-07-29T10:00:00.000Z")
    expect(budapestToUtc("2026-12-01", "12:00").toISOString()).toBe("2026-12-01T11:00:00.000Z")
    expect(budapestToUtc("2026-10-25").toISOString()).toBe("2026-10-24T22:00:00.000Z")
    expect(budapestToUtc("2026-10-26").toISOString()).toBe("2026-10-25T23:00:00.000Z")
  })

  it("gives the local calendar date of an instant", () => {
    expect(budapestDate(new Date("2026-09-01T22:30:00Z"))).toBe("2026-09-02")
    expect(budapestDate(new Date("2026-01-01T22:30:00Z"))).toBe("2026-01-01")
  })

  it("validates and formats dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true)
    expect(isIsoDate("2026-02-30")).toBe(false)
    expect(isIsoDate("2026.02.28")).toBe(false)
    expect(isClockTime("09:30")).toBe(true)
    expect(isClockTime("24:00")).toBe(false)
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(formatHuDate("2026-09-02")).toBe("2026. szeptember 2.")
  })
})

describe("event timing (5.2)", () => {
  it("keeps a single-date event current until the end of that day", () => {
    const w = eventWindow({ startDate: "2026-11-10", startTime: "14:00" })
    expect(w.startsAt.toISOString()).toBe("2026-11-10T13:00:00.000Z")
    expect(w.endsAt.toISOString()).toBe("2026-11-10T23:00:00.000Z")
    expect(eventPhase(w, new Date("2026-11-10T12:00:00Z"))).toBe("kozelgo")
    expect(eventPhase(w, new Date("2026-11-10T20:00:00Z"))).toBe("folyamatban")
    expect(eventPhase(w, new Date("2026-11-10T23:00:00Z"))).toBe("korabbi")
  })

  it("treats an end date without a time as the end of the closing day, and an end time as exact", () => {
    expect(eventWindow({ startDate: "2026-11-10", endDate: "2026-11-12" }).endsAt.toISOString()).toBe("2026-11-12T23:00:00.000Z")
    expect(eventWindow({ startDate: "2026-11-10", endDate: "2026-11-12", endTime: "16:00" }).endsAt.toISOString()).toBe("2026-11-12T15:00:00.000Z")
    expect(eventWindow({ startDate: "2026-11-10", startTime: "14:00", endTime: "16:00" }).endsAt.toISOString()).toBe("2026-11-10T15:00:00.000Z")
  })

  it("formats the date or period", () => {
    expect(formatEventWhen({ startDate: "2026-11-10" })).toBe("2026. november 10.")
    expect(formatEventWhen({ startDate: "2026-11-10", startTime: "14:00" })).toBe("2026. november 10. 14:00")
    expect(formatEventWhen({ startDate: "2026-11-10", startTime: "14:00", endTime: "16:00" })).toBe("2026. november 10. 14:00–16:00")
    expect(formatEventWhen({ startDate: "2026-11-10", endDate: "2026-11-12" })).toBe("2026. november 10. – 2026. november 12.")
  })
})

describe("text", () => {
  it("splits the article into paragraphs on empty lines", () => {
    expect(splitParagraphs("Első bekezdés,\nami két sor.\n\n\n  Második.  \r\n\r\nHarmadik")).toEqual(["Első bekezdés, ami két sor.", "Második.", "Harmadik"])
    expect(splitParagraphs("   ")).toEqual([])
    expect(splitParagraphs(null)).toEqual([])
  })

  it("builds a slug from the title", () => {
    expect(slugifyTitle("Új fejezet kezdődik a Társaság életében")).toBe("uj-fejezet-kezdodik-a-tarsasag-eleteben")
    expect(slugifyTitle("???")).toBe("bejegyzes")
    expect(slugifyTitle("a".repeat(200)).length).toBe(70)
  })
})

describe("validation", () => {
  const news = (over = {}) => normalizePost({ type: "hir", title: "Cím", excerpt: "Összefoglaló", body: "Szöveg", ...over })
  const event = (over = {}) => normalizePost({ type: "esemeny", title: "Cím", excerpt: "Összefoglaló", body: "Leírás", startDate: "2026-11-10", ...over })

  it("lets a draft be saved with a title only, but not published", () => {
    const draft = normalizePost({ type: "hir", title: "Csak cím" })
    expect(validatePost(draft, false)).toEqual({})
    expect(Object.keys(validatePost(draft, true)).sort()).toEqual(["body", "excerpt"])
    expect(validatePost(normalizePost({ type: "hir" }), false).title).toBeTruthy()
  })

  it("accepts complete news and events", () => {
    expect(validatePost(news(), true)).toEqual({})
    expect(validatePost(event({ startTime: "14:00", endTime: "16:00", linkUrl: "https://example.test/jelentkezes" }), true)).toEqual({})
  })

  it("requires a start date to publish an event and checks the order of dates", () => {
    expect(validatePost(event({ startDate: "" }), true).startDate).toBeTruthy()
    expect(validatePost(event({ startDate: "" }), false).startDate).toBeUndefined()
    expect(validatePost(event({ endDate: "2026-11-09" }), true).endDate).toBeTruthy()
    expect(validatePost(event({ startTime: "14:00", endTime: "13:00" }), true).endTime).toBeTruthy()
    expect(validatePost(event({ startTime: "25:00" }), true).startTime).toBeTruthy()
  })

  it("accepts only full web addresses as the event link", () => {
    expect(validatePost(event({ linkUrl: "example.test" }), true).linkUrl).toBeTruthy()
    expect(validatePost(event({ linkUrl: "javascript:alert(1)" }), true).linkUrl).toBeTruthy()
  })
})

describe("visitor view", () => {
  const base: PostSource = { _id: "p1", type: "hir", slug: "cim", title: "Cím", excerpt: " Összefoglaló ", body: "Egy\n\nKettő", status: "kozzetett", publishedAt: new Date("2026-09-02T10:00:00Z") }

  it("shows news with its publication date", () => {
    expect(toPostView(base, new Date())).toMatchObject({ href: "/aktualitasok/cim", excerpt: "Összefoglaló", paragraphs: ["Egy", "Kettő"], dateIso: "2026-09-02", dateLabel: "2026. szeptember 2.", event: null, imageUrl: null })
  })

  it("hides the registration link once the event is over", () => {
    const event: PostSource = { ...base, type: "esemeny", startDate: "2026-11-10", location: "Algyő", linkUrl: "https://example.test" }
    expect(toPostView(event, new Date("2026-11-01T00:00:00Z")).event).toMatchObject({ phase: "kozelgo", location: "Algyő", linkUrl: "https://example.test" })
    expect(toPostView(event, new Date("2026-11-11T00:00:00Z")).event).toMatchObject({ phase: "korabbi", linkUrl: null })
  })
})

describe("home preview (3.2)", () => {
  const view = (id: string, type: "hir" | "esemeny", phase: "kozelgo" | "korabbi" = "kozelgo"): PostView => ({ id, type, slug: id, href: `/aktualitasok/${id}`, title: id, excerpt: "", paragraphs: [], imageUrl: null, featured: false, dateIso: null, dateLabel: null, event: type === "esemeny" ? { when: "", location: null, phase, linkUrl: null, linkLabel: "" } : null })

  it("puts the featured item first, then events, then news, without repeats", () => {
    const ids = composeHomePreview(view("h2", "hir"), [view("e1", "esemeny")], [view("h1", "hir"), view("h2", "hir"), view("h3", "hir")]).map((p) => p.id)
    expect(ids).toEqual(["h2", "e1", "h1", "h3"])
  })

  it("drops a featured event that is over and never returns more than six", () => {
    expect(composeHomePreview(view("e0", "esemeny", "korabbi"), [], [view("h1", "hir")]).map((p) => p.id)).toEqual(["h1"])
    const many = Array.from({ length: 10 }, (_, i) => view(`h${i}`, "hir"))
    expect(composeHomePreview(null, [], many)).toHaveLength(6)
  })
})
