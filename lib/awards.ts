/**
 * Awards and recognitions (specification 4.4): pure rules for the admin editor and the public page.
 * Recipients are typed as lines of "ÉÉÉÉ Név; Név" in the admin; here they are parsed and rendered.
 */

export const AWARDS_PATH = "/dijazottak"
export const AWARD_NAME_MAX = 120
export const AWARD_DESCRIPTION_MAX = 1200
export const AWARDS_INTRO_KEY = "dijazottak_bevezeto"
export const AWARDS_INTRO_MAX = 1500

export interface AwardEntry {
  year: number
  names: string[]
}

export interface AwardInput {
  name: string
  description: string
  /** One line per year: "2027 Dr. Minta Anna; Minta Kft." */
  entriesText: string
}

export type AwardErrors = Partial<Record<keyof AwardInput, string>>

/** The six award types of 4.4, in the order the specification lists them; used by the seed. */
export const DEFAULT_AWARDS: { name: string; description: string }[] = [
  { name: "MAVET Díj", description: "A MAVET Díj azoknak az egészségügyi szakembereknek adományozható, akik az elmúlt években kiemelkedő szakmai teljesítményükkel, innovatív munkájukkal vagy a vidék egészségügyének fejlesztéséért végzett tevékenységükkel jelentős értéket teremtettek." },
  { name: "MAVET Közösségért Díj", description: "A MAVET Közösségért Díj azoknak az egészségügyi területen kívül tevékenykedő személyeknek vagy szervezeteknek adományozható, akik kiemelkedő szerepet vállalnak a közösségek egészségének fejlesztésében, az egészségmegőrzésben vagy a vidék egészségügyi életének támogatásában." },
  { name: "MAVET Ifjúsági Díj", description: "A MAVET Ifjúsági Díj a fiatal szakemberek és kutatók kiemelkedő teljesítményét ismeri el. Olyan, jellemzően 35 év alatti egészségügyi szakembereknek adományozható, akik az elmúlt években kiemelkedő szakmai teljesítményükkel, innovatív munkájukkal vagy a vidék egészségügyének fejlesztéséért végzett tevékenységükkel jelentős értéket teremtettek." },
  { name: "MAVET Életműdíj", description: "A MAVET Életműdíj a Társaság legmagasabb szakmai elismerése. Azoknak a szakembereknek adományozható, akik több évtizedes munkásságukkal maradandó hatást gyakoroltak a vidékegészségügy, az oktatás vagy a tudomány fejlődésére, és példát mutattak a következő generációk számára." },
  { name: "Kiemelkedő Tudományos Közlemény Díj", description: "Ez a díj annak a szerzőnek vagy szerzői közösségnek adományozható, aki az adott időszakban a vidékegészségügy vagy kapcsolódó tudományterületek témájában kiemelkedő tudományos közleményt publikált, amely hozzájárul a vidékegészségügy fejlődéséhez." },
  { name: "Örökös Tiszteletbeli Elnök", description: "Az Örökös Tiszteletbeli Elnök cím a Társaság legmagasabb szakmai és erkölcsi elismerése. Olyan személynek adományozható, aki meghatározó szerepet játszott a magyar falu- és vidékegészségügy mint tudományterület megszületésében és fejlődésében, valamint a Magyar Vidékegészségügyi Társaság létrejöttében, fejlődésében vagy hosszú távú működésében, és munkásságával maradandó értéket teremtett a közösség számára." },
]

export const DEFAULT_AWARDS_INTRO =
  "A Magyar Vidékegészségügyi Társaság díjaival azokat a szakembereket ismeri el, akik munkájukkal, példamutatásukkal vagy tudományos tevékenységükkel kiemelkedően hozzájárulnak a vidék egészségügyének fejlődéséhez. Ismerje meg díjazottjainkat és a Társaság elismeréseit!"

const str = (v: unknown) => (typeof v === "string" ? v : "")

export function normalizeAward(raw: Partial<Record<keyof AwardInput, unknown>>): AwardInput {
  return {
    name: str(raw.name).trim().slice(0, AWARD_NAME_MAX),
    description: str(raw.description).trim().slice(0, AWARD_DESCRIPTION_MAX),
    entriesText: str(raw.entriesText).replace(/\r\n?/g, "\n").trim(),
  }
}

/**
 * "2027 Dr. Minta Anna; Minta Kft." → { year: 2027, names: [...] }. Lines without a leading year or
 * without a name are reported; years repeated on several lines are merged. Sorted newest first.
 */
export function parseEntries(text: string): { entries: AwardEntry[]; errors: string[] } {
  const byYear = new Map<number, string[]>()
  const errors: string[] = []
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      const m = line.match(/^(\d{4})\.?\s*[:–-]?\s*(.*)$/)
      if (!m) return void errors.push(`${i + 1}. sor: a sor az évszámmal kezdődjön (pl. „2027 Dr. Minta Anna”).`)
      const year = Number(m[1])
      const names = m[2].split(";").map((n) => n.trim()).filter(Boolean)
      if (names.length === 0) return void errors.push(`${i + 1}. sor: az évszám után adja meg a díjazott nevét.`)
      if (year < 1900 || year > 2200) return void errors.push(`${i + 1}. sor: valószínűtlen évszám (${year}).`)
      byYear.set(year, [...(byYear.get(year) ?? []), ...names])
    })
  const entries = [...byYear.entries()].map(([year, names]) => ({ year, names })).sort((a, b) => b.year - a.year)
  return { entries, errors }
}

export function entriesToText(entries: AwardEntry[]): string {
  return [...entries]
    .sort((a, b) => b.year - a.year)
    .map((e) => `${e.year} ${e.names.join("; ")}`)
    .join("\n")
}

export function validateAward(input: AwardInput): AwardErrors {
  const e: AwardErrors = {}
  if (!input.name) e.name = "Adja meg a díj nevét."
  const parsed = parseEntries(input.entriesText)
  if (parsed.errors.length > 0) e.entriesText = parsed.errors.join(" ")
  return e
}

export interface AwardView {
  id: string
  name: string
  description: string
  entries: AwardEntry[]
}

/** Public view (4.4): hidden awards, empty years and nameless entries are left out; years newest first. */
export function visibleAwards(awards: { id: string; name: string; description: string; hidden?: boolean | null; entries: AwardEntry[] }[]): AwardView[] {
  return awards
    .filter((a) => !a.hidden && a.name.trim())
    .map((a) => ({
      id: a.id,
      name: a.name.trim(),
      description: a.description.trim(),
      entries: a.entries
        .map((e) => ({ year: e.year, names: e.names.map((n) => n.trim()).filter(Boolean) }))
        .filter((e) => Number.isInteger(e.year) && e.names.length > 0)
        .sort((a, b) => b.year - a.year),
    }))
}
