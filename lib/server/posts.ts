import mongoose from "mongoose"
import dbConnect from "@/lib/db-connect"
import { PostModel, type PostDocument } from "@/lib/models/post"
import { EVENTS_PAGE_SIZE, HOME_PREVIEW_SIZE, NEWS_PAGE_SIZE, RESERVED_POST_SLUGS, composeHomePreview, slugifyTitle, toPostView, type PostSource, type PostView } from "@/lib/posts"

/** Only published posts are ever read by the public pages (5.3). */
const PUBLISHED = { status: "kozzetett" } as const
/** Newest first; the id keeps the order stable between pages when dates are equal (5.2). */
const NEWS_ORDER = { publishedAt: -1, _id: -1 } as const

const view = (now: Date) => (doc: PostDocument) => toPostView(doc as unknown as PostSource, now)

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

async function paged(filter: Record<string, unknown>, sort: Record<string, 1 | -1>, page: number, size: number, now: Date): Promise<Paged<PostView>> {
  await dbConnect()
  const total = await PostModel.countDocuments(filter)
  const pages = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(1, page), pages)
  const docs = await PostModel.find(filter).sort(sort).skip((current - 1) * size).limit(size).lean<PostDocument[]>()
  return { items: docs.map(view(now)), total, page: current, pages }
}

export function listNews(page: number, now = new Date()): Promise<Paged<PostView>> {
  return paged({ ...PUBLISHED, type: "hir" }, NEWS_ORDER, page, NEWS_PAGE_SIZE, now)
}

/** Running events first, then upcoming ones by start (5.2): both fall out of ordering by start time. */
export function listCurrentEvents(page: number, now = new Date()): Promise<Paged<PostView>> {
  return paged({ ...PUBLISHED, type: "esemeny", endsAt: { $gt: now } }, { startsAt: 1, _id: 1 }, page, EVENTS_PAGE_SIZE, now)
}

/** The event that ended most recently comes first (5.2). */
export function listPastEvents(page: number, now = new Date()): Promise<Paged<PostView>> {
  return paged({ ...PUBLISHED, type: "esemeny", endsAt: { $lte: now } }, { endsAt: -1, _id: -1 }, page, EVENTS_PAGE_SIZE, now)
}

export async function countPastEvents(now = new Date()): Promise<number> {
  await dbConnect()
  return PostModel.countDocuments({ ...PUBLISHED, type: "esemeny", endsAt: { $lte: now } })
}

export async function getPublishedPost(slug: string, now = new Date()): Promise<PostView | null> {
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) return null
  await dbConnect()
  const doc = await PostModel.findOne({ ...PUBLISHED, slug }).lean<PostDocument | null>()
  return doc ? view(now)(doc) : null
}

export async function listPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  await dbConnect()
  const docs = await PostModel.find(PUBLISHED).select({ slug: 1, updatedAt: 1 }).limit(2000).lean<Pick<PostDocument, "slug" | "updatedAt">[]>()
  return docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt }))
}

/** Home page preview (3.2); see `composeHomePreview` for the rule. */
export async function listHomePreview(now = new Date()): Promise<PostView[]> {
  await dbConnect()
  const [featured, events, news] = await Promise.all([
    PostModel.findOne({ ...PUBLISHED, featured: true }).lean<PostDocument | null>(),
    PostModel.find({ ...PUBLISHED, type: "esemeny", endsAt: { $gt: now } }).sort({ startsAt: 1, _id: 1 }).limit(HOME_PREVIEW_SIZE).lean<PostDocument[]>(),
    PostModel.find({ ...PUBLISHED, type: "hir" }).sort(NEWS_ORDER).limit(HOME_PREVIEW_SIZE).lean<PostDocument[]>(),
  ])
  const toView = view(now)
  return composeHomePreview(featured ? toView(featured) : null, events.map(toView), news.map(toView))
}

/** A free slug for a new post: the title's slug, numbered if taken or reserved. */
export async function uniquePostSlug(title: string): Promise<string> {
  await dbConnect()
  const base = slugifyTitle(title)
  for (let attempt = 1; attempt <= 100; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`
    if ((RESERVED_POST_SLUGS as readonly string[]).includes(candidate)) continue
    if (!(await PostModel.exists({ slug: candidate }))) return candidate
  }
  return `${base}-${new mongoose.Types.ObjectId().toString().slice(-6)}`
}
