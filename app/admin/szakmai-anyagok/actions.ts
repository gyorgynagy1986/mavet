"use server"

import mongoose from "mongoose"
import type { Session } from "next-auth"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { DOCUMENT_MESSAGES, DOCUMENT_TYPES, DOCUMENT_MAX_BYTES, normalizeMaterial, slugifyCategory, validateMaterial, youtubeId, type MaterialErrors, type MaterialInput } from "@/lib/materials"
import { MaterialCategoryModel, type MaterialCategoryDocument } from "@/lib/models/material-category"
import { MaterialModel, type MaterialDocument } from "@/lib/models/material"
import { actorFromSession, logAdminAudit } from "@/lib/server/auth/admin-audit"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { purgeMaterialFiles } from "@/lib/server/material-file"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { revalidateMaterials } from "@/lib/server/revalidate-public"

export type MaterialActionResult = { ok: true; message: string; id: string } | { ok: false; message: string; errors?: MaterialErrors }
export type MaterialSaveIntent = "keep" | "publish" | "hide"

const LIST_PATH = `${ADMIN_HOME_PATH}/szakmai-anyagok`
const DENIED = { ok: false as const, message: "Nincs jogosultsága." }

type Ctx = { session: Session; meta: { ip: string | null; userAgent: string | null } }

async function context(): Promise<Ctx | null> {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) return null
  const h = await headers()
  await dbConnect()
  return { session, meta: { ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, userAgent: h.get("user-agent") } }
}

async function load(id: string): Promise<MaterialDocument | null> {
  if (!mongoose.isValidObjectId(id)) return null
  return MaterialModel.findById(id).lean<MaterialDocument | null>()
}

function refresh(id?: string) {
  revalidatePath(LIST_PATH)
  revalidatePath(`${LIST_PATH}/kategoriak`)
  if (id) revalidatePath(`${LIST_PATH}/${id}`)
  revalidateMaterials()
}

/** Creates (id = null) or updates a material; publishing needs every field a visitor sees (6.2). */
export async function saveMaterial(id: string | null, raw: Partial<Record<keyof MaterialInput, unknown>>, intent: MaterialSaveIntent): Promise<MaterialActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const existing = id ? await load(id) : null
  if (id && !existing) return { ok: false, message: "Az anyag nem található." }

  const input = normalizeMaterial(raw)
  const willBePublic = intent === "publish" || (intent === "keep" && existing?.status === "kozzetett")
  const hasFile = Boolean(existing?.file?.url)
  const errors = validateMaterial(input, willBePublic, hasFile)
  if (input.categoryId && !(mongoose.isValidObjectId(input.categoryId) && (await MaterialCategoryModel.exists({ _id: input.categoryId })))) errors.categoryId = "Ismeretlen kategória."
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: willBePublic ? "Közzétételhez minden megjelenő adat szükséges; nézze át a jelölt mezőket." : "Néhány mező hibás.", errors }
  }

  const status = intent === "publish" ? "kozzetett" : intent === "hide" ? "rejtett" : (existing?.status ?? "rejtett")
  const actorEmail = ctx.session.user.email ?? null
  const update = {
    title: input.title,
    categoryId: input.categoryId ? new mongoose.Types.ObjectId(input.categoryId) : null,
    summary: input.summary,
    kind: input.kind,
    access: input.access,
    author: input.author,
    publishedDate: input.publishedDate || null,
    documentSource: input.documentSource,
    externalUrl: input.kind === "dokumentum" && input.documentSource === "link" ? input.externalUrl : "",
    videoProvider: input.videoProvider,
    videoId: input.kind === "video" ? (input.videoProvider === "youtube" ? (youtubeId(input.videoRef) ?? "") : input.videoRef) : "",
    status,
    updatedByEmail: actorEmail,
  }

  let materialId: string
  if (existing) {
    await MaterialModel.updateOne({ _id: existing._id }, { $set: update })
    materialId = existing._id.toString()
  } else {
    const created = await MaterialModel.create({ ...update, createdByEmail: actorEmail })
    materialId = created._id.toString()
  }
  await logAdminAudit({
    ...actorFromSession(ctx.session),
    ...ctx.meta,
    action: existing ? "material_update" : "material_create",
    targetName: input.title,
    changes: existing && status !== existing.status ? [{ field: "status", from: existing.status, to: status }] : [],
    summary: `Szakmai anyag: „${input.title}” (${status})`,
  })
  refresh(materialId)
  const message = !existing
    ? status === "kozzetett" ? "Anyag létrehozva és közzétéve." : "Anyag mentve (rejtett)."
    : status !== existing.status
      ? status === "kozzetett" ? "Közzétéve: mostantól látható a listában." : "Elrejtve: a listából eltűnt, a fájl másnak nem érhető el."
      : "Módosítások mentve."
  return { ok: true, message, id: materialId }
}

