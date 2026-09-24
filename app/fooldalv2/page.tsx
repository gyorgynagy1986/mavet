import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Eyebrow } from "@/components/home/eyebrow"
import { HomeContent } from "@/components/home/home-content"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { mottoPillars } from "@/lib/data/site"
import { cn } from "@/lib/utils"

/**
 * Home page, design variant 2: full-colour landscape hero with a navy reading
 * gradient, and three photo cards overlapping its bottom edge. Everything
 * below the cards is the shared `HomeContent`.
 */
export default function HomeV2Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-mavet-navy-deep text-white">
        <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
          <Image src="/hero.webp" alt="" fill priority sizes="100vw" className="object-cover object-[center_55%] motion-safe:animate-mavet-zoom" />
        </div>
        {/* Reading gradient: solid navy behind the text, clearing towards the village on the right. */}
        <div
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(6_30_65/0.94)_0%,rgb(11_45_91/0.82)_34%,rgb(11_45_91/0.35)_62%,rgb(11_45_91/0.08)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(6_30_65/0.88)_0%,rgb(11_45_91/0.72)_60%,rgb(11_45_91/0.5)_100%)]"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-mavet-navy-deep/70 to-transparent" aria-hidden="true" />

        <SiteContainer className="mavet-hero-exit pt-20 pb-44 sm:pt-28 sm:pb-56 lg:pt-32 lg:pb-64">
          <div className="flex max-w-2xl flex-col items-start gap-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <Eyebrow emblem="mono" className="text-mavet-gold-50">Magyar Vidékegészségügyi Társaság</Eyebrow>
            <div className="flex flex-col gap-6">
              <h1 className="text-[2.75rem] leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
                Helyszín. Közösség. <span className="text-mavet-gold italic">Szemlélet.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/85 sm:text-xl">
                A tudomány az együttműködésben válik cselekvéssé. A MAVET a vidéki közösségek egészségéért dolgozó szakemberek nyitott, interdiszciplináris fóruma.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button size="xl" variant="gold" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>
                Jelentkezem
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button size="xl" variant="outline-inverse" className="backdrop-blur-sm" render={<Link href="/a-tarsasagrol" />} nativeButton={false}>
                Ismerje meg a Társaságot
              </Button>
            </div>
          </div>
        </SiteContainer>
      </section>

      {/* Motto pillars: photo cards overlapping the hero */}
      <section aria-labelledby="pillerek-cime" className="relative z-10 -mt-28 sm:-mt-36 lg:-mt-44">
        <SiteContainer>
          <h2 id="pillerek-cime" className="sr-only">Amit a mottónk jelent</h2>
          <ul className="grid gap-5 md:grid-cols-3 lg:gap-7">
            {mottoPillars.map(({ title, description, image, imagePosition }, index) => (
              <li
                key={title}
                style={{ animationDelay: `${200 + index * 120}ms` }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-24px_rgb(11_45_91/0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_70px_-24px_rgb(11_45_91/0.45)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 motion-safe:fill-mode-both motion-reduce:transform-none"
              >
                <div className="relative aspect-[3/2] overflow-hidden" aria-hidden="true">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none", imagePosition)}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-mavet-blue via-mavet-gold to-mavet-gold-light" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6 sm:p-8">
                  <h3 className="text-2xl">{title}</h3>
                  <p className="leading-7 text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </SiteContainer>
      </section>

      <HomeContent />
    </>
  )
}
