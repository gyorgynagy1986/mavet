/** Dependency-free constants shared by the proxy, the login page and the admin area. */

/** Hidden login page; nothing on the public site links to it. */
export const LOGIN_PATH = "/mavet-login"
export const ADMIN_HOME_PATH = "/admin"

/** Member login and account pages (public frame). */
export const MEMBER_LOGIN_PATH = "/belepes"
export const MEMBER_ACCOUNT_PATH = "/fiok"
/** Member directory (9.4): list for active members; a board member's profile under it may be public. */
export const MEMBER_DIRECTORY_PATH = "/tagok"
/** Public profile of a board or committee member: `/a-tarsasagrol/vezetoseg/<slug>`. */
export const ABOUT_PATH = "/a-tarsasagrol"
export const BOARD_PROFILE_PATH = "/a-tarsasagrol/vezetoseg"
export const BOARD_ANCHOR = "vezetoseg"

/** Query parameter carrying the page to return to after the member login. */
export const RETURN_PARAM = "vissza"

/**
 * Where to go after a successful member login. Only our own member pages are accepted, so the
 * parameter cannot be used to send someone to another site.
 */
export function safeReturnPath(value: string | string[] | null | undefined): string {
  const path = Array.isArray(value) ? value[0] : value
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.length > 300) return MEMBER_ACCOUNT_PATH
  const allowed = [MEMBER_ACCOUNT_PATH, MEMBER_DIRECTORY_PATH].some((base) => path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`))
  return allowed ? path : MEMBER_ACCOUNT_PATH
}

export function loginPathWithReturn(path: string): string {
  return `${MEMBER_LOGIN_PATH}?${RETURN_PARAM}=${encodeURIComponent(path)}`
}
