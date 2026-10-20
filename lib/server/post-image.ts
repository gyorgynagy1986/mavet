import { del, list, put } from "@vercel/blob"
import sharp from "sharp"
import { isBlobConfigured, type PhotoResult } from "@/lib/server/profile-photo"
import { PHOTO_MESSAGES, photoFileError } from "@/lib/validation/photo"

/** Stored width of the article image; the height follows the picture. */
export const POST_IMAGE_WIDTH = 1600
/** The cover is always stored at this size (16:9), cropped from the centre. */
export const POST_COVER_WIDTH = 1600
export const POST_COVER_HEIGHT = 900

/**
 * One folder per post. The article image sits at the folder root (as before), the cover in a `borito/`
 * subfolder, so each can be replaced or removed without touching the other.
 */
const folder = (postId: string) => `aktualitasok/${postId}/`
const coverFolder = (postId: string) => `${folder(postId)}borito/`

type Keep = { url?: string | null; pathname?: string | null } | null | undefined

async function upload(pathname: string, output: Buffer): Promise<PhotoResult> {
  try {
    // Copied into a plain Blob: fetch refuses a Buffer that sits on shared memory.
    const body = new Blob([Uint8Array.from(output)], { type: "image/webp" })
    const blob = await put(pathname, body, { access: "public", contentType: "image/webp", addRandomSuffix: true })
    return { ok: true, url: blob.url, pathname: blob.pathname }
  } catch (error) {
    console.error("[post-image] upload failed:", error)
    return { ok: false, message: PHOTO_MESSAGES.storage }
  }
}

/** Article image: scaled down to POST_IMAGE_WIDTH at most, original aspect, WebP without metadata. */
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
  return upload(`${folder(postId)}${Date.now()}.webp`, output)
}

/** Cover image: cropped to 16:9 (POST_COVER_WIDTH × POST_COVER_HEIGHT, attention-based crop), WebP. */
export async function storePostCover(postId: string, file: File): Promise<PhotoResult> {
  if (!isBlobConfigured()) return { ok: false, message: PHOTO_MESSAGES.notConfigured }
  const invalid = photoFileError(file)
  if (invalid) return { ok: false, message: invalid }
  let output: Buffer
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: POST_COVER_WIDTH, height: POST_COVER_HEIGHT, fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 80 })
      .toBuffer()
  } catch {
    return { ok: false, message: PHOTO_MESSAGES.unreadable }
  }
  return upload(`${coverFolder(postId)}${Date.now()}.webp`, output)
}

async function purge(prefix: string, keep: Keep, exclude?: (pathname: string) => boolean): Promise<boolean> {
  if (!isBlobConfigured()) return false
  try {
    const urls: string[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix, cursor, limit: 1000 })
      for (const blob of page.blobs) {
        if (exclude?.(blob.pathname)) continue
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

/** Deletes the article image(s) of a post (optionally keeping one); the cover is left alone. */
export function purgePostImages(postId: string, keep?: Keep): Promise<boolean> {
  const covers = coverFolder(postId)
  return purge(folder(postId), keep, (pathname) => pathname.startsWith(covers))
}

/** Deletes the cover(s) of a post (optionally keeping one); the article image is left alone. */
export function purgePostCovers(postId: string, keep?: Keep): Promise<boolean> {
  return purge(coverFolder(postId), keep)
}

/** Deletes everything stored for the post (on post deletion). */
export function purgeAllPostImages(postId: string): Promise<boolean> {
  return purge(folder(postId), null)
}
