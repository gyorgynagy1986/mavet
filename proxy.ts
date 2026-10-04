import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { LOGIN_PATH } from "@/lib/auth-paths"

/**
 * Coarse gate for the admin area. Unauthenticated requests go to the hidden
 * login page; authenticated non-admins are sent to the public home page. The
 * fine-grained checks (SUPERADMIN-only pages, every API call) run server-side
 * with a fresh session, because the token's role may be up to a minute old.
 */
export default withAuth(
  function proxy(req) {
    const role = req.nextauth.token?.role
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-pathname", req.nextUrl.pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: LOGIN_PATH },
  },
)

// Must be static strings (Next parses this at build time); keep in sync with ADMIN_HOME_PATH.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
