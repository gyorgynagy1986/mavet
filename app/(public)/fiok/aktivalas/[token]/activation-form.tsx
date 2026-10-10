"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { KeyRoundIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { MEMBER_ACCOUNT_PATH } from "@/lib/auth-paths"
import { PASSWORD_MIN_LENGTH, passwordError } from "@/lib/validation/password"
import { activateAccount } from "./actions"

export function ActivationForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [again, setAgain] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const local = passwordError(password) ?? (password !== again ? "A két jelszó nem egyezik." : null)
    setError(local)
    if (local) return
    setBusy(true)
    const result = await activateAccount(token, password, again)
    if (!result.ok) {
      setError(result.message)
      setBusy(false)
      return
    }
    const login = await signIn("member-password", { email: result.email, password, redirect: false })
    if (login?.ok) {
      router.replace(MEMBER_ACCOUNT_PATH)
      router.refresh()
    } else {
      router.replace("/belepes?aktivalva=1")
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="act-password">Jelszó</FieldLabel>
          <Input id="act-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
          <FieldDescription>Legalább {PASSWORD_MIN_LENGTH} karakter, betűvel és számmal.</FieldDescription>
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="act-password-again">Jelszó még egyszer</FieldLabel>
          <Input id="act-password-again" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} disabled={busy} />
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
      {error ? <Alert variant="destructive" aria-live="polite"><AlertTitle>Nem sikerült</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={busy || !password || !again}>
        {busy ? <Spinner data-icon="inline-start" /> : <KeyRoundIcon data-icon="inline-start" />}
        {busy ? "Aktiválás…" : "Jelszó beállítása és belépés"}
      </Button>
    </form>
  )
}
