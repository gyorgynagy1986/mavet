import { del, list, put } from "@vercel/blob"
import sharp from "sharp"
import { PHOTO_MESSAGES, PHOTO_SIZE, photoFileError } from "@/lib/validation/photo"

/** Either a classic read-write token or an OIDC-connected store (BLOB_STORE_ID on Vercel). */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && (process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL)))
}

export type PhotoResult = { ok: true; url: string; pathname: string } | { ok: false; message: string }

const folder = (userId: string) => `profil/${userId}/`

/**
 * Every upload, whatever its size or format, is cropped to a PHOTO_SIZE square and stored as WebP
 * (metadata stripped), so a stored photo is always a few tens of kilobytes.
 */
export async function storeProfilePhoto(userId: string, file: File): Promise<PhotoResult> {
  if (!isBlobConfigured()) return { ok: false, message: PHOTO_MESSAGES.notConfigured }
  const invalid = photoFileError(file)
  if (invalid) return { ok: false, message: invalid }

  let output: Buffer
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "attention" })
      .webp({ quality: 80 })
      .toBuffer()
  } catch {
    return { ok: false, message: PHOTO_MESSAGES.unreadable }
  }

  try {
    const blob = await put(`${folder(userId)}${Date.now()}.webp`, output, { access: "public", contentType: "image/webp", addRandomSuffix: true })
    return { ok: true, url: blob.url, pathname: blob.pathname }
  } catch (error) {
    console.error("[profile-photo] upload failed:", error)
    return { ok: false, message: PHOTO_MESSAGES.storage }
  }
}

/**
 * Deletes every stored photo of the user from the Blob store (optionally keeping one URL), including
 * leftovers of earlier uploads. Returns false if the store could not be reached or the delete failed.
 */
export async function purgeProfilePhotos(userId: string, keepUrl?: string | null): Promise<boolean> {
  if (!isBlobConfigured()) return false
  try {
    const urls: string[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix: folder(userId), cursor, limit: 1000 })
      for (const blob of page.blobs) if (blob.url !== keepUrl) urls.push(blob.url)
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    if (urls.length > 0) await del(urls)
    return true
  } catch (error) {
    console.error("[profile-photo] delete failed:", error)
    return false
  }
}
