import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Pagination } from "@/components/pagination"
import { PostCard } from "@/components/posts/post-card"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { parsePage } from "@/lib/directory"
import { PAST_EVENTS_PATH, POSTS_PATH } from "@/lib/posts"
import { listPastEvents } from "@/lib/server/posts"

export const metadata: Metadata = { title: "Korábbi események", description: "A MAVET korábbi eseményei." }
export const dynamic = "force-dynamic"

/** Past events (5.1): reachable even when there is no current event, with a way back to the current list. */
export default async function PastEventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const events = await listPastEvents(parsePage(params.oldal))

  return (
    <>
      <PageHeader title="Korábbi események" description="A Társaság már lezajlott eseményei. A leírások továbbra is olvashatók." />
      <SiteContainer className="flex flex-col gap-6 py-12 sm:py-16">
        <Button variant="soft" className="w-fit" render={<Link href={POSTS_PATH} />} nativeButton={false}>
          <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          Vissza az aktualitásokhoz
        </Button>
        {events.total === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Még nincs korábbi esemény.</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.items.map((post) => (
              <li key={post.id}><PostCard post={post} /></li>
            ))}
          </ul>
        )}
        <Pagination page={events.page} pages={events.pages} label="Korábbi események lapozása" hrefFor={(n) => (n > 1 ? `${PAST_EVENTS_PATH}?oldal=${n}` : PAST_EVENTS_PATH)} />
      </SiteContainer>
    </>
  )
}
