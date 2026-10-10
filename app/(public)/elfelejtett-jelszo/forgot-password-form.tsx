"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { CheckCircle2Icon, SendIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { MEMBER_LOGIN_PATH } from "@/lib/auth-paths"
import { requestPasswordReset } from "./actions"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await requestPasswordReset(email)
    if (result.ok) setDone(true)
    else setError(result.message)
    setBusy(false)
  }

  if (done) {
    return (
      <Alert aria-live="polite">
        <CheckCircle2Icon className="text-mavet-blue" />
        <AlertTitle>Kérését rögzítettük</AlertTitle>
        <AlertDescription>
          Ha a megadott címhez aktivált tagi fiók tartozik, elküldtük az új jelszó beállításához szükséges linket. Ellenőrizze a postafiókját (a levélszemét mappát is). <Link href={MEMBER_LOGIN_PATH} className="font-medium underline underline-offset-4">Vissza a bejelentkezéshez</Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="forgot-email">E-mail-cím</FieldLabel>
          <Input id="forgot-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} required />
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={busy || !email}>
        {busy ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
        {busy ? "Küldés…" : "Link kérése"}
      </Button>
    </form>
  )
}
