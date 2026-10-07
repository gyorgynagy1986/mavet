import Link from "next/link"
import { ArrowUpRightIcon, CalendarDaysIcon, MapPinIcon } from "lucide-react"
import { POST_TYPE_LABEL, type PostView } from "@/lib/posts"

/**
 * List card (5.3). News: title, summary, publication date. Event: title, summary, date or period, location.
 * The image is optional; the card works without it. The whole card is one link to the detail page.
 */
export function PostCard({ post }: { post: PostView }) {
  const running = post.event?.phase === "folyamatban"
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-mavet-blue-50 hover:shadow-[0_20px_44px_-20px_rgb(11_45_91/0.3)]">
      {post.imageUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already resized WebP */}
          <img src={post.imageUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-mavet-blue-deep uppercase">{POST_TYPE_LABEL[post.type]}</span>
          {running ? <span className="rounded-full bg-mavet-gold/25 px-3 py-1 text-xs font-semibold tracking-wide text-mavet-navy uppercase">Most zajlik</span> : null}
          {post.event ? null : post.dateIso ? <time dateTime={post.dateIso}>{post.dateLabel}</time> : null}
        </p>
        <h3 className="text-xl leading-snug text-balance">
          <Link href={post.href} className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-ring/50">
            {post.title}
          </Link>
        </h3>
        {post.event ? (
          <ul className="flex flex-col gap-1.5 text-sm text-mavet-navy">
            <li className="flex items-start gap-2">
              <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-mavet-blue" aria-hidden="true" />
              <span><span className="sr-only">Időpont: </span>{post.event.when}</span>
            </li>
            {post.event.location ? (
              <li className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-mavet-blue" aria-hidden="true" />
                <span><span className="sr-only">Helyszín: </span>{post.event.location}</span>
              </li>
            ) : null}
          </ul>
        ) : null}
        {post.excerpt ? <p className="leading-7 text-muted-foreground">{post.excerpt}</p> : null}
        <p className="mt-auto flex items-center gap-1.5 font-semibold text-mavet-blue" aria-hidden="true">
          {post.type === "hir" ? "Elolvasom" : "Részletek"}
          <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
        </p>
      </div>
    </article>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-7" aria-hidden="true">
      <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
      <div className="h-6 w-5/6 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
    </div>
  )
}
