"use server"

import mongoose from "mongoose"
import type { Session } from "next-auth"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { PostModel, type PostDocument } from "@/lib/models/post"
import { POST_TYPE_LABEL, budapestDate, budapestToUtc, eventWindow, normalizePost, validatePost, type PostErrors, type PostInput } from "@/lib/posts"
import { actorFromSession, logAdminAudit } from "@/lib/server/auth/admin-audit"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { purgePostImages, storePostImage } from "@/lib/server/post-image"
import { uniquePostSlug } from "@/lib/server/posts"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { revalidatePosts } from "@/lib/server/revalidate-public"
import { PHOTO_MESSAGES, photoFileError } from "@/lib/validation/photo"

export type PostActionResult = { ok: true; message: string; id: string } | { ok: false; message: string; errors?: PostErrors }
/** What the save button asks for besides storing the fields. */
export type SaveIntent = "keep" | "publish" | "unpublish"

const LIST_PATH = `${ADMIN_HOME_PATH}/aktualitasok`
const DENIED = { ok: false as const, message: "Nincs jogosultsága." }

type Ctx = { session: Session; meta: { ip: string | null; userAgent: string | null } }

async function context(): Promise<Ctx | null> {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) return null
  const h = await headers()
  await dbConnect()
  return { session, meta: { ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, userAgent: h.get("user-agent") } }
}

async function load(id: string): Promise<PostDocument | null> {
  if (!mongoose.isValidObjectId(id)) return null
  return PostModel.findById(id).lean<PostDocument | null>()
}

function refresh(post: { _id: { toString(): string }; slug: string }) {
  revalidatePath(LIST_PATH)
  revalidatePath(`${LIST_PATH}/${post._id.toString()}`)
  revalidatePosts(post.slug)
}

/** The stored fields derived from the form; the event's start and end instants are recomputed on every save. */
function fields(input: PostInput) {
  const isEvent = input.type === "esemeny"
  const window = isEvent && input.startDate ? eventWindow(input) : null
  return {
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    startDate: isEvent && input.startDate ? input.startDate : null,
    startTime: isEvent && input.startTime ? input.startTime : null,
    endDate: isEvent && input.endDate ? input.endDate : null,
    endTime: isEvent && input.endTime ? input.endTime : null,
    startsAt: window?.startsAt ?? null,
    endsAt: window?.endsAt ?? null,
    location: isEvent ? input.location : "",
    linkUrl: isEvent ? input.linkUrl : "",
    linkLabel: isEvent ? input.linkLabel : "",
  }
}

/**
 * Creates (id = null) or updates a post. A draft can be saved with a title only; publishing, and saving
 * something that is already public, needs every field a visitor sees. The type and the slug never change.
 */
export async function savePost(id: string | null, raw: Partial<Record<keyof PostInput, unknown>>, intent: SaveIntent): Promise<PostActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const existing = id ? await load(id) : null
  if (id && !existing) return { ok: false, message: "A bejegyzés nem található." }

  const input = normalizePost({ ...raw, type: existing?.type ?? raw.type })
  const willBePublic = intent === "publish" || (intent === "keep" && existing?.status === "kozzetett")
  const errors = validatePost(input, willBePublic)
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: willBePublic ? "Közzétételhez minden megjelenő adat szükséges; nézze át a jelölt mezőket." : "Néhány mező hibás.", errors }
  }

  const status = intent === "publish" ? "kozzetett" : intent === "unpublish" ? "piszkozat" : (existing?.status ?? "piszkozat")
  const actorEmail = ctx.session.user.email ?? null
  // News date: the one typed in; otherwise kept, or the day of the first publication.
  const typedDate = input.type === "hir" && input.publishedDate ? budapestToUtc(input.publishedDate, "12:00") : null
  const keepsDate = typedDate && existing?.publishedAt && budapestDate(existing.publishedAt) === input.publishedDate
  const publishedAt = keepsDate ? existing.publishedAt : (typedDate ?? existing?.publishedAt ?? (status === "kozzetett" ? new Date() : null))

  const update = {
    ...fields(input),
    status,
    publishedAt,
    updatedByEmail: actorEmail,
    // A withdrawn post cannot stay featured (3.2).
    ...(status === "piszkozat" ? { featured: false } : {}),
  }

  let post: { _id: mongoose.Types.ObjectId; slug: string }
  if (existing) {
    await PostModel.updateOne({ _id: existing._id }, { $set: update })
    post = existing
  } else {
    const slug = await uniquePostSlug(input.title)
    const created = await PostModel.create({ ...update, type: input.type, slug, createdByEmail: actorEmail })
    post = { _id: created._id, slug }
  }

  const label = POST_TYPE_LABEL[input.type]
  const action = !existing ? "post_create" : status !== existing.status ? (status === "kozzetett" ? "post_publish" : "post_unpublish") : "post_update"
  await logAdminAudit({
    ...actorFromSession(ctx.session),
    ...ctx.meta,
    action,
    targetName: input.title,
    changes: existing && status !== existing.status ? [{ field: "status", from: existing.status, to: status }] : [],
    summary: `${label}: „${input.title}” (${post.slug})`,
  })
  if (!existing && status === "kozzetett") {
    await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "post_publish", targetName: input.title, summary: `${label}: „${input.title}” (${post.slug})` })
  }

  refresh(post)
  const message = !existing
    ? status === "kozzetett" ? `${label} létrehozva és közzétéve.` : "Piszkozat mentve."
    : status !== existing.status
      ? status === "kozzetett" ? "Közzétéve: mostantól látható az oldalon." : "Visszavonva: az oldalon már nem látható, közvetlen hivatkozással sem."
      : "Módosítások mentve."
  return { ok: true, message, id: post._id.toString() }
}

