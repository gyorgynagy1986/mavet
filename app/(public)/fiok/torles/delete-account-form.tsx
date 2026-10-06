"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Trash2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { deleteOwnAccount } from "./actions"

export function DeleteAccountForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!window.confirm("Biztosan véglegesen törli a fiókját és a tagságát?")) return
    setBusy(true)
    setError(null)
    const r = await deleteOwnAccount(password, confirmation)
    if (!r.ok) {
      setError(r.message)
      setBusy(false)
      return
    }
    await signOut({ redirect: false })
    router.replace("/?fiok=torolve")
    router.refresh()
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="del-password">Jelenlegi jelszó</FieldLabel>
          <Input id="del-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="del-confirm">Megerősítés</FieldLabel>
          <Input id="del-confirm" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} disabled={busy} autoComplete="off" />
          <FieldDescription>Írja be nagybetűkkel: TÖRLÉS</FieldDescription>
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
      {error ? <Alert variant="destructive" aria-live="polite"><AlertTitle>Nem sikerült</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button type="submit" variant="destructive" size="lg" className="w-full sm:w-fit" disabled={busy || !password || confirmation.trim().toUpperCase() !== "TÖRLÉS"}>
        {busy ? <Spinner data-icon="inline-start" /> : <Trash2Icon data-icon="inline-start" />}
        Fiók és tagság végleges törlése
      </Button>
    </form>
  )
}
