"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { ChevronDownIcon, LogInIcon, LogOutIcon, ShieldCheckIcon, UserCircle2Icon, UserRoundIcon, UsersRoundIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ADMIN_HOME_PATH, MEMBER_ACCOUNT_PATH, MEMBER_DIRECTORY_PATH, MEMBER_LOGIN_PATH } from "@/lib/auth-paths"
import { cn } from "@/lib/utils"

type AccountState = { status: "loading" } | { status: "guest" } | { status: "member"; name: string; email: string } | { status: "admin"; name: string; email: string }

/**
 * Reads the session on the client (NextAuth's /api/auth/session), so the public
 * pages stay statically rendered. Until it answers, the guest state is shown.
 */
export function useAccount(): AccountState {
  const [state, setState] = useState<AccountState>({ status: "loading" })
  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((session: { user?: { name?: string | null; email?: string | null; role?: string } } | null) => {
        if (cancelled) return
        const user = session?.user
        if (!user?.email) return setState({ status: "guest" })
        const name = user.name || user.email
        setState(user.role === "ADMIN" || user.role === "SUPERADMIN" ? { status: "admin", name, email: user.email } : { status: "member", name, email: user.email })
      })
      .catch(() => !cancelled && setState({ status: "guest" }))
    return () => {
      cancelled = true
    }
  }, [])
  return state
}

/** Desktop: icon button; guests go straight to the login page, members get a menu. */
export function AccountMenu({ className }: { className?: string }) {
  const account = useAccount()

  if (account.status === "loading" || account.status === "guest") {
    return (
      <Button
        variant="ghost"
        className={cn("h-10 gap-2 px-3 text-mavet-navy/80 hover:text-mavet-navy", className)}
        render={<Link href={MEMBER_LOGIN_PATH} />}
        nativeButton={false}
        aria-label="Bejelentkezés"
      >
        <UserCircle2Icon className="size-5" aria-hidden="true" />
        <span className="hidden 2xl:inline">Bejelentkezés</span>
      </Button>
    )
  }

  const target = account.status === "admin" ? ADMIN_HOME_PATH : MEMBER_ACCOUNT_PATH

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className={cn("h-10 gap-2 px-3 text-mavet-navy", className)} aria-label="Fiók menü">
            <UserCircle2Icon className="size-5" aria-hidden="true" />
            <span className="hidden max-w-36 truncate font-semibold 2xl:inline">{account.name}</span>
            <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <div className="space-y-0.5 px-2 py-2">
          <div className="text-sm font-semibold leading-tight">{account.name}</div>
          <div className="truncate text-xs text-muted-foreground">{account.email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={target} />}>
          {account.status === "admin" ? <ShieldCheckIcon aria-hidden="true" /> : <UserRoundIcon aria-hidden="true" />}
          {account.status === "admin" ? "Adminisztráció" : "Saját fiók"}
        </DropdownMenuItem>
        {account.status === "member" ? (
          <DropdownMenuItem render={<Link href={MEMBER_DIRECTORY_PATH} />}>
            <UsersRoundIcon aria-hidden="true" />
            Tagi névjegyzék
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOutIcon aria-hidden="true" />
          Kijelentkezés
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Mobile sheet rows: the same options as plain buttons. `close` wraps each row in a SheetClose. */
export function AccountMenuRows({ close }: { close: (node: React.ReactElement, key: string) => React.ReactNode }) {
  const account = useAccount()

  if (account.status === "loading" || account.status === "guest") {
    return close(
      <Button variant="ghost" className="justify-start" render={<Link href={MEMBER_LOGIN_PATH} />} nativeButton={false}>
        <LogInIcon data-icon="inline-start" aria-hidden="true" />
        Bejelentkezés
      </Button>,
      "login",
    )
  }

  const target = account.status === "admin" ? ADMIN_HOME_PATH : MEMBER_ACCOUNT_PATH
  return (
    <>
      <div className="px-3 pt-2 pb-1 text-xs text-muted-foreground">{account.email}</div>
      {close(
        <Button variant="ghost" className="justify-start" render={<Link href={target} />} nativeButton={false}>
          {account.status === "admin" ? <ShieldCheckIcon data-icon="inline-start" aria-hidden="true" /> : <UserRoundIcon data-icon="inline-start" aria-hidden="true" />}
          {account.status === "admin" ? "Adminisztráció" : "Saját fiók"}
        </Button>,
        "account",
      )}
      {account.status === "member"
        ? close(
            <Button variant="ghost" className="justify-start" render={<Link href={MEMBER_DIRECTORY_PATH} />} nativeButton={false}>
              <UsersRoundIcon data-icon="inline-start" aria-hidden="true" />
              Tagi névjegyzék
            </Button>,
            "directory",
          )
        : null}
      <Button variant="ghost" className="justify-start text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOutIcon data-icon="inline-start" aria-hidden="true" />
        Kijelentkezés
      </Button>
    </>
  )
}
