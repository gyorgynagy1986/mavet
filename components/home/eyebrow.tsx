import { cn } from "@/lib/utils"

/** Small uppercase section label with the gold rule of the brand. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-xs font-semibold tracking-[0.16em] uppercase sm:text-sm", className)}>
      <span className="h-0.5 w-8 rounded-full bg-mavet-gold" aria-hidden="true" />
      {children}
    </p>
  )
}
