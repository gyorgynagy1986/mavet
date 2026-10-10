import type { Metadata } from "next"
import Link from "next/link"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import {
  MembershipApplicationModel,
  membershipApplicationStatuses,
  type MembershipApplicationDocument,
  type MembershipApplicationStatus,
} from "@/lib/models/membership-application"
import { APPLICATION_LIST_TABS, APPLICATION_STATUS_SHORT, statusBadgeVariant } from "@/lib/server/admin-applications"
import { categoryName, formatDateTime, fullName } from "@/lib/server/applications"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { StatusHelp } from "../status-help"

export const metadata: Metadata = { title: "Jelentkezések" }
export const dynamic = "force-dynamic"

const PAGE_SIZE = 50

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const requested = typeof params.allapot === "string" ? params.allapot : "bekuldott"
  const tab: MembershipApplicationStatus | "mind" =
    requested === "mind" ? "mind" : (membershipApplicationStatuses as readonly string[]).includes(requested) ? (requested as MembershipApplicationStatus) : "bekuldott"

  await dbConnect()
  const [counts, rows] = await Promise.all([
    MembershipApplicationModel.aggregate<{ _id: MembershipApplicationStatus; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    MembershipApplicationModel.find(tab === "mind" ? {} : { status: tab })
      .sort(tab === "bekuldott" ? { submittedAt: 1 as const } : { lastActivityAt: -1 as const })
      .limit(PAGE_SIZE)
      .select({ title: 1, lastName: 1, firstName: 1, email: 1, category: 1, status: 1, createdAt: 1, submittedAt: 1, lastActivityAt: 1, reminders: 1 })
      .lean<MembershipApplicationDocument[]>(),
  ])
  const countByStatus = new Map(counts.map((c) => [c._id, c.n]))
  const total = counts.reduce((sum, c) => sum + c.n, 0)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Tagság</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Jelentkezések</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Az elbírálásra váró jelentkezések a véglegesítés sorrendjében. A folyamatban lévők még nem véglegesítették az adatlapot; nekik a rendszer automatikusan emlékeztetőt küld.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-border" aria-label="Állapot szerinti szűrés">
        {APPLICATION_LIST_TABS.map((t) => {
          const n = t.key === "mind" ? total : (countByStatus.get(t.key as MembershipApplicationStatus) ?? 0)
          const active = tab === t.key
          return (
            <Link
              key={t.key}
              href={`${ADMIN_HOME_PATH}/jelentkezesek?allapot=${t.key}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                active ? "border-mavet-gold text-mavet-navy" : "border-transparent text-muted-foreground hover:text-mavet-navy",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-mavet-gold/20 text-mavet-navy" : "bg-muted text-muted-foreground")}>{n}</span>
            </Link>
          )
        })}
      </nav>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5">Név</th>
                <th scope="col" className="px-4 py-2.5">Kategória</th>
                <th scope="col" className="px-4 py-2.5">Állapot</th>
                <th scope="col" className="px-4 py-2.5">Indítva</th>
                <th scope="col" className="px-4 py-2.5">Véglegesítve</th>
                <th scope="col" className="px-4 py-2.5">Emlékeztető</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row._id.toString()} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <Link href={`${ADMIN_HOME_PATH}/jelentkezesek/${row._id.toString()}`} className="font-semibold text-mavet-navy underline-offset-4 hover:underline">
                      {fullName(row)}
                    </Link>
                    <div className="text-xs text-muted-foreground">{row.email}</div>
                  </td>
                  <td className="px-4 py-2.5">{categoryName(row.category)}</td>
                  <td className="px-4 py-2.5"><Badge variant={statusBadgeVariant(row.status)}>{APPLICATION_STATUS_SHORT[row.status]}</Badge></td>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{formatDateTime(row.createdAt)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{row.submittedAt ? formatDateTime(row.submittedAt) : "–"}</td>
                  <td className="px-4 py-2.5 tabular-nums">{row.reminders?.length ? `${row.reminders.length}×` : "–"}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Nincs jelentkezés ebben az állapotban.</td></tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {rows.length === PAGE_SIZE ? <p className="text-sm text-muted-foreground">Az első {PAGE_SIZE} találat látható.</p> : null}

      <StatusHelp
        title="Súgó: mit jelentenek a fülek?"
        intro="A jelentkezés két lépésből áll: a rövid űrlap után a jelentkező e-mailben linket kap, azon tölti ki a teljes adatlapot, és csak a véglegesítés után kerül elbírálásra."
        items={[
          { label: "Elbírálásra vár", description: "A jelentkező véglegesítette a teljes adatlapot. Itt kell dönteni: megnyitás, majd Elfogadás (a kategória felülírható) vagy Elutasítás indoklással. A döntésről a jelentkező azonnal levelet kap." },
          { label: "Folyamatban", description: "A jelentkező rákattintott a linkre (az e-mail-címe ellenőrzött), de az adatlapot még nem véglegesítette. A rendszer 7, majd 14 nap után automatikusan emlékeztetőt küld; kézzel is küldhető emlékeztető vagy új link." },
          { label: "Előzetes", description: "Csak a rövid űrlapot küldte be, a linkre még nem kattintott, ezért az e-mail-címe nem ellenőrzött. Ide tartoznak a weboldal indulása előtti előzetes jelentkezők is; nekik a részletezőből küldhető a folytató link." },
          { label: "Elfogadva", description: "Elfogadott jelentkezés. Ebből tagi fiók jött létre, a jelentkező aktiváló linket kapott; az aktiválás állapota a részletezőn és a Tagok oldalon látszik." },
          { label: "Elutasítva", description: "Elutasított jelentkezés. A jelentkező levelet kapott a megadott indoklással, és ugyanazzal az e-mail-címmel új jelentkezést indíthat." },
          { label: "Lezárva", description: "Döntés nélkül lezárt jelentkezés (például a jelentkező visszalépett vagy törlést kért). A linkje érvénytelen, levél nem megy ki." },
          { label: "Mind", description: "Minden jelentkezés állapottól függetlenül." },
        ]}
      />
    </div>
  )
}
