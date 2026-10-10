import Link from "next/link"
import { redirect } from "next/navigation"
import { SearchIcon, UsersRoundIcon, XIcon } from "lucide-react"
import { MemberCard } from "@/components/members/member-card"
import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { MEMBER_ACCOUNT_PATH, MEMBER_DIRECTORY_PATH, loginPathWithReturn } from "@/lib/auth-paths"
import { pageWindow, parsePage } from "@/lib/directory"
import { canUseDirectory, getViewer, listDirectory } from "@/lib/server/directory"
import { cn } from "@/lib/utils"
import { DirectoryRestricted } from "./restricted"

export const dynamic = "force-dynamic"

function pageHref(query: string, page: number) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (page > 1) params.set("oldal", String(page))
  const qs = params.toString()
  return qs ? `${MEMBER_DIRECTORY_PATH}?${qs}` : MEMBER_DIRECTORY_PATH
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const viewer = await getViewer()
  const params = await searchParams
  const rawQuery = Array.isArray(params.q) ? (params.q[0] ?? "") : (params.q ?? "")
  const query = rawQuery.trim().slice(0, 80)
  if (viewer.kind === "guest") redirect(loginPathWithReturn(pageHref(query, parsePage(params.oldal))))
  if (!canUseDirectory(viewer)) return <DirectoryRestricted admin={viewer.kind === "admin"} />

  const { members, total, page, pages } = await listDirectory(query, parsePage(params.oldal))

  return (
    <>
      <PageHeader title="Tagi névjegyzék" description="A Társaság aktív tagjai, akik engedélyezték a megjelenésüket. A névjegyzéket csak bejelentkezett, aktív tagok látják." />
      <SiteContainer className="flex flex-col gap-6 py-10 sm:py-14">
        <form action={MEMBER_DIRECTORY_PATH} method="get" role="search" className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="directory-search" className="text-sm font-semibold">Keresés név szerint</label>
            <Input id="directory-search" type="search" name="q" defaultValue={query} placeholder="Például: Kovács" maxLength={80} autoComplete="off" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              <SearchIcon data-icon="inline-start" aria-hidden="true" />
              Keresés
            </Button>
            {query ? (
              <Button variant="outline" render={<Link href={MEMBER_DIRECTORY_PATH} />} nativeButton={false}>
                <XIcon data-icon="inline-start" aria-hidden="true" />
                Keresés törlése
              </Button>
            ) : null}
          </div>
        </form>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {query ? `${total} találat erre: „${query}”` : `${total} tag a névjegyzékben`}
          {pages > 1 ? ` · ${page}. oldal a ${pages}-ból` : ""}
        </p>

        {members.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersRoundIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>{query ? "Nincs találat" : "A névjegyzék még üres"}</EmptyTitle>
              <EmptyDescription>
                {query
                  ? "Erre a névre nem találtunk megjelenést engedélyező aktív tagot. Próbálja a név egy részletével."
                  : "Még egyetlen tag sem engedélyezte a megjelenését. A saját megjelenését a profiljában kapcsolhatja be."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {query ? (
                <Button variant="outline" render={<Link href={MEMBER_DIRECTORY_PATH} />} nativeButton={false}>Keresés törlése</Button>
              ) : (
                <Button variant="outline" render={<Link href={`${MEMBER_ACCOUNT_PATH}/profil`} />} nativeButton={false}>Profil és megjelenés</Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <li key={member.id}>
                <MemberCard member={member} />
              </li>
            ))}
          </ul>
        )}

        {pages > 1 ? (
          <nav aria-label="Lapozás" className="flex flex-wrap items-center justify-center gap-1">
            {pageWindow(page, pages).map((n, index) =>
              n === 0 ? (
                <span key={`gap-${index}`} className="px-2 text-muted-foreground" aria-hidden="true">…</span>
              ) : (
                <Link
                  key={n}
                  href={pageHref(query, n)}
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
        ) : null}
      </SiteContainer>
    </>
  )
}