/** Marks one published post as the home page highlight; any other loses the mark (3.2). */
export async function setPostFeatured(id: string, featured: boolean): Promise<PostActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const post = await load(id)
  if (!post) return { ok: false, message: "A bejegyzés nem található." }
  if (featured && post.status !== "kozzetett") return { ok: false, message: "Csak közzétett bejegyzés emelhető ki." }
  if (featured && post.type === "esemeny" && post.endsAt && post.endsAt.getTime() <= Date.now()) return { ok: false, message: "Korábbi esemény nem emelhető ki a főoldalon." }

  if (featured) await PostModel.updateMany({ _id: { $ne: post._id }, featured: true }, { $set: { featured: false } })
  await PostModel.updateOne({ _id: post._id }, { $set: { featured, updatedByEmail: ctx.session.user.email ?? null } })
  await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "post_update", targetName: post.title, changes: [{ field: "featured", from: String(post.featured === true), to: String(featured) }], summary: `Főoldali kiemelés: ${featured ? "be" : "ki"} („${post.title}”)` })
  refresh(post)
  return { ok: true, message: featured ? "Kiemelve a főoldalon." : "A kiemelés megszűnt.", id }
}

/** Deletes the post and its image for good. */
export async function deletePost(id: string): Promise<PostActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const post = await load(id)
  if (!post) return { ok: false, message: "A bejegyzés nem található." }
  if (isBlobConfigured()) await purgePostImages(post._id.toString())
  await PostModel.deleteOne({ _id: post._id })
  await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "post_delete", targetName: post.title, summary: `${POST_TYPE_LABEL[post.type]} törölve: „${post.title}” (${post.slug})` })
  refresh(post)
  return { ok: true, message: "Bejegyzés törölve.", id }
}

/** Image upload (FormData with `image`); replaces the previous one, which is deleted from the store. */
export async function uploadPostImage(id: string, formData: FormData): Promise<PostActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const post = await load(id)
  if (!post) return { ok: false, message: "A bejegyzés nem található." }
  const file = formData.get("image")
  const invalid = photoFileError(file instanceof File ? file : null)
  if (invalid || !(file instanceof File)) return { ok: false, message: invalid ?? PHOTO_MESSAGES.missing }

  const postId = post._id.toString()
  const stored = await storePostImage(postId, file)
  if (!stored.ok) return stored
  await PostModel.updateOne({ _id: post._id }, { $set: { image: { url: stored.url, pathname: stored.pathname }, updatedByEmail: ctx.session.user.email ?? null } })
  await purgePostImages(postId, stored)
  refresh(post)
  return { ok: true, message: "Kép mentve.", id }
}

export async function removePostImage(id: string): Promise<PostActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const post = await load(id)
  if (!post) return { ok: false, message: "A bejegyzés nem található." }
  if (!isBlobConfigured()) return { ok: false, message: PHOTO_MESSAGES.notConfigured }
  if (!(await purgePostImages(post._id.toString()))) return { ok: false, message: PHOTO_MESSAGES.deleteFailed }
  await PostModel.updateOne({ _id: post._id }, { $set: { image: { url: null, pathname: null }, updatedByEmail: ctx.session.user.email ?? null } })
  refresh(post)
  return { ok: true, message: "Kép eltávolítva.", id }
}
