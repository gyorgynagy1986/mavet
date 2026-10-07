import { CalendarDaysIcon, ExternalLinkIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { POST_TYPE_LABEL, type PostView } from "@/lib/posts"

/**
 * Detail view (5.3): title, date, summary, article and the image; for an event the time, the location and,
 * while it is current, the registration or information link. Used by the public page and, with the same
 * data shape, by the live preview of the admin form.
 */
export function PostArticle({ post, headingLevel = "h1" }: { post: PostView; headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-mavet-blue-deep uppercase">{POST_TYPE_LABEL[post.type]}</span>
          {post.event?.phase === "folyamatban" ? <span className="rounded-full bg-mavet-gold/25 px-3 py-1 text-xs font-semibold tracking-wide text-mavet-navy uppercase">Most zajlik</span> : null}
          {post.event?.phase === "korabbi" ? <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-wide uppercase">Korábbi esemény</span> : null}
          {!post.event && post.dateIso ? <time dateTime={post.dateIso}>{post.dateLabel}</time> : null}
        </p>
        <Heading className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{post.title || "Cím nélkül"}</Heading>
        {post.excerpt ? <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{post.excerpt}</p> : null}
      </header>

      {post.event ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-mavet-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-col gap-2 text-mavet-navy">
            <li className="flex items-start gap-2.5">
              <CalendarDaysIcon className="mt-1 size-4 shrink-0 text-mavet-blue" aria-hidden="true" />
              <span><span className="sr-only">Időpont: </span>{post.event.when}</span>
            </li>
            {post.event.location ? (
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="mt-1 size-4 shrink-0 text-mavet-blue" aria-hidden="true" />
                <span><span className="sr-only">Helyszín: </span>{post.event.location}</span>
              </li>
            ) : null}
          </ul>
          {post.event.linkUrl ? (
            <Button variant="gold" size="lg" className="w-fit shrink-0" render={<a href={post.event.linkUrl} target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
              {post.event.linkLabel}
              <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
              <span className="sr-only"> (új lapon nyílik meg)</span>
            </Button>
          ) : null}
        </div>
      ) : null}

      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already resized WebP
        <img src={post.imageUrl} alt="" className="w-full rounded-xl border border-border object-cover" />
      ) : null}

      <div className="flex flex-col gap-5 leading-7 text-muted-foreground">
        {post.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}
