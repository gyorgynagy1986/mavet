import { BOARD_PROFILE_PATH, MEMBER_DIRECTORY_PATH } from "@/lib/auth-paths"
import { workgroupOptions } from "@/lib/data/site"

/**
 * Who may appear to other people, and with which data (specification 9.3, 9.4, 4.1).
 * Pure functions, no database access, so the rules are unit-tested and reused by every surface.
 */

export const DIRECTORY_PAGE_SIZE = 24

export interface DirectorySource {
  _id: { toString(): string }
  role?: string | null
  name?: string | null
  title?: string | null
  lastName?: string | null
  firstName?: string | null
  specialty?: string | null
  workplace?: string | null
  bio?: string | null
  interests?: readonly string[] | null
  workgroups?: readonly string[] | null
  office?: string | null
  boardMember?: boolean | null
  slug?: string | null
  photo?: { url?: string | null } | null
  visibility?: { enabled?: boolean | null; photo?: boolean | null; specialty?: boolean | null; workplace?: boolean | null; bio?: boolean | null; interests?: boolean | null; workgroups?: boolean | null } | null
  membership?: { status?: string | null } | null
}

/** Only what another person may see. Contact, birth, identifier and payment data are never part of it. */
export interface DirectoryProfile {
  id: string
  /** Where the profile opens: the readable public address for a board member, the members-only one otherwise. */
  href: string
  name: string
  initials: string
  office: string | null
  isBoard: boolean
  photoUrl: string | null
  specialty: string | null
  workplace: string | null
  bio: string | null
  interests: string[]
  workgroups: string[]
}

/** Active member who switched "Megjelenés engedélyezése" on: visible to active members. */
export function isListed(user: DirectorySource | null | undefined): boolean {
  return Boolean(user && user.role === "USER" && user.membership?.status === "aktiv" && user.visibility?.enabled === true)
}

/** Public appearance needs both the admin's designation and the member's own consent. */
export function isPublicProfile(user: DirectorySource | null | undefined): boolean {
  return isListed(user) && user?.boardMember === true
}

const text = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** A field flag that was never saved counts as allowed (the schema default), an explicit false hides the field. */
const allowed = (flag: boolean | null | undefined) => flag !== false

export function visibleProfile(user: DirectorySource): DirectoryProfile {
  const v = user.visibility ?? {}
  const plainName = [user.lastName, user.firstName].map((part) => part?.trim()).filter(Boolean).join(" ") || user.name?.trim() || ""
  const name = [user.title?.trim(), plainName].filter(Boolean).join(" ")
  const initials = plainName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("hu") ?? "")
    .join("")
  const names = new Map<string, string>(workgroupOptions.map((group) => [group.id, group.name]))
  const id = user._id.toString()
  const slug = text(user.slug)
  return {
    id,
    href: isPublicProfile(user) && slug ? `${BOARD_PROFILE_PATH}/${slug}` : `${MEMBER_DIRECTORY_PATH}/${id}`,
    name,
    initials,
    office: text(user.office),
    isBoard: user.boardMember === true,
    photoUrl: allowed(v.photo) ? text(user.photo?.url) : null,
    specialty: allowed(v.specialty) ? text(user.specialty) : null,
    workplace: allowed(v.workplace) ? text(user.workplace) : null,
    bio: allowed(v.bio) ? text(user.bio) : null,
    interests: allowed(v.interests) ? (user.interests ?? []).map((item) => item.trim()).filter(Boolean) : [],
    workgroups: allowed(v.workgroups) ? (user.workgroups ?? []).flatMap((id) => names.get(id) ?? []) : [],
  }
}

/**
 * Address-safe form of a name without the title: "Kovács-Nagy Éva" → "kovacs-nagy-eva".
 * Falls back to "tag" when nothing usable is left.
 */
export function slugifyName(name: string | null | undefined): string {
  const slug = (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")
  return slug || "tag"
}

/** Candidates in order: the plain slug, then numbered ones for people sharing a name. */
export function slugCandidate(base: string, attempt: number): string {
  return attempt <= 1 ? base : `${base}-${attempt}`
}

const ACCENT_GROUPS = ["aá", "eé", "ií", "oóöő", "uúüű"]

/**
 * Name search (9.4): partial match, case-insensitive, and tolerant of missing accents
 * ("kovacs" finds "Kovács"). Returns one regular-expression source per word; every word must
 * match the name, in any order. Only the name is searched, never another field.
 */
export function nameSearchPatterns(query: string | null | undefined): string[] {
  const words = (query ?? "").trim().toLocaleLowerCase("hu").split(/\s+/).filter(Boolean).slice(0, 5)
  return words.map((word) =>
    Array.from(word.slice(0, 40))
      .map((char) => {
        const group = ACCENT_GROUPS.find((letters) => letters.includes(char))
        if (group) return `[${group}${group.toLocaleUpperCase("hu")}]`
        const upper = char.toLocaleUpperCase("hu")
        const escape = (c: string) => c.replace(/[.*+?^${}()|[\]\\\/-]/g, "\\$&")
        return upper !== char && upper.length === 1 ? `[${escape(char)}${escape(upper)}]` : escape(char)
      })
      .join(""),
  )
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number.parseInt(Array.isArray(value) ? (value[0] ?? "") : (value ?? ""), 10)
  return Number.isFinite(n) && n >= 1 && n <= 10000 ? n : 1
}

/** Page numbers to show: all when few, otherwise the ends and a window around the current page (0 = gap). */
export function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const wanted = new Set([1, 2, total - 1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total))
  const sorted = [...wanted].sort((a, b) => a - b)
  const out: number[] = []
  for (const n of sorted) {
    if (out.length > 0 && n - out[out.length - 1] > 1) out.push(0)
    out.push(n)
  }
  return out
}
