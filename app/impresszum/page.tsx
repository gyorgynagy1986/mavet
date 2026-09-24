import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { dataController, processors } from "@/lib/data/legal"

const hosting = processors[0]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
      <dt className="font-semibold text-mavet-navy">{label}</dt>
      <dd className="leading-7 text-muted-foreground">{children}</dd>
    </div>
  )
}

export default function ImprintPage() {
  const c = dataController
  return (
    <>
      <PageHeader title="Impresszum" description="A weboldal üzemeltetőjének és tárhelyszolgáltatójának adatai." />
      <SiteContainer className="flex max-w-4xl flex-col gap-12 py-12 sm:py-16">
        <section className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Üzemeltető</h2>
          <dl className="divide-y divide-border">
            <Row label="Név">{c.name} ({c.shortName})</Row>
            {c.seat && <Row label="Székhely">{c.seat}</Row>}
            {c.representative && <Row label="Képviselő">{c.representative}</Row>}
            {c.registrationCourt && <Row label="Nyilvántartó bíróság">{c.registrationCourt}</Row>}
            {c.registrationNumber && <Row label="Nyilvántartási szám">{c.registrationNumber}</Row>}
            {c.taxNumber && <Row label="Adószám">{c.taxNumber}</Row>}
            <Row label="E-mail">
              <a href={`mailto:${c.email}`} className="font-medium text-mavet-blue underline-offset-4 hover:underline">{c.email}</a>
            </Row>
            <Row label="Weboldal">{c.website.replace(/^https?:\/\//, "")}</Row>
          </dl>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Tárhelyszolgáltató</h2>
          <dl className="divide-y divide-border">
            <Row label="Név">{hosting.name}</Row>
            <Row label="Cím">{hosting.address}</Row>
            <Row label="Weboldal">
              <a href="https://vercel.com" className="font-medium text-mavet-blue underline-offset-4 hover:underline">vercel.com</a>
            </Row>
          </dl>
        </section>
      </SiteContainer>
    </>
  )
}
