import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon, StarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { PostModel, type PostDocument } from "@/lib/models/post"
import { POST_STATUS_LABEL, POST_TYPE_LABEL, budapestDate, eventPhase, formatEventWhen, formatHuDate, postTypes, type PostType } from "@/lib/posts"
import { formatDateTime } from "@/lib/server/applications"
import { cn } from "@/lib/utils"
import { StatusHelp } from "../status-help"

export const metadata: Metadata = { title: "Aktualitások" }
export const dynamic = "force-dynamic"

const BASE = `${ADMIN_HOME_PATH}/aktualitasok`
const TABS: { key: PostType; label: string }[] = [
  { key: "hir", label: "Hírek" },
  { key: "esemeny", label: "Események" },
]

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const tab: PostType = (postTypes as readonly string[]).includes(String(params.tipus)) ? (params.tipus as PostType) : "hir"

  await dbConnect()
  const [counts, rows] = await Promise.all([
    PostModel.aggregate<{ _id: PostType; n: number }>([{ $group: { _id: "$type", n: { $sum: 1 } } }]),
    PostModel.find({ type: tab })
      .sort(tab === "hir" ? { status: 1, publishedAt: -1, _id: -1 } : { startsAt: -1, _id: -1 })
      .limit(200)
      .lean<PostDocument[]>(),
  ])
  const count = new Map(counts.map((c) => [c._id, c.n]))
  const now = new Date()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Tartalom</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Aktualitások</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Hírek és események létrehozása, szerkesztése, közzététele és visszavonása. Csak a közzétett bejegyzés látszik az oldalon.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href={`${BASE}/uj?tipus=hir`} />} nativeButton={false}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Új hír
          </Button>
          <Button variant="soft" render={<Link href={`${BASE}/uj?tipus=esemeny`} />} nativeButton={false}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Új esemény
          </Button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-border" aria-label="Típus szerinti szűrés">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <Link key={t.key} href={`${BASE}?tipus=${t.key}`} aria-current={active ? "page" : undefined}
              className={cn("-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors", active ? "border-mavet-gold text-mavet-navy" : "border-transparent text-muted-foreground hover:text-mavet-navy")}>
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-mavet-gold/20 text-mavet-navy" : "bg-muted text-muted-foreground")}>{count.get(t.key) ?? 0}</span>
            </Link>
          )
        })}
      </nav>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">Cím</th>
                <th className="px-4 py-2.5">Állapot</th>
                <th className="px-4 py-2.5">{tab === "hir" ? "Dátum" : "Időpont"}</th>
                <th className="px-4 py-2.5">Utoljára módosítva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((post) => {
                const phase = post.type === "esemeny" && post.startsAt && post.endsAt ? eventPhase({ startsAt: post.startsAt, endsAt: post.endsAt }, now) : null
                return (
                  <tr key={post._id.toString()} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <Link href={`${BASE}/${post._id.toString()}`} className="font-semibold text-mavet-navy underline-offset-4 hover:underline">{post.title}</Link>
                      {post.featured ? (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-mavet-gold/25 px-2 py-0.5 text-xs font-semibold text-mavet-navy">
                          <StarIcon className="size-3" aria-hidden="true" />
                          Főoldalon kiemelt
                        </span>
                      ) : null}
                      <div className="text-xs text-muted-foreground">/aktualitasok/{post.slug}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={post.status === "kozzetett" ? "default" : "outline"}>{POST_STATUS_LABEL[post.status]}</Badge>
                        {phase === "korabbi" ? <Badge variant="secondary">Korábbi</Badge> : null}
                        {phase === "folyamatban" ? <Badge variant="secondary">Most zajlik</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">
                      {post.type === "esemeny"
                        ? post.startDate ? formatEventWhen({ startDate: post.startDate, startTime: post.startTime, endDate: post.endDate, endTime: post.endTime }) : "–"
                        : post.publishedAt ? formatHuDate(budapestDate(post.publishedAt)) : "–"}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground tabular-nums">{formatDateTime(post.updatedAt)}</td>
                  </tr>
                )
              })}
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Még nincs {POST_TYPE_LABEL[tab].toLowerCase()}. Hozzon létre egyet a fenti gombbal.</td></tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <StatusHelp
        title="Súgó: hogyan működik a közzététel?"
        intro="Egy bejegyzés addig piszkozat, amíg közzé nem teszi. A piszkozatot csak az adminisztrátorok látják."
        items={[
          { label: "Piszkozat", description: "Nem látszik az oldalon, közvetlen hivatkozással sem. Elég hozzá egy cím, a többi később is kitölthető." },
          { label: "Közzétéve", description: "Megjelenik az Aktualitások oldalon és a főoldali előnézetben. Közzétételhez cím, összefoglaló és szöveg kell, eseménynél kezdő dátum is." },
          { label: "Visszavonás", description: "A közzétett bejegyzés bármikor visszavonható: eltűnik a listákból és a főoldalról, a hivatkozása sem nyílik meg. Nem törlődik, később újra közzétehető." },
          { label: "Korábbi esemény", description: "A véget ért esemény magától átkerül a Korábbi események közé. Az oldala megmarad, a jelentkezési gomb eltűnik róla." },
          { label: "Főoldali kiemelés", description: "Egyszerre egy közzétett hír vagy aktuális esemény emelhető ki; ez kerül a főoldali előnézet első, nagy helyére. Kiemelés nélkül a helyek automatikusan töltődnek." },
        ]}
      />
    </div>
  )
}
