"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { LogInIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function MemberLoginForm({ justActivated, returnTo }: { justActivated: boolean; returnTo: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await signIn("member-password", { email, password, redirect: false })
    if (result?.ok) {
      router.replace(returnTo)
      router.refresh()
      return
    }
    setError(result?.error && result.error !== "CredentialsSignin" ? result.error : "Hibás e-mail-cím vagy jelszó.")
    setBusy(false)
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {justActivated ? <Alert><AlertTitle>Fiókja aktiválva</AlertTitle><AlertDescription>Lépjen be az e-mail-címével és az imént beállított jelszóval.</AlertDescription></Alert> : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">E-mail-cím</FieldLabel>
          <Input id="login-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} required />
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="login-password">Jelszó</FieldLabel>
          <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} required />
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={busy || !email || !password}>
        {busy ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
        {busy ? "Belépés…" : "Bejelentkezés"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Még nem tag? <Link href="/tagsag" className="font-medium underline underline-offset-4">Tudjon meg többet a tagságról</Link>. <Link href="/elfelejtett-jelszo" className="font-medium underline underline-offset-4">Elfelejtette a jelszavát?</Link>
      </p>
    </form>
  )
}
