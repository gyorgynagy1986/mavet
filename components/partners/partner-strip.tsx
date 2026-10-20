"use client"

import { useEffect, useRef } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PartnerView } from "@/lib/partners"
import { PartnerTile } from "./partner-tile"

/**
 * Home page partner strip (3.1): a horizontally scrolling row of equal tiles. With more tiles than fit,
 * it drifts slowly and loops (two copies of the list); arrows scroll a tile; reduced motion disables the
 * drift. With few partners the row simply centres.
 */
export function PartnerStrip({ partners }: { partners: PartnerView[] }) {
  const viewport = useRef<HTMLDivElement>(null)
  const manualUntil = useRef(0)
  const loop = partners.length >= 5
  const items = loop ? [...partners, ...partners] : partners

  useEffect(() => {
    if (!loop) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) return
    let frame = 0
    let previous = 0
    const step = (time: number) => {
      const el = viewport.current
      if (el && previous && time >= manualUntil.current) {
        el.scrollLeft += Math.min(time - previous, 50) * 0.03
        const half = el.scrollWidth / 2
        if (el.scrollLeft >= half) el.scrollLeft -= half
      }
      previous = time
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [loop])

  function slide(direction: 1 | -1) {
    const el = viewport.current
    if (!el) return
    manualUntil.current = performance.now() + 1500
    if (loop && direction < 0 && el.scrollLeft < 260) el.scrollLeft += el.scrollWidth / 2
    el.scrollBy({ left: direction * 260, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
  }

  return (
    <div className="relative">
      <div ref={viewport} className={loop ? "flex gap-5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "flex flex-wrap justify-center gap-5"} aria-label="Partnereink logói">
        {items.map((p, i) => (
          <div key={`${p.id}-${i}`} className="w-44 shrink-0 sm:w-52" aria-hidden={loop && i >= partners.length ? true : undefined}>
            <PartnerTile partner={p} />
          </div>
        ))}
      </div>
      {loop ? (
        <div className="mt-5 flex justify-center gap-2">
          <Button size="icon-sm" variant="soft" aria-label="Előző partnerek" onClick={() => slide(-1)}><ChevronLeftIcon /></Button>
          <Button size="icon-sm" variant="soft" aria-label="Következő partnerek" onClick={() => slide(1)}><ChevronRightIcon /></Button>
        </div>
      ) : null}
    </div>
  )
}
