import mongoose from "mongoose"
import dbConnect from "@/lib/db-connect"
import { DIRECTORY_PAGE_SIZE, isListed, isPublicProfile, nameSearchPatterns, slugCandidate, slugifyName, visibleProfile, type DirectoryProfile } from "@/lib/directory"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"

/** The database-side form of `isListed`; every query starts from it, so a hidden person cannot leak into any list. */
const LISTED = { role: "USER", "membership.status": "aktiv", "visibility.enabled": true } as const
const NAME_ORDER = { lastName: 1, firstName: 1, _id: 1 } as const
const HUNGARIAN = { locale: "hu", strength: 1 } as const

export type Viewer = { kind: "guest" } | { kind: "admin" } | { kind: "member"; id: string; active: boolean }

/** Who is looking. The membership status is read from the database on every request, not from the session. */
export async function getViewer(): Promise<Viewer> {
  const session = await getServerAuthSession()
  if (!session) return { kind: "guest" }
  if (isAdmin(session)) return { kind: "admin" }
  await dbConnect()
  const user = await UserModel.findById(session.user.id).select({ role: 1, "membership.status": 1 }).lean<Pick<UserDocument, "_id" | "role" | "membership"> | null>()
  if (!user || user.role !== "USER") return { kind: "guest" }
  return { kind: "member", id: user._id.toString(), active: user.membership?.status === "aktiv" }
}

export const canUseDirectory = (viewer: Viewer) => viewer.kind === "member" && viewer.active

export interface DirectoryPage {
  members: DirectoryProfile[]
  total: number
  page: number
  pages: number
}

/** Alphabetical by name (the title is not part of the key), numbered pages, optional name search. */
export async function listDirectory(query: string, page: number): Promise<DirectoryPage> {
  await dbConnect()
  const patterns = nameSearchPatterns(query)
  const filter = patterns.length > 0 ? { ...LISTED, $and: patterns.map((source) => ({ name: { $regex: source } })) } : LISTED
  const total = await UserModel.countDocuments(filter)
  const pages = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE))
  const current = Math.min(page, pages)
  const users = await UserModel.find(filter)
    .collation(HUNGARIAN)
    .sort(NAME_ORDER)
    .skip((current - 1) * DIRECTORY_PAGE_SIZE)
    .limit(DIRECTORY_PAGE_SIZE)
    .lean<UserDocument[]>()
  return { members: users.map(visibleProfile), total, page: current, pages }
}

/**
 * One profile, or null when this viewer may not see it. Null covers "does not exist", "hidden" and
 * "not allowed" alike, so a direct link reveals nothing about a hidden person.
 */
export async function getProfileFor(viewer: Viewer, id: string): Promise<{ profile: DirectoryProfile; isPublic: boolean } | null> {
  if (!mongoose.isValidObjectId(id)) return null
  await dbConnect()
  const user = await UserModel.findById(id).lean<UserDocument | null>()
  if (!user || !isListed(user)) return null
  const isPublic = isPublicProfile(user)
  if (!isPublic && !canUseDirectory(viewer)) return null
  if (isPublic && !user.slug) user.slug = (await ensureProfileSlug(user)) ?? undefined
  return { profile: visibleProfile(user), isPublic }
}

/**
 * Gives a board member their readable address if they have none yet, and returns it. The slug comes from
 * the name without the title; people sharing a name get a number. An existing slug is never changed.
 */
export async function ensureProfileSlug(user: Pick<UserDocument, "_id" | "name" | "lastName" | "firstName" | "slug">): Promise<string | null> {
  if (user.slug) return user.slug
  await dbConnect()
  const base = slugifyName([user.lastName, user.firstName].filter(Boolean).join(" ") || user.name)
  for (let attempt = 1; attempt <= 50; attempt += 1) {
    const candidate = slugCandidate(base, attempt)
    if (await UserModel.exists({ slug: candidate })) continue
    try {
      await UserModel.updateOne({ _id: user._id, slug: { $in: [null, ""] } }, { $set: { slug: candidate } })
    } catch (error) {
      // Somebody else took the candidate in the meantime (unique index): try the next one.
      if ((error as { code?: number }).code === 11000) continue
      throw error
    }
    const saved = await UserModel.findById(user._id).select({ slug: 1 }).lean<Pick<UserDocument, "slug"> | null>()
    if (saved?.slug) return saved.slug
  }
  console.error("[directory] no free slug for user", user._id.toString())
  return null
}

/**
 * Board and committee members for the public "A Társaságról" page (4.1): alphabetical by name,
 * the title is not part of the key, and the order cannot be set by hand.
 */
export async function listBoardMembers(): Promise<DirectoryProfile[]> {
  await dbConnect()
  const users = await UserModel.find({ ...LISTED, boardMember: true }).collation(HUNGARIAN).sort(NAME_ORDER).limit(200).lean<UserDocument[]>()
  // Members designated before slugs existed get one on first display.
  for (const user of users) if (!user.slug) user.slug = (await ensureProfileSlug(user)) ?? undefined
  return users.map(visibleProfile)
}

/** Public board profile by its readable address; null unless the person is a visible, active board member. */
export async function getBoardProfileBySlug(slug: string): Promise<DirectoryProfile | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null
  await dbConnect()
  const user = await UserModel.findOne({ ...LISTED, boardMember: true, slug }).lean<UserDocument | null>()
  return user && isPublicProfile(user) ? visibleProfile(user) : null
}
