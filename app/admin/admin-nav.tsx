"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IdCardIcon, LayoutDashboardIcon, MailIcon, NewspaperIcon, ScrollTextIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import type { AdminNavItem } from "@/lib/admin-nav"
import { cn } from "@/lib/utils"

const ICONS = {
  LayoutDashboard: LayoutDashboardIcon,
  ShieldCheck: ShieldCheckIcon,
  ScrollText: ScrollTextIcon,
  Users: UsersIcon,
  Mail: MailIcon,
  IdCard: IdCardIcon,
  Newspaper: NewspaperIcon,
} as const

export function AdminNav({ items, className }: { items: AdminNavItem[]; className?: string }) {
  const pathname = usePathname()
  return (
    <nav className={cn("items-center gap-1 overflow-x-auto overflow-y-hidden pb-1 md:overflow-visible md:pb-0", className)} aria-label="Adminisztrációs navigáció">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = ICONS[item.icon]
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-mavet-navy/70 outline-none transition-colors hover:text-mavet-navy focus-visible:ring-3 focus-visible:ring-ring/50",
              "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-mavet-gold after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:after:transition-none",
              active && "text-mavet-navy after:scale-x-100",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
