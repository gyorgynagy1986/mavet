/**
 * Shrinks an image in the browser and converts it to WebP (JPEG where the browser cannot encode WebP), so
 * the upload stays small. The server resizes and re-encodes it again in every case. On any failure the
 * original file is returned and the server deals with it.
 */
export async function downscaleImage(file: File, maxEdge: number): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9))
    let blob = await encode("image/webp")
    if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg")
    if (!blob) return file
    return new File([blob], blob.type === "image/webp" ? "kep.webp" : "kep.jpg", { type: blob.type })
  } catch {
    return file
  }
}

/** Stays under the 4.5 MB request limit of Vercel functions. */
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024
