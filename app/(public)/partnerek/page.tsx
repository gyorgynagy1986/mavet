import type { Metadata } from "next"
import { HandshakeIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PartnerTile } from "@/components/partners/partner-tile"
import { SiteContainer } from "@/components/site-container"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { getPartnersIntro, listPublishedPartners } from "@/lib/server/partners"

export const metadata: Metadata = { title: "Partnereink", description: "A MAVET együttműködő partnerei és támogatói." }
export const dynamic = "force-dynamic"

/** Partner list (3.4): every published partner, equal tiles; the external link opens in a new tab. No detail page. */
export default async function PartnersPage() {
  let partners: Awaited<ReturnType<typeof listPublishedPartners>> = []
  let intro = ""
  try {
    ;[partners, intro] = await Promise.all([listPublishedPartners(), getPartnersIntro()])
  } catch (error) {
    console.error("[partnerek] could not be loaded:", error)
  }
  return (
    <>
      <PageHeader title="Partnereink és támogatóink" description={intro || "A Társaság együttműködő partnerei és támogatói."} />
      <SiteContainer className="py-12 sm:py-16">
        {partners.length === 0 ? (
          <Empty className="min-h-72 border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><HandshakeIcon /></EmptyMedia>
              <EmptyTitle>Partnereink hamarosan</EmptyTitle>
              <EmptyDescription>Az együttműködő szervezetek bemutatása folyamatban van.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {partners.map((p) => (
              <li key={p.id}><PartnerTile partner={p} /></li>
            ))}
          </ul>
        )}
      </SiteContainer>
    </>
  )
}
