import { describe, expect, it } from "vitest"
import { extractTemplateVariables, htmlToText, renderTemplate, wrapInMailLayout } from "./render"

describe("e-mail template renderer", () => {
  it("substitutes variables with HTML escaping", () => {
    expect(renderTemplate("<p>Kedves {{nev}}!</p>", { nev: "Dr. <b>Minta</b> & Társa" })).toBe("<p>Kedves Dr. &lt;b&gt;Minta&lt;/b&gt; &amp; Társa!</p>")
  })

  it("tolerates spaces and renders unknown variables as empty", () => {
    expect(renderTemplate("{{ nev }}|{{ismeretlen}}|{{nev}}", { nev: "A" })).toBe("A||A")
  })

  it("does not escape in plain-text (subject) mode", () => {
    expect(renderTemplate("Új tagjelölt: {{nev}}", { nev: "Kiss & Nagy" }, { html: false })).toBe("Új tagjelölt: Kiss & Nagy")
  })

  it("formats dates in Hungarian", () => {
    expect(renderTemplate("{{d}}", { d: new Date("2026-10-04T12:05:00Z") })).toContain("2026. október 4.")
  })

  it("lists the variables used by a template", () => {
    expect(extractTemplateVariables("{{a}} {{ b }} {{a}} {{c.d}}")).toEqual(["a", "b"])
  })

  it("derives a readable text version from the HTML body", () => {
    const text = htmlToText('<p>Üdv, <strong>Elek</strong>!</p><p><a href="https://x.hu/y">Folytatás</a></p>')
    expect(text).toBe("Üdv, Elek!\n\nFolytatás (https://x.hu/y)")
  })

  it("wraps the body in the MAVET frame", () => {
    const html = wrapInMailLayout("<p>törzs</p>")
    expect(html).toContain("<p>törzs</p>")
    expect(html).toContain("Magyar Vidékegészségügyi Társaság")
    expect(html.startsWith("<!doctype html>")).toBe(true)
  })
})
