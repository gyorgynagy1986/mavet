import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import { AWARDS_PATH, entriesToText } from "@/lib/awards"
import { getAwardsIntro, listAwardDocuments } from "@/lib/server/awards"
import { Button } from "@/components/ui/button"
import { AwardsEditor } from "./awards-editor"

export const metadata: Metadata = { title: "Díjazottak" }
export const dynamic = "force-dynamic"

export default async function AdminAwardsPage() {
  const [awards, intro] = await Promise.all([listAwardDocuments(), getAwardsIntro()])
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Tartalom</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Díjazottak és elismerések</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Díjtípusok leírással és a díjazottak évenként. A díjazotti bejegyzés nem hoz létre tagi fiókot és nem hivatkozik tagi profilra. Fénykép és életrajz csak adatkezelési hozzájárulással tehető közzé; az oldal most csak neveket mutat.</p>
        </div>
        <Button variant="soft" render={<Link href={AWARDS_PATH} target="_blank" />} nativeButton={false}>
          Publikus oldal
          <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </header>
      <AwardsEditor
        intro={intro}
        awards={awards.map((a) => ({
          id: a._id.toString(),
          name: a.name,
          description: a.description ?? "",
          entriesText: entriesToText((a.entries ?? []).map((e) => ({ year: e.year, names: [...(e.names ?? [])] }))),
          hidden: a.hidden === true,
        }))}
      />
    </div>
  )
}
