import Link from "next/link"
import { ExternalLinkIcon, FileTextIcon, LockIcon, VideoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MaterialView } from "@/lib/server/materials"
import { VideoDialog } from "./video-dialog"

/** One material = one row (client decision DD-46): title and summary, category, form, date, and the action. */
export function MaterialRow({ item }: { item: MaterialView }) {
  const Icon = item.kind === "video" ? VideoIcon : FileTextIcon
  return (
    <tr className={item.locked ? "text-muted-foreground" : undefined}>
      <td className="px-4 py-4 align-top sm:px-5">
        <div className="flex gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-mavet-blue" aria-hidden="true">
            {item.locked ? <LockIcon className="size-4" /> : <Icon className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-balance text-mavet-navy">{item.title}</p>
            {item.summary ? <p className="mt-1 max-w-2xl text-sm leading-6">{item.summary}</p> : null}
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {item.author ? <span>{item.author}</span> : null}
              <span className="md:hidden">{item.category ?? "–"}</span>
              {item.dateLabel ? <span className="md:hidden">{item.dateLabel}</span> : null}
              {item.access === "tagi" ? <span className="font-semibold text-mavet-navy">Csak tagoknak</span> : null}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-4 align-top text-sm md:table-cell">{item.category ?? "–"}</td>
      <td className="hidden px-4 py-4 align-top text-sm lg:table-cell">
        {item.kind === "video" ? "Videó" : "Dokumentum"}
        {item.fileLabel ? <span className="block text-xs text-muted-foreground">{item.fileLabel}</span> : null}
      </td>
      <td className="hidden px-4 py-4 align-top text-sm whitespace-nowrap tabular-nums md:table-cell">{item.dateLabel ?? "–"}</td>
      <td className="px-4 py-4 text-right align-top sm:px-5">
        {item.locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
            <LockIcon className="size-3.5" aria-hidden="true" />
            Tagi
          </span>
        ) : item.kind === "video" && item.video?.embedUrl ? (
          <VideoDialog title={item.title} embedUrl={item.video.embedUrl} />
        ) : item.openHref ? (
          <Button size="sm" variant="soft" render={<Link href={item.openHref} target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
            Megnyitás
            <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
            <span className="sr-only"> (új lapon nyílik meg)</span>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Nem elérhető</span>
        )}
      </td>
    </tr>
  )
}
