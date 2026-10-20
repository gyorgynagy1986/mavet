import type { Metadata } from "next"
import Link from "next/link"
import { BookOpenIcon, LockIcon, SearchIcon } from "lucide-react"
import { MaterialRow } from "@/components/materials/material-row"
import { PageHeader } from "@/components/page-header"
import { Pagination } from "@/components/pagination"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { loginPathWithReturn } from "@/lib/auth-paths"
import { parsePage } from "@/lib/directory"
import { MATERIALS_PATH } from "@/lib/materials"
import { getViewer } from "@/lib/server/directory"
import { canOpenMembersOnly, listCategories, listPublishedMaterials } from "@/lib/server/materials"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Szakmai anyagok", description: "A MAVET ajánlásai, előadásai, publikációi, videói és dokumentumai." }
export const dynamic = "force-dynamic"

function href(q: string, category: string, page: number): string {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (category) params.set("kategoria", category)
  if (page > 1) params.set("oldal", String(page))
  const qs = params.toString()
  return `${MATERIALS_PATH}${qs ? `?${qs}` : ""}`
}

/** Szakmai anyagok (6.4): title search, category filter, numbered pages; members-only rows stay listed, locked. */
export default async function MaterialsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : ""
  const category = typeof params.kategoria === "string" ? params.kategoria.slice(0, 60) : ""
  const notice = params.hozzaferes === "tagi"
  const viewer = await getViewer()
  const [categories, result] = await Promise.all([listCategories(), listPublishedMaterials(viewer, q, category, parsePage(params.oldal))])
  const hasLocked = result.items.some((m) => m.locked)
  const filtering = Boolean(q || category)

  return (
    <>
      <PageHeader title="Szakmai anyagok" description="Ajánlások, előadások, publikációk, videók és dokumentumok. A tagi anyagokat bejelentkezett, aktív tagjaink nyithatják meg." />
      <SiteContainer className="flex flex-col gap-8 py-12 sm:py-16">
        {notice || hasLocked ? (
          viewer.kind === "guest" ? (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-mavet-surface px-5 py-4">
              <LockIcon className="size-5 shrink-0 text-mavet-blue" aria-hidden="true" />
              <p className="flex-1 text-sm leading-6">A zárolt anyagok csak a MAVET aktív tagjai számára érhetők el. Tagként jelentkezzen be a megnyitásukhoz.</p>
              <Button size="sm" render={<Link href={loginPathWithReturn(href(q, category, result.page))} />} nativeButton={false}>Bejelentkezés</Button>
            </div>
          ) : !canOpenMembersOnly(viewer) ? (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-mavet-surface px-5 py-4">
              <LockIcon className="size-5 shrink-0 text-mavet-blue" aria-hidden="true" />
              <p className="flex-1 text-sm leading-6">A tagi anyagokhoz aktív tagság kell. A tagsága állapotát a fiókjában látja.</p>
              {viewer.kind === "member" ? <Button size="sm" variant="soft" render={<Link href="/fiok" />} nativeButton={false}>Saját fiók</Button> : null}
            </div>
          ) : null
        ) : null}

        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" action={MATERIALS_PATH}>
          <div className="flex-1">
            <label htmlFor="q" className="mb-1.5 block text-sm font-medium">Keresés címre</label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="q" name="q" defaultValue={q} placeholder="Például: ajánlás" className="h-10 pl-9" />
            </div>
          </div>
          {categories.length > 0 ? (
            <div className="sm:w-64">
              <label htmlFor="kategoria" className="mb-1.5 block text-sm font-medium">Kategória</label>
              <select id="kategoria" name="kategoria" defaultValue={category} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="">Minden kategória</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" className="h-10">Szűrés</Button>
            {filtering ? <Button variant="ghost" className="h-10" render={<Link href={MATERIALS_PATH} />} nativeButton={false}>Törlés</Button> : null}
          </div>
        </form>

        {result.total === 0 ? (
          <Empty className="min-h-72 border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><BookOpenIcon /></EmptyMedia>
              <EmptyTitle>{filtering ? "Nincs a feltételeknek megfelelő anyag" : "Még nincs közzétett szakmai anyag"}</EmptyTitle>
              <EmptyDescription>{filtering ? "Próbáljon más keresőszót vagy kategóriát." : "Az anyagtár folyamatosan bővül; nézzen vissza később."}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-left">
              <thead className="bg-muted/60 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-5">Anyag</th>
                  <th scope="col" className="hidden px-4 py-3 md:table-cell">Kategória</th>
                  <th scope="col" className="hidden px-4 py-3 lg:table-cell">Forma</th>
                  <th scope="col" className="hidden px-4 py-3 md:table-cell">Dátum</th>
                  <th scope="col" className={cn("px-4 py-3 text-right sm:px-5")}><span className="sr-only">Művelet</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.items.map((item) => <MaterialRow key={item.id} item={item} />)}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={result.page} pages={result.pages} label="Szakmai anyagok lapozása" hrefFor={(n) => href(q, category, n)} />
      </SiteContainer>
    </>
  )
}
