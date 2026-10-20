"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { CalendarDaysIcon, ChevronDownIcon, FolderOpenIcon, IdCardIcon, LayoutDashboardIcon, MailIcon, NewspaperIcon, ScrollTextIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { AdminNavChild, AdminNavItem } from "@/lib/admin-nav"
import { cn } from "@/lib/utils"

const ICONS = {
  LayoutDashboard: LayoutDashboardIcon,
  ShieldCheck: ShieldCheckIcon,
  ScrollText: ScrollTextIcon,
  Users: UsersIcon,
  Mail: MailIcon,
  IdCard: IdCardIcon,
  Newspaper: NewspaperIcon,
  FolderOpen: FolderOpenIcon,
  CalendarDays: CalendarDaysIcon,
} as const

const linkClass =
  "relative inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-mavet-navy/70 outline-none transition-colors hover:text-mavet-navy focus-visible:ring-3 focus-visible:ring-ring/50 " +
  "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-mavet-gold after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:after:transition-none"

function pathOf(href: string): string {
  return href.split("?")[0]
}

export function AdminNav({ items, className }: { items: AdminNavItem[]; className?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = (item: AdminNavItem) => {
    const base = pathOf(item.href)
    if (item.exact) return pathname === base
    if (pathname === base || pathname.startsWith(`${base}/`)) return true
    return item.children?.some((c) => pathname === pathOf(c.href) || pathname.startsWith(`${pathOf(c.href)}/`)) ?? false
  }
  const isChildActive = (child: AdminNavChild) => {
    const base = pathOf(child.href)
    const onPath = pathname === base || pathname.startsWith(`${base}/`)
    if (!onPath) return false
    if (!child.match) return true
    // The list page falls back to the first type when the parameter is missing.
    const current = searchParams.get(child.match.param)
    return current ? current === child.match.value : child.match.value === "hir"
  }

  return (
    <nav className={cn("items-center gap-1 overflow-x-auto overflow-y-hidden pb-1 md:overflow-visible md:pb-0", className)} aria-label="Adminisztrációs navigáció">
      {items.map((item) => {
        const active = isActive(item)
        const Icon = ICONS[item.icon]

        if (!item.children?.length) {
          return (
            <Link key={item.key} href={item.href} aria-current={active ? "page" : undefined} className={cn(linkClass, active && "text-mavet-navy after:scale-x-100")}>
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          )
        }

        return (
          <div key={item.key} className="contents">
            {/* Desktop: one trigger with a dropdown. */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(linkClass, "hidden md:inline-flex", active && "text-mavet-navy after:scale-x-100")}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
                <ChevronDownIcon className="size-3.5 opacity-70" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={6} className="w-52">
                {item.children.map((child) => {
                  const ChildIcon = ICONS[child.icon]
                  const childActive = isChildActive(child)
                  return (
                    <DropdownMenuItem key={child.key} render={<Link href={child.href} />} className={cn(childActive && "bg-mavet-gold/15 font-semibold text-mavet-navy")}>
                      <ChildIcon aria-hidden="true" />
                      {child.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile: the children as plain items. */}
            {item.children.map((child) => {
              const ChildIcon = ICONS[child.icon]
              const childActive = isChildActive(child)
              return (
                <Link key={child.key} href={child.href} aria-current={childActive ? "page" : undefined} className={cn(linkClass, "md:hidden", childActive && "text-mavet-navy after:scale-x-100")}>
                  <ChildIcon className="size-4" aria-hidden="true" />
                  {child.label}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