/** The file was uploaded straight to the Blob store by the browser (see the upload route); this records it. */
export async function attachMaterialFile(id: string, blob: { url: string; pathname: string; contentType: string; size: number; name: string }): Promise<MaterialActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const material = await load(id)
  if (!material) return { ok: false, message: "Az anyag nem található." }
  if (!blob.pathname.startsWith(`szakmai-anyagok/${material._id.toString()}/`)) return { ok: false, message: "A fájl nem ehhez az anyaghoz tartozik." }
  if (!DOCUMENT_TYPES[blob.contentType] || blob.size > DOCUMENT_MAX_BYTES) return { ok: false, message: DOCUMENT_MESSAGES.type }
  await MaterialModel.updateOne(
    { _id: material._id },
    { $set: { file: { url: blob.url, pathname: blob.pathname, name: blob.name.slice(0, 200), size: blob.size, contentType: blob.contentType }, documentSource: "fajl", updatedByEmail: ctx.session.user.email ?? null } },
  )
  await purgeMaterialFiles(material._id.toString(), blob)
  await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "material_update", targetName: material.title, summary: `Szakmai anyag fájlja cserélve: „${material.title}” (${blob.name})` })
  refresh(id)
  return { ok: true, message: "Fájl mentve.", id }
}

export async function removeMaterialFile(id: string): Promise<MaterialActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const material = await load(id)
  if (!material) return { ok: false, message: "Az anyag nem található." }
  if (!isBlobConfigured()) return { ok: false, message: DOCUMENT_MESSAGES.notConfigured }
  if (!(await purgeMaterialFiles(material._id.toString()))) return { ok: false, message: DOCUMENT_MESSAGES.deleteFailed }
  // A published document without a file would be an empty card; hide it.
  const hide = material.status === "kozzetett" && material.kind === "dokumentum" && material.documentSource === "fajl"
  await MaterialModel.updateOne(
    { _id: material._id },
    { $set: { file: { url: null, pathname: null, name: null, size: null, contentType: null }, ...(hide ? { status: "rejtett" } : {}), updatedByEmail: ctx.session.user.email ?? null } },
  )
  refresh(id)
  return { ok: true, message: hide ? "Fájl eltávolítva; az anyag rejtett lett, amíg nincs új fájl." : "Fájl eltávolítva.", id }
}

export async function deleteMaterial(id: string): Promise<MaterialActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const material = await load(id)
  if (!material) return { ok: false, message: "Az anyag nem található." }
  if (isBlobConfigured()) await purgeMaterialFiles(material._id.toString())
  await MaterialModel.deleteOne({ _id: material._id })
  await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "material_delete", targetName: material.title, summary: `Szakmai anyag törölve: „${material.title}”` })
  refresh(id)
  return { ok: true, message: "Anyag törölve.", id }
}

// ---- categories ----

export type CategoryActionResult = { ok: true; message: string } | { ok: false; message: string }

export async function saveCategory(id: string | null, rawName: string): Promise<CategoryActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const name = rawName.trim().slice(0, 80)
  if (!name) return { ok: false, message: "Adjon nevet a kategóriának." }
  const slug = slugifyCategory(name) || `kategoria-${Date.now()}`
  const clash = await MaterialCategoryModel.findOne({ slug, ...(id ? { _id: { $ne: id } } : {}) }).lean<MaterialCategoryDocument | null>()
  if (clash) return { ok: false, message: "Ilyen nevű kategória már van." }
  if (id) {
    if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Érvénytelen azonosító." }
    await MaterialCategoryModel.updateOne({ _id: id }, { $set: { name, slug } })
  } else {
    const last = await MaterialCategoryModel.findOne().sort({ order: -1 }).lean<MaterialCategoryDocument | null>()
    await MaterialCategoryModel.create({ name, slug, order: (last?.order ?? 0) + 1 })
  }
  await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "material_category_change", targetName: name, summary: `Kategória ${id ? "módosítva" : "létrehozva"}: „${name}”` })
  refresh()
  return { ok: true, message: id ? "Kategória mentve." : "Kategória létrehozva." }
}

export async function moveCategory(id: string, direction: "fel" | "le"): Promise<CategoryActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const all = await MaterialCategoryModel.find().sort({ order: 1, name: 1 }).lean<MaterialCategoryDocument[]>()
  const index = all.findIndex((c) => c._id.toString() === id)
  const swap = direction === "fel" ? index - 1 : index + 1
  if (index < 0 || swap < 0 || swap >= all.length) return { ok: true, message: "Nincs változás." }
  const reordered = [...all]
  ;[reordered[index], reordered[swap]] = [reordered[swap], reordered[index]]
  await Promise.all(reordered.map((c, i) => MaterialCategoryModel.updateOne({ _id: c._id }, { $set: { order: i + 1 } })))
  refresh()
  return { ok: true, message: "Sorrend mentve." }
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Érvénytelen azonosító." }
  const used = await MaterialModel.countDocuments({ categoryId: id })
  if (used > 0) return { ok: false, message: `A kategóriához ${used} anyag tartozik; előbb sorolja át őket.` }
  const cat = await MaterialCategoryModel.findByIdAndDelete(id).lean<MaterialCategoryDocument | null>()
  if (cat) await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "material_category_change", targetName: cat.name, summary: `Kategória törölve: „${cat.name}”` })
  refresh()
  return { ok: true, message: "Kategória törölve." }
}
