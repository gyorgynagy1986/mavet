import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/db-connect"
import { UserModel, type UserRole } from "@/lib/models/user"
import { requireSuperAdmin } from "@/lib/server/auth/session"
import { actorFromSession, logAdminAudit, requestMeta } from "@/lib/server/auth/admin-audit"
import { adminUserToItem, type AdminUserLean } from "@/lib/server/admin-users"

export const runtime = "nodejs"

/**
 * Roles settable from the UI. "Revoking" is a demotion to USER, not a delete:
 * it is reversible, the audit log's actor references stay meaningful, and the
 * same account can become a member later.
 */
const ASSIGNABLE_ROLES = ["ADMIN", "USER"] as const satisfies readonly UserRole[]
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

/** PATCH /api/admin/users/[id]  body: { role: "ADMIN" | "USER" } */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin()
  if (guard.error) return guard.error
  const { session } = guard

  const { id } = await context.params
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Érvénytelen azonosító." }, { status: 400 })

  const body = (await request.json().catch(() => null)) as { role?: unknown } | null
  const role = body?.role
  if (typeof role !== "string" || !ASSIGNABLE_ROLES.includes(role as AssignableRole)) {
    return NextResponse.json({ error: "A szerep csak ADMIN vagy USER lehet." }, { status: 400 })
  }
  if (session.user.id === id) {
    return NextResponse.json({ error: "A saját szerepét nem módosíthatja." }, { status: 400 })
  }

  try {
    await dbConnect()
    const before = await UserModel.findById(id)
      .select({ name: 1, email: 1, role: 1, lastLoginAt: 1, createdAt: 1 })
      .lean<AdminUserLean | null>()
    if (!before) return NextResponse.json({ error: "Felhasználó nem található." }, { status: 404 })
    if (before.role === "SUPERADMIN") {
      return NextResponse.json({ error: "A SUPERADMIN szerep felületről nem módosítható." }, { status: 403 })
    }
    if (before.role === role) return NextResponse.json({ data: adminUserToItem(before) })

    const updated = await UserModel.findByIdAndUpdate(id, { $set: { role } }, { new: true })
      .select({ name: 1, email: 1, role: 1, lastLoginAt: 1, createdAt: 1 })
      .lean<AdminUserLean | null>()
    if (!updated) return NextResponse.json({ error: "Felhasználó nem található." }, { status: 404 })

    await logAdminAudit({
      ...actorFromSession(session),
      ...requestMeta(request),
      action: role === "USER" ? "admin_demote" : "admin_role_change",
      targetUserId: updated._id,
      targetEmail: updated.email ?? before.email ?? null,
      targetName: updated.name ?? before.name ?? null,
      changes: [{ field: "role", from: before.role ?? null, to: role }],
      summary: role === "USER" ? `Adminisztrátori jogosultság visszavonva (${before.role ?? "?"} → USER).` : `Szerep módosítva: ${before.role ?? "?"} → ${role}.`,
    })

    return NextResponse.json({ data: adminUserToItem(updated) })
  } catch (error) {
    console.error("[admin/users PATCH]", error)
    return NextResponse.json({ error: "Váratlan hiba történt a mentés során." }, { status: 500 })
  }
}
