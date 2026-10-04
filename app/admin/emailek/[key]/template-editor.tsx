"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CodeIcon, EyeIcon, Loader2Icon, PowerIcon, PowerOffIcon, RotateCcwIcon, SaveIcon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { TemplateVariableSpec } from "@/lib/server/email/registry"
import { extractTemplateVariables, renderTemplate, wrapInMailLayout } from "@/lib/server/email/render"
import { resetEmailTemplate, saveEmailTemplate, sendTestEmail, setEmailTemplateEnabled } from "../actions"

export function TemplateEditor({
  templateKey,
  variables,
  examples,
  initial,
  defaults,
}: {
  templateKey: string
  variables: TemplateVariableSpec[]
  examples: Record<string, string>
  initial: { subject: string; html: string; enabled: boolean }
  defaults: { subject: string; html: string }
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [subject, setSubject] = useState(initial.subject)
  const [html, setHtml] = useState(initial.html)
  const [enabled, setEnabled] = useState(initial.enabled)
  const [testTo, setTestTo] = useState("")
  const [view, setView] = useState<"preview" | "code">("preview")

  const known = useMemo(() => new Set(variables.map((v) => v.key)), [variables])
  const unknownVars = useMemo(() => [...extractTemplateVariables(subject), ...extractTemplateVariables(html)].filter((k) => !known.has(k)), [subject, html, known])
  const preview = useMemo(() => wrapInMailLayout(renderTemplate(html, examples)), [html, examples])
  const previewSubject = useMemo(() => renderTemplate(subject, examples, { html: false }), [subject, examples])
  const dirty = subject !== initial.subject || html !== initial.html

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const r = await fn()
      if (r.ok) {
        toast.success(r.message)
        router.refresh()
      } else toast.error(r.message)
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Automatikus küldés</CardTitle>
              <CardDescription>{enabled ? "Aktív: a rendszer ezt a levelet kiküldi." : "Letiltva: a rendszer nem küldi ki, a naplóba „kihagyva” kerül."}</CardDescription>
            </div>
            <Button
              variant={enabled ? "soft" : "outline"}
              size="sm"
              disabled={pending}
              onClick={() => {
                const next = !enabled
                setEnabled(next)
                run(() => setEmailTemplateEnabled(templateKey, next))
              }}
            >
              {enabled ? <PowerIcon data-icon="inline-start" /> : <PowerOffIcon data-icon="inline-start" />}
              {enabled ? "Aktív" : "Inaktív"}
            </Button>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CodeIcon className="size-4 text-mavet-blue" />Használható változók</CardTitle>
            <CardDescription>Kattintson egy változóra a vágólapra másoláshoz. A rendszer HTML-biztosan illeszti be az értéket.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <button
                key={v.key}
                type="button"
                title={`${v.description}\nPélda: ${v.example}`}
                onClick={() => navigator.clipboard?.writeText(`{{${v.key}}}`).then(() => toast.success(`{{${v.key}}} a vágólapon`))}
                className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-mavet-navy hover:border-mavet-blue/40 hover:bg-mavet-blue/10"
              >
                {`{{${v.key}}}`}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tárgy és törzs</CardTitle>
            <CardDescription>A törzs HTML. A fejlécet és a láblécet a rendszer adja hozzá. <code className="rounded bg-muted px-1">&lt;script&gt;</code> nem engedélyezett.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tpl-subject">Tárgy</Label>
              <Input id="tpl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-html">Törzs (HTML)</Label>
              <Textarea id="tpl-html" value={html} onChange={(e) => setHtml(e.target.value)} rows={18} spellCheck={false} disabled={pending} className="font-mono text-xs leading-5" />
            </div>
            {unknownVars.length > 0 ? (
              <p className="text-sm text-destructive">Ismeretlen változó, üresen fog megjelenni: {unknownVars.map((k) => `{{${k}}}`).join(", ")}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending || !dirty} onClick={() => run(() => saveEmailTemplate(templateKey, { subject, html, enabled }))}>
                {pending ? <Loader2Icon className="animate-spin" /> : <SaveIcon data-icon="inline-start" />}
                Mentés
              </Button>
              <Button variant="outline" disabled={pending} onClick={() => { setSubject(defaults.subject); setHtml(defaults.html) }}>
                <RotateCcwIcon data-icon="inline-start" />
                Alapértelmezett szöveg betöltése
              </Button>
              <Button
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm("Törli a mentett sablont, és visszaáll az alapértelmezett? Ez nem vonható vissza.")) return
                  setSubject(defaults.subject)
                  setHtml(defaults.html)
                  run(() => resetEmailTemplate(templateKey))
                }}
              >
                Mentett sablon törlése
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teszt e-mail</CardTitle>
            <CardDescription>A mentett sablont példaértékekkel küldi a megadott címre, [TESZT] előtaggal. Mentetlen módosítást nem küld.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Input type="email" placeholder="te@pelda.hu" value={testTo} onChange={(e) => setTestTo(e.target.value)} disabled={pending} />
            <Button variant="soft" disabled={pending || !testTo} onClick={() => run(() => sendTestEmail(templateKey, testTo))}>
              <SendIcon data-icon="inline-start" />
              Küldés
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-24">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><EyeIcon className="size-4 text-mavet-blue" />Előnézet</CardTitle>
            <CardDescription className="truncate">Tárgy: {previewSubject}</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant={view === "preview" ? "soft" : "ghost"} size="sm" onClick={() => setView("preview")}>Nézet</Button>
            <Button variant={view === "code" ? "soft" : "ghost"} size="sm" onClick={() => setView("code")}>Forrás</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {view === "preview" ? (
            <iframe title="E-mail előnézet" sandbox="" srcDoc={preview} className="h-[720px] w-full rounded-b-xl border-0 bg-mavet-surface" />
          ) : (
            <pre className="max-h-[720px] overflow-auto p-4 font-mono text-xs leading-5 whitespace-pre-wrap">{preview}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
