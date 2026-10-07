import { put } from "@vercel/blob"
import sharp from "sharp"
import { isBlobConfigured, purgeBlobFolder, type PhotoResult } from "@/lib/server/profile-photo"
import { PHOTO_MESSAGES, photoFileError } from "@/lib/validation/photo"

/** Stored width of a post image; the height follows the picture. */
export const POST_IMAGE_WIDTH = 1600

const folder = (postId: string) => `aktualitasok/${postId}/`

/** Every upload is scaled down to POST_IMAGE_WIDTH at most and stored as WebP, without metadata. */
export async function storePostImage(postId: string, file: File): Promise<PhotoResult> {
  if (!isBlobConfigured()) return { ok: false, message: PHOTO_MESSAGES.notConfigured }
  const invalid = photoFileError(file)
  if (invalid) return { ok: false, message: invalid }

  let output: Buffer
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer())).rotate().resize({ width: POST_IMAGE_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
  } catch {
    return { ok: false, message: PHOTO_MESSAGES.unreadable }
  }

  try {
    // Copied into a plain Blob: fetch refuses a Buffer that sits on shared memory.
    const body = new Blob([Uint8Array.from(output)], { type: "image/webp" })
    const blob = await put(`${folder(postId)}${Date.now()}.webp`, body, { access: "public", contentType: "image/webp", addRandomSuffix: true })
    return { ok: true, url: blob.url, pathname: blob.pathname }
  } catch (error) {
    console.error("[post-image] upload failed:", error)
    return { ok: false, message: PHOTO_MESSAGES.storage }
  }
}

export function purgePostImages(postId: string, keep?: { url?: string | null; pathname?: string | null } | null): Promise<boolean> {
  return purgeBlobFolder(folder(postId), keep)
}
