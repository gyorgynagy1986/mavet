import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { EMAIL_TEMPLATES, exampleVars, isEmailTemplateKey } from "@/lib/server/email/registry"
import { resolveTemplate } from "@/lib/server/email/send"
import { formatDateTime } from "@/lib/server/applications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TemplateEditor } from "./template-editor"

export const metadata: Metadata = { title: "Sablon szerkesztése" }
export const dynamic = "force-dynamic"

export default async function EmailTemplateEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  if (!isEmailTemplateKey(key)) notFound()
  const spec = EMAIL_TEMPLATES[key]
  const template = await resolveTemplate(key)

  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${ADMIN_HOME_PATH}/emailek`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza a sablonokhoz
      </Button>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">E-mail sablon</p>
          <Badge variant="outline">{spec.audience}</Badge>
          {template.customized ? <Badge variant="secondary">szerkesztett</Badge> : <Badge variant="ghost">alapértelmezett</Badge>}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{spec.name}</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{spec.description}</p>
        {template.updatedAt ? <p className="mt-1 text-xs text-muted-foreground">Utoljára módosítva: {formatDateTime(template.updatedAt)}{template.updatedByEmail ? ` · ${template.updatedByEmail}` : ""}</p> : null}
      </header>
      <TemplateEditor
        templateKey={key}
        variables={spec.variables}
        examples={exampleVars(spec)}
        initial={{ subject: template.subject, html: template.html, enabled: template.enabled }}
        defaults={{ subject: spec.defaultSubject, html: spec.defaultHtml }}
      />
    </div>
  )
}
