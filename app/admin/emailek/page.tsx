import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, ScrollTextIcon } from "lucide-react"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { EmailTemplateModel } from "@/lib/models/email-template"
import { EMAIL_TEMPLATES, emailTemplateKeys } from "@/lib/server/email/registry"
import { formatDateTime } from "@/lib/server/applications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = { title: "E-mail sablonok" }
export const dynamic = "force-dynamic"

export default async function EmailTemplatesPage() {
  await dbConnect()
  const saved = await EmailTemplateModel.find({}).select({ key: 1, enabled: 1, updatedAt: 1, updatedByEmail: 1 }).lean<{ key: string; enabled: boolean; updatedAt: Date; updatedByEmail: string | null }[]>()
  const byKey = new Map(saved.map((s) => [s.key, s]))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Kommunikáció</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">E-mail sablonok</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            A rendszer automatikus leveleinek tárgya és HTML-törzse. A levelek a MAVET fejlécével és láblécével mennek ki; a sablon csak a törzset tartalmazza. A <code className="rounded bg-muted px-1 text-sm">{"{{változó}}"}</code> helyére a rendszer a tényleges adatot írja.
          </p>
        </div>
        <Button variant="soft" render={<Link href={`${ADMIN_HOME_PATH}/emailek/naplo`} />} nativeButton={false}>
          <ScrollTextIcon data-icon="inline-start" />
          E-mail napló
        </Button>
      </header>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {emailTemplateKeys.map((key) => {
              const spec = EMAIL_TEMPLATES[key]
              const doc = byKey.get(key)
              const enabled = doc?.enabled ?? true
              return (
                <li key={key} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`${ADMIN_HOME_PATH}/emailek/${key}`} className="font-semibold text-mavet-navy underline-offset-4 hover:underline">{spec.name}</Link>
                      <Badge variant="outline">{spec.audience}</Badge>
                      {!enabled ? <Badge variant="destructive">letiltva</Badge> : null}
                      {doc ? <Badge variant="secondary">szerkesztett</Badge> : <Badge variant="ghost">alapértelmezett</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{spec.description}</p>
                    {doc ? <p className="mt-0.5 text-xs text-muted-foreground">Módosítva: {formatDateTime(doc.updatedAt)}{doc.updatedByEmail ? ` · ${doc.updatedByEmail}` : ""}</p> : null}
                  </div>
                  <Button variant="ghost" size="sm" render={<Link href={`${ADMIN_HOME_PATH}/emailek/${key}`} />} nativeButton={false}>
                    Szerkesztés
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
