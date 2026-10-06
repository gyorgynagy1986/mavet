import type { Metadata } from "next"
import Link from "next/link"
import mongoose from "mongoose"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { formatHuf } from "@/lib/data/membership-fees"
import { EmailLogModel, type EmailLogDocument } from "@/lib/models/email-log"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { MEMBERSHIP_STATUS_LABEL, membershipBadgeVariant } from "@/lib/server/admin-members"
import { categoryName, formatDateTime } from "@/lib/server/applications"
import { workgroupOptions } from "@/lib/data/site"
import { getServerAuthSession, isSuperAdmin } from "@/lib/server/auth/session"
import { formatPhone } from "@/lib/validation/phone"
import { EMAIL_TEMPLATES, isEmailTemplateKey } from "@/lib/server/email/registry"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MemberActions } from "./member-actions"

export const metadata: Metadata = { title: "Tag" }
export const dynamic = "force-dynamic"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "–"}</dd>
    </div>
  )
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) notFound()
  const session = await getServerAuthSession()

  await dbConnect()
  const [user, mails] = await Promise.all([
    UserModel.findById(id).lean<UserDocument | null>(),
    EmailLogModel.find({ userId: id }).sort({ createdAt: -1 }).limit(30).lean<EmailLogDocument[]>(),
  ])
  if (!user || user.role !== "USER" || !user.membership?.status) notFound()
  const m = user.membership
  const name = [user.title, user.lastName, user.firstName].filter(Boolean).join(" ") || user.name
  const address = [user.address?.postalCode, user.address?.city, user.address?.street, user.address?.country].filter(Boolean).join(", ")

  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${ADMIN_HOME_PATH}/tagok`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza a tagokhoz
      </Button>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Tag</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{name}</h1>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={membershipBadgeVariant(m.status!)} className="h-7 px-3 text-sm">{MEMBERSHIP_STATUS_LABEL[m.status!]}</Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Tagság</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Row label="Tisztség" value={user.office ? `${user.office}${user.boardMember ? " · publikus bemutatkozásban megjelenhet" : ""}` : "–"} />
                <Row label="Kategória" value={`${categoryName(m.category)}${m.category === "rendes" ? (m.medicalDegree ? " · orvos/gyógyszerész" : " · nem orvos/gyógyszerész") : ""}`} />
                <Row label="Elfogadva" value={m.acceptedAt ? formatDateTime(m.acceptedAt) : "–"} />
                <Row label="Aktiválva" value={m.activatedAt ? formatDateTime(m.activatedAt) : "még nem"} />
                <Row label="Érvényes" value={m.paidThroughYear ? `${m.paidThroughYear}. év végéig` : "–"} />
                {m.feeDue?.amount ? <Row label="Első tagdíj" value={`${formatHuf(m.feeDue.amount)} (${m.feeDue.forYear}. év), határidő: ${m.feeDue.dueAt ? formatDateTime(m.feeDue.dueAt) : "–"}`} /> : null}
                {m.revokedAt ? <Row label="Visszavonva" value={`${formatDateTime(m.revokedAt)} · ${m.revokedByEmail ?? ""}${m.revokeReason ? ` · ${m.revokeReason}` : ""}`} /> : null}
                <Row label="Jelentkezés" value={m.applicationId ? <Link href={`${ADMIN_HOME_PATH}/jelentkezesek/${m.applicationId.toString()}`} className="text-mavet-navy underline-offset-4 hover:underline">Megnyitás</Link> : "–"} />
                <Row label="Utolsó belépés" value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "még nem lépett be"} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Profil</CardTitle><CardDescription>A tag által megadott adatok.</CardDescription></CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Row label="Születési dátum" value={user.birthDate ? user.birthDate.toLocaleDateString("hu-HU", { timeZone: "UTC" }) : "–"} />
                <Row label="Levelezési cím" value={address || "–"} />
                <Row label="Telefon" value={formatPhone(user.phone) || "–"} />
                <Row label="Szakterület" value={user.specialty || "–"} />
                <Row label="Munkahely" value={user.workplace || "–"} />
                <Row label="Bemutatkozás" value={user.bio || "–"} />
                <Row label="Érdeklődés" value={user.interests?.length ? user.interests.join(", ") : "–"} />
                <Row label="Munkacsoportok" value={user.workgroups?.length ? user.workgroups.map((w) => workgroupOptions.find((o) => o.id === w)?.name ?? w).join(", ") : "–"} />
                <Row label="Megjelenés" value={user.visibility?.enabled ? "engedélyezve (névjegyzékben látható)" : "kikapcsolva"} />
                <Row label="Profilkép" value={user.photo?.url ? "van" : "nincs"} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Kiküldött e-mailek</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <tr><th className="px-4 py-2">Időpont</th><th className="px-4 py-2">Sablon</th><th className="px-4 py-2">Állapot</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mails.map((x) => (
                    <tr key={x._id.toString()}>
                      <td className="px-4 py-2 whitespace-nowrap tabular-nums">{formatDateTime(x.createdAt)}</td>
                      <td className="px-4 py-2">{isEmailTemplateKey(x.templateKey) ? EMAIL_TEMPLATES[x.templateKey].name : x.templateKey}</td>
                      <td className="px-4 py-2"><Badge variant={x.status === "sent" ? "secondary" : x.status === "failed" ? "destructive" : "outline"}>{x.status === "sent" ? "elküldve" : x.status === "failed" ? "sikertelen" : "kihagyva"}</Badge></td>
                    </tr>
                  ))}
                  {mails.length === 0 ? <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">Még nem ment ki e-mail.</td></tr> : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <MemberActions
          id={id}
          email={user.email}
          status={m.status!}
          category={m.category ?? "rendes"}
          medicalDegree={m.medicalDegree ?? null}
          canDelete={isSuperAdmin(session)}
          office={user.office ?? null}
          boardMember={user.boardMember ?? false}
        />
      </div>
    </div>
  )
}
