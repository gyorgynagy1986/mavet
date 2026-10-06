import { cn } from "@/lib/utils"

/** Portrait if the member allowed it, otherwise initials. */
export function MemberAvatar({ photoUrl, initials, name, className }: { photoUrl: string | null; initials: string; name: string; className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-mavet-blue-50 font-semibold text-mavet-navy", className)}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already 512 px WebP; no next/image remote config needed
        <img src={photoUrl} alt={`${name} portréja`} loading="lazy" className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials || "?"}</span>
      )}
    </div>
  )
}
