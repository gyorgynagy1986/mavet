"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDownIcon, MenuIcon } from "lucide-react"
import { navigation, professionalContentNavigation } from "@/lib/data/site"
import { AccountMenu, AccountMenuRows } from "@/components/account-menu"
import { MavetLogo } from "@/components/brand/mavet-logo"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }
  const groupActive = professionalContentNavigation.some((item) => isActive(item.href))

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
                    "relative rounded-md px-3 py-2 text-[0.9375rem] font-semibold whitespace-nowrap text-mavet-navy/75 outline-none transition-colors hover:text-mavet-navy focus-visible:ring-3 focus-visible:ring-ring/50",
                    "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-mavet-gold after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:after:transition-none",
                    active && "text-mavet-navy after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-current={groupActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-[0.9375rem] font-semibold whitespace-nowrap text-mavet-navy/75 outline-none transition-colors hover:text-mavet-navy focus-visible:ring-3 focus-visible:ring-ring/50",
                  "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-mavet-gold after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:after:transition-none",
                  groupActive && "text-mavet-navy after:scale-x-100",
                )}
              >
                Szakmai tartalom
                <ChevronDownIcon className="size-4 opacity-70" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-56">
                {professionalContentNavigation.map((item) => (
                  <DropdownMenuItem key={item.href} render={<Link href={item.href} />} className={cn(isActive(item.href) && "bg-mavet-gold/15 font-semibold text-mavet-navy")}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <Button size="lg" className="h-10 px-4" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>Jelentkezem</Button>
          <AccountMenu />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Button render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>Jelentkezem</Button>
          <AccountMenu className="px-2" />
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
                <p className="px-4 pt-3 pb-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Szakmai tartalom</p>
                {professionalContentNavigation.map((item) => (
                  <SheetClose key={item.href} render={<Button variant={isActive(item.href) ? "secondary" : "ghost"} className="justify-start" aria-current={isActive(item.href) ? "page" : undefined} render={<Link href={item.href} />} nativeButton={false} />}>{item.label}</SheetClose>
                ))}
                <SheetClose render={<Button className="justify-start" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false} />}>Jelentkezem</SheetClose>
                <div className="my-2 h-px bg-border" role="separator" />
                <AccountMenuRows close={(node, key) => <SheetClose key={key} render={node} />} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </SiteContainer>
    </header>
  )
}
