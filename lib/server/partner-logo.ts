import { put } from "@vercel/blob"
import sharp from "sharp"
import { LOGO_BOX, LOGO_MESSAGES, logoFileError } from "@/lib/partners"
import { isBlobConfigured, purgeBlobFolder, type PhotoResult } from "@/lib/server/profile-photo"

const folder = (partnerId: string) => `partnerek/${partnerId}/`

/**
 * Every logo is normalised so the tiles render alike: fitted into LOGO_BOX without cropping, on a
 * transparent background, saved as WebP with alpha. SVG is rasterised here (sharp), so no SVG markup is
 * ever served from our store.
 */
export async function storePartnerLogo(partnerId: string, file: File): Promise<PhotoResult> {
  if (!isBlobConfigured()) return { ok: false, message: LOGO_MESSAGES.notConfigured }
  const invalid = logoFileError(file)
  if (invalid) return { ok: false, message: invalid }
  let output: Buffer
  try {
    const input = Buffer.from(await file.arrayBuffer())
    output = await sharp(input, { density: 300 })
      .rotate()
      .trim({ threshold: 2 })
      .resize({ width: LOGO_BOX.width, height: LOGO_BOX.height, fit: "contain", withoutEnlargement: false, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90, alphaQuality: 100 })
      .toBuffer()
  } catch {
    return { ok: false, message: LOGO_MESSAGES.unreadable }
  }
  try {
    const body = new Blob([Uint8Array.from(output)], { type: "image/webp" })
    const blob = await put(`${folder(partnerId)}${Date.now()}.webp`, body, { access: "public", contentType: "image/webp", addRandomSuffix: true })
    return { ok: true, url: blob.url, pathname: blob.pathname }
  } catch (error) {
    console.error("[partner-logo] upload failed:", error)
    return { ok: false, message: LOGO_MESSAGES.storage }
  }
}

export function purgePartnerLogos(partnerId: string, keep?: { url?: string | null; pathname?: string | null } | null): Promise<boolean> {
  return purgeBlobFolder(folder(partnerId), keep)
}
