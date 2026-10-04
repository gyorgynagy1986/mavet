import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { listAdminUsers } from "@/lib/server/admin-users"
import { getServerAuthSession, isSuperAdmin } from "@/lib/server/auth/session"
import { AdminsEditor } from "./admins-editor"

export const metadata: Metadata = { title: "Adminok" }
export const dynamic = "force-dynamic"

export default async function AdminsPage() {
  const session = await getServerAuthSession()
  // The layout already requires an admin; this page is SUPERADMIN-only.
  if (!isSuperAdmin(session)) redirect(ADMIN_HOME_PATH)

  const admins = await listAdminUsers()

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Főadminisztrátor</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Adminok</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Itt vehet fel új adminisztrátort, és itt vonhatja vissza a jogosultságot. Az új admin e-mailben kapott belépési kóddal lép be a{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">/mavet-login</code> oldalon; jelszó nincs. A SUPERADMIN szerep csak a seed scripttel vagy adatbázis-szinten adható. Minden művelet bekerül a naplóba.
        </p>
      </header>
      <AdminsEditor initialAdmins={admins} currentUserId={session!.user.id} />
    </div>
  )
}
