import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import { UserModel, type UserRole } from "@/lib/models/user"
import { requireSuperAdmin } from "@/lib/server/auth/session"
import { actorFromSession, logAdminAudit, requestMeta } from "@/lib/server/auth/admin-audit"
import { adminUserToItem, listAdminUsers, type AdminUserLean } from "@/lib/server/admin-users"
import { isPlausibleEmail, normalizeEmail } from "@/lib/server/auth/verification"

export const runtime = "nodejs"

/**
 * SUPERADMIN-only admin management.
 *
 * Only the ADMIN role can be granted here. SUPERADMIN is set by the seed script
 * or at database level, so a compromised superadmin account cannot mint more.
 */
const CREATABLE_ROLE: UserRole = "ADMIN"

/** GET /api/admin/users → admin-level users. */
export async function GET() {
  const guard = await requireSuperAdmin()
  if (guard.error) return guard.error
  try {
    return NextResponse.json({ data: await listAdminUsers() })
  } catch (error) {
    console.error("[admin/users GET]", error)
    return NextResponse.json({ error: "Nem sikerült betölteni a listát." }, { status: 500 })
  }
}

/**
 * POST /api/admin/users  body: { email, name }
 * New address → new ADMIN user. Existing USER → promoted (and renamed if given).
 * Existing admin → 409. The new admin needs no password: login is by e-mail code.
 */
export async function POST(request: Request) {
  const guard = await requireSuperAdmin()
  if (guard.error) return guard.error
  const { session } = guard

  const body = (await request.json().catch(() => null)) as { email?: unknown; name?: unknown } | null
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  if (!email || !isPlausibleEmail(email)) return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 })
  if (name.length < 2 || name.length > 120) return NextResponse.json({ error: "A név megadása kötelező (2–120 karakter)." }, { status: 400 })

  try {
    await dbConnect()
    const actor = actorFromSession(session)
    const meta = requestMeta(request)

    const existing = await UserModel.findOne({ email })
      .select({ name: 1, email: 1, role: 1, lastLoginAt: 1, createdAt: 1 })
      .lean<AdminUserLean | null>()

    if (existing && existing.role && existing.role !== "USER") {
      return NextResponse.json({ error: `Ez a felhasználó már ${existing.role} szerepű.` }, { status: 409 })
    }

    if (existing) {
      const updated = await UserModel.findByIdAndUpdate(existing._id, { $set: { role: CREATABLE_ROLE, name } }, { new: true })
        .select({ name: 1, email: 1, role: 1, lastLoginAt: 1, createdAt: 1 })
        .lean<AdminUserLean | null>()
      if (!updated) return NextResponse.json({ error: "Felhasználó nem található." }, { status: 404 })

      const changes: { field: string; from: string | null; to: string | null }[] = [{ field: "role", from: existing.role ?? null, to: CREATABLE_ROLE }]
      if ((existing.name ?? null) !== name) changes.push({ field: "name", from: existing.name ?? null, to: name })
      await logAdminAudit({
        ...actor,
        ...meta,
        action: "admin_role_change",
        targetUserId: updated._id,
        targetEmail: email,
        targetName: name,
        changes,
        summary: `Meglévő felhasználó előléptetve ${CREATABLE_ROLE} szerepre.`,
      })
      return NextResponse.json({ data: adminUserToItem(updated), promoted: true }, { status: 200 })
    }

    const created = await UserModel.create({ email, name, role: CREATABLE_ROLE })
    await logAdminAudit({
      ...actor,
      ...meta,
      action: "admin_create",
      targetUserId: created._id,
      targetEmail: email,
      targetName: name,
      changes: [{ field: "role", from: null, to: CREATABLE_ROLE }],
      summary: `Új adminisztrátor létrehozva (${CREATABLE_ROLE}).`,
    })
    return NextResponse.json(
      { data: adminUserToItem({ _id: created._id, name, email, role: CREATABLE_ROLE, createdAt: new Date() }), promoted: false },
      { status: 201 },
    )
  } catch (error) {
    if (error && typeof error === "object" && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "Ezzel az e-mail-címmel már létezik felhasználó." }, { status: 409 })
    }
    console.error("[admin/users POST]", error)
    return NextResponse.json({ error: "Váratlan hiba történt a mentés során." }, { status: 500 })
  }
}
