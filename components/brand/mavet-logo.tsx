import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { cn } from "@/lib/utils"

type MavetLogoProps = {
  /** `light`: navy wordmark for light backgrounds; `dark`: white wordmark for navy backgrounds. */
  tone?: "light" | "dark"
  className?: string
}

/**
 * Horizontal logo (emblem + wordmark), the primary logo of the site header.
 * The wordmark follows the brand manual: "M A [V emblem] E T", with the inline
 * emblem at 112% of the cap height. It is set in the live Palatino stack until
 * the outlined `mavet-logo-horizontal.svg` arrives from the designer.
 */
export function MavetLogo({ tone = "light", className }: MavetLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <MavetEmblem className="h-[1.35em] w-auto shrink-0" />
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-baseline font-display leading-none font-normal tracking-[0.2em]",
          tone === "dark" ? "text-white" : "text-mavet-navy",
        )}
      >
        MA
        <MavetEmblem className="mr-[0.2em] h-[0.78em] w-auto translate-y-[0.06em]" />
        ET
      </span>
      <span className="sr-only">MAVET</span>
    </span>
  )
}
