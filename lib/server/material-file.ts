import { del, list } from "@vercel/blob"
import { isBlobConfigured } from "@/lib/server/profile-photo"

/** One folder per material in the Blob store; a replaced file is deleted, so the folder holds at most one. */
export const materialFolder = (materialId: string) => `szakmai-anyagok/${materialId}/`

/** Deletes every file of the material except `keep` (the one just uploaded). */
export async function purgeMaterialFiles(materialId: string, keep?: { url?: string | null; pathname?: string | null } | null): Promise<boolean> {
  if (!isBlobConfigured()) return false
  try {
    const urls: string[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix: materialFolder(materialId), cursor, limit: 1000 })
      for (const blob of page.blobs) {
        const kept = Boolean(keep && ((keep.url && blob.url === keep.url) || (keep.pathname && blob.pathname === keep.pathname)))
        if (!kept) urls.push(blob.url)
      }
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    if (urls.length > 0) await del(urls)
    return true
  } catch (error) {
    console.error("[material-file] delete failed:", materialId, error)
    return false
  }
}
