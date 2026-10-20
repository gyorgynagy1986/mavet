import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import { PARTNERS_PATH } from "@/lib/partners"
import { getPartnersIntro, listAllPartners } from "@/lib/server/partners"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { Button } from "@/components/ui/button"
import { PartnersEditor } from "./partners-editor"

export const metadata: Metadata = { title: "Partnerek" }
export const dynamic = "force-dynamic"

export default async function AdminPartnersPage() {
  const [partners, intro] = await Promise.all([listAllPartners(), getPartnersIntro()])
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Tartalom</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Partnereink és támogatóink</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">A közzétett partnerek a Partnereink oldalon jelennek meg, a kiemeltek a főoldali logósávban is. Közzététel előtt logó kell. A sorrend itt állítható.</p>
        </div>
        <Button variant="soft" render={<Link href={PARTNERS_PATH} target="_blank" />} nativeButton={false}>
          Publikus oldal
          <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </header>
      <PartnersEditor
        intro={intro}
        storageConfigured={isBlobConfigured()}
        partners={partners.map((p) => ({ id: p._id.toString(), name: p.name, websiteUrl: p.websiteUrl ?? "", logoUrl: p.logo?.url ?? null, featured: p.featured === true, published: p.published === true }))}
      />
    </div>
  )
}
