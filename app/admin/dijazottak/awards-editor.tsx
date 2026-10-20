"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, EyeOffIcon, PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AWARDS_INTRO_MAX, AWARD_DESCRIPTION_MAX, AWARD_NAME_MAX, parseEntries, type AwardErrors, type AwardInput } from "@/lib/awards"
import { deleteAward, moveAward, saveAward, saveAwardsIntro, setAwardHidden, type AwardActionResult } from "./actions"

export interface AwardRow {
  id: string
  name: string
  description: string
  entriesText: string
  hidden: boolean
}

export function AwardsEditor({ intro: initialIntro, awards }: { intro: string; awards: AwardRow[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [intro, setIntro] = useState(initialIntro)
  const [adding, setAdding] = useState(false)

  function run(fn: () => Promise<AwardActionResult>, after?: () => void) {
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
          <CardDescription>Az oldal tetején, a díjak előtt jelenik meg.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              run(() => saveAwardsIntro(intro))
            }}
          >
            <Textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={4} maxLength={AWARDS_INTRO_MAX} aria-label="Bevezető szöveg" disabled={pending} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{intro.length} / {AWARDS_INTRO_MAX} karakter</span>
              <Button type="submit" size="sm" disabled={pending || intro === initialIntro}>
                <SaveIcon data-icon="inline-start" />
                Bevezető mentése
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Díjak</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={pending || adding}>
          <PlusIcon data-icon="inline-start" />
          Új díj
        </Button>
      </div>

      {adding ? (
        <AwardCard
          award={{ id: "", name: "", description: "", entriesText: "", hidden: false }}
          index={-1}
          count={awards.length}
          pending={pending}
          run={run}
          onCancel={() => setAdding(false)}
          onSaved={() => setAdding(false)}
        />
      ) : null}

      {awards.map((award, i) => (
        <AwardCard key={award.id} award={award} index={i} count={awards.length} pending={pending} run={run} />
      ))}
      {awards.length === 0 && !adding ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Még nincs díj. Futtassa a <code>npm run seed:awards</code> parancsot a hat alapdíj felvételéhez, vagy vegyen fel újat.</p> : null}
    </div>
  )
}

function AwardCard({ award, index, count, pending, run, onCancel, onSaved }: { award: AwardRow; index: number; count: number; pending: boolean; run: (fn: () => Promise<AwardActionResult>, after?: () => void) => void; onCancel?: () => void; onSaved?: () => void }) {
  const isNew = award.id === ""
  const [data, setData] = useState<AwardInput>({ name: award.name, description: award.description, entriesText: award.entriesText })
  const [errors, setErrors] = useState<AwardErrors>({})
  const dirty = isNew || data.name !== award.name || data.description !== award.description || data.entriesText !== award.entriesText
  const parsed = parseEntries(data.entriesText)
  const recipients = parsed.entries.reduce((n, e) => n + e.names.length, 0)

  function update<K extends keyof AwardInput>(key: K, value: AwardInput[K]) {
    setData({ ...data, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  function save() {
    run(
      async () => {
        const r = await saveAward(isNew ? null : award.id, data)
        if (!r.ok) setErrors(r.errors ?? {})
        return r
      },
      () => onSaved?.(),
    )
  }

  return (
    <Card className={award.hidden ? "border-dashed opacity-80" : undefined}>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{isNew ? "Új díj" : award.name}</CardTitle>
          {award.hidden ? <Badge variant="outline">rejtett</Badge> : null}
          {!isNew ? <span className="text-xs text-muted-foreground tabular-nums">{parsed.entries.length} év · {recipients} díjazott</span> : null}
        </div>
        {!isNew ? (
          <div className="flex items-center gap-1">
            <Button size="icon-sm" variant="ghost" aria-label="Feljebb" disabled={pending || index === 0} onClick={() => run(() => moveAward(award.id, "fel"))}><ArrowUpIcon /></Button>
            <Button size="icon-sm" variant="ghost" aria-label="Lejjebb" disabled={pending || index === count - 1} onClick={() => run(() => moveAward(award.id, "le"))}><ArrowDownIcon /></Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setAwardHidden(award.id, !award.hidden))}>
              {award.hidden ? <EyeIcon data-icon="inline-start" /> : <EyeOffIcon data-icon="inline-start" />}
              {award.hidden ? "Megjelenítés" : "Elrejtés"}
            </Button>
            <Button size="icon-sm" variant="ghost" className="text-destructive" aria-label="Díj törlése" disabled={pending} onClick={() => window.confirm(`Törli a(z) „${award.name}” díjat?`) && run(() => deleteAward(award.id))}><Trash2Icon /></Button>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          noValidate
        >
          <FieldGroup>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex flex-col gap-5">
                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor={`award-name-${award.id || "uj"}`}>A díj neve</FieldLabel>
                  <Input id={`award-name-${award.id || "uj"}`} value={data.name} onChange={(e) => update("name", e.target.value)} maxLength={AWARD_NAME_MAX} disabled={pending} aria-invalid={Boolean(errors.name) || undefined} />
                  <FieldError>{errors.name}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`award-desc-${award.id || "uj"}`}>Leírás</FieldLabel>
                  <Textarea id={`award-desc-${award.id || "uj"}`} value={data.description} onChange={(e) => update("description", e.target.value)} rows={6} maxLength={AWARD_DESCRIPTION_MAX} disabled={pending} />
                  <FieldDescription>{data.description.length} / {AWARD_DESCRIPTION_MAX} karakter.</FieldDescription>
                </Field>
              </div>
              <Field data-invalid={Boolean(errors.entriesText) || undefined}>
                <FieldLabel htmlFor={`award-entries-${award.id || "uj"}`}>Díjazottak évenként</FieldLabel>
                <Textarea
                  id={`award-entries-${award.id || "uj"}`}
                  value={data.entriesText}
                  onChange={(e) => update("entriesText", e.target.value)}
                  rows={10}
                  disabled={pending}
                  className="font-mono text-sm"
                  placeholder={"2027 Dr. Minta Anna; Minta Egészségház\n2026 Prof. Dr. Példa Béla"}
                  aria-invalid={Boolean(errors.entriesText) || undefined}
                />
                <FieldDescription>Soronként egy év: az évszám, utána a díjazott(ak) neve; több díjazottat pontosvesszővel válasszon el. Személy, szervezet vagy szerzői közösség neve is lehet. Az oldalon az évek a legújabbal kezdve jelennek meg; az üres évek nem látszanak.</FieldDescription>
                <FieldError>{errors.entriesText ?? (parsed.errors.length > 0 ? parsed.errors.join(" ") : undefined)}</FieldError>
              </Field>
            </div>
          </FieldGroup>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={pending || !dirty || parsed.errors.length > 0}>
              <SaveIcon data-icon="inline-start" />
              {isNew ? "Díj létrehozása" : "Mentés"}
            </Button>
            {onCancel ? <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={pending}>Mégse</Button> : null}
            {dirty && !isNew ? <span className="text-xs font-medium text-amber-800">Nem mentett módosítás.</span> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
