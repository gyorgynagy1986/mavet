import Link from "next/link"
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BrainCircuitIcon,
  HeartPulseIcon,
  NetworkIcon,
  StethoscopeIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { FacebookMark } from "@/components/facebook-mark"
import { Eyebrow } from "@/components/home/eyebrow"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { newsItems } from "@/lib/data/news"
import { workgroups } from "@/lib/data/site"

/** Decorative icons for the workgroup cards, in the order of `workgroups`. */
const workgroupIcons: LucideIcon[] = [StethoscopeIcon, BrainCircuitIcon, ActivityIcon, NetworkIcon, UsersIcon, HeartPulseIcon]

/**
 * Everything on the home page below the hero and the motto pillars. Shared by
 * the home page and its design variants, so the content exists only once.
 */
export function HomeContent() {
  const latestNews = [...newsItems].sort((a, b) => b.publishedAtIso.localeCompare(a.publishedAtIso)).slice(0, 6)
  const [featuredNews, ...otherNews] = latestNews

  return (
    <>
      {/* Mission */}
      <section className="py-20 sm:py-28">
        <SiteContainer className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="mavet-reveal-left flex flex-col gap-5">
            <Eyebrow className="text-mavet-blue">Küldetésünk</Eyebrow>
            <h2 className="text-3xl leading-tight text-balance sm:text-[2.5rem]">Méltányos, közösségközpontú és bizonyítékokon alapuló ellátás</h2>
          </div>
          <div className="mavet-reveal-right flex flex-col gap-5 text-lg leading-8 text-muted-foreground">
            <p>A vidékegészségügy nem kizárólag földrajzi fogalom, hanem olyan szakmai szemlélet, amely minden ember számára magas színvonalú és fenntartható egészségügyi ellátást kíván biztosítani.</p>
            <p>A Társaság fórumot teremt a szakemberek, kutatók, oktatók, döntéshozók, hallgatók és érdeklődők együttműködéséhez.</p>
            <Button size="xl" variant="soft" className="mt-3 w-fit" render={<Link href="/a-tarsasagrol" />} nativeButton={false}>
              Küldetés és történet
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </SiteContainer>
      </section>

      {/* Workgroups */}
      <section className="border-y border-border bg-mavet-surface py-20 sm:py-28">
        <SiteContainer className="flex flex-col gap-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="mavet-reveal flex flex-col gap-5">
              <Eyebrow className="text-mavet-blue">Szakmai műhelyek</Eyebrow>
              <h2 className="text-3xl leading-tight sm:text-[2.5rem]">Munkacsoportok</h2>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">Közös témák és kihívások mentén szerveződő szakmai közösségek.</p>
            </div>
            <Button size="xl" variant="soft" className="w-fit shrink-0" render={<Link href="/munkacsoportok" />} nativeButton={false}>
              Összes munkacsoport
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workgroups.map((group, index) => {
              const Icon = workgroupIcons[index % workgroupIcons.length]
              return (
                <li key={group} className="mavet-reveal">
                  <Link
                    href="/munkacsoportok"
                    className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 outline-none transition duration-200 hover:-translate-y-1 hover:border-mavet-blue-50 hover:shadow-[0_20px_44px_-20px_rgb(11_45_91/0.3)] focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none sm:p-7"
                  >
                    <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-mavet-blue to-mavet-gold transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-xl bg-accent text-mavet-blue transition-colors group-hover:bg-mavet-navy group-hover:text-white">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="font-display text-2xl text-mavet-blue-50" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl leading-snug text-balance">{group}</h3>
                      <p className="text-muted-foreground">A részletes bemutatás hamarosan elérhető.</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </SiteContainer>
      </section>

      {/* News */}
      {featuredNews && (
        <section className="py-20 sm:py-28">
          <SiteContainer className="flex flex-col gap-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="mavet-reveal flex flex-col gap-5">
                <Eyebrow className="text-mavet-blue">Friss hírek</Eyebrow>
                <h2 className="text-3xl leading-tight sm:text-[2.5rem]">Aktualitások</h2>
              </div>
              <Button size="xl" variant="soft" className="w-fit shrink-0" render={<Link href="/aktualitasok" />} nativeButton={false}>
                Összes aktualitás
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
              <article className="mavet-reveal relative isolate flex flex-col justify-end gap-5 overflow-hidden rounded-2xl bg-mavet-hero p-7 text-white sm:p-10 lg:min-h-[26rem]">
                <MavetEmblem variant="mono" className="absolute -top-6 -right-10 -z-10 w-72 text-white opacity-[0.06]" />
                <p className="flex flex-wrap items-center gap-3 text-sm text-white/75">
                  <span className="rounded-full bg-mavet-gold px-3 py-1 text-xs font-semibold tracking-wide text-mavet-navy uppercase">Kiemelt hír</span>
                  <time dateTime={featuredNews.publishedAtIso}>{featuredNews.publishedAt}</time>
                </p>
                <h3 className="text-2xl leading-tight text-balance sm:text-3xl">
                  <Link href={`/aktualitasok/${featuredNews.slug}`} className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-white/50">
                    {featuredNews.title}
                  </Link>
                </h3>
                <p className="max-w-2xl leading-7 text-white/80">{featuredNews.excerpt}</p>
                <p className="flex items-center gap-1.5 font-semibold text-mavet-gold-light" aria-hidden="true">
                  Elolvasom
                  <ArrowUpRightIcon className="size-4" />
                </p>
              </article>
              {otherNews.length > 0 && (
                <div className="grid gap-5">
                  {otherNews.map((item) => (
                    <article key={item.slug} className="mavet-reveal group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 transition duration-200 hover:border-mavet-blue-50 hover:shadow-[0_20px_44px_-20px_rgb(11_45_91/0.3)] sm:p-8">
                      <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-mavet-blue-deep uppercase">Hír</span>
                        <time dateTime={item.publishedAtIso}>{item.publishedAt}</time>
                      </p>
                      <h3 className="text-xl leading-snug text-balance sm:text-2xl">
                        <Link href={`/aktualitasok/${item.slug}`} className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-ring/50">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="leading-7 text-muted-foreground">{item.excerpt}</p>
                      <p className="mt-auto flex items-center gap-1.5 font-semibold text-mavet-blue" aria-hidden="true">
                        Elolvasom
                        <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </SiteContainer>
        </section>
      )}

      {/* Membership call to action */}
      <section className="pb-20 sm:pb-28">
        <SiteContainer>
          <div className="mavet-reveal relative isolate overflow-hidden rounded-3xl bg-mavet-hero px-7 py-14 text-white sm:px-14 sm:py-20">
            <MavetEmblem variant="mono" className="absolute -right-16 -bottom-20 -z-10 w-[30rem] text-white opacity-[0.06]" />
            <div className="flex max-w-2xl flex-col items-start gap-6">
              <Eyebrow emblem="mono" className="text-mavet-gold-50">Tagság</Eyebrow>
              <h2 className="text-3xl leading-tight text-balance sm:text-[2.5rem]">Csatlakozzon a vidékegészségügy szakmai közösségéhez</h2>
              <p className="text-lg leading-8 text-white/80">Rendes, ifjúsági, hallgatói és pártoló tagsági formákkal várjuk a vidéki közösségek egészségéért tenni kívánó szakembereket és érdeklődőket.</p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button size="xl" variant="gold" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>
                  Jelentkezem
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button size="xl" variant="outline-inverse" render={<Link href="/tagsag" />} nativeButton={false}>
                  Tagsági formák
                </Button>
              </div>
            </div>
          </div>
        </SiteContainer>
      </section>

      {/* Stay in touch */}
      <section className="border-t border-border bg-mavet-surface py-12">
        <SiteContainer className="mavet-reveal flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl">Maradjon kapcsolatban a MAVET-tel</h2>
            <p className="mt-2 text-muted-foreground">Tájékozódjon az oldalon, vagy kövesse hamarosan elérhető Facebook-oldalunkat.</p>
          </div>
          <FacebookMark className="size-11 border-border text-mavet-blue" />
        </SiteContainer>
      </section>
    </>
  )
}

