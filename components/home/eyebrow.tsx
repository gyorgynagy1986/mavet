import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { cn } from "@/lib/utils"

/** Small uppercase section label, marked with the single-colour V emblem (it takes the text colour). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] uppercase sm:text-sm", className)}>
      <MavetEmblem variant="mono" className="h-[0.85em] w-auto shrink-0" />
      {children}
    </p>
  )
}
