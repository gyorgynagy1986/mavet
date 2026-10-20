"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { privacyNoticeVersion } from "@/lib/data/site"
import { isValidEmail } from "@/lib/validation/email"

type Status = "idle" | "submitting" | "done"

/** Newsletter sign-up (10.2): e-mail + separate consent with the privacy notice linked in the sentence; neutral success. */
export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [errors, setErrors] = useState<{ email?: string; consent?: string; form?: string }>({})

  async function submit(event: FormEvent) {
    event.preventDefault()
    const next: typeof errors = {}
    if (!isValidEmail(email.trim())) next.email = "Adjon meg érvényes e-mail-címet."
    if (!consent) next.consent = "A feliratkozáshoz a nyilatkozat elfogadása szükséges."
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setStatus("submitting")
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), consent, privacyNoticeVersion }) })
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      if (response.ok && data.ok) {
        setStatus("done")
        return
      }
      setErrors({ form: data.message ?? "A feliratkozás nem sikerült. Próbálja újra." })
      setStatus("idle")
    } catch {
      setErrors({ form: "Hálózati hiba. Ellenőrizze a kapcsolatot, és próbálja újra." })
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
        <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-mavet-blue" aria-hidden="true" />
        <div>
          <p className="font-semibold text-mavet-navy">Köszönjük!</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">A megadott címet rögzítettük a hírlevél-feliratkozók között. A hírlevélről bármikor leiratkozhat a levelekben lévő hivatkozással.</p>
        </div>
      </div>
    )
  }

  const submitting = status === "submitting"
  return (
    <form onSubmit={submit} noValidate className="flex w-full max-w-xl flex-col gap-4">
      {/* The field and the button share a grid row, so the button's top edge stays level with the input even when an error appears below it. */}
      <div className="grid items-start gap-x-3 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label htmlFor="newsletter-email" className="text-sm font-medium sm:col-start-1">E-mail-cím</label>
        <div className="hidden sm:block" />
        <Field className="sm:col-start-1" data-invalid={Boolean(errors.email) || undefined}>
          <Input id="newsletter-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pelda@email.hu" disabled={submitting} aria-invalid={Boolean(errors.email) || undefined} className="h-10" />
          <FieldError>{errors.email}</FieldError>
        </Field>
        <Button type="submit" className="h-10 shrink-0 sm:col-start-2 sm:row-start-2" disabled={submitting}>
          {submitting ? <Spinner data-icon="inline-start" /> : null}
          {submitting ? "Feliratkozom…" : "Feliratkozom"}
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox id="newsletter-consent" checked={consent} onCheckedChange={(c) => setConsent(c === true)} disabled={submitting} aria-invalid={Boolean(errors.consent) || undefined} className="mt-1" />
          <label htmlFor="newsletter-consent" className="text-sm leading-6">
            Hozzájárulok, hogy a MAVET hírlevelet küldjön az e-mail-címemre. A részleteket az{" "}
            <Link href="/adatkezeles" className="underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Adatkezelési tájékoztató</Link> tartalmazza.
          </label>
        </div>
        {errors.consent ? <p className="pl-7 text-sm font-medium text-destructive">{errors.consent}</p> : null}
      </div>
      {errors.form ? <p role="alert" className="text-sm font-medium text-destructive">{errors.form}</p> : null}
    </form>
  )
}
