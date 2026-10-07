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
    // sharp's Buffer can sit on shared memory, which fetch refuses as a request body ("SharedArrayBuffer is not allowed"),
    // so the bytes are copied into a plain Blob before the upload.
    const body = new Blob([Uint8Array.from(output)], { type: "image/webp" })
    const blob = await put(`${folder(userId)}${Date.now()}.webp`, body, { access: "public", contentType: "image/webp", addRandomSuffix: true })
    return { ok: true, url: blob.url, pathname: blob.pathname }
  } catch (error) {
    console.error("[profile-photo] upload failed:", error)
    return { ok: false, message: PHOTO_MESSAGES.storage }
  }
}

/**
 * Deletes every file under a folder of the Blob store, optionally keeping one. Returns false if the store
 * could not be reached or the delete failed.
 */
export async function purgeBlobFolder(prefix: string, keep?: { url?: string | null; pathname?: string | null } | null): Promise<boolean> {
  if (!isBlobConfigured()) return false
  try {
    const urls: string[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix, cursor, limit: 1000 })
      for (const blob of page.blobs) {
        // Matched on pathname as well, so a freshly saved file is never deleted if the URL form differs.
        const kept = Boolean(keep && ((keep.url && blob.url === keep.url) || (keep.pathname && blob.pathname === keep.pathname)))
        if (!kept) urls.push(blob.url)
      }
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    if (urls.length > 0) await del(urls)
    return true
  } catch (error) {
    console.error("[blob] delete failed:", prefix, error)
    return false
  }
}

/** Deletes every stored photo of the user (optionally keeping one), including leftovers of earlier uploads. */
export function purgeProfilePhotos(userId: string, keep?: { url?: string | null; pathname?: string | null } | null): Promise<boolean> {
  return purgeBlobFolder(folder(userId), keep)
}
