"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db-connect"
import { MEMBER_ACCOUNT_PATH } from "@/lib/auth-paths"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { getServerAuthSession } from "@/lib/server/auth/session"
import { isBlobConfigured, photoDebug, purgeProfilePhotos, storeProfilePhoto } from "@/lib/server/profile-photo"
import { rateLimit } from "@/lib/server/rate-limit"
import { revalidatePublicPages } from "@/lib/server/revalidate-public"
import { parseIsoDate } from "@/lib/validation/membership-application"
import { normalizePhone } from "@/lib/validation/phone"
import { PHOTO_MESSAGES, photoFileError } from "@/lib/validation/photo"
import { normalizeProfile, parseInterests, validateProfile, type ProfileErrors, type ProfileInput } from "@/lib/validation/profile"

export type ProfileActionResult = { ok: true; message: string } | { ok: false; message: string; errors?: ProfileErrors }

type VisibilityInput = { enabled: boolean; photo: boolean; specialty: boolean; workplace: boolean; bio: boolean; interests: boolean; workgroups: boolean }

async function currentMember(): Promise<UserDocument | null> {
  const session = await getServerAuthSession()
  if (!session || session.user.role !== "USER") return null
  await dbConnect()
  return UserModel.findById(session.user.id).lean<UserDocument | null>()
}

function refresh() {
  revalidatePath(`${MEMBER_ACCOUNT_PATH}/profil`)
  revalidatePath(MEMBER_ACCOUNT_PATH)
  revalidatePublicPages()
}

/** Personal and professional data (9.2). Category, office and membership data are never touched here. */
export async function updateProfile(raw: Partial<Record<keyof ProfileInput, unknown>>): Promise<ProfileActionResult> {
  const user = await currentMember()
  if (!user) return { ok: false, message: "Bejelentkezés szükséges." }
  const limit = await rateLimit("profile-update", user._id.toString(), 30, "10 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok mentés rövid idő alatt." }

  const input = normalizeProfile(raw)
  const errors = validateProfile(input)
  if (Object.keys(errors).length > 0) return { ok: false, message: "Néhány mező hibás.", errors }

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        title: input.title,
        lastName: input.lastName,
        firstName: input.firstName,
        name: `${input.lastName} ${input.firstName}`.trim(),
        birthDate: input.birthDate ? (parseIsoDate(input.birthDate) ?? undefined) : undefined,
        birthPlace: input.birthPlace,
        "address.postalCode": input.postalCode,
        "address.city": input.city,
        "address.street": input.street,
        "address.country": input.country,
        phone: normalizePhone(input.phone) ?? "",
        specialty: input.specialty,
        workplace: input.workplace,
        bio: input.bio.slice(0, 500),
        interests: parseInterests(input.interests),
        workgroups: input.workgroups,
      },
    },
  )
  refresh()
  return { ok: true, message: "Profil mentve." }
}

/** Visibility master switch and per-field flags (9.3); effective immediately, no approval. */
export async function updateVisibility(input: VisibilityInput): Promise<ProfileActionResult> {
  const user = await currentMember()
  if (!user) return { ok: false, message: "Bejelentkezés szükséges." }
  const limit = await rateLimit("profile-visibility", user._id.toString(), 60, "10 m")
  if (!limit.allowed) return { ok: false, message: "Túl sok módosítás rövid idő alatt; próbálja újra kicsit később." }
  const flags = {
    enabled: input.enabled === true,
    photo: input.photo !== false,
    specialty: input.specialty !== false,
    workplace: input.workplace !== false,
    bio: input.bio !== false,
    interests: input.interests !== false,
    workgroups: input.workgroups !== false,
  }
  const result = await UserModel.updateOne({ _id: user._id }, { $set: { visibility: flags } })
  if (result.matchedCount !== 1) return { ok: false, message: "A beállítás mentése nem sikerült." }
  refresh()
  return { ok: true, message: flags.enabled ? "Megjelenés engedélyezve." : "Megjelenés kikapcsolva: a neve sehol nem jelenik meg más tagoknak." }
}

/** Photo upload (FormData with `photo`); replaces the previous one, which is deleted from the store. */
export async function uploadProfilePhoto(formData: FormData): Promise<ProfileActionResult> {
  const user = await currentMember()
  if (!user) return { ok: false, message: PHOTO_MESSAGES.auth }
  const file = formData.get("photo")
  photoDebug("action:received", { userId: user._id.toString(), isFile: file instanceof File, type: file instanceof File ? file.type : typeof file, size: file instanceof File ? file.size : null, previousUrl: user.photo?.url ?? null })
  const invalid = photoFileError(file instanceof File ? file : null)
  if (invalid || !(file instanceof File)) return { ok: false, message: invalid ?? PHOTO_MESSAGES.missing }
  const limit = await rateLimit("profile-photo", user._id.toString(), 10, "1 h")
  if (!limit.allowed) return { ok: false, message: PHOTO_MESSAGES.rateLimit }

  const userId = user._id.toString()
  const stored = await storeProfilePhoto(userId, file)
  if (!stored.ok) {
    photoDebug("action:store-failed", { message: stored.message })
    return stored
  }
  const write = await UserModel.updateOne({ _id: user._id }, { $set: { photo: { url: stored.url, pathname: stored.pathname, updatedAt: new Date() } } })
  const saved = await UserModel.findById(user._id).select("photo").lean<Pick<UserDocument, "photo"> | null>()
  photoDebug("action:db-updated", { matched: write.matchedCount, modified: write.modifiedCount, photoInDb: saved?.photo ?? null })
  // Old photos are removed only after the new one is saved; a failure here is logged and retried on the next upload or removal.
  await purgeProfilePhotos(userId, { url: stored.url, pathname: stored.pathname })
  refresh()
  return { ok: true, message: PHOTO_MESSAGES.saved }
}

/** Removes the photo from the Blob store first; the profile is only cleared once the file is really gone. */
export async function removeProfilePhoto(): Promise<ProfileActionResult> {
  const user = await currentMember()
  if (!user) return { ok: false, message: PHOTO_MESSAGES.auth }
  if (!isBlobConfigured()) return { ok: false, message: PHOTO_MESSAGES.notConfigured }
  const purged = await purgeProfilePhotos(user._id.toString())
  if (!purged) return { ok: false, message: PHOTO_MESSAGES.deleteFailed }
  await UserModel.updateOne({ _id: user._id }, { $set: { photo: { url: null, pathname: null, updatedAt: null } } })
  refresh()
  return { ok: true, message: PHOTO_MESSAGES.removed }
}
