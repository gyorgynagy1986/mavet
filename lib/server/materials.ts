import mongoose from "mongoose"
import dbConnect from "@/lib/db-connect"
import { MATERIALS_PAGE_SIZE, formatBytes, type MaterialAccess, type MaterialKind, type VideoProvider } from "@/lib/materials"
import { MaterialCategoryModel, type MaterialCategoryDocument } from "@/lib/models/material-category"
import { MaterialModel, type MaterialDocument } from "@/lib/models/material"
import type { Viewer } from "@/lib/server/directory"

const PUBLISHED = { status: "kozzetett" } as const
const ORDER = { publishedDate: -1, _id: -1 } as const

export interface CategoryOption {
  id: string
  name: string
  slug: string
}

export async function listCategories(): Promise<CategoryOption[]> {
  await dbConnect()
  const docs = await MaterialCategoryModel.find().sort({ order: 1, name: 1 }).lean<MaterialCategoryDocument[]>()
  return docs.map((c) => ({ id: c._id.toString(), name: c.name, slug: c.slug }))
}

/** What the public list shows for one material; `locked` means the viewer may see the card but not open it (6.3). */
export interface MaterialView {
  id: string
  title: string
  summary: string
  category: string | null
  categorySlug: string | null
  kind: MaterialKind
  access: MaterialAccess
  author: string | null
  dateLabel: string | null
  dateIso: string | null
  locked: boolean
  /** Document: where "Megnyitás" leads (our gate route). */
  openHref: string | null
  fileLabel: string | null
  /** Video: embeddable address, present only when the viewer may watch. */
  video: { provider: VideoProvider; embedUrl: string | null } | null
}

export const canOpenMembersOnly = (viewer: Viewer) => viewer.kind === "member" && viewer.active

function dateLabel(iso: string | null | undefined): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
}

export function toMaterialView(doc: MaterialDocument, categories: Map<string, CategoryOption>, viewer: Viewer): MaterialView {
  const locked = doc.access === "tagi" && !canOpenMembersOnly(viewer)
  const category = doc.categoryId ? (categories.get(doc.categoryId.toString()) ?? null) : null
  const id = doc._id.toString()
  const isDocument = doc.kind === "dokumentum"
  const hasDocument = isDocument && (doc.documentSource === "link" ? Boolean(doc.externalUrl) : Boolean(doc.file?.url))
  const fileLabel = isDocument
    ? doc.documentSource === "link"
      ? "Külső hivatkozás"
      : doc.file?.contentType
        ? `${(doc.file.name?.split(".").pop() ?? "fájl").toUpperCase()}${doc.file.size ? ` · ${formatBytes(doc.file.size)}` : ""}`
        : null
    : null
  return {
    id,
    title: doc.title,
    summary: doc.summary ?? "",
    category: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    kind: doc.kind,
    access: doc.access,
    author: doc.author?.trim() || null,
    dateLabel: dateLabel(doc.publishedDate),
    dateIso: doc.publishedDate ?? null,
    locked,
    openHref: !locked && hasDocument ? `/szakmai-anyagok/${id}/megnyitas` : null,
    fileLabel,
    video:
      doc.kind === "video"
        ? {
            provider: doc.videoProvider,
            embedUrl: !locked && doc.videoProvider === "youtube" && doc.videoId ? `https://www.youtube-nocookie.com/embed/${doc.videoId}?rel=0` : null,
          }
        : null,
  }
}

export interface MaterialsPage {
  items: MaterialView[]
  total: number
  page: number
  pages: number
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Public list (6.4): title search, category filter, numbered pages; locked cards stay in the list. */
export async function listPublishedMaterials(viewer: Viewer, query: string, categorySlug: string, page: number): Promise<MaterialsPage> {
  await dbConnect()
  const categories = await listCategories()
  const bySlug = categories.find((c) => c.slug === categorySlug)
  const filter: Record<string, unknown> = { ...PUBLISHED }
  if (bySlug) filter.categoryId = new mongoose.Types.ObjectId(bySlug.id)
  if (query) filter.title = new RegExp(escapeRegex(query), "i")
  const total = await MaterialModel.countDocuments(filter)
  const pages = Math.max(1, Math.ceil(total / MATERIALS_PAGE_SIZE))
  const current = Math.min(Math.max(1, page), pages)
  const docs = await MaterialModel.find(filter).sort(ORDER).skip((current - 1) * MATERIALS_PAGE_SIZE).limit(MATERIALS_PAGE_SIZE).lean<MaterialDocument[]>()
  const map = new Map(categories.map((c) => [c.id, c]))
  return { items: docs.map((d) => toMaterialView(d, map, viewer)), total, page: current, pages }
}

export async function findPublishedMaterial(id: string): Promise<MaterialDocument | null> {
  if (!mongoose.isValidObjectId(id)) return null
  await dbConnect()
  return MaterialModel.findOne({ _id: id, ...PUBLISHED }).lean<MaterialDocument | null>()
}
