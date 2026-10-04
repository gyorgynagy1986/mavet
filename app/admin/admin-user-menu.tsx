"use client"

import { signOut } from "next-auth/react"
import { ChevronDownIcon, LogOutIcon, UserCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOGIN_PATH } from "@/lib/auth-paths"

const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: "Főadminisztrátor",
  ADMIN: "Adminisztrátor",
}

export function AdminUserMenu({ name, email, role }: { name?: string | null; email?: string | null; role?: string | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-9 gap-2 px-2" aria-label="Fiók menü">
            <UserCircle2Icon className="size-5 text-mavet-navy" aria-hidden="true" />
            <span className="hidden max-w-40 truncate text-sm font-semibold sm:inline">{name ?? email ?? "Fiók"}</span>
            <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <div className="space-y-0.5 px-2 py-2">
          {name ? <div className="text-sm font-semibold leading-tight">{name}</div> : null}
          {email ? <div className="truncate text-xs text-muted-foreground">{email}</div> : null}
          {role ? <div className="pt-1 text-xs font-medium text-mavet-blue">{ROLE_LABEL[role] ?? role}</div> : null}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: LOGIN_PATH })}>
          <LogOutIcon aria-hidden="true" />
          Kijelentkezés
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
