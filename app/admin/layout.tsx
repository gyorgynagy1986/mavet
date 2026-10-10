import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MavetLogo } from "@/components/brand/mavet-logo"
import { Toaster } from "@/components/ui/sonner"
import { ADMIN_HOME_PATH, LOGIN_PATH } from "@/lib/auth-paths"
import { visibleNav } from "@/lib/admin-nav"
import { getServerAuthSession, isAdmin, isSuperAdmin } from "@/lib/server/auth/session"
import { AdminNav } from "./admin-nav"
import { AdminUserMenu } from "./admin-user-menu"

export const metadata: Metadata = {
  title: { default: "Adminisztráció", template: "%s | MAVET adminisztráció" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

/**
 * Admin frame. Server component (D-005): the session is checked here with a
 * fresh lookup, on top of the proxy's coarse token check. The pages inside add
 * their own SUPERADMIN checks where needed.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession()
  if (!session) redirect(`${LOGIN_PATH}?callbackUrl=${encodeURIComponent(ADMIN_HOME_PATH)}`)
  if (!isAdmin(session)) redirect("/")

  const superAdmin = isSuperAdmin(session)
  const items = visibleNav(superAdmin)

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-mavet-surface">
      <a
        href="#admin-tartalom"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Ugrás a tartalomra
      </a>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link href={ADMIN_HOME_PATH} className="flex items-center gap-3 rounded-md text-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Adminisztráció kezdőlap">
              <MavetLogo />
              <span className="hidden rounded-md border border-mavet-gold/40 bg-mavet-gold/15 px-2 py-0.5 text-[0.7rem] font-semibold tracking-[0.12em] text-mavet-navy uppercase sm:inline-block">
                Admin
              </span>
            </Link>
            <AdminNav items={items} className="hidden md:flex" />
          </div>
          <AdminUserMenu name={session.user.name} email={session.user.email} role={session.user.role} />
        </div>
        <AdminNav items={items} className="flex border-t border-border/70 px-4 py-2 md:hidden" />
      </header>
      <main id="admin-tartalom" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
      <footer className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
        MAVET adminisztráció · minden művelet naplózásra kerül
      </footer>
      <Toaster />
    </div>
  )
}
