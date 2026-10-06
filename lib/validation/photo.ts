/** Profile photo rules shared by the browser and the server, so both report the same errors. */
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024
/** Stored size: square, this many pixels per side, WebP. */
export const PHOTO_SIZE = 512
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const PHOTO_ACCEPT = PHOTO_TYPES.join(",")

export const PHOTO_MESSAGES = {
  missing: "Válasszon ki egy képet.",
  type: "Csak JPEG, PNG vagy WebP kép tölthető fel.",
  size: "A kép legfeljebb 10 MB lehet.",
  unreadable: "A fájl nem olvasható képként.",
  tooLargeToSend: "A kép túl nagy a feltöltéshez. Válasszon kisebb képet.",
  notConfigured: "A képtárolás nincs beállítva ezen a környezeten.",
  storage: "A kép mentése nem sikerült a tárolóban. Próbálja újra később.",
  deleteFailed: "A kép törlése a tárolóból nem sikerült. Próbálja újra később.",
  network: "A feltöltés nem sikerült. Ellenőrizze a kapcsolatot, és próbálja újra.",
  rateLimit: "Túl sok képfeltöltés; próbálja újra később.",
  auth: "Bejelentkezés szükséges.",
  saved: "Profilkép mentve.",
  removed: "Profilkép eltávolítva.",
} as const

/** Returns the error message for a picked file, or null if it may be uploaded. */
export function photoFileError(file: { type: string; size: number } | null | undefined): string | null {
  if (!file || file.size === 0) return PHOTO_MESSAGES.missing
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return PHOTO_MESSAGES.type
  if (file.size > PHOTO_MAX_BYTES) return PHOTO_MESSAGES.size
  return null
}
