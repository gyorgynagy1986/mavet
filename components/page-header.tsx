import Image from "next/image"
import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { SiteContainer } from "@/components/site-container"

/**
 * Subpage title band: a restrained "mini hero" so text pages do not start on a bare white field.
 * The home hero landscape shows through very faintly on the right (duotone, fading towards the
 * title), with the V emblem as a watermark. The page body below stays plain white for readability.
 */
export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-border bg-mavet-surface py-10 sm:py-14">
      <div
        className="absolute inset-0 -z-20 bg-mavet-blue-50 opacity-[0.22] [mask-image:linear-gradient(to_right,transparent_15%,black_75%)]"
        aria-hidden="true"
      >
        <Image src="/hero.webp" alt="" fill sizes="100vw" className="object-cover object-[center_60%] mix-blend-luminosity" />
      </div>
      <MavetEmblem
        variant="mono"
        className="absolute -right-16 -bottom-24 -z-10 hidden w-[26rem] text-mavet-navy opacity-[0.05] sm:block"
      />
      <SiteContainer className="flex flex-col gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
      </SiteContainer>
    </header>
  )
}
