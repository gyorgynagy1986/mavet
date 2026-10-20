import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Page number from the query string: 1-based, clamped to the available pages. */
export function parsePage(raw: string | string[] | undefined, total: number, pageSize: number): number {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const n = typeof raw === "string" ? Number.parseInt(raw, 10) : 1
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, pages)
}

/** "N találat · 1–50" with previous/next links; `href(page)` builds the link for a page. */
export function ListPager({ page, pageSize, total, href }: { page: number; pageSize: number; total: number; href: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p className="tabular-nums">
        {total} találat{total > 0 ? ` · ${from}–${to}. sor` : ""}{pages > 1 ? ` · ${page}/${pages}. oldal` : ""}
      </p>
      {pages > 1 ? (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Button variant="soft" size="sm" render={<Link href={href(page - 1)} />} nativeButton={false}>
              <ChevronLeftIcon data-icon="inline-start" aria-hidden="true" />
              Előző
            </Button>
          ) : (
            <Button variant="soft" size="sm" disabled><ChevronLeftIcon data-icon="inline-start" aria-hidden="true" />Előző</Button>
          )}
          {page < pages ? (
            <Button variant="soft" size="sm" render={<Link href={href(page + 1)} />} nativeButton={false}>
              Következő
              <ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="soft" size="sm" disabled>Következő<ChevronRightIcon data-icon="inline-end" aria-hidden="true" /></Button>
          )}
        </div>
      ) : null}
    </div>
  )
}
