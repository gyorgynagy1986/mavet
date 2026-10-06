"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MEMBER_ACCOUNT_PATH } from "@/lib/auth-paths"
import { cn } from "@/lib/utils"

const items = [
  { href: MEMBER_ACCOUNT_PATH, label: "Áttekintés", exact: true },
  { href: `${MEMBER_ACCOUNT_PATH}/profil`, label: "Profil és megjelenés" },
  { href: `${MEMBER_ACCOUNT_PATH}/torles`, label: "Fiók törlése" },
]

export function AccountNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-wrap gap-1 border-b border-border" aria-label="Fiók menü">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors", active ? "border-mavet-gold text-mavet-navy" : "border-transparent text-muted-foreground hover:text-mavet-navy")}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
