"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { CheckCircle2Icon, SendIcon } from "lucide-react"
import { preliminaryMembershipCategories, privacyNoticeVersion } from "@/lib/data/site"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { emailErrorMessage, validateEmail } from "@/lib/validation/email"

type Status = "idle" | "submitting" | "success" | "error" | "limited"

type Errors = Partial<Record<"category" | "lastName" | "firstName" | "email" | "consent", string>>

export function PreliminaryMembershipForm({ initialCategory = "" }: { initialCategory?: string }) {
  const [status, setStatus] = useState<Status>("idle")
  const [category, setCategory] = useState(initialCategory)
  const [errors, setErrors] = useState<Errors>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get("title") ?? "")
    const lastName = String(formData.get("lastName") ?? "").trim()
    const firstName = String(formData.get("firstName") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const consent = formData.get("consent") === "on"
    const emailResult = validateEmail(email)
    const nextErrors: Errors = {
      category: category ? undefined : "Válasszon tagsági kategóriát.",
      lastName: lastName ? undefined : "Adja meg a vezetéknevét.",
      firstName: firstName ? undefined : "Adja meg a keresztnevét.",
      email: emailResult.ok ? undefined : emailErrorMessage(emailResult),
      consent: consent ? undefined : "Az adatkezelési hozzájárulás szükséges.",
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setStatus("submitting")
    try {
      const response = await fetch("/api/preliminary-membership-applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category, title, lastName, firstName, email, consent, privacyNoticeVersion }),
      })
      setStatus(response.status === 429 ? "limited" : response.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return <Alert aria-live="polite"><CheckCircle2Icon /><AlertTitle>Rögzítettük előzetes jelentkezését</AlertTitle><AlertDescription>A megadott címre visszaigazoló e-mailt küldünk. Ha erre a címre korábban már érkezett jelentkezés, azt nem rögzítettük újra, de a visszaigazolást ismét elküldtük. A Közgyűlés döntéséig nincs további teendője.</AlertDescription></Alert>
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.category) || undefined}>
          <FieldLabel htmlFor="membership-category">Tagsági kategória</FieldLabel>
          <Select value={category} onValueChange={(value) => setCategory(value ?? "")} name="category" disabled={status === "submitting"}>
            <SelectTrigger id="membership-category" className="w-full" aria-invalid={Boolean(errors.category)}><SelectValue placeholder="Válasszon kategóriát">{(value) => preliminaryMembershipCategories.find((item) => item.id === value)?.name ?? "Válasszon kategóriát"}</SelectValue></SelectTrigger>
            <SelectContent><SelectGroup>{preliminaryMembershipCategories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
          <FieldError>{errors.category}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="membership-title">Titulus</FieldLabel>
          <Select name="title" defaultValue="" disabled={status === "submitting"}>
            <SelectTrigger id="membership-title" className="w-full"><SelectValue placeholder="Nincs titulus" /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="">Nincs titulus</SelectItem><SelectItem value="Dr.">Dr.</SelectItem><SelectItem value="Prof.">Prof.</SelectItem></SelectGroup></SelectContent>
          </Select>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.lastName) || undefined}><FieldLabel htmlFor="membership-last-name">Vezetéknév</FieldLabel><Input id="membership-last-name" name="lastName" autoComplete="family-name" aria-invalid={Boolean(errors.lastName)} disabled={status === "submitting"} /><FieldError>{errors.lastName}</FieldError></Field>
          <Field data-invalid={Boolean(errors.firstName) || undefined}><FieldLabel htmlFor="membership-first-name">Keresztnév</FieldLabel><Input id="membership-first-name" name="firstName" autoComplete="given-name" aria-invalid={Boolean(errors.firstName)} disabled={status === "submitting"} /><FieldError>{errors.firstName}</FieldError></Field>
        </div>
        <Field data-invalid={Boolean(errors.email) || undefined}><FieldLabel htmlFor="membership-email">E-mail-cím</FieldLabel><Input id="membership-email" name="email" type="email" autoComplete="email" placeholder="nev@pelda.hu" aria-invalid={Boolean(errors.email)} disabled={status === "submitting"} /><FieldError>{errors.email}</FieldError></Field>
        <Field data-invalid={Boolean(errors.consent) || undefined} orientation="horizontal">
          <Checkbox id="membership-consent" name="consent" aria-invalid={Boolean(errors.consent)} disabled={status === "submitting"} />
          <FieldContent><p className="text-sm leading-6"><FieldLabel htmlFor="membership-consent" className="inline font-normal leading-6">Hozzájárulok, hogy a MAVET az előzetes tagsági jelentkezésemet rögzítse, visszaigazoló e-mailt küldjön, és a teljes jelentkezési folyamat elkészültekor ugyanarra az e-mail-címre felhívást küldjön a folytatáshoz, az </FieldLabel><Link className="font-medium underline underline-offset-4" href="/adatkezeles">Adatkezelési tájékoztatóban</Link> foglaltak szerint.</p><FieldError>{errors.consent}</FieldError></FieldContent>
        </Field>
      </FieldGroup>
      {status === "error" && <Alert variant="destructive" aria-live="polite"><AlertTitle>Nem sikerült a beküldés</AlertTitle><AlertDescription>Próbálja újra később.</AlertDescription></Alert>}
      {status === "limited" && <Alert variant="destructive" aria-live="polite"><AlertTitle>Túl sok próbálkozás</AlertTitle><AlertDescription>Kérjük, várjon néhány percet, majd próbálja újra.</AlertDescription></Alert>}
      <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={status === "submitting"}>{status === "submitting" ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}{status === "submitting" ? "Küldés…" : "Előzetes jelentkezés rögzítése"}</Button>
    </form>
  )
}
