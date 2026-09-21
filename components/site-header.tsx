"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"
import { navigation } from "@/lib/data/site"
import { MavetLogo } from "@/components/brand/mavet-logo"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <SiteContainer className="flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Link href="/" className="rounded-md text-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-2xl">
          <MavetLogo />
        </Link>
        <div className="hidden items-center gap-6 lg:flex">
          <nav className="flex items-center gap-1" aria-label="Elsődleges navigáció">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-[0.9375rem] font-semibold text-mavet-navy/75 outline-none transition-colors hover:text-mavet-navy focus-visible:ring-3 focus-visible:ring-ring/50",
                    "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-mavet-gold after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:after:transition-none",
                    active && "text-mavet-navy after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <Button size="lg" className="h-10 px-4" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>Jelentkezem</Button>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Button render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>Jelentkezem</Button>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" />} aria-label="Menü megnyitása">
              <MenuIcon />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Navigáció</SheetTitle>
                <SheetDescription>A MAVET bemutatkozó oldalai</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobil navigáció">
                <SheetClose render={<Button variant="ghost" className="justify-start" render={<Link href="/" />} nativeButton={false} />}>Főoldal</SheetClose>
                {navigation.map((item) => (
                  <SheetClose key={item.href} render={<Button variant={isActive(item.href) ? "secondary" : "ghost"} className="justify-start" aria-current={isActive(item.href) ? "page" : undefined} render={<Link href={item.href} />} nativeButton={false} />}>{item.label}</SheetClose>
                ))}
                <SheetClose render={<Button className="justify-start" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false} />}>Jelentkezem</SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </SiteContainer>
    </header>
  )
}
