import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { Eyebrow } from "@/components/home/eyebrow"
import { HomeContent } from "@/components/home/home-content"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { mottoPillars } from "@/lib/data/site"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-mavet-hero text-white">
        {/* Barely visible landscape photo with a slow zoom; luminosity blend keeps it inside the navy palette. */}
        <div
          className="absolute inset-0 -z-20 overflow-hidden opacity-[0.16] mix-blend-luminosity [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
          aria-hidden="true"
        >
          <Image src="/hero.webp" alt="" fill sizes="100vw" className="object-cover object-[center_60%] motion-safe:animate-mavet-zoom" />
        </div>
        <div className="absolute inset-0 -z-10 bg-mavet-grid" aria-hidden="true" />
        <MavetEmblem variant="mono" className="absolute -top-6 -right-40 -z-10 w-96 text-white opacity-[0.04] lg:hidden" />
        <SiteContainer className="mavet-hero-exit grid items-center gap-12 pt-16 pb-28 sm:pt-24 sm:pb-36 lg:grid-cols-[1.15fr_0.85fr] lg:pt-28 lg:pb-40">
          <div className="flex flex-col items-start gap-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <Eyebrow className="text-mavet-gold-50">Magyar Vidékegészségügyi Társaság</Eyebrow>
            <div className="flex flex-col gap-6">
              <h1 className="text-[2.75rem] leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
                Helyszín. Közösség. <span className="text-mavet-gold italic">Szemlélet.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/80 sm:text-xl">
                A tudomány az együttműködésben válik cselekvéssé. A MAVET a vidéki közösségek egészségéért dolgozó szakemberek nyitott, interdiszciplináris fóruma.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button size="xl" variant="gold" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>
                Jelentkezem
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button size="xl" variant="outline-inverse" render={<Link href="/a-tarsasagrol" />} nativeButton={false}>
                Ismerje meg a Társaságot
              </Button>
            </div>
          </div>

          <div className="mavet-parallax relative mx-auto hidden aspect-square w-full max-w-md place-items-center lg:grid" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-[9%] rounded-full border border-white/10 bg-white/[0.04]" />
            <div className="absolute inset-[18%] rounded-full bg-mavet-blue/40 blur-3xl" />
            <div className="absolute inset-[19%] rounded-full bg-white shadow-[0_30px_80px_-20px_rgb(6_30_65/0.8)]" />
            <div className="absolute top-[14%] right-[12%] size-2.5 rounded-full bg-mavet-gold" />
            <div className="absolute bottom-[19%] left-[6%] size-2 rounded-full bg-mavet-blue-50" />
            <MavetEmblem className="relative w-[44%] translate-y-[4%]" />
          </div>
        </SiteContainer>
      </section>

      {/* Motto pillars, overlapping the hero */}
      <section aria-labelledby="pillerek-cime" className="relative z-10 -mt-16 sm:-mt-20">
        <SiteContainer>
          <h2 id="pillerek-cime" className="sr-only">Amit a mottónk jelent</h2>
          <ul className="grid divide-y divide-border overflow-hidden rounded-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:delay-200 motion-safe:duration-700 motion-safe:fill-mode-both border border-border bg-card shadow-[0_24px_60px_-24px_rgb(11_45_91/0.28)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {mottoPillars.map(({ title, description, image, imagePosition }) => (
              <li key={title} className="group relative isolate flex flex-col gap-3 overflow-hidden p-6 pt-28 sm:p-8 sm:pt-36">
                {/* Faint duotone photo: luminosity blend over a light blue tint, fading out towards the text. */}
                <div
                  className="absolute inset-0 -z-10 bg-mavet-blue-50 opacity-30 transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,black_12%,transparent_64%)] group-hover:opacity-45 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className={cn("object-cover mix-blend-luminosity transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none", imagePosition)}
                  />
                </div>
                <span className="h-0.5 w-8 rounded-full bg-mavet-gold" aria-hidden="true" />
                <h3 className="text-xl">{title}</h3>
                <p className="leading-7 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
        </SiteContainer>
      </section>

      <HomeContent />
    </>
  )
}
