import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { getNewsItem, newsItems } from "@/lib/data/news"

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return newsItems.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const item = getNewsItem(slug)

  return item ? { title: item.title, description: item.excerpt } : {}
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params
  const item = getNewsItem(slug)

  if (!item) notFound()

  return (
    <SiteContainer className="max-w-3xl py-8 sm:py-10">
      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <time className="text-sm text-muted-foreground" dateTime={item.publishedAtIso}>
            {item.publishedAt}
          </time>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{item.title}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{item.excerpt}</p>
        </header>
          <div className="flex flex-col gap-5 leading-7 text-muted-foreground">
            {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <Button className="mt-2 w-fit" variant="outline" render={<Link href="/aktualitasok" />} nativeButton={false}>
            Vissza az aktualitásokhoz
          </Button>
      </article>
    </SiteContainer>
  )
}
