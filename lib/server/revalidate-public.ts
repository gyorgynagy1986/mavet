import { revalidatePath } from "next/cache"
import { ABOUT_PATH } from "@/lib/auth-paths"

/**
 * "A Társaságról" is served as a static page (CDN) and rebuilt only when something that can change the
 * board list happens: a member's visibility, profile, photo, office, membership status or account.
 * Every server action that touches one of those calls this, so the switch of 9.3 stays immediate.
 * A time-based revalidation on the page itself is the safety net if a path is missed.
 */
export function revalidatePublicPages(): void {
  revalidatePath(ABOUT_PATH)
}
