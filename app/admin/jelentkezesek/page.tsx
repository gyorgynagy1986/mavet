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
import { UserModel, type MembershipStatus } from "@/lib/models/user"
import { MEMBERSHIP_STATUS_LABEL, membershipBadgeVariant } from "@/lib/server/admin-members"
import { categoryName, formatDateTime, fullName } from "@/lib/server/applications"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { StatusHelp } from "../status-help"
import { ListPager, parsePage } from "../list-pager"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Jelentkezések" }
export const dynamic = "force-dynamic"

const PAGE_SIZE = 50

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const requested = typeof params.allapot === "string" ? params.allapot : "bekuldott"
  const tab: MembershipApplicationStatus | "mind" =
    requested === "mind" ? "mind" : (membershipApplicationStatuses as readonly string[]).includes(requested) ? (requested as MembershipApplicationStatus) : "bekuldott"

  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : ""

  await dbConnect()
  const filter: Record<string, unknown> = tab === "mind" ? {} : { status: tab }
  if (q) {
    const re = new RegExp(escapeRegex(q), "i")
    filter.$or = [{ lastName: re }, { firstName: re }, { email: re }]
  }
  const [counts, matching] = await Promise.all([
    MembershipApplicationModel.aggregate<{ _id: MembershipApplicationStatus; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    MembershipApplicationModel.countDocuments(filter),
  ])
  const page = parsePage(params.oldal, matching, PAGE_SIZE)
  const rows = await MembershipApplicationModel.find(filter)
    .sort(tab === "bekuldott" ? { submittedAt: 1 as const } : { lastActivityAt: -1 as const })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .select({ title: 1, lastName: 1, firstName: 1, email: 1, category: 1, status: 1, createdAt: 1, submittedAt: 1, lastActivityAt: 1, reminders: 1 })
    .lean<MembershipApplicationDocument[]>()
  const countByStatus = new Map(counts.map((c) => [c._id, c.n]))
  const total = counts.reduce((sum, c) => sum + c.n, 0)
  const pageHref = (n: number) => `${ADMIN_HOME_PATH}/jelentkezesek?allapot=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}${n > 1 ? `&oldal=${n}` : ""}`

  // Accepted applications live on in the Tagok menu; show that membership state here too, so an admin
  // can tell at a glance who has not set a password yet without opening each application.
  const acceptedIds = rows.filter((r) => r.status === "elfogadva").map((r) => r._id)
  const members = acceptedIds.length
    ? await UserModel.find({ "membership.applicationId": { $in: acceptedIds } }).select({ "membership.applicationId": 1, "membership.status": 1 }).lean<{ membership?: { applicationId?: { toString(): string }; status?: MembershipStatus } }[]>()
    : []
  const memberStatusByApp = new Map<string, MembershipStatus>()
  for (const m of members) if (m.membership?.applicationId && m.membership.status) memberStatusByApp.set(m.membership.applicationId.toString(), m.membership.status)

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
              href={`${ADMIN_HOME_PATH}/jelentkezesek?allapot=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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

      <form className="flex max-w-md gap-2" action={`${ADMIN_HOME_PATH}/jelentkezesek`}>
        <input type="hidden" name="allapot" value={tab} />
        <Input name="q" defaultValue={q} placeholder="Keresés névre vagy e-mail-címre" aria-label="Keresés" className="h-9" />
        <Button type="submit" variant="soft" className="h-9">Keresés</Button>
        {q ? <Button variant="ghost" className="h-9" render={<Link href={`${ADMIN_HOME_PATH}/jelentkezesek?allapot=${tab}`} />} nativeButton={false}>Törlés</Button> : null}
      </form>

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
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={statusBadgeVariant(row.status)}>{APPLICATION_STATUS_SHORT[row.status]}</Badge>
                      {row.status === "elfogadva" ? (() => {
                        const ms = memberStatusByApp.get(row._id.toString())
                        if (!ms) return <Badge variant="outline">tagi fiók törölve</Badge>
                        if (ms === "aktivalasra_var") return <Badge variant="destructive">jelszót még nem adott</Badge>
                        return <Badge variant={membershipBadgeVariant(ms)}>{MEMBERSHIP_STATUS_LABEL[ms].toLowerCase()}</Badge>
                      })() : null}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{formatDateTime(row.createdAt)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{row.submittedAt ? formatDateTime(row.submittedAt) : "–"}</td>
                  <td className="px-4 py-2.5 tabular-nums">{row.reminders?.length ? `${row.reminders.length}×` : "–"}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">{q ? "Nincs találat a keresésre." : "Nincs jelentkezés ebben az állapotban."}</td></tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <ListPager page={page} pageSize={PAGE_SIZE} total={matching} href={pageHref} />

      <StatusHelp
        title="Súgó: mit jelentenek a fülek?"
        intro="A jelentkezés két lépésből áll: a rövid űrlap után a jelentkező e-mailben linket kap, azon tölti ki a teljes adatlapot, és csak a véglegesítés után kerül elbírálásra."
        items={[
          { label: "Elbírálásra vár", description: "A jelentkező véglegesítette a teljes adatlapot. Itt kell dönteni: megnyitás, majd Elfogadás (a kategória felülírható) vagy Elutasítás indoklással. A döntésről a jelentkező azonnal levelet kap." },
          { label: "Folyamatban", description: "A jelentkező rákattintott a linkre (az e-mail-címe ellenőrzött), de az adatlapot még nem véglegesítette. A rendszer 7, majd 14 nap után automatikusan emlékeztetőt küld; kézzel is küldhető emlékeztető vagy új link." },
          { label: "Előzetes", description: "Csak a rövid űrlapot küldte be, a linkre még nem kattintott, ezért az e-mail-címe nem ellenőrzött. Ide tartoznak a weboldal indulása előtti előzetes jelentkezők is; nekik a részletezőből küldhető a folytató link." },
          { label: "Elfogadva", description: "Elfogadott jelentkezés. Ebből tagi fiók jött létre, a jelentkező aktiváló (jelszóbeállító) linket kapott. A második címke a tagi fiók állapota: „jelszót még nem adott” = még nem kattintott az aktiváló linkre; ilyenkor a részletezőn vagy a Tagok oldalon újraküldhető a link." },
          { label: "Elutasítva", description: "Elutasított jelentkezés. A jelentkező levelet kapott a megadott indoklással, és ugyanazzal az e-mail-címmel új jelentkezést indíthat." },
          { label: "Lezárva", description: "Döntés nélkül lezárt jelentkezés (például a jelentkező visszalépett vagy törlést kért). A linkje érvénytelen, levél nem megy ki." },
          { label: "Mind", description: "Minden jelentkezés állapottól függetlenül." },
        ]}
      />
    </div>
  )
}
