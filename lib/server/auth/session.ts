import { getServerSession, type Session } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/server/auth/auth-options"
import { isAdminRole, isSuperAdminRole } from "@/lib/models/user"

/** Current session on the server (layouts, pages, route handlers). */
export async function getServerAuthSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error("[auth] session lookup failed:", error)
    return null
  }
}

export function isAdmin(session: Session | null): boolean {
  return isAdminRole(session?.user?.role)
}

export function isSuperAdmin(session: Session | null): boolean {
  return isSuperAdminRole(session?.user?.role)
}

type Guard = { session: Session; error?: undefined } | { session: null; error: NextResponse }

/**
 * Route-handler guard: 401 without a session, 403 without an admin role.
 * Every protected endpoint must call this (specification 12.2: hiding a button
 * is not access control).
 */
export async function requireAdmin(): Promise<Guard> {
  const session = await getServerAuthSession()
  if (!session) return { session: null, error: NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 }) }
  if (!isAdmin(session)) return { session: null, error: NextResponse.json({ error: "Nincs adminisztrátori jogosultsága." }, { status: 403 }) }
  return { session }
}

export async function requireSuperAdmin(): Promise<Guard> {
  const session = await getServerAuthSession()
  if (!session) return { session: null, error: NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 }) }
  if (!isSuperAdmin(session)) return { session: null, error: NextResponse.json({ error: "Csak SUPERADMIN jogosultsággal érhető el." }, { status: 403 }) }
  return { session }
}
