import Link from "next/link"
import { pageWindow } from "@/lib/directory"
import { cn } from "@/lib/utils"

/** Numbered pagination as plain links (2.2); renders nothing for a single page. */
export function Pagination({ page, pages, hrefFor, label }: { page: number; pages: number; hrefFor: (page: number) => string; label: string }) {
  if (pages <= 1) return null
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-1">
      {pageWindow(page, pages).map((n, index) =>
        n === 0 ? (
          <span key={`gap-${index}`} className="px-2 text-muted-foreground" aria-hidden="true">…</span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            scroll={false}
            aria-current={n === page ? "page" : undefined}
            aria-label={`${n}. oldal`}
            className={cn(
              "flex size-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors",
              n === page ? "border-mavet-navy bg-mavet-navy text-white" : "border-border text-mavet-navy hover:bg-muted",
            )}
          >
            {n}
          </Link>
        ),
      )}
    </nav>
  )
}
