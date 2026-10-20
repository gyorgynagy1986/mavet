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
import { POST_TYPE_LABEL, type HomePreview, type PostView } from "@/lib/posts"
import { PostCover } from "@/components/posts/post-cover"
import { listHomePreview } from "@/lib/server/posts"
import { listFeaturedPartners } from "@/lib/server/partners"
import { PartnerStrip } from "@/components/partners/partner-strip"
import type { PartnerView } from "@/lib/partners"
import { workgroups } from "@/lib/data/site"

/** Decorative icons for the workgroup cards, in the order of `workgroups`. */
const workgroupIcons: LucideIcon[] = [StethoscopeIcon, BrainCircuitIcon, ActivityIcon, NetworkIcon, UsersIcon, HeartPulseIcon]

/**
 * Everything on the home page below the hero and the motto pillars. Shared by
 * the home page and its design variants, so the content exists only once.
 */
export async function HomeContent() {
  // Aktualitások (3.2): one highlighted card (the admin-featured post, otherwise the newest news) with at
  // most two further news beside it, and at most three current events below. Without anything (or without
  // a database) the whole block stays hidden.
  let preview: HomePreview = { highlight: null, news: [], events: [] }
  try {
    preview = await listHomePreview()
  } catch (error) {
    console.error("[home] news preview could not be loaded:", error)
  }
  const { highlight: featuredNews, news: otherNews, events: upcomingEvents } = preview
  // Partners (3.1): the featured, published ones; without any the section stays hidden.
  let partners: PartnerView[] = []
  try {
    partners = await listFeaturedPartners()
  } catch (error) {
    console.error("[home] partners could not be loaded:", error)
  }

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

      {/* News and events */}
      {(featuredNews || upcomingEvents.length > 0) && (
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
            {featuredNews && (
              <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
                <article className="mavet-reveal relative isolate flex min-h-[22rem] flex-col justify-end gap-4 overflow-hidden rounded-2xl bg-mavet-hero p-7 text-white sm:min-h-[26rem] sm:p-10 lg:min-h-0">
                  {featuredNews.coverUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already resized WebP */}
                      <img src={featuredNews.coverUrl} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
                      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-mavet-navy via-mavet-navy/70 to-mavet-navy/20" aria-hidden="true" />
                    </>
                  ) : (
                    <MavetEmblem variant="mono" className="absolute -top-6 -right-10 -z-10 w-72 text-white opacity-[0.06]" />
                  )}
                  <p className="flex flex-wrap items-center gap-3 text-sm text-white/75">
                    <span className="rounded-full bg-mavet-gold px-3 py-1 text-xs font-semibold tracking-wide text-mavet-navy uppercase">
                      {featuredNews.featured ? `Kiemelt ${POST_TYPE_LABEL[featuredNews.type].toLowerCase()}` : POST_TYPE_LABEL[featuredNews.type]}
                    </span>
                    {featuredNews.dateIso ? <time dateTime={featuredNews.dateIso}>{featuredNews.dateLabel}</time> : null}
                    {featuredNews.event?.location ? <span>{featuredNews.event.location}</span> : null}
                  </p>
                  <h3 className="text-2xl leading-tight text-balance sm:text-3xl">
                    <Link href={featuredNews.href} className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-white/50">
                      {featuredNews.title}
                    </Link>
                  </h3>
                  <p className="line-clamp-3 max-w-2xl leading-7 text-white/80">{featuredNews.excerpt}</p>
                  <p className="flex items-center gap-1.5 font-semibold text-mavet-gold-light" aria-hidden="true">
                    {featuredNews.type === "hir" ? "Elolvasom" : "Részletek"}
                    <ArrowUpRightIcon className="size-4" />
                  </p>
                </article>
                {otherNews.length > 0 && (
                  <div className="grid gap-5">
                    {otherNews.map((item) => <PreviewCard key={item.id} item={item} variant="side" />)}
                  </div>
                )}
              </div>
            )}
            {upcomingEvents.length > 0 && (
              <div className="flex flex-col gap-6">
                <div className="mavet-reveal flex items-end justify-between gap-6">
                  <h3 className="text-2xl leading-tight sm:text-3xl">Közelgő események</h3>
                  <Link href="/aktualitasok" className="hidden shrink-0 items-center gap-1.5 font-semibold text-mavet-blue underline-offset-4 hover:underline sm:inline-flex">
                    Minden esemény
                    <ArrowUpRightIcon className="size-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((item) => <PreviewCard key={item.id} item={item} variant="grid" />)}
                </div>
              </div>
            )}
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

      {/* Partners (3.1): featured partners in equal tiles; the full list is on /partnerek */}
      {partners.length > 0 && (
        <section className="border-t border-border bg-mavet-surface py-16 sm:py-20">
          <SiteContainer className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="mavet-reveal flex flex-col gap-5">
                <Eyebrow className="text-mavet-blue">Együttműködés</Eyebrow>
                <h2 className="text-3xl leading-tight sm:text-[2.5rem]">Partnereink és támogatóink</h2>
              </div>
              <Button size="xl" variant="soft" className="w-fit shrink-0" render={<Link href="/partnerek" />} nativeButton={false}>
                Összes partner
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <div className="mavet-reveal">
              <PartnerStrip partners={partners} />
            </div>
          </SiteContainer>
        </section>
      )}

      {/* Stay in touch */}
      <section className="border-t border-border bg-mavet-surface py-12">
        <SiteContainer className="mavet-reveal flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl">Maradjon kapcsolatban a MAVET-tel</h2>
            <p className="mt-2 text-muted-foreground">Tájékozódjon az oldalon, vagy kövesse Facebook-oldalunkat.</p>
          </div>
          <FacebookMark className="size-11 border-border text-mavet-blue" />
        </SiteContainer>
      </section>
    </>
  )
}


