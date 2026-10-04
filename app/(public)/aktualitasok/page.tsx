import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { newsItems } from "@/lib/data/news"
import Link from "next/link"

export default function NewsPage() {
  return (
    <>
      <PageHeader title="Aktualitások" description="A MAVET legfrissebb hírei és közösségi eseményei." />
      <SiteContainer className="py-12 sm:py-16">
        <section aria-labelledby="hirek-cime" className="grid gap-4 md:grid-cols-2">
          <h2 id="hirek-cime" className="sr-only">Hírek</h2>
          {newsItems.map((item) => (
            <article key={item.slug}>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <CardDescription>{item.publishedAt}</CardDescription>
                  <CardTitle className="text-xl leading-7">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col items-start gap-5">
                  <p className="leading-7 text-muted-foreground">{item.excerpt}</p>
                  <Button variant="soft" render={<Link href={`/aktualitasok/${item.slug}`} />} nativeButton={false}>
                    Elolvasom
                  </Button>
                </CardContent>
              </Card>
            </article>
          ))}
        </section>
      </SiteContainer>
    </>
  )
}
