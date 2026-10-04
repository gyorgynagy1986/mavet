import { createHash, randomBytes } from "node:crypto"
import type { Types } from "mongoose"
import dbConnect from "@/lib/db-connect"
import { membershipCategories } from "@/lib/data/site"
import {
  CONTINUE_TOKEN_DAYS,
  MembershipApplicationModel,
  type MembershipApplicationCategory,
  type MembershipApplicationDocument,
} from "@/lib/models/membership-application"
import { sendTemplatedMail, type SendTemplatedResult } from "@/lib/server/email/send"

declare global {
  var __application_indexes_ok__: boolean | undefined
}

/**
 * Self-healing index check (once per process): the pre-D-018 schema had a
 * plain unique index on `email`, which rejects every re-application after a
 * rejection or closure. The replacement is the partial unique index on open
 * states only. `npm run migrate:applications` does the same; this guards
 * deployments where the migration was not run.
 */
export async function ensureApplicationIndexes(): Promise<void> {
  if (global.__application_indexes_ok__) return
  try {
    await dbConnect()
    const collection = MembershipApplicationModel.collection
    const indexes = await collection.indexes()
    const stale = indexes.find((i) => i.name === "email_1" && i.unique)
    if (stale) {
      await collection.dropIndex("email_1")
      console.warn("⚠️ [membership-application] stale unique index email_1 dropped (replaced by email_open_unique)")
    }
    if (!indexes.some((i) => i.name === "email_open_unique")) {
      await collection.createIndex(
        { email: 1 },
        { unique: true, name: "email_open_unique", partialFilterExpression: { status: { $in: ["elozetes", "megerositett", "bekuldott"] } } },
      )
    }
    global.__application_indexes_ok__ = true
  } catch (error) {
    console.error("❌ [membership-application] index check failed:", error)
  }
}

export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "")
  return `${base}${path}`
}

export function categoryName(category: MembershipApplicationCategory | string | null | undefined): string {
  return membershipCategories.find((c) => c.id === category)?.name ?? String(category ?? "")
}

export function fullName(app: Pick<MembershipApplicationDocument, "title" | "lastName" | "firstName">): string {
  return [app.title, app.lastName, app.firstName].filter(Boolean).join(" ")
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex")
}

export function continueUrl(rawToken: string): string {
  return siteUrl(`/tagsag/jelentkezes/${rawToken}`)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("hu-HU", { timeZone: "Europe/Budapest", dateStyle: "long" })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("hu-HU", { timeZone: "Europe/Budapest", dateStyle: "long", timeStyle: "short" })
}

/**
 * Issues a fresh continuation token (invalidating the previous one) and stores
 * only its hash. Returns the raw token for the e-mail.
 */
export async function issueContinueToken(applicationId: Types.ObjectId | string): Promise<{ raw: string; expiresAt: Date }> {
  const raw = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + CONTINUE_TOKEN_DAYS * 24 * 60 * 60 * 1000)
  await dbConnect()
  await MembershipApplicationModel.updateOne(
    { _id: applicationId },
    { $set: { continueTokenHash: hashToken(raw), continueTokenExpiresAt: expiresAt } },
  )
  return { raw, expiresAt }
}

/** Finds an application by its raw continuation token; null when unknown or expired. */
export async function findByContinueToken(raw: string): Promise<MembershipApplicationDocument | null> {
  if (!raw || raw.length < 20 || raw.length > 128) return null
  await dbConnect()
  const app = await MembershipApplicationModel.findOne({ continueTokenHash: hashToken(raw) }).lean<MembershipApplicationDocument | null>()
  if (!app) return null
  if (!app.continueTokenExpiresAt || app.continueTokenExpiresAt.getTime() < Date.now()) return null
  return app
}

/** Sends the continuation link (first mail or a reminder) with a freshly issued token. */
export async function sendContinueLink(
  app: Pick<MembershipApplicationDocument, "_id" | "email" | "title" | "lastName" | "firstName" | "category">,
  kind: "folytatas" | "emlekezteto",
  triggeredBy = "system",
): Promise<SendTemplatedResult> {
  const { raw, expiresAt } = await issueContinueToken(app._id)
  return sendTemplatedMail({
    key: kind === "folytatas" ? "jelentkezes_folytatas" : "jelentkezes_emlekezteto",
    to: app.email,
    triggeredBy,
    applicationId: app._id,
    vars: {
      nev: fullName(app),
      keresztnev: app.firstName,
      vezeteknev: app.lastName,
      kategoria: categoryName(app.category),
      link: continueUrl(raw),
      linkLejarat: formatDate(expiresAt),
    },
  })
}