/**
 * The small cards of the Aktualitások block. `side`: the two news beside the highlight, horizontal
 * (thumbnail left, text right, two-line excerpt) so the right column never outgrows the highlight.
 * `grid`: the events row below, vertical with a cover and a clamped excerpt, equal heights.
 */
function PreviewCard({ item, variant }: { item: PostView; variant: "side" | "grid" }) {
  const meta = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide text-mavet-blue-deep uppercase">{POST_TYPE_LABEL[item.type]}</span>
      {item.dateIso ? <time dateTime={item.dateIso}>{item.dateLabel}</time> : null}
      {item.event?.location ? <span>{item.event.location}</span> : null}
    </p>
  )
  const cta = (
    <p className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-mavet-blue" aria-hidden="true">
      {item.type === "hir" ? "Elolvasom" : "Részletek"}
      <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
    </p>
  )
  const shell = "mavet-reveal group relative overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-mavet-blue-50 hover:shadow-[0_20px_44px_-20px_rgb(11_45_91/0.3)]"

  if (variant === "side") {
    return (
      <article className={`${shell} flex flex-col sm:flex-row`}>
        <PostCover url={item.coverUrl} zoomOnHover className="sm:aspect-auto sm:w-44 sm:shrink-0 lg:w-40 xl:w-48" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-5 sm:p-6">
          {meta}
          <h3 className="line-clamp-2 text-lg leading-snug text-balance">
            <Link href={item.href} className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-ring/50">
              {item.title}
            </Link>
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
          {cta}
        </div>
      </article>
    )
  }

  return (
    <article className={`${shell} flex h-full flex-col`}>
      <PostCover url={item.coverUrl} zoomOnHover />
      <div className="flex flex-1 flex-col gap-3 p-6">
        {meta}
        <h3 className="line-clamp-2 text-lg leading-snug text-balance sm:text-xl">
          <Link href={item.href} className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-ring/50">
            {item.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
        {cta}
      </div>
    </article>
  )
}
