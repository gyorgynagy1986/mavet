import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { cn } from "@/lib/utils"

/**
 * Small uppercase section label, marked with the V emblem.
 * `emblem="color"` (default): full-colour blue-gold emblem, for light backgrounds.
 * `emblem="mono"`: single-colour emblem taking the text colour, for dark (navy) backgrounds,
 * where the navy part of the colour emblem would disappear.
 */
export function Eyebrow({
  children,
  className,
  emblem = "color",
}: {
  children: React.ReactNode
  className?: string
  emblem?: "color" | "mono"
}) {
  return (
    <p className={cn("flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] uppercase sm:text-sm", className)}>
      <MavetEmblem variant={emblem} className={cn("w-auto shrink-0", emblem === "color" ? "h-[1.05em]" : "h-[0.85em]")} />
      {children}
    </p>
  )
}
