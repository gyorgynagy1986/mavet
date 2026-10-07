import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Pagination } from "@/components/pagination"
import { PostCard } from "@/components/posts/post-card"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { parsePage } from "@/lib/directory"
import { PAST_EVENTS_PATH, POSTS_PATH } from "@/lib/posts"
import { countPastEvents, listCurrentEvents, listNews } from "@/lib/server/posts"

// The two lists are paged through the address (?esemenyek=2&hirek=3) and events move to "past" on their own.
export const dynamic = "force-dynamic"

function href(events: number, news: number, anchor: string) {
  const params = new URLSearchParams()
  if (events > 1) params.set("esemenyek", String(events))
  if (news > 1) params.set("hirek", String(news))
  const qs = params.toString()
  return `${POSTS_PATH}${qs ? `?${qs}` : ""}#${anchor}`
}

/** Aktualitások (5.1): current events first, news below; without a current event the news come first. */
export default async function PostsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const now = new Date()
  const [events, news, pastCount] = await Promise.all([listCurrentEvents(parsePage(params.esemenyek), now), listNews(parsePage(params.hirek), now), countPastEvents(now)])

  return (
    <>
      <PageHeader title="Aktualitások" description="A MAVET legfrissebb hírei és közösségi eseményei." />
      <SiteContainer className="flex flex-col gap-14 py-12 sm:py-16">
        {events.total > 0 ? (
          <section aria-labelledby="esemenyek-cime" id="esemenyek" className="flex scroll-mt-24 flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="esemenyek-cime" className="text-2xl font-semibold tracking-tight sm:text-3xl">Események</h2>
              {pastCount > 0 ? <PastEventsLink /> : null}
            </div>
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.items.map((post) => (
                <li key={post.id}><PostCard post={post} /></li>
              ))}
            </ul>
            <Pagination page={events.page} pages={events.pages} label="Események lapozása" hrefFor={(n) => href(n, news.page, "esemenyek")} />
          </section>
        ) : null}

        <section aria-labelledby="hirek-cime" id="hirek" className="flex scroll-mt-24 flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="hirek-cime" className="text-2xl font-semibold tracking-tight sm:text-3xl">Hírek</h2>
            {events.total === 0 && pastCount > 0 ? <PastEventsLink /> : null}
          </div>
          {news.total === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Jelenleg nincs közzétett hír. Nézzen vissza később!</p>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {news.items.map((post) => (
                <li key={post.id}><PostCard post={post} /></li>
              ))}
            </ul>
          )}
          <Pagination page={news.page} pages={news.pages} label="Hírek lapozása" hrefFor={(n) => href(events.page, n, "hirek")} />
        </section>
      </SiteContainer>
    </>
  )
}

function PastEventsLink() {
  return (
    <Button variant="soft" render={<Link href={PAST_EVENTS_PATH} />} nativeButton={false}>
      Korábbi események
      <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
    </Button>
  )
}
