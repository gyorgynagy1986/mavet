"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { CheckCircle2Icon, SendIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { privacyNoticeVersion } from "@/lib/data/site"
import { emailErrorMessage, validateEmail } from "@/lib/validation/email"

type Errors = Partial<Record<"name" | "email" | "message" | "consent", string>>

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "limited">("idle")
  const [errors, setErrors] = useState<Errors>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      consent: formData.get("consent") === "on",
    }
    const next: Errors = {}
    if (values.name.length < 2) next.name = "Adja meg a nevét."
    const emailResult = validateEmail(values.email)
    if (!emailResult.ok) next.email = emailErrorMessage(emailResult)
    if (values.message.length < 10) next.message = "Az üzenet legalább 10 karakter legyen."
    if (!values.consent) next.consent = "Az adatkezelési hozzájárulás szükséges."
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus("submitting")
    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, privacyNoticeVersion }),
      })
      setStatus(response.status === 429 ? "limited" : response.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") return <Alert aria-live="polite"><CheckCircle2Icon /><AlertTitle>Az üzenetet rögzítettük</AlertTitle><AlertDescription>Köszönjük a megkeresést.</AlertDescription></Alert>

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name) || undefined}><FieldLabel htmlFor="contact-name">Név</FieldLabel><Input id="contact-name" name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} disabled={status === "submitting"} /><FieldError>{errors.name}</FieldError></Field>
        <Field data-invalid={Boolean(errors.email) || undefined}><FieldLabel htmlFor="contact-email">E-mail-cím</FieldLabel><Input id="contact-email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} disabled={status === "submitting"} /><FieldError>{errors.email}</FieldError></Field>
        <Field data-invalid={Boolean(errors.message) || undefined}><FieldLabel htmlFor="contact-message">Üzenet</FieldLabel><Textarea id="contact-message" name="message" rows={6} aria-invalid={Boolean(errors.message)} disabled={status === "submitting"} /><FieldError>{errors.message}</FieldError></Field>
        <Field data-invalid={Boolean(errors.consent) || undefined} orientation="horizontal"><Checkbox id="contact-consent" name="consent" aria-invalid={Boolean(errors.consent)} disabled={status === "submitting"} /><FieldContent><FieldLabel htmlFor="contact-consent" className="font-normal">Hozzájárulok, hogy a MAVET a megadott adataimat a kapcsolatfelvételi üzenetem megválaszolásához kezelje.</FieldLabel><p className="text-sm text-muted-foreground"><Link className="underline underline-offset-4" href="/adatkezeles">Adatkezelési tájékoztató</Link></p><FieldError>{errors.consent}</FieldError></FieldContent></Field>
      </FieldGroup>
      {status === "error" && <Alert variant="destructive"><AlertTitle>Az üzenet nem küldhető el</AlertTitle><AlertDescription>Próbálja újra később, vagy írjon közvetlenül e-mailt.</AlertDescription></Alert>}
      {status === "limited" && <Alert variant="destructive"><AlertTitle>Túl sok próbálkozás</AlertTitle><AlertDescription>Kérjük, várjon néhány percet, majd próbálja újra.</AlertDescription></Alert>}
      <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={status === "submitting"}>{status === "submitting" ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}{status === "submitting" ? "Küldés…" : "Üzenet küldése"}</Button>
    </form>
  )
}

