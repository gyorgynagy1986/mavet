/**
 * News and events (specification 5): rules that do not need the database, shared by the public pages,
 * the admin form (live preview, validation) and the server. No server-only import may enter this file.
 */

export const postTypes = ["hir", "esemeny"] as const
export type PostType = (typeof postTypes)[number]
export const postStatuses = ["piszkozat", "kozzetett"] as const
export type PostStatus = (typeof postStatuses)[number]

export const POST_TYPE_LABEL: Record<PostType, string> = { hir: "Hír", esemeny: "Esemény" }
export const POST_STATUS_LABEL: Record<PostStatus, string> = { piszkozat: "Piszkozat", kozzetett: "Közzétéve" }

export const NEWS_PAGE_SIZE = 6
export const EVENTS_PAGE_SIZE = 6
/** Home page preview: at most six cards (3.2). */
export const HOME_PREVIEW_SIZE = 6
/** Address segments that are pages of their own under /aktualitasok and cannot be a post slug. */
export const RESERVED_POST_SLUGS = ["korabbi-esemenyek"] as const
export const PAST_EVENTS_PATH = "/aktualitasok/korabbi-esemenyek"
export const POSTS_PATH = "/aktualitasok"

export const TITLE_MAX = 160
export const EXCERPT_MAX = 300
export const BODY_MAX = 20000
export const LOCATION_MAX = 200
export const DEFAULT_LINK_LABEL = "Jelentkezés és további információ"

const TIME_ZONE = "Europe/Budapest"
const MONTHS = ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"]
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

// ---------- dates (Hungarian local time, 5.2) ----------

export function isIsoDate(value: string | null | undefined): value is string {
  const m = DATE_RE.exec(value ?? "")
  if (!m) return false
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3])
}

export function isClockTime(value: string | null | undefined): value is string {
  return TIME_RE.test(value ?? "")
}

/** Minutes Budapest is ahead of UTC at the given instant (60 in winter, 120 in summer). */
function budapestOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(utcMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  return Math.round((asUtc - utcMs) / 60000)
}

/** The instant of a Hungarian wall-clock date and time. */
export function budapestToUtc(date: string, time = "00:00"): Date {
  const [y, m, d] = date.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  const wall = Date.UTC(y, m - 1, d, hh, mm)
  const first = wall - budapestOffsetMinutes(wall) * 60000
  // Second pass with the offset valid at the result, so days around a clock change come out right.
  return new Date(wall - budapestOffsetMinutes(first) * 60000)
}

/** Hungarian calendar date (YYYY-MM-DD) of an instant. */
export function budapestDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant)
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** "2026. szeptember 2." */
export function formatHuDate(date: string): string {
  const m = DATE_RE.exec(date)
  return m ? `${Number(m[1])}. ${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}.` : date
}

export interface EventTimes {
  startDate: string
  startTime?: string | null
  endDate?: string | null
  endTime?: string | null
}

/**
 * When an event starts and when it stops being current (5.2): with a single date it is current until the
 * end of that day; an end date without a time means the end of the closing day; a given end time is exact.
 */
export function eventWindow(times: EventTimes): { startsAt: Date; endsAt: Date } {
  const lastDay = times.endDate || times.startDate
  return {
    startsAt: budapestToUtc(times.startDate, times.startTime || "00:00"),
    endsAt: times.endTime ? budapestToUtc(lastDay, times.endTime) : budapestToUtc(addDays(lastDay, 1), "00:00"),
  }
}

export type EventPhase = "kozelgo" | "folyamatban" | "korabbi"

export function eventPhase(window: { startsAt: Date; endsAt: Date }, now: Date): EventPhase {
  if (now.getTime() >= window.endsAt.getTime()) return "korabbi"
  return now.getTime() >= window.startsAt.getTime() ? "folyamatban" : "kozelgo"
}

