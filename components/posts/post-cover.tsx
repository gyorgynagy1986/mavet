import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { cn } from "@/lib/utils"

/**
 * The 16:9 cover slot of a post: the uploaded cover, or the MAVET placeholder (navy ground, faint emblem)
 * so that every card and header has the same shape whether or not a cover was uploaded.
 */
export function PostCover({ url, className, zoomOnHover = false }: { url: string | null; className?: string; zoomOnHover?: boolean }) {
  return (
    <div className={cn("relative isolate aspect-[16/9] overflow-hidden bg-mavet-hero", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already resized WebP
        <img src={url} alt="" loading="lazy" className={cn("size-full object-cover", zoomOnHover && "transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none")} />
      ) : (
        <MavetEmblem variant="mono" aria-hidden="true" className="absolute top-1/2 left-1/2 w-[38%] -translate-x-1/2 -translate-y-1/2 text-white opacity-[0.14]" />
      )}
    </div>
  )
}
