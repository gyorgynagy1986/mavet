"use client"

import { useState, type FormEvent } from "react"
import { KeyRoundIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { PASSWORD_MIN_LENGTH, passwordError } from "@/lib/validation/password"
import { changePassword } from "./actions"

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [again, setAgain] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const local = passwordError(next) ?? (next !== again ? "A két új jelszó nem egyezik." : null)
    setError(local)
    if (local) return
    setBusy(true)
    const result = await changePassword(current, next, again)
    if (result.ok) {
      toast.success("Jelszava megváltozott.")
      setCurrent("")
      setNext("")
      setAgain("")
    } else setError(result.message)
    setBusy(false)
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="pw-current">Jelenlegi jelszó</FieldLabel>
          <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} disabled={busy} />
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="pw-next">Új jelszó</FieldLabel>
          <Input id="pw-next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} disabled={busy} />
          <FieldDescription>Legalább {PASSWORD_MIN_LENGTH} karakter, betűvel és számmal.</FieldDescription>
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="pw-again">Új jelszó még egyszer</FieldLabel>
          <Input id="pw-again" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} disabled={busy} />
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" variant="soft" className="w-fit" disabled={busy || !current || !next || !again}>
        {busy ? <Spinner data-icon="inline-start" /> : <KeyRoundIcon data-icon="inline-start" />}
        Jelszó módosítása
      </Button>
    </form>
  )
}
