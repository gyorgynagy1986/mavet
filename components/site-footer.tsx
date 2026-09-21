import Link from "next/link"
import { MavetLogo } from "@/components/brand/mavet-logo"
import { SiteContainer } from "@/components/site-container"
import { contact, navigation } from "@/lib/data/site"
import { FacebookMark } from "@/components/facebook-mark"

const legalLinks = [
  { href: "/adatkezeles", label: "Adatkezelési tájékoztató" },
  { href: "/suti-tajekoztato", label: "Süti-tájékoztató" },
  { href: "/impresszum", label: "Impresszum" },
] as const

const footerLinkClass = "w-fit rounded-sm text-white/75 underline-offset-4 outline-none transition-colors hover:text-white hover:underline focus-visible:ring-3 focus-visible:ring-white/40"

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-mavet-navy-deep text-white">
      <div className="h-1 bg-gradient-to-r from-mavet-blue via-mavet-gold to-mavet-gold-light" aria-hidden="true" />
      <SiteContainer className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div className="flex flex-col gap-4">
          <Link href="/" className="w-fit rounded-md text-2xl outline-none focus-visible:ring-3 focus-visible:ring-white/40">
            <MavetLogo tone="dark" />
          </Link>
          <p className="font-semibold">Magyar Vidékegészségügyi Társaság</p>
          <p className="font-display text-lg text-mavet-gold-50 italic">Helyszín. Közösség. Szemlélet.</p>
          <p className="max-w-md text-sm leading-6 text-white/70">Az oldal fejlesztés alatt áll. A teljes tagsági és szakmai funkcionalitás egy későbbi ütemben válik elérhetővé.</p>
        </div>
        <nav className="flex flex-col gap-2.5 text-sm" aria-label="Lábléc navigáció">
          <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-white/55 uppercase">Oldalak</p>
          {navigation.map((item) => (
            <Link key={item.href} className={footerLinkClass} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5 text-sm">
          <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-white/55 uppercase">Kapcsolat</p>
          <a className={footerLinkClass} href={`mailto:${contact.email}`}>{contact.email}</a>
          <FacebookMark className="mt-2 border-white/25 bg-white/10 text-white" />
        </div>
      </SiteContainer>
      <div className="border-t border-white/10">
        <SiteContainer className="flex flex-col gap-3 py-5 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Magyar Vidékegészségügyi Társaság</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Jogi navigáció">
            {legalLinks.map((item) => (
              <Link key={item.href} className={footerLinkClass} href={item.href}>{item.label}</Link>
            ))}
          </nav>
        </SiteContainer>
      </div>
    </footer>
  )
}
