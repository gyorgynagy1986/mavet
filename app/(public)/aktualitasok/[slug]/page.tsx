import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { PostArticle } from "@/components/posts/post-article"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { PAST_EVENTS_PATH, POSTS_PATH } from "@/lib/posts"
import { getPublishedPost, listPublishedSlugs } from "@/lib/server/posts"

type Props = { params: Promise<{ slug: string }> }

/**
 * Static page per post, rebuilt when the admin saves, publishes or withdraws it (`revalidatePosts`).
 * The ten-minute revalidation moves a finished event to "past" and removes its registration link.
 */
export const revalidate = 600

export async function generateStaticParams() {
  try {
    return (await listPublishedSlugs()).map(({ slug }) => ({ slug }))
  } catch {
    // No database at build time: the pages are generated on first request instead.
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug).catch(() => null)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: post.href },
    openGraph: { title: post.title, description: post.excerpt || undefined, type: "article", images: post.imageUrl ? [post.imageUrl] : undefined },
  }
}

/** Only published content is readable (5.3): a draft or withdrawn post answers "not found" even by direct link. */
export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) notFound()
  const past = post.event?.phase === "korabbi"

  return (
    <SiteContainer className="flex max-w-3xl flex-col gap-8 py-8 sm:py-10">
      <PostArticle post={post} />
      <Button className="w-fit" variant="soft" render={<Link href={past ? PAST_EVENTS_PATH : POSTS_PATH} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
        {past ? "Vissza a korábbi eseményekhez" : "Vissza az aktualitásokhoz"}
      </Button>
    </SiteContainer>
  )
}
