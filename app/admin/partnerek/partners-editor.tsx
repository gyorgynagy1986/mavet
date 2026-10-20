"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDownIcon, ArrowUpIcon, Building2Icon, PlusIcon, SaveIcon, StarIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { LOGO_ACCEPT, LOGO_MESSAGES, PARTNERS_INTRO_MAX, PARTNER_NAME_MAX, logoFileError, type PartnerErrors, type PartnerInput } from "@/lib/partners"
import { deletePartner, movePartner, savePartner, savePartnersIntro, setPartnerFlag, uploadPartnerLogo, type PartnerActionResult } from "./actions"

export interface PartnerRow {
  id: string
  name: string
  websiteUrl: string
  logoUrl: string | null
  featured: boolean
  published: boolean
}

export function PartnersEditor({ intro: initialIntro, partners, storageConfigured }: { intro: string; partners: PartnerRow[]; storageConfigured: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [intro, setIntro] = useState(initialIntro)
  const [adding, setAdding] = useState(false)

  function run(fn: () => Promise<PartnerActionResult>, after?: () => void) {
    start(async () => {
      const r = await fn()
      if (r.ok) {
        toast.success(r.message)
        after?.()
        router.refresh()
      } else toast.error(r.message)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Bevezető</CardTitle>
          <CardDescription>A Partnereink oldal tetején jelenik meg.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              run(() => savePartnersIntro(intro))
            }}
          >
            <Textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} maxLength={PARTNERS_INTRO_MAX} aria-label="Bevezető szöveg" disabled={pending} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{intro.length} / {PARTNERS_INTRO_MAX} karakter</span>
              <Button type="submit" size="sm" disabled={pending || intro === initialIntro}>
                <SaveIcon data-icon="inline-start" />
                Bevezető mentése
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Partnerek</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={pending || adding}>
          <PlusIcon data-icon="inline-start" />
          Új partner
        </Button>
      </div>

      {adding ? <PartnerCard partner={{ id: "", name: "", websiteUrl: "", logoUrl: null, featured: false, published: false }} index={-1} count={partners.length} pending={pending} run={run} storageConfigured={storageConfigured} onCancel={() => setAdding(false)} onSaved={() => setAdding(false)} /> : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {partners.map((p, i) => (
          <PartnerCard key={p.id} partner={p} index={i} count={partners.length} pending={pending} run={run} storageConfigured={storageConfigured} />
        ))}
      </div>
      {partners.length === 0 && !adding ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Még nincs partner.</p> : null}
    </div>
  )
}

function PartnerCard({ partner, index, count, pending, run, storageConfigured, onCancel, onSaved }: { partner: PartnerRow; index: number; count: number; pending: boolean; run: (fn: () => Promise<PartnerActionResult>, after?: () => void) => void; storageConfigured: boolean; onCancel?: () => void; onSaved?: () => void }) {
  const isNew = partner.id === ""
  const router = useRouter()
  const [data, setData] = useState<PartnerInput>({ name: partner.name, websiteUrl: partner.websiteUrl })
  const [errors, setErrors] = useState<PartnerErrors>({})
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dirty = isNew || data.name !== partner.name || data.websiteUrl !== partner.websiteUrl

  function update<K extends keyof PartnerInput>(key: K, value: PartnerInput[K]) {
    setData({ ...data, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  async function uploadLogo(file: File | null) {
    if (fileRef.current) fileRef.current.value = ""
    if (!file) return
    const invalid = logoFileError(file)
    if (invalid) return void toast.error(invalid)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.set("logo", file)
      const r = await uploadPartnerLogo(partner.id, fd)
      if (r.ok) {
        toast.success(r.message)
        router.refresh()
      } else toast.error(r.message)
    } catch {
      toast.error(LOGO_MESSAGES.storage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className={!partner.published && !isNew ? "border-dashed" : undefined}>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{isNew ? "Új partner" : partner.name}</CardTitle>
          {!isNew ? <Badge variant={partner.published ? "default" : "outline"}>{partner.published ? "közzétéve" : "rejtett"}</Badge> : null}
          {partner.featured ? <Badge className="bg-mavet-gold/25 text-mavet-navy hover:bg-mavet-gold/25"><StarIcon className="size-3" aria-hidden="true" /> főoldalon</Badge> : null}
        </div>
        {!isNew ? (
          <div className="flex items-center gap-1">
            <Button size="icon-sm" variant="ghost" aria-label="Feljebb" disabled={pending || index === 0} onClick={() => run(() => movePartner(partner.id, "fel"))}><ArrowUpIcon /></Button>
            <Button size="icon-sm" variant="ghost" aria-label="Lejjebb" disabled={pending || index === count - 1} onClick={() => run(() => movePartner(partner.id, "le"))}><ArrowDownIcon /></Button>
            <Button size="icon-sm" variant="ghost" className="text-destructive" aria-label="Partner törlése" disabled={pending} onClick={() => window.confirm(`Törli a(z) „${partner.name}” partnert a logójával együtt?`) && run(() => deletePartner(partner.id))}><Trash2Icon /></Button>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-5 sm:flex-row">
        {!isNew ? (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-56">
            <div className="flex aspect-[2/1] items-center justify-center rounded-lg border border-border bg-white p-4">
              {partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already normalised WebP
                <img src={partner.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
              ) : (
                <Building2Icon className="size-7 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            {!storageConfigured ? <p className="text-xs text-destructive">{LOGO_MESSAGES.notConfigured}</p> : null}
            <input ref={fileRef} type="file" accept={LOGO_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void uploadLogo(e.target.files?.[0] ?? null)} />
            <Button type="button" size="sm" variant="soft" disabled={pending || uploading || !storageConfigured} onClick={() => fileRef.current?.click()}>
              {uploading ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
              {partner.logoUrl ? "Logó cseréje" : "Logó feltöltése"}
            </Button>
            <p className="text-xs text-muted-foreground">PNG, SVG, WebP vagy JPEG, max. 4 MB. A rendszer egységes, 2:1 arányú átlátszó dobozba illeszti, így minden logó egyforma méretben jelenik meg.</p>
          </div>
        ) : null}
        <form
          className="flex flex-1 flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            run(
              async () => {
                const r = await savePartner(isNew ? null : partner.id, data)
                if (!r.ok) setErrors(r.errors ?? {})
                return r
              },
              () => onSaved?.(),
            )
          }}
        >
          <Field data-invalid={Boolean(errors.name) || undefined}>
            <FieldLabel htmlFor={`partner-name-${partner.id || "uj"}`}>Név</FieldLabel>
            <Input id={`partner-name-${partner.id || "uj"}`} value={data.name} onChange={(e) => update("name", e.target.value)} maxLength={PARTNER_NAME_MAX} disabled={pending} aria-invalid={Boolean(errors.name) || undefined} />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.websiteUrl) || undefined}>
            <FieldLabel htmlFor={`partner-url-${partner.id || "uj"}`}>Weboldal (nem kötelező)</FieldLabel>
            <Input id={`partner-url-${partner.id || "uj"}`} type="url" inputMode="url" value={data.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://…" disabled={pending} aria-invalid={Boolean(errors.websiteUrl) || undefined} />
            <FieldError>{errors.websiteUrl}</FieldError>
          </Field>
          {!isNew ? (
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={partner.published} disabled={pending} onCheckedChange={(v) => run(() => setPartnerFlag(partner.id, "published", v))} />
                Közzétéve a Partnerek oldalon
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={partner.featured} disabled={pending} onCheckedChange={(v) => run(() => setPartnerFlag(partner.id, "featured", v))} />
                Kiemelt: a főoldalon is
              </label>
            </div>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={pending || !dirty}>
              <SaveIcon data-icon="inline-start" />
              {isNew ? "Partner létrehozása" : "Mentés"}
            </Button>
            {onCancel ? <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={pending}>Mégse</Button> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
