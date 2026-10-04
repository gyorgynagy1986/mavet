import { ADMIN_HOME_PATH } from "@/lib/auth-paths"

/**
 * Single source of the admin navigation. Items marked `superadminOnly` are
 * hidden from ADMIN users and their pages redirect them to the admin home.
 * Keep this file React-free so it can be imported anywhere.
 */
export interface AdminNavItem {
  key: string
  href: string
  label: string
  /** lucide icon name, resolved by the nav component. */
  icon: "LayoutDashboard" | "ShieldCheck" | "ScrollText" | "Users" | "Mail" | "IdCard"
  superadminOnly?: boolean
  /** Only the exact path is active (for the home item). */
  exact?: boolean
}

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { key: "home", href: ADMIN_HOME_PATH, label: "Kezdőlap", icon: "LayoutDashboard", exact: true },
  { key: "applications", href: `${ADMIN_HOME_PATH}/jelentkezesek`, label: "Jelentkezések", icon: "Users" },
  { key: "members", href: `${ADMIN_HOME_PATH}/tagok`, label: "Tagok", icon: "IdCard" },
  { key: "emails", href: `${ADMIN_HOME_PATH}/emailek`, label: "E-mailek", icon: "Mail" },
  { key: "admins", href: `${ADMIN_HOME_PATH}/adminok`, label: "Adminok", icon: "ShieldCheck", superadminOnly: true },
  { key: "logs", href: `${ADMIN_HOME_PATH}/naplo`, label: "Naplók", icon: "ScrollText", superadminOnly: true },
]

export function visibleNav(isSuperAdmin: boolean): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !item.superadminOnly || isSuperAdmin)
}
