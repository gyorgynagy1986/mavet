/**
 * Professional materials (specification 6): pure rules shared by the admin form, the server actions
 * and the public list. No database or React here, so it is unit-testable.
 */

export const MATERIALS_PATH = "/szakmai-anyagok"
export const MATERIALS_PAGE_SIZE = 12

export const materialKinds = ["dokumentum", "video"] as const
export type MaterialKind = (typeof materialKinds)[number]
export const MATERIAL_KIND_LABEL: Record<MaterialKind, string> = { dokumentum: "Dokumentum", video: "Videó" }

export const materialAccess = ["publikus", "tagi"] as const
export type MaterialAccess = (typeof materialAccess)[number]
export const MATERIAL_ACCESS_LABEL: Record<MaterialAccess, string> = { publikus: "Publikus", tagi: "Csak aktív tagoknak" }

export const materialStatuses = ["rejtett", "kozzetett"] as const
export type MaterialStatus = (typeof materialStatuses)[number]
export const MATERIAL_STATUS_LABEL: Record<MaterialStatus, string> = { rejtett: "Rejtett", kozzetett: "Közzétéve" }

/** Where a video comes from. Bunny.net is modelled, but playback is not wired up yet (see lib/server/bunny.ts). */
export const videoProviders = ["youtube", "bunny"] as const
export type VideoProvider = (typeof videoProviders)[number]
export const VIDEO_PROVIDER_LABEL: Record<VideoProvider, string> = { youtube: "YouTube (publikus)", bunny: "Bunny.net (védett, később)" }

/** Document sources: an uploaded file or an external address (6.1). */
export const documentSources = ["fajl", "link"] as const
export type DocumentSource = (typeof documentSources)[number]

export const MATERIAL_TITLE_MAX = 200
export const MATERIAL_SUMMARY_MAX = 600
export const MATERIAL_AUTHOR_MAX = 200

/** Accepted document uploads (ND-37, proposed to the client): PDF and Office files, up to 25 MB. */
export const DOCUMENT_MAX_BYTES = 25 * 1024 * 1024
export const DOCUMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
}
export const DOCUMENT_ACCEPT = Object.keys(DOCUMENT_TYPES).join(",")
export const DOCUMENT_EXTENSIONS = Object.values(DOCUMENT_TYPES)

export const DOCUMENT_MESSAGES = {
  missing: "Válasszon egy fájlt.",
  type: `Csak ${DOCUMENT_EXTENSIONS.map((e) => e.toUpperCase()).join(", ")} fájl tölthető fel.`,
  tooLarge: "A fájl legfeljebb 25 MB lehet.",
  notConfigured: "A fájltároló nincs beállítva ezen a környezeten.",
  storage: "A fájl mentése nem sikerült. Próbálja újra.",
  deleteFailed: "A fájl törlése a tárolóból nem sikerült.",
} as const

export function documentFileError(file: { type: string; size: number } | null | undefined): string | null {
  if (!file) return DOCUMENT_MESSAGES.missing
  if (!DOCUMENT_TYPES[file.type]) return DOCUMENT_MESSAGES.type
  if (file.size > DOCUMENT_MAX_BYTES) return DOCUMENT_MESSAGES.tooLarge
  return null
}

export interface MaterialInput {
  title: string
  categoryId: string
  summary: string
  kind: MaterialKind
  access: MaterialAccess
  author: string
  /** YYYY-MM-DD or empty. */
  publishedDate: string
  // document
  documentSource: DocumentSource
  externalUrl: string
  // video
  videoProvider: VideoProvider
  /** A YouTube address or id; for Bunny the library video id. */
  videoRef: string
}

export type MaterialErrors = Partial<Record<keyof MaterialInput | "file", string>>

const str = (v: unknown) => (typeof v === "string" ? v : "")
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback)

export function normalizeMaterial(raw: Partial<Record<keyof MaterialInput, unknown>>): MaterialInput {
  return {
    title: str(raw.title).trim().slice(0, MATERIAL_TITLE_MAX),
    categoryId: str(raw.categoryId).trim(),
    summary: str(raw.summary).trim().slice(0, MATERIAL_SUMMARY_MAX),
    kind: oneOf(raw.kind, materialKinds, "dokumentum"),
    access: oneOf(raw.access, materialAccess, "publikus"),
    author: str(raw.author).trim().slice(0, MATERIAL_AUTHOR_MAX),
    publishedDate: str(raw.publishedDate).trim(),
    documentSource: oneOf(raw.documentSource, documentSources, "fajl"),
    externalUrl: str(raw.externalUrl).trim(),
    videoProvider: oneOf(raw.videoProvider, videoProviders, "youtube"),
    videoRef: str(raw.videoRef).trim(),
  }
}

export const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
export const isHttpUrl = (v: string) => /^https?:\/\/\S+$/i.test(v)

/** The YouTube video id from any common address form (watch, youtu.be, shorts, embed) or a bare id. */
export function youtubeId(input: string): string | null {
  const v = input.trim()
  if (/^[\w-]{11}$/.test(v)) return v
  try {
    const url = new URL(v)
    const host = url.hostname.replace(/^www\.|^m\./, "")
    if (host === "youtu.be") return /^[\w-]{11}$/.test(url.pathname.slice(1)) ? url.pathname.slice(1) : null
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/)?.[1] ?? null
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }
  } catch {
    return null
  }
  return null
}

/**
 * Validation. `publishing` is true when the material will be visible: then everything a visitor needs
 * must be present (6.2); a hidden material can be saved with a title only. `hasFile` tells whether an
 * uploaded file is attached (uploads are separate from the form).
 */
export function validateMaterial(input: MaterialInput, publishing: boolean, hasFile: boolean): MaterialErrors {
  const e: MaterialErrors = {}
  if (!input.title) e.title = "Adjon címet."
  if (input.publishedDate && !isIsoDate(input.publishedDate)) e.publishedDate = "Érvénytelen dátum."
  if (input.kind === "dokumentum" && input.documentSource === "link" && input.externalUrl && !isHttpUrl(input.externalUrl)) e.externalUrl = "Teljes webcím kell (https://…)."
  if (input.kind === "video" && input.videoRef) {
    if (input.videoProvider === "youtube" && !youtubeId(input.videoRef)) e.videoRef = "Nem ismerhető fel YouTube-videó. Illessze be a videó címét (https://www.youtube.com/watch?v=…)."
  }
  if (input.kind === "video" && input.videoProvider === "bunny") e.videoProvider = "A Bunny.net lejátszás még nincs bekötve; egyelőre YouTube-videó tehető közzé."
  if (!publishing) return e
  if (!input.categoryId) e.categoryId = "Válasszon kategóriát."
  if (!input.summary) e.summary = "Közzétételhez rövid összefoglaló kell."
  if (input.kind === "dokumentum") {
    if (input.documentSource === "fajl" && !hasFile) e.file = "Közzétételhez töltse fel a dokumentumot."
    if (input.documentSource === "link" && !input.externalUrl) e.externalUrl = "Közzétételhez adja meg a dokumentum webcímét."
  } else if (!input.videoRef) e.videoRef = "Közzétételhez adja meg a videót."
  return e
}

export const slugifyCategory = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`
  return `${(n / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`
}
