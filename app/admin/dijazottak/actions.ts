"use server"

import mongoose from "mongoose"
import type { Session } from "next-auth"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { AWARDS_INTRO_KEY, AWARDS_INTRO_MAX, normalizeAward, parseEntries, validateAward, type AwardErrors, type AwardInput } from "@/lib/awards"
import { AwardModel, type AwardDocument } from "@/lib/models/award"
import { SiteTextModel } from "@/lib/models/site-text"
import { actorFromSession, logAdminAudit } from "@/lib/server/auth/admin-audit"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { revalidateAwards } from "@/lib/server/revalidate-public"

export type AwardActionResult = { ok: true; message: string; id?: string } | { ok: false; message: string; errors?: AwardErrors }

const DENIED = { ok: false as const, message: "Nincs jogosultsága." }
type Ctx = { session: Session; meta: { ip: string | null; userAgent: string | null } }

async function context(): Promise<Ctx | null> {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) return null
  const h = await headers()
  await dbConnect()
  return { session, meta: { ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, userAgent: h.get("user-agent") } }
}

function refresh() {
  revalidatePath(`${ADMIN_HOME_PATH}/dijazottak`)
  revalidateAwards()
}

async function audit(ctx: Ctx, targetName: string, summary: string) {
  await logAdminAudit({ ...actorFromSession(ctx.session), ...ctx.meta, action: "award_update", targetName, summary })
}

/** Creates (id = null) or updates an award type with its recipients. */
export async function saveAward(id: string | null, raw: Partial<Record<keyof AwardInput, unknown>>): Promise<AwardActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const input = normalizeAward(raw)
  const errors = validateAward(input)
  if (Object.keys(errors).length > 0) return { ok: false, message: "Néhány mező hibás.", errors }
  const { entries } = parseEntries(input.entriesText)
  const actorEmail = ctx.session.user.email ?? null
  let awardId: string
  if (id) {
    if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Érvénytelen azonosító." }
    const res = await AwardModel.updateOne({ _id: id }, { $set: { name: input.name, description: input.description, entries, updatedByEmail: actorEmail } })
    if (res.matchedCount === 0) return { ok: false, message: "A díj nem található." }
    awardId = id
  } else {
    const last = await AwardModel.findOne().sort({ order: -1 }).lean<AwardDocument | null>()
    const created = await AwardModel.create({ name: input.name, description: input.description, entries, order: (last?.order ?? 0) + 1, updatedByEmail: actorEmail })
    awardId = created._id.toString()
  }
  await audit(ctx, input.name, `${id ? "Díj szerkesztve" : "Új díj"}: „${input.name}” (${entries.length} év, ${entries.reduce((n, e) => n + e.names.length, 0)} díjazott)`)
  refresh()
  return { ok: true, message: id ? "Díj mentve." : "Díj létrehozva.", id: awardId }
}

export async function setAwardHidden(id: string, hidden: boolean): Promise<AwardActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Érvénytelen azonosító." }
  const award = await AwardModel.findByIdAndUpdate(id, { $set: { hidden, updatedByEmail: ctx.session.user.email ?? null } }).lean<AwardDocument | null>()
  if (!award) return { ok: false, message: "A díj nem található." }
  await audit(ctx, award.name, `Díj ${hidden ? "elrejtve" : "megjelenítve"}: „${award.name}”`)
  refresh()
  return { ok: true, message: hidden ? "A díj nem jelenik meg az oldalon." : "A díj megjelenik az oldalon." }
}

export async function moveAward(id: string, direction: "fel" | "le"): Promise<AwardActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const all = await AwardModel.find().sort({ order: 1, name: 1 }).lean<AwardDocument[]>()
  const index = all.findIndex((a) => a._id.toString() === id)
  const swap = direction === "fel" ? index - 1 : index + 1
  if (index < 0 || swap < 0 || swap >= all.length) return { ok: true, message: "Nincs változás." }
  const reordered = [...all]
  ;[reordered[index], reordered[swap]] = [reordered[swap], reordered[index]]
  await Promise.all(reordered.map((a, i) => AwardModel.updateOne({ _id: a._id }, { $set: { order: i + 1 } })))
  refresh()
  return { ok: true, message: "Sorrend mentve." }
}

export async function deleteAward(id: string): Promise<AwardActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Érvénytelen azonosító." }
  const award = await AwardModel.findById(id).lean<AwardDocument | null>()
  if (!award) return { ok: false, message: "A díj nem található." }
  if ((award.entries ?? []).some((e) => (e.names ?? []).length > 0)) return { ok: false, message: "Díjazottakkal rendelkező díj nem törölhető; előbb törölje a bejegyzéseket, vagy rejtse el a díjat." }
  await AwardModel.deleteOne({ _id: award._id })
  await audit(ctx, award.name, `Díj törölve: „${award.name}”`)
  refresh()
  return { ok: true, message: "Díj törölve." }
}

export async function saveAwardsIntro(raw: string): Promise<AwardActionResult> {
  const ctx = await context()
  if (!ctx) return DENIED
  const text = raw.replace(/\r\n?/g, "\n").trim().slice(0, AWARDS_INTRO_MAX)
  await SiteTextModel.updateOne({ key: AWARDS_INTRO_KEY }, { $set: { text, updatedByEmail: ctx.session.user.email ?? null } }, { upsert: true })
  await audit(ctx, "Díjazottak bevezető", "A Díjazottak oldal bevezetője szerkesztve")
  refresh()
  return { ok: true, message: "Bevezető mentve." }
}
