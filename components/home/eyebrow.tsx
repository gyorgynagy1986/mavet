import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { cn } from "@/lib/utils"

/**
 * Small uppercase section label, marked with the V emblem.
 * `emblem="color"` (default): full-colour blue-gold emblem, for light backgrounds.
 * `emblem="mono"`: single-colour emblem taking the text colour, for dark (navy) backgrounds,
 * where the navy part of the colour emblem would disappear.
 * `as`: the rendered element. Default `p` (a label, not a heading); the home hero
 * uses `h1` so the Society's full name is the page heading. Only one `h1` per page.
 * The heading font stack (Palatino) is overridden with `font-sans`, so the label
 * keeps its Source Sans look whichever element it renders as.
 */
export function Eyebrow({
  children,
  className,
  emblem = "color",
  as: Tag = "p",
}: {
  children: React.ReactNode
  className?: string
  emblem?: "color" | "mono"
  as?: "p" | "h1" | "h2"
}) {
  return (
    <Tag className={cn("flex items-center gap-2.5 font-sans text-xs font-semibold tracking-[0.16em] uppercase sm:text-sm", className)}>
      <MavetEmblem variant={emblem} className={cn("w-auto shrink-0", emblem === "color" ? "h-[1.05em]" : "h-[0.85em]")} />
      {children}
    </Tag>
  )
}
