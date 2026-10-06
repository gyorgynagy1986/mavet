import { del, put } from "@vercel/blob"
import sharp from "sharp"

/** Profile photo rules (specification 9.2 / 13.4): JPEG, PNG or WebP, max 10 MB, server-side resize. */
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024
export const PHOTO_SIZE = 512
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"])

/**
 * Blob credentials: either a classic read-write token, or the OIDC pairing
 * (`BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`, which Vercel injects at runtime and
 * `vercel env pull` writes locally). The SDK picks them up by itself.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && (process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL)))
}

export type PhotoResult = { ok: true; url: string; pathname: string } | { ok: false; message: string }

/** Validates, squares and resizes the image, then stores it as WebP in Vercel Blob. */
export async function storeProfilePhoto(userId: string, file: File): Promise<PhotoResult> {
  if (!isBlobConfigured()) return { ok: false, message: "A képtárolás nincs beállítva (Blob store nincs a projekthez kapcsolva)." }
  if (!ALLOWED.has(file.type)) return { ok: false, message: "Csak JPEG, PNG vagy WebP kép tölthető fel." }
  if (file.size > PHOTO_MAX_BYTES) return { ok: false, message: "A kép legfeljebb 10 MB lehet." }

  let output: Buffer
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer()
  } catch {
    return { ok: false, message: "A fájl nem olvasható képként." }
  }

  const pathname = `profil/${userId}/${Date.now()}.webp`
  try {
    // Random suffix: the URL must not be derivable from the user id (public store).
    const blob = await put(pathname, output, { access: "public", contentType: "image/webp", addRandomSuffix: true })
    return { ok: true, url: blob.url, pathname: blob.pathname }
  } catch (error) {
    console.error("[profile-photo] upload failed:", error)
    return { ok: false, message: "A kép mentése nem sikerült a tárolóban. Próbálja újra később." }
  }
}

export async function deleteProfilePhoto(url: string | null | undefined): Promise<void> {
  if (!url || !isBlobConfigured()) return
  try {
    await del(url)
  } catch (error) {
    console.error("[profile-photo] delete failed:", error)
  }
}
