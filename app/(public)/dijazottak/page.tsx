import type { Metadata } from "next"
import { AwardIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { getAwardsPage } from "@/lib/server/awards"

export const metadata: Metadata = { title: "Díjazottak és elismerések", description: "A MAVET díjai és díjazottjai díjtípusonként és évenként." }
// Rendered per request: a small query, and the admin's edit must show at once even for a visitor whose
// client-side router cache still holds the page (static pages stay cached there for minutes).
export const dynamic = "force-dynamic"

/** Díjazottak és elismerések (4.4): award types in two columns, each with its years newest first. */
export default async function AwardsPage() {
  let data: Awaited<ReturnType<typeof getAwardsPage>> = { intro: "", awards: [] }
  try {
    data = await getAwardsPage()
  } catch (error) {
    console.error("[dijazottak] could not be loaded:", error)
  }
  const { intro, awards } = data

  return (
    <>
      <PageHeader title="Díjazottak és elismerések" description={intro || "A vidékegészségügyért végzett munka elismerése díjtípusonként és évenként."} />
      <SiteContainer className="flex flex-col gap-8 py-12 sm:py-16">
        {awards.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">A díjak és díjazottak hamarosan itt lesznek olvashatók.</p>
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {awards.map((award) => (
              <li key={award.id} className="h-full">
                <section aria-labelledby={`dij-${award.id}`} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mavet-gold/20 text-mavet-navy" aria-hidden="true">
                      <AwardIcon className="size-5" />
                    </span>
                    <h2 id={`dij-${award.id}`} className="text-xl font-semibold tracking-tight text-balance text-mavet-navy">{award.name}</h2>
                  </div>
                  {award.description ? <p className="border-b border-border px-5 py-4 text-sm leading-6 text-muted-foreground sm:px-6">{award.description}</p> : null}
                  {award.entries.length > 0 ? (
                    <dl className="flex flex-1 flex-col divide-y divide-border">
                      {award.entries.map(({ year, names }) => (
                        <div key={year} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4 px-5 py-3 sm:px-6">
                          <dt className="text-sm font-semibold text-mavet-blue tabular-nums">{year}</dt>
                          <dd className="flex flex-wrap gap-x-5 gap-y-1">
                            {names.map((name, i) => <span key={`${name}-${i}`} className="font-medium">{name}</span>)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="px-5 py-4 text-sm text-muted-foreground italic sm:px-6">Díjazott még nincs.</p>
                  )}
                </section>
              </li>
            ))}
          </ul>
        )}
      </SiteContainer>
    </>
  )
}
