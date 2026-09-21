import Link from "next/link"
import { InfoIcon } from "lucide-react"
import { SiteContainer } from "@/components/site-container"

export function DevelopmentBanner() {
  return (
    <aside className="bg-mavet-navy-deep text-white" aria-label="Fejlesztési állapot">
      <SiteContainer className="flex items-center justify-center gap-2 py-2 text-center text-xs sm:text-sm">
        <InfoIcon aria-hidden="true" className="size-4 shrink-0 text-mavet-gold" />
        <p className="text-white/85">A MAVET új weboldala folyamatosan bővül. Hamarosan új tartalmakkal és online funkciókkal várjuk. <Link className="font-semibold text-white underline decoration-mavet-gold decoration-2 underline-offset-4 hover:text-mavet-gold-light" href="/tagsag/jelentkezes">Jelentkezem</Link></p>
      </SiteContainer>
    </aside>
  )
}
