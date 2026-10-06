import type { Metadata } from "next"
import Link from "next/link"
import mongoose from "mongoose"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { EmailLogModel, type EmailLogDocument } from "@/lib/models/email-log"
import { MembershipApplicationModel, type MembershipApplicationDocument } from "@/lib/models/membership-application"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { formatHuf } from "@/lib/data/membership-fees"
import { APPLICATION_STATUS_LABEL, statusBadgeVariant } from "@/lib/server/admin-applications"
import { categoryName, formatDateTime, fullName } from "@/lib/server/applications"
import { EMAIL_TEMPLATES, isEmailTemplateKey } from "@/lib/server/email/registry"
import { getServerAuthSession, isSuperAdmin } from "@/lib/server/auth/session"
import { formatPhone } from "@/lib/validation/phone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationActions } from "./application-actions"

export const metadata: Metadata = { title: "Jelentkezés" }
export const dynamic = "force-dynamic"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "–"}</dd>
    </div>
  )
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) notFound()

  const session = await getServerAuthSession()
  await dbConnect()
  const [app, mails, member] = await Promise.all([
    MembershipApplicationModel.findById(id).lean<MembershipApplicationDocument | null>(),
    EmailLogModel.find({ applicationId: id }).sort({ createdAt: -1 }).limit(50).lean<EmailLogDocument[]>(),
    UserModel.findOne({ "membership.applicationId": id }).select({ membership: 1, lastLoginAt: 1 }).lean<UserDocument | null>(),
  ])
  if (!app) notFound()
  const MEMBERSHIP_LABEL: Record<string, string> = { aktivalasra_var: "Aktiválásra vár (nincs még jelszó)", fizetesre_var: "Aktiválva, első tagdíjra vár", aktiv: "Aktív tag", lejart: "Lejárt tagság", megszunt: "Megszűnt" }

  const address = app.address ? [app.address.postalCode, app.address.city, app.address.street, app.address.country].filter(Boolean).join(", ") : ""

  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${ADMIN_HOME_PATH}/jelentkezesek`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza a listához
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Jelentkezés</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{fullName(app)}</h1>
          <p className="mt-1 text-muted-foreground">{app.email}</p>
        </div>
        <Badge variant={statusBadgeVariant(app.status)} className="h-7 px-3 text-sm">{APPLICATION_STATUS_LABEL[app.status]}</Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adatlap</CardTitle>
              <CardDescription>A jelentkező által megadott adatok. Véglegesítés után a jelentkező nem módosíthatja.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Row label="Kért kategória" value={categoryName(app.category)} />
                {app.acceptedCategory && app.acceptedCategory !== app.category ? <Row label="Elfogadott kategória" value={categoryName(app.acceptedCategory)} /> : null}
                <Row label="Titulus" value={app.title || "–"} />
                <Row label="Születési dátum" value={app.birthDate ? app.birthDate.toLocaleDateString("hu-HU", { timeZone: "UTC" }) : "–"} />
                <Row label="Levelezési cím" value={address || "–"} />
                <Row label="Telefon" value={formatPhone(app.phone) || "–"} />
                <Row label={app.category === "hallgatoi" ? "Tanulmányi terület" : "Szakterület"} value={app.specialty || "–"} />
                <Row label="Munkahely" value={app.noWorkplace ? "Nincs állandó munkahelye" : app.workplace || "–"} />
                {app.category === "rendes" ? <Row label="Végzettség" value={app.medicalDegree === true ? "Orvos / gyógyszerész (10 000 Ft)" : app.medicalDegree === false ? "Nem orvos / gyógyszerész (5 000 Ft)" : "–"} /> : null}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Idővonal és nyilatkozatok</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Row label="Jelentkezés indítva" value={formatDateTime(app.createdAt)} />
                <Row label="E-mail megerősítve" value={app.emailVerifiedAt ? formatDateTime(app.emailVerifiedAt) : "még nem"} />
                <Row label="Utolsó aktivitás" value={app.lastActivityAt ? formatDateTime(app.lastActivityAt) : "–"} />
                <Row label="Véglegesítve" value={app.submittedAt ? formatDateTime(app.submittedAt) : "még nem"} />
                <Row label="Döntés" value={app.decidedAt ? `${formatDateTime(app.decidedAt)} · ${app.decidedByEmail ?? ""}` : "–"} />
                {app.decisionMessage ? <Row label="Jelentkezőnek küldött indoklás" value={app.decisionMessage} /> : null}
                <Row label="Emlékeztetők" value={app.reminders?.length ? app.reminders.map((r) => `${formatDateTime(r.sentAt)} (${r.kind === "auto" ? "automatikus" : "kézi"})`).join("; ") : "–"} />
                <Row label="Előzetes hozzájárulás" value={app.consent ? `${formatDateTime(app.consent.acceptedAt)} · ${app.consent.privacyNoticeVersion}` : "–"} />
                <Row label="Alapszabály elfogadva" value={app.declarations?.statutesAcceptedAt ? formatDateTime(app.declarations.statutesAcceptedAt) : "–"} />
                <Row label="Adatkezelés elfogadva" value={app.declarations?.privacyAcceptedAt ? `${formatDateTime(app.declarations.privacyAcceptedAt)} · ${app.declarations.privacyNoticeVersion ?? ""}` : "–"} />
              </dl>
            </CardContent>
          </Card>

          {member?.membership?.status ? (
            <Card>
              <CardHeader>
                <CardTitle>Tagi fiók</CardTitle>
                <CardDescription>Az elfogadáskor létrehozott fiók és tagsági állapot.</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <Row label="Tagsági állapot" value={MEMBERSHIP_LABEL[member.membership.status] ?? member.membership.status} />
                  <Row label="Kategória" value={categoryName(member.membership.category)} />
                  <Row label="Érvényes" value={member.membership.paidThroughYear ? `${member.membership.paidThroughYear}. év végéig` : "–"} />
                  {member.membership.feeDue?.amount ? <Row label="Fizetendő első tagdíj" value={`${formatHuf(member.membership.feeDue.amount)} (${member.membership.feeDue.forYear}. év), határidő: ${member.membership.feeDue.dueAt ? formatDateTime(member.membership.feeDue.dueAt) : "–"}`} /> : null}
                  <Row label="Aktiválva" value={member.membership.activatedAt ? formatDateTime(member.membership.activatedAt) : "még nem"} />
                  <Row label="Utolsó belépés" value={member.lastLoginAt ? formatDateTime(member.lastLoginAt) : "–"} />
                </dl>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Kiküldött e-mailek</CardTitle>
              <CardDescription>A jelentkezőnek és az adminoknak ehhez a jelentkezéshez küldött levelek.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-2">Időpont</th>
                    <th scope="col" className="px-4 py-2">Sablon</th>
                    <th scope="col" className="px-4 py-2">Címzett</th>
                    <th scope="col" className="px-4 py-2">Állapot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mails.map((m) => (
                    <tr key={m._id.toString()}>
                      <td className="px-4 py-2 whitespace-nowrap tabular-nums">{formatDateTime(m.createdAt)}</td>
                      <td className="px-4 py-2">{isEmailTemplateKey(m.templateKey) ? EMAIL_TEMPLATES[m.templateKey].name : m.templateKey}</td>
                      <td className="px-4 py-2">{m.to}</td>
                      <td className="px-4 py-2"><Badge variant={m.status === "sent" ? "secondary" : m.status === "failed" ? "destructive" : "outline"}>{m.status === "sent" ? "elküldve" : m.status === "failed" ? "sikertelen" : "kihagyva"}</Badge>{m.error ? <span className="ml-2 text-xs text-muted-foreground">{m.error}</span> : null}</td>
                    </tr>
                  ))}
                  {mails.length === 0 ? <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Még nem ment ki e-mail.</td></tr> : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <ApplicationActions id={id} status={app.status} category={app.category} internalNote={app.internalNote ?? ""} awaitingActivation={member?.membership?.status === "aktivalasra_var"} canDelete={isSuperAdmin(session) && !member} />
      </div>
    </div>
  )
}
