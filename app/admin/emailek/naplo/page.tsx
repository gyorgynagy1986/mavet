import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { CronRunModel, type CronRunDocument } from "@/lib/models/cron-run"
import { EmailLogModel, type EmailLogDocument } from "@/lib/models/email-log"
import { EMAIL_TEMPLATES, isEmailTemplateKey } from "@/lib/server/email/registry"
import { formatDateTime } from "@/lib/server/applications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = { title: "E-mail napló" }
export const dynamic = "force-dynamic"

const CRON_LABEL: Record<string, string> = { "application-reminders": "Jelentkezési emlékeztetők" }

export default async function EmailLogPage() {
  await dbConnect()
  const [mails, runs] = await Promise.all([
    EmailLogModel.find({}).sort({ createdAt: -1 }).limit(200).lean<EmailLogDocument[]>(),
    CronRunModel.find({}).sort({ createdAt: -1 }).limit(20).lean<CronRunDocument[]>(),
  ])

  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${ADMIN_HOME_PATH}/emailek`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza a sablonokhoz
      </Button>
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Kommunikáció</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">E-mail napló</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Az utolsó 200 automatikus levél és az ütemezett feladatok futásai.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ütemezett futások</CardTitle>
          <CardDescription>Az emlékeztető-feladat naponta fut; itt látszik, hány jelentkezést nézett át és hány levelet küldött.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr><th className="px-4 py-2">Indult</th><th className="px-4 py-2">Feladat</th><th className="px-4 py-2">Eredmény</th><th className="px-4 py-2">Átnézve</th><th className="px-4 py-2">Küldve</th><th className="px-4 py-2">Hibák</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((r) => (
                <tr key={r._id.toString()}>
                  <td className="px-4 py-2 whitespace-nowrap tabular-nums">{formatDateTime(r.startedAt)}</td>
                  <td className="px-4 py-2">{CRON_LABEL[r.job] ?? r.job}</td>
                  <td className="px-4 py-2"><Badge variant={r.ok ? "secondary" : "destructive"}>{r.ok ? "sikeres" : "hibás"}</Badge>{r.summary ? <span className="ml-2 text-xs text-muted-foreground">{r.summary}</span> : null}</td>
                  <td className="px-4 py-2 tabular-nums">{r.processed}</td>
                  <td className="px-4 py-2 tabular-nums">{r.sent}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{r.issues.length ? r.issues.slice(0, 3).join("; ") : "–"}</td>
                </tr>
              ))}
              {runs.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Még nem futott ütemezett feladat.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kiküldött levelek</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr><th className="px-4 py-2">Időpont</th><th className="px-4 py-2">Sablon</th><th className="px-4 py-2">Címzett</th><th className="px-4 py-2">Tárgy</th><th className="px-4 py-2">Állapot</th><th className="px-4 py-2">Kiváltó</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mails.map((m) => (
                <tr key={m._id.toString()} className={m.status === "failed" ? "bg-destructive/5" : undefined}>
                  <td className="px-4 py-2 whitespace-nowrap tabular-nums">{formatDateTime(m.createdAt)}</td>
                  <td className="px-4 py-2">{isEmailTemplateKey(m.templateKey) ? EMAIL_TEMPLATES[m.templateKey].name : m.templateKey}</td>
                  <td className="px-4 py-2">{m.applicationId ? <Link href={`${ADMIN_HOME_PATH}/jelentkezesek/${m.applicationId.toString()}`} className="text-mavet-navy underline-offset-4 hover:underline">{m.to}</Link> : m.to}</td>
                  <td className="max-w-xs truncate px-4 py-2 text-muted-foreground" title={m.subject}>{m.subject}</td>
                  <td className="px-4 py-2"><Badge variant={m.status === "sent" ? "secondary" : m.status === "failed" ? "destructive" : "outline"}>{m.status === "sent" ? "elküldve" : m.status === "failed" ? "sikertelen" : "kihagyva"}</Badge>{(m.attempts ?? 1) > 1 ? <span className="ml-2 text-xs text-muted-foreground" title="Hány SendGrid-hívás kellett (átmeneti hibák újrapróbálva)">{m.attempts}. próbálkozás</span> : null}{m.error ? <div className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground" title={m.error}>{m.error}</div> : null}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{m.triggeredBy}</td>
                </tr>
              ))}
              {mails.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Még nem ment ki levél.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
