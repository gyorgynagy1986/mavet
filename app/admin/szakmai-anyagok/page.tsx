import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon, TagsIcon } from "lucide-react"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { MATERIAL_ACCESS_LABEL, MATERIAL_KIND_LABEL, MATERIAL_STATUS_LABEL, materialStatuses, type MaterialStatus } from "@/lib/materials"
import { MaterialModel, type MaterialDocument } from "@/lib/models/material"
import { listCategories } from "@/lib/server/materials"
import { formatDateTime } from "@/lib/server/applications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ListPager, parsePage } from "../list-pager"
import { StatusHelp } from "../status-help"

export const metadata: Metadata = { title: "Szakmai anyagok" }
export const dynamic = "force-dynamic"

const BASE = `${ADMIN_HOME_PATH}/szakmai-anyagok`
const PAGE_SIZE = 50
const TABS: { key: MaterialStatus | "mind"; label: string }[] = [
  { key: "kozzetett", label: "Közzétéve" },
  { key: "rejtett", label: "Rejtett" },
  { key: "mind", label: "Mind" },
]

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export default async function AdminMaterialsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const requested = typeof params.allapot === "string" ? params.allapot : "kozzetett"
  const tab: MaterialStatus | "mind" = requested === "mind" ? "mind" : (materialStatuses as readonly string[]).includes(requested) ? (requested as MaterialStatus) : "kozzetett"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : ""

  await dbConnect()
  const filter: Record<string, unknown> = tab === "mind" ? {} : { status: tab }
  if (q) filter.title = new RegExp(escapeRegex(q), "i")
  const [counts, matching, categories] = await Promise.all([
    MaterialModel.aggregate<{ _id: MaterialStatus; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    MaterialModel.countDocuments(filter),
    listCategories(),
  ])
  const page = parsePage(params.oldal, matching, PAGE_SIZE)
  const rows = await MaterialModel.find(filter).sort({ publishedDate: -1, updatedAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean<MaterialDocument[]>()
  const countByStatus = new Map(counts.map((c) => [c._id, c.n]))
  const total = counts.reduce((sum, c) => sum + c.n, 0)
  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const pageHref = (n: number) => `${BASE}?allapot=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}${n > 1 ? `&oldal=${n}` : ""}`

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Tartalom</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Szakmai anyagok</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Ajánlások, előadások, publikációk, videók és dokumentumok. Új anyag rejtett, amíg közzé nem teszi; a tagi anyagot csak aktív tag nyithatja meg.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href={`${BASE}/uj`} />} nativeButton={false}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Új anyag
          </Button>
          <Button variant="soft" render={<Link href={`${BASE}/kategoriak`} />} nativeButton={false}>
            <TagsIcon data-icon="inline-start" aria-hidden="true" />
            Kategóriák
          </Button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-border" aria-label="Állapot szerinti szűrés">
        {TABS.map((t) => {
          const n = t.key === "mind" ? total : (countByStatus.get(t.key as MaterialStatus) ?? 0)
          const active = tab === t.key
          return (
            <Link key={t.key} href={`${BASE}?allapot=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={active ? "page" : undefined}
              className={cn("-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors", active ? "border-mavet-gold text-mavet-navy" : "border-transparent text-muted-foreground hover:text-mavet-navy")}>
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-mavet-gold/20 text-mavet-navy" : "bg-muted text-muted-foreground")}>{n}</span>
            </Link>
          )
        })}
      </nav>

      <form className="flex max-w-md gap-2" action={BASE}>
        <input type="hidden" name="allapot" value={tab} />
        <Input name="q" defaultValue={q} placeholder="Keresés címre" aria-label="Keresés" className="h-9" />
        <Button type="submit" variant="soft" className="h-9">Keresés</Button>
        {q ? <Button variant="ghost" className="h-9" render={<Link href={`${BASE}?allapot=${tab}`} />} nativeButton={false}>Törlés</Button> : null}
      </form>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">Cím</th>
                <th className="px-4 py-2.5">Kategória</th>
                <th className="px-4 py-2.5">Forma</th>
                <th className="px-4 py-2.5">Hozzáférés</th>
                <th className="px-4 py-2.5">Állapot</th>
                <th className="px-4 py-2.5">Dátum</th>
                <th className="px-4 py-2.5">Módosítva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((m) => (
                <tr key={m._id.toString()} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <Link href={`${BASE}/${m._id.toString()}`} className="font-semibold text-mavet-navy underline-offset-4 hover:underline">{m.title}</Link>
                    {m.author ? <div className="text-xs text-muted-foreground">{m.author}</div> : null}
                  </td>
                  <td className="px-4 py-2.5">{m.categoryId ? (categoryName.get(m.categoryId.toString()) ?? "–") : <span className="text-muted-foreground">nincs</span>}</td>
                  <td className="px-4 py-2.5">{MATERIAL_KIND_LABEL[m.kind]}{m.kind === "dokumentum" ? (m.documentSource === "link" ? " · link" : m.file?.url ? " · fájl" : " · nincs fájl") : m.videoProvider === "bunny" ? " · Bunny" : " · YouTube"}</td>
                  <td className="px-4 py-2.5">{m.access === "tagi" ? <Badge variant="secondary">{MATERIAL_ACCESS_LABEL.tagi}</Badge> : MATERIAL_ACCESS_LABEL.publikus}</td>
                  <td className="px-4 py-2.5"><Badge variant={m.status === "kozzetett" ? "default" : "outline"}>{MATERIAL_STATUS_LABEL[m.status]}</Badge></td>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{m.publishedDate ?? "–"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{formatDateTime(m.updatedAt)}</td>
                </tr>
              ))}
              {rows.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">{q ? "Nincs találat a keresésre." : "Nincs anyag ebben az állapotban."}</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <ListPager page={page} pageSize={PAGE_SIZE} total={matching} href={pageHref} />

      <StatusHelp
        title="Súgó: hogyan működik a szakmai anyagtár?"
        intro="Egy anyag egy kategóriába tartozik (csak szűrésre szolgál), formája dokumentum vagy videó, hozzáférése publikus vagy csak aktív tagoknak."
        items={[
          { label: "Rejtett", description: "Nem szerepel a publikus listában, a fájlja másnak nem érhető el. Új anyag ilyen; az elrejtés nem törlés." },
          { label: "Közzétéve", description: "Látszik a listában. Közzétételhez cím, kategória, összefoglaló és a dokumentum (fájl vagy link) vagy videó kell." },
          { label: "Publikus", description: "Bárki megnyithatja." },
          { label: "Csak aktív tagoknak", description: "A kártya (cím, összefoglaló) mindenkinek látszik, zárolva; megnyitni csak bejelentkezett, aktív tag tudja. A fájl megnyitásakor a rendszer újra ellenőrzi a jogosultságot." },
          { label: "Videó", description: "Publikus videó YouTube-ról, beágyazva. A tokennel védett Bunny.net lejátszás elő van készítve, de még nincs bekötve; amíg nincs, tagi videónál is YouTube (nem listázott) videót használjon." },
          { label: "Fájlok", description: "PDF, Word, PowerPoint, Excel, legfeljebb 25 MB; a böngészőből közvetlenül a tárolóba megy. Anyag törlésekor a fájl is törlődik." },
        ]}
      />
    </div>
  )
}
