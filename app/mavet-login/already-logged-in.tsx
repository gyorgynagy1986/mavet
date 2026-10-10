"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { ArrowRightIcon, CircleCheckIcon, LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AlreadyLoggedIn({ name, email, callbackUrl }: { name?: string | null; email?: string | null; callbackUrl: string }) {
  const router = useRouter()
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-30px_rgb(11_45_91/0.35)]">
      <div className="h-1 bg-mavet-gold" aria-hidden="true" />
      <div className="space-y-6 px-6 py-8 text-center sm:px-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-mavet-blue/20 bg-mavet-blue/10">
          <CircleCheckIcon className="size-6 text-mavet-blue" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Már be van jelentkezve</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {name ? <span className="font-semibold text-foreground">{name}</span> : null}
            {name && email ? <br /> : null}
            {email}
          </p>
        </div>
        <div className="space-y-3">
          <Button size="xl" className="w-full" render={<Link href={callbackUrl} />} nativeButton={false}>
            Tovább az adminisztrációhoz
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="w-full"
            onClick={() => signOut({ redirect: false }).then(() => { router.replace("/mavet-login"); router.refresh() })}
          >
            <LogOutIcon data-icon="inline-start" aria-hidden="true" />
            Kijelentkezés
          </Button>
        </div>
      </div>
    </div>
  )
}
