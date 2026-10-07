import { revalidatePath } from "next/cache"
import { ABOUT_PATH } from "@/lib/auth-paths"
import { PAST_EVENTS_PATH, POSTS_PATH } from "@/lib/posts"

/**
 * "A Társaságról" is served as a static page (CDN) and rebuilt only when something that can change the
 * board list happens: a member's visibility, profile, photo, office, membership status or account.
 * Every server action that touches one of those calls this, so the switch of 9.3 stays immediate.
 * A time-based revalidation on the page itself is the safety net if a path is missed.
 */
export function revalidatePublicPages(): void {
  revalidatePath(ABOUT_PATH)
}

/**
 * News and events appear on the home page, the list and their own page, all served statically. Every
 * admin action on a post calls this with the post's slug.
 */
export function revalidatePosts(slug?: string | null): void {
  revalidatePath("/")
  revalidatePath("/fooldalv2")
  revalidatePath(POSTS_PATH)
  revalidatePath(PAST_EVENTS_PATH)
  revalidatePath("/sitemap.xml")
  if (slug) revalidatePath(`${POSTS_PATH}/${slug}`)
}
