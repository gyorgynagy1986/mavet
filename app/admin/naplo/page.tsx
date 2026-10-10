import type { Metadata } from "next"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { AdminAuditLogModel, type AdminAuditLogDocument } from "@/lib/models/admin-audit-log"
import { AuthLogModel, type AuthLogDocument } from "@/lib/models/auth-log"
import { getServerAuthSession, isSuperAdmin } from "@/lib/server/auth/session"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = { title: "Naplók" }
export const dynamic = "force-dynamic"

const LIMIT = 100

const AUTH_EVENT_LABEL: Record<string, string> = {
  CODE_REQUESTED: "Kódkérés",
  CODE_SENT: "Kód elküldve",
  CODE_REQUEST_UNKNOWN_USER: "Kódkérés ismeretlen címre",
  IP_RATE_LIMITED: "IP-korlát",
  EMAIL_RATE_LIMITED: "Címkorlát",
  INVALID_CODE_ATTEMPT: "Hibás kód",
  INVALID_CODE_FORMAT: "Hibás kódformátum",
  CODE_EXPIRED: "Lejárt vagy hiányzó kód",
  BRUTE_FORCE_DETECTED: "Túl sok próbálkozás",
  LOGIN_SUCCESS: "Sikeres belépés",
  LOGIN_FAILED: "Sikertelen belépés",
  USER_NOT_FOUND: "Nincs admin fiók",
}

const AUDIT_ACTION_LABEL: Record<string, string> = {
  admin_create: "Admin létrehozva",
  admin_role_change: "Szerep módosítva",
  admin_demote: "Jog visszavonva",
}

function fmt(date: Date): string {
  return date.toLocaleString("hu-HU", { timeZone: "Europe/Budapest", dateStyle: "short", timeStyle: "medium" })
}

export default async function LogsPage() {
  const session = await getServerAuthSession()
  if (!isSuperAdmin(session)) redirect(ADMIN_HOME_PATH)

  await dbConnect()
  const [authLogs, auditLogs] = await Promise.all([
    AuthLogModel.find({}).sort({ createdAt: -1 }).limit(LIMIT).lean<AuthLogDocument[]>(),
    AdminAuditLogModel.find({}).sort({ createdAt: -1 }).limit(LIMIT).lean<AdminAuditLogDocument[]>(),
  ])

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Főadminisztrátor</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Naplók</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          A legutóbbi {LIMIT} belépési esemény és jogosultság-változás. Személyes adatokat (e-mail, IP, böngésző) tartalmaz; csak főadminisztrátor láthatja.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Jogosultság-változások</CardTitle>
          <CardDescription>Ki, kinek, mit állított át.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5">Időpont</th>
                <th scope="col" className="px-4 py-2.5">Művelet</th>
                <th scope="col" className="px-4 py-2.5">Végezte</th>
                <th scope="col" className="px-4 py-2.5">Érintett</th>
                <th scope="col" className="px-4 py-2.5">Részletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.map((log) => (
                <tr key={log._id.toString()}>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{fmt(log.createdAt)}</td>
                  <td className="px-4 py-2.5"><Badge variant={log.action === "admin_demote" ? "destructive" : "secondary"}>{AUDIT_ACTION_LABEL[log.action] ?? log.action}</Badge></td>
                  <td className="px-4 py-2.5">{log.actorName ?? log.actorEmail ?? "–"}</td>
                  <td className="px-4 py-2.5">{log.targetName ? `${log.targetName} (${log.targetEmail ?? ""})` : log.targetEmail ?? "–"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{log.summary ?? log.changes.map((c) => `${c.field}: ${c.from ?? "–"} → ${c.to ?? "–"}`).join("; ")}</td>
                </tr>
              ))}
              {auditLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Még nincs bejegyzés.</td></tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Belépési események</CardTitle>
          <CardDescription>Siker és kudarc egyformán. A sárga sorok figyelmeztetések, a pirosak zárolások.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5">Időpont</th>
                <th scope="col" className="px-4 py-2.5">Esemény</th>
                <th scope="col" className="px-4 py-2.5">E-mail</th>
                <th scope="col" className="px-4 py-2.5">IP</th>
                <th scope="col" className="px-4 py-2.5">Részletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {authLogs.map((log) => (
                <tr key={log._id.toString()} className={log.level === "error" ? "bg-destructive/5" : log.level === "warn" ? "bg-mavet-gold/10" : undefined}>
                  <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{fmt(log.createdAt)}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={log.success ? "default" : log.level === "error" ? "destructive" : "outline"}>{AUTH_EVENT_LABEL[log.event] ?? log.event}</Badge>
                  </td>
                  <td className="px-4 py-2.5">{log.email ?? "–"}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{log.ip ?? "–"}</td>
                  <td className="max-w-xs truncate px-4 py-2.5 text-muted-foreground" title={log.userAgent ?? undefined}>
                    {[log.reason, log.attempts != null ? `${log.attempts}. próbálkozás` : null, log.userAgent].filter(Boolean).join(" · ") || "–"}
                  </td>
                </tr>
              ))}
              {authLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Még nincs bejegyzés.</td></tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