/** "2026. október 12. 14:00–16:00" or "2026. október 12. – 2026. október 14." */
export function formatEventWhen(times: EventTimes): string {
  const start = `${formatHuDate(times.startDate)}${times.startTime ? ` ${times.startTime}` : ""}`
  if (!times.endDate || times.endDate === times.startDate) return times.startTime && times.endTime ? `${start}–${times.endTime}` : start
  return `${start} – ${formatHuDate(times.endDate)}${times.endTime ? ` ${times.endTime}` : ""}`
}

// ---------- text ----------

/** The article is plain text: paragraphs separated by an empty line (the structure of the first two news items). */
export function splitParagraphs(body: string | null | undefined): string[] {
  return (body ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
}

export function slugifyTitle(title: string | null | undefined): string {
  const slug = (title ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "")
  return slug || "bejegyzes"
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

// ---------- admin form ----------

export interface PostInput {
  type: PostType
  title: string
  excerpt: string
  body: string
  /** News: publication date shown on the card (YYYY-MM-DD). Empty = the day of the first publication. */
  publishedDate: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  linkUrl: string
  linkLabel: string
}

export type PostErrors = Partial<Record<keyof PostInput, string>>

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

export function normalizePost(raw: Partial<Record<keyof PostInput, unknown>>): PostInput {
  return {
    type: raw.type === "esemeny" ? "esemeny" : "hir",
    title: str(raw.title, TITLE_MAX + 50),
    excerpt: str(raw.excerpt, EXCERPT_MAX + 100),
    body: typeof raw.body === "string" ? raw.body.replace(/\r\n?/g, "\n").trim().slice(0, BODY_MAX + 1000) : "",
    publishedDate: str(raw.publishedDate, 10),
    startDate: str(raw.startDate, 10),
    startTime: str(raw.startTime, 5),
    endDate: str(raw.endDate, 10),
    endTime: str(raw.endTime, 5),
    location: str(raw.location, LOCATION_MAX + 50),
    linkUrl: str(raw.linkUrl, 500),
    linkLabel: str(raw.linkLabel, 80),
  }
}

/**
 * A draft only needs a title, so work can be saved half-done. Publishing needs everything a visitor
 * sees on the card and the page. Format rules apply in both cases.
 */
export function validatePost(input: PostInput, forPublish: boolean): PostErrors {
  const errors: PostErrors = {}
  if (!input.title) errors.title = "A cím megadása kötelező."
  else if (input.title.length > TITLE_MAX) errors.title = `A cím legfeljebb ${TITLE_MAX} karakter lehet.`
  if (input.excerpt.length > EXCERPT_MAX) errors.excerpt = `Az összefoglaló legfeljebb ${EXCERPT_MAX} karakter lehet.`
  else if (forPublish && !input.excerpt) errors.excerpt = "Közzétételhez rövid összefoglaló szükséges."
  if (input.body.length > BODY_MAX) errors.body = `A szöveg legfeljebb ${BODY_MAX} karakter lehet.`
  else if (forPublish && splitParagraphs(input.body).length === 0) errors.body = input.type === "hir" ? "Közzétételhez a cikk szövege szükséges." : "Közzétételhez az esemény leírása szükséges."

  if (input.type === "hir") {
    if (input.publishedDate && !isIsoDate(input.publishedDate)) errors.publishedDate = "Érvénytelen dátum."
    return errors
  }

  if (!input.startDate) {
    if (forPublish) errors.startDate = "Az esemény kezdő dátuma kötelező."
  } else if (!isIsoDate(input.startDate)) errors.startDate = "Érvénytelen dátum."
  if (input.startTime && !isClockTime(input.startTime)) errors.startTime = "Érvénytelen időpont."
  if (input.endDate && !isIsoDate(input.endDate)) errors.endDate = "Érvénytelen dátum."
  if (input.endTime && !isClockTime(input.endTime)) errors.endTime = "Érvénytelen időpont."
  if (!errors.startDate && !errors.endDate && input.startDate && input.endDate && input.endDate < input.startDate) errors.endDate = "A záró dátum nem lehet korábbi a kezdésnél."
  if (!errors.startDate && !errors.startTime && !errors.endDate && !errors.endTime && input.startDate && input.endTime) {
    const window = eventWindow(input)
    if (window.endsAt.getTime() <= window.startsAt.getTime()) errors.endTime = "A befejezés nem lehet korábbi a kezdésnél."
  }
  if (input.location.length > LOCATION_MAX) errors.location = `A helyszín legfeljebb ${LOCATION_MAX} karakter lehet.`
  if (input.linkUrl && !isHttpUrl(input.linkUrl)) errors.linkUrl = "Teljes webcímet adjon meg (https://…)."
  return errors
}

// ---------- what a visitor sees ----------

export interface PostSource {
  _id: { toString(): string }
  type: PostType
  slug: string
  title: string
  excerpt?: string | null
  body?: string | null
  status: PostStatus
  featured?: boolean | null
  publishedAt?: Date | null
  image?: { url?: string | null } | null
  startDate?: string | null
  startTime?: string | null
  endDate?: string | null
  endTime?: string | null
  startsAt?: Date | null
  endsAt?: Date | null
  location?: string | null
  linkUrl?: string | null
  linkLabel?: string | null
}

export interface PostView {
  id: string
  type: PostType
  slug: string
  href: string
  title: string
  excerpt: string
  paragraphs: string[]
  imageUrl: string | null
  featured: boolean
  /** News: publication date. Event: start date. Machine-readable (YYYY-MM-DD) and Hungarian form. */
  dateIso: string | null
  dateLabel: string | null
  event: { when: string; location: string | null; phase: EventPhase; linkUrl: string | null; linkLabel: string } | null
}

export function toPostView(post: PostSource, now: Date): PostView {
  const isEvent = post.type === "esemeny" && Boolean(post.startDate)
  const times: EventTimes | null = isEvent ? { startDate: post.startDate as string, startTime: post.startTime, endDate: post.endDate, endTime: post.endTime } : null
  const phase = times ? eventPhase(eventWindow(times), now) : null
  const newsDate = post.publishedAt ? budapestDate(post.publishedAt) : null
  const dateIso = times ? times.startDate : newsDate
  return {
    id: post._id.toString(),
    type: post.type,
    slug: post.slug,
    href: `${POSTS_PATH}/${post.slug}`,
    title: post.title,
    excerpt: post.excerpt?.trim() ?? "",
    paragraphs: splitParagraphs(post.body),
    imageUrl: post.image?.url?.trim() || null,
    featured: post.featured === true,
    dateIso,
    dateLabel: times ? formatEventWhen(times) : newsDate ? formatHuDate(newsDate) : null,
    event:
      times && phase
        ? {
            when: formatEventWhen(times),
            location: post.location?.trim() || null,
            phase,
            // A past event keeps its page and description, but no call to register (5.2).
            linkUrl: phase !== "korabbi" && post.linkUrl && isHttpUrl(post.linkUrl) ? post.linkUrl : null,
            linkLabel: post.linkLabel?.trim() || DEFAULT_LINK_LABEL,
          }
        : null,
  }
}

/**
 * Home page preview (3.2): the featured item first, then running and upcoming events, then the newest
 * news; nothing twice, at most six. `events` and `news` must already be in their list order.
 */
export function composeHomePreview(featured: PostView | null, events: PostView[], news: PostView[], size = HOME_PREVIEW_SIZE): PostView[] {
  const out: PostView[] = []
  const seen = new Set<string>()
  const usable = featured && (featured.type === "hir" || featured.event?.phase !== "korabbi") ? featured : null
  for (const item of [...(usable ? [usable] : []), ...events, ...news]) {
    if (seen.has(item.id) || out.length >= size) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}
