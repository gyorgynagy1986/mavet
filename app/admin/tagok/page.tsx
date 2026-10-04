import type { Metadata } from "next"
import Link from "next/link"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { UserModel, membershipStatuses, type MembershipStatus, type UserDocument } from "@/lib/models/user"
import { MEMBER_LIST_TABS, MEMBERSHIP_STATUS_LABEL, membershipBadgeVariant } from "@/lib/server/admin-members"
import { categoryName, formatDateTime } from "@/lib/server/applications"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StatusHelp } from "../status-help"

export const metadata: Metadata = { title: "Tagok" }
export const dynamic = "force-dynamic"

const PAGE_SIZE = 50

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export default async function MembersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const requested = typeof params.allapot === "string" ? params.allapot : "aktiv"
  const tab: MembershipStatus | "mind" = requested === "mind" ? "mind" : (membershipStatuses as readonly string[]).includes(requested) ? (requested as MembershipStatus) : "aktiv"
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : ""

  await dbConnect()
  const filter: Record<string, unknown> = { role: "USER", "membership.status": tab === "mind" ? { $exists: true } : tab }
  if (q) {
    const re = new RegExp(escapeRegex(q), "i")
    filter.$or = [{ name: re }, { email: re }, { lastName: re }, { firstName: re }]
  }
  const [counts, rows] = await Promise.all([
    UserModel.aggregate<{ _id: MembershipStatus; n: number }>([{ $match: { role: "USER", "membership.status": { $exists: true } } }, { $group: { _id: "$membership.status", n: { $sum: 1 } } }]),
    UserModel.find(filter)
      .sort({ lastName: 1, firstName: 1 })
      .limit(PAGE_SIZE)
      .select({ title: 1, lastName: 1, firstName: 1, name: 1, email: 1, membership: 1, lastLoginAt: 1 })
      .lean<UserDocument[]>(),
  ])
  const countByStatus = new Map(counts.map((c) => [c._id, c.n]))
  const total = counts.reduce((sum, c) => sum + c.n, 0)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Tagság</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Tagok</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Az elfogadott jelentkezőkből létrejött tagi fiókok. A kategória és a tagsági állapot innen módosítható; a fiók törlése csak főadminisztrátorként.</p>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-border" aria-label="Állapot szerinti szűrés">
        {MEMBER_LIST_TABS.map((t) => {
          const n = t.key === "mind" ? total : (countByStatus.get(t.key as MembershipStatus) ?? 0)
          const active = tab === t.key
          return (
            <Link key={t.key} href={`${ADMIN_HOME_PATH}/tagok?allapot=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={active ? "page" : undefined}
              className={cn("-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors", active ? "border-mavet-gold text-mavet-navy" : "border-transparent text-muted-foreground hover:text-mavet-navy")}>
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-mavet-gold/20 text-mavet-navy" : "bg-muted text-muted-foreground")}>{n}</span>
            </Link>
          )
        })}
      </nav>

      <form className="flex max-w-md gap-2" action={`${ADMIN_HOME_PATH}/tagok`}>
        <input type="hidden" name="allapot" value={tab} />
        <Input name="q" defaultValue={q} placeholder="Keresés névre vagy e-mail-címre" aria-label="Keresés" className="h-9" />
        <Button type="submit" variant="soft" className="h-9">Keresés</Button>
      </form>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr><th className="px-4 py-2.5">Név</th><th className="px-4 py-2.5">Kategória</th><th className="px-4 py-2.5">Állapot</th><th className="px-4 py-2.5">Érvényes</th><th className="px-4 py-2.5">Utolsó belépés</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => (
                <tr key={u._id.toString()} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <Link href={`${ADMIN_HOME_PATH}/tagok/${u._id.toString()}`} className="font-semibold text-mavet-navy underline-offset-4 hover:underline">{[u.title, u.lastName, u.firstName].filter(Boolean).join(" ") || u.name}</Link>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-2.5">{categoryName(u.membership?.category)}</td>
                  <td className="px-4 py-2.5">{u.membership?.status ? <Badge variant={membershipBadgeVariant(u.membership.status)}>{MEMBERSHIP_STATUS_LABEL[u.membership.status]}</Badge> : "–"}</td>
                  <td className="px-4 py-2.5 tabular-nums">{u.membership?.paidThroughYear ? `${u.membership.paidThroughYear}. év végéig` : "–"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "–"}</td>
                </tr>
              ))}
              {rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nincs tag ebben az állapotban.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {rows.length === PAGE_SIZE ? <p className="text-sm text-muted-foreground">Az első {PAGE_SIZE} találat látható; szűkítsen kereséssel.</p> : null}

      <StatusHelp
        title="Súgó: mit jelentenek a fülek?"
        intro="Tagi fiók az elfogadott jelentkezésből jön létre. A fülek a tagsági állapotot mutatják; a kategória és az állapot a tag részletezőjén módosítható."
        items={[
          { label: "Aktív", description: "Teljes jogú tag: eléri a tagi felületeket. Díjmentes kategóriánál és a 2026-ban elfogadott tagoknál ez az aktiválás után azonnal érvényes; díjköteles kategóriánál a tagdíj igazolása után." },
          { label: "Tagdíjra vár", description: "Elfogadott és aktivált tag, akinek az első éves tagdíja még nincs rendezve (2027-től, rendes és ifjúsági kategória). A fiókjába be tud lépni, de a tagi jogok a befizetés igazolásáig nem élnek." },
          { label: "Aktiválásra vár", description: "Elfogadott jelentkező, aki még nem kattintott az aktiváló linkre, ezért nincs jelszava és nem lépett be. Ha elakadt, a jelentkezés részletezőjéből újraküldhető az aktiváló link (7 napig érvényes)." },
          { label: "Lejárt", description: "A tagdíj a türelmi idő (január 31.) végéig nem érkezett be, a tagság február 1-jével lejárt. A fiók és a profil megmarad; befizetéssel új elbírálás nélkül helyreállítható. (A fizetési modul bekötéséig ez az állapot még nem keletkezik automatikusan.)" },
          { label: "Megszűnt", description: "Az admin visszavonta a tagságot. A fiók és a belépés megmarad, a tagi jogok megszűntek; a tag a fiókjában látja. A részletezőn helyreállítható." },
          { label: "Mind", description: "Minden tagi fiók állapottól függetlenül." },
        ]}
      />
    </div>
  )
}
