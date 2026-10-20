import { Building2Icon } from "lucide-react"
import type { PartnerView } from "@/lib/partners"
import { cn } from "@/lib/utils"

/**
 * One partner = one tile of fixed proportions (2:1 logo box with even padding, name under it), so a
 * row of partners reads as one system whatever the logos' own shapes. The logo is already normalised
 * at upload (fitted into an 800×400 transparent box), object-contain keeps it centred and whole.
 */
export function PartnerTile({ partner, className }: { partner: PartnerView; className?: string }) {
  const body = (
    <>
      <span className="flex aspect-[2/1] w-full items-center justify-center rounded-xl bg-white p-5 ring-1 ring-border transition group-hover:ring-mavet-blue-50 sm:p-6">
        {partner.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already normalised WebP
          <img src={partner.logoUrl} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
        ) : (
          <Building2Icon className="size-8 text-mavet-navy/40" aria-hidden="true" />
        )}
      </span>
      <span className="line-clamp-2 text-center text-sm leading-5 font-semibold text-mavet-navy">{partner.name}</span>
    </>
  )
  const classes = cn("group flex w-full flex-col items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)
  return partner.websiteUrl ? (
    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className={classes} aria-label={`${partner.name} (új lapon nyílik meg)`}>
      {body}
    </a>
  ) : (
    <div className={classes}>{body}</div>
  )
}
