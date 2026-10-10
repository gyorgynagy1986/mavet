import { PageHeader } from "@/components/page-header"
import { PostCardSkeleton } from "@/components/posts/post-card"
import { SiteContainer } from "@/components/site-container"

export default function PostsLoading() {
  return (
    <>
      <PageHeader title="Aktualitások" description="A MAVET legfrissebb hírei és közösségi eseményei." />
      <SiteContainer className="flex flex-col gap-6 py-12 sm:py-16">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Betöltés">
          {Array.from({ length: 3 }, (_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </SiteContainer>
    </>
  )
}
