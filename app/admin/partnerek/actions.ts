"use server"

import mongoose from "mongoose"
import type { Session } from "next-auth"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { LOGO_MESSAGES, PARTNERS_INTRO_KEY, PARTNERS_INTRO_MAX, logoFileError, normalizePartner, validatePartner, type PartnerErrors, type PartnerInput } from "@/lib/partners"
import { PartnerModel, type PartnerDocument } from "@/lib/models/partner"
import { SiteTextModel } from "@/lib/models/site-text"
import { actorFromSession, logAdminAudit } from "@/lib/server/auth/admin-audit"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { purgePartnerLogos, storePartnerLogo } from "@/lib/server/partner-logo"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { revalidatePartners } from "@/lib/server/revalidate-public"

export type PartnerActionResult = { ok: true; message: string; id?: string } | { ok: false; message: string; errors?: PartnerErrors }

const DENIED = { ok: false as const, message: "Nincs jogosultsága." }
type Ctx = { session: Session; meta: { ip: string | null; userAgent: string | null } }

async function context(): Promise<Ctx | null> {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) return null
  const h = await headers()
  await dbConnect()
  return { session, meta: { ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, userAgent: h.get("user-agent") } }
}

async function load(id: string): Promise<PartnerDocument | null> {
  if (!mongoose.isValidObjectId(id)) return null
  return PartnerModel.findById(id).lean<PartnerDocument | null>()
}

function refresh() {
  revalidatePath(`${ADMIN_HOME_PATH}/partnerek`)
  revalidatePartners()
}

async function audit(ctx: Ctx, targetName: string, summary: string) {
  await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "partner_update", targetName, summary })
}

export async function savePartner(id: string | null, raw: Partial<Record<keyof PartnerInput, unknown>>): Promise<PartnerActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const input = normalizePartner(raw)
  const errors = validatePartner(input)
  if (Object.keys(errors).length > 0) return { ok: false, message: "Néhány mező hibás.", errors }
  const actorEmail = ctx.session.user.email ?? null
  let partnerId: string
  if (id) {
    const existing = await load(id)
    if (!existing) return { ok: false, message: "A partner nem található." }
    await PartnerModel.updateOne({ _id: existing._id }, { $set: { name: input.name, websiteUrl: input.websiteUrl, updatedByEmail: actorEmail } })
    partnerId = id
  } else {
    const last = await PartnerModel.findOne().sort({ order: -1 }).lean<PartnerDocument | null>()
    const created = await PartnerModel.create({ name: input.name, websiteUrl: input.websiteUrl, order: (last?.order ?? 0) + 1, updatedByEmail: actorEmail })
    partnerId = created._id.toString()
  }
  await audit(ctx, input.name, `${id ? "Partner szerkesztve" : "Új partner"}: „${input.name}”`)
  refresh()
  return { ok: true, message: id ? "Partner mentve." : "Partner létrehozva; töltse fel a logót, majd tegye közzé.", id: partnerId }
}

export async function setPartnerFlag(id: string, flag: "featured" | "published", value: boolean): Promise<PartnerActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const partner = await load(id)
  if (!partner) return { ok: false, message: "A partner nem található." }
  if (flag === "published" && value && !partner.logo?.url) return { ok: false, message: "Közzététel előtt töltsön fel logót." }
  await PartnerModel.updateOne({ _id: partner._id }, { $set: { [flag]: value, updatedByEmail: ctx.session.user.email ?? null } })
  await audit(ctx, partner.name, `Partner ${flag === "featured" ? "főoldali kiemelés" : "közzététel"}: ${value ? "be" : "ki"} („${partner.name}”)`)
  refresh()
  return { ok: true, message: flag === "featured" ? (value ? "Megjelenik a főoldalon." : "Lekerült a főoldalról.") : value ? "Közzétéve." : "Elrejtve." }
}

export async function movePartner(id: string, direction: "fel" | "le"): Promise<PartnerActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const all = await PartnerModel.find().sort({ order: 1, name: 1 }).lean<PartnerDocument[]>()
  const index = all.findIndex((p) => p._id.toString() === id)
  const swap = direction === "fel" ? index - 1 : index + 1
  if (index < 0 || swap < 0 || swap >= all.length) return { ok: true, message: "Nincs változás." }
  const reordered = [...all]
  ;[reordered[index], reordered[swap]] = [reordered[swap], reordered[index]]
  await Promise.all(reordered.map((p, i) => PartnerModel.updateOne({ _id: p._id }, { $set: { order: i + 1 } })))
  refresh()
  return { ok: true, message: "Sorrend mentve." }
}

/** Logo upload (FormData `logo`); the previous logo is deleted from the store. */
export async function uploadPartnerLogo(id: string, formData: FormData): Promise<PartnerActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const partner = await load(id)
  if (!partner) return { ok: false, message: "A partner nem található." }
  const file = formData.get("logo")
  const invalid = logoFileError(file instanceof File ? file : null)
  if (invalid || !(file instanceof File)) return { ok: false, message: invalid ?? LOGO_MESSAGES.missing }
  const partnerId = partner._id.toString()
  const stored = await storePartnerLogo(partnerId, file)
  if (!stored.ok) return stored
  await PartnerModel.updateOne({ _id: partner._id }, { $set: { logo: { url: stored.url, pathname: stored.pathname }, updatedByEmail: ctx.session.user.email ?? null } })
  await purgePartnerLogos(partnerId, stored)
  await audit(ctx, partner.name, `Partner logó cserélve: „${partner.name}”`)
  refresh()
  return { ok: true, message: "Logó mentve." }
}

export async function deletePartner(id: string): Promise<PartnerActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const partner = await load(id)
  if (!partner) return { ok: false, message: "A partner nem található." }
  if (isBlobConfigured()) await purgePartnerLogos(partner._id.toString())
  await PartnerModel.deleteOne({ _id: partner._id })
  await audit(ctx, partner.name, `Partner törölve: „${partner.name}”`)
  refresh()
  return { ok: true, message: "Partner törölve." }
}

export async function savePartnersIntro(raw: string): Promise<PartnerActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const text = raw.replace(/\r\n?/g, "\n").trim().slice(0, PARTNERS_INTRO_MAX)
  await SiteTextModel.updateOne({ key: PARTNERS_INTRO_KEY }, { $set: { text, updatedByEmail: ctx.session.user.email ?? null } }, { upsert: true })
  await audit(ctx, "Partnerek bevezető", "A Partnerek oldal bevezetője szerkesztve")
  refresh()
  return { ok: true, message: "Bevezető mentve." }
}
