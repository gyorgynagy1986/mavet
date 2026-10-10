"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, SaveIcon, SendIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { MembershipApplicationCategory } from "@/lib/models/membership-application"
import { validateFullForm, type FullFormErrors, type FullFormInput } from "@/lib/validation/membership-application"
import { finalizeApplication, saveApplicationDraft } from "./actions"

type Busy = "idle" | "saving" | "finalizing"

export function FullApplicationForm({ token, category, initial }: { token: string; category: MembershipApplicationCategory; initial: FullFormInput }) {
  const router = useRouter()
  const [form, setForm] = useState<FullFormInput>(initial)
  const [statutes, setStatutes] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [errors, setErrors] = useState<FullFormErrors>({})
  const [busy, setBusy] = useState<Busy>("idle")
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const dirtyRef = useRef(false)

  function update<K extends keyof FullFormInput>(key: K, value: FullFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
    dirtyRef.current = true
  }

  // Autosave 2 s after the last change, so a closed tab does not lose the data.
  useEffect(() => {
    if (!dirty || busy !== "idle") return
    const timer = setTimeout(async () => {
      const result = await saveApplicationDraft(token, form)
      if (result.ok) {
        setDirty(false)
        dirtyRef.current = false
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [dirty, form, token, busy])

  async function handleSave() {
    setBusy("saving")
    setMessage(null)
    const result = await saveApplicationDraft(token, form)
    setMessage(result.ok ? { type: "ok", text: "Elmentettük. Ugyanezzel a linkkel bármikor folytathatja." } : { type: "error", text: result.message })
    if (result.ok) setDirty(false)
    setBusy("idle")
  }

  async function handleFinalize(event: FormEvent) {
    event.preventDefault()
    const local = validateFullForm(form, category)
    if (!statutes) local.statutes = "Az Alapszabály elfogadása szükséges."
    if (!privacy) local.privacy = "Az adatkezelési tájékoztató elfogadása szükséges."
    setErrors(local)
    if (Object.keys(local).length > 0) {
      setMessage({ type: "error", text: "Néhány mező még hiányzik vagy hibás; a jelzett mezőket kérjük, ellenőrizze." })
      return
    }
    setBusy("finalizing")
    setMessage(null)
    const result = await finalizeApplication(token, form, { statutes, privacy })
    if (result.ok) {
      router.refresh()
      return
    }
    setErrors(result.errors ?? {})
    setMessage({ type: "error", text: result.message ?? "Néhány mező még hiányzik vagy hibás; a jelzett mezőket kérjük, ellenőrizze." })
    setBusy("idle")
  }

  const disabled = busy !== "idle"
  const student = category === "hallgatoi"
  const invalid = (key: keyof FullFormErrors) => Boolean(errors[key]) || undefined

  return (
    <form onSubmit={handleFinalize} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={invalid("birthDate")}>
          <FieldLabel htmlFor="app-birth-date">Születési dátum</FieldLabel>
          <Input id="app-birth-date" type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} aria-invalid={invalid("birthDate")} disabled={disabled} className="w-fit" />
          {category === "ifjusagi" ? <FieldDescription>Az Ifjúsági tagság a 35. életév betöltéséig választható.</FieldDescription> : null}
          <FieldError>{errors.birthDate}</FieldError>
        </Field>

        <FieldSet>
          <FieldLegend>Levelezési cím</FieldLegend>
          <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
            <Field data-invalid={invalid("postalCode")}>
              <FieldLabel htmlFor="app-postal">Irányítószám</FieldLabel>
              <Input id="app-postal" inputMode="numeric" autoComplete="postal-code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} aria-invalid={invalid("postalCode")} disabled={disabled} />
              <FieldError>{errors.postalCode}</FieldError>
            </Field>
            <Field data-invalid={invalid("city")}>
              <FieldLabel htmlFor="app-city">Település</FieldLabel>
              <Input id="app-city" autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} aria-invalid={invalid("city")} disabled={disabled} />
              <FieldError>{errors.city}</FieldError>
            </Field>
          </div>
          <Field data-invalid={invalid("street")}>
            <FieldLabel htmlFor="app-street">Utca, házszám</FieldLabel>
            <Input id="app-street" autoComplete="street-address" value={form.street} onChange={(e) => update("street", e.target.value)} aria-invalid={invalid("street")} disabled={disabled} />
            <FieldError>{errors.street}</FieldError>
          </Field>
          <Field data-invalid={invalid("country")}>
            <FieldLabel htmlFor="app-country">Ország</FieldLabel>
            <Input id="app-country" autoComplete="country-name" value={form.country} onChange={(e) => update("country", e.target.value)} aria-invalid={invalid("country")} disabled={disabled} />
            <FieldError>{errors.country}</FieldError>
          </Field>
        </FieldSet>

        <Field data-invalid={invalid("phone")}>
          <FieldLabel htmlFor="app-phone">Telefonszám</FieldLabel>
          <Input id="app-phone" type="tel" autoComplete="tel" placeholder="+36 30 123 4567" value={form.phone} onChange={(e) => update("phone", e.target.value)} aria-invalid={invalid("phone")} disabled={disabled} />
          <FieldError>{errors.phone}</FieldError>
        </Field>

        <Field data-invalid={invalid("specialty")}>
          <FieldLabel htmlFor="app-specialty">{student ? "Tanulmányi terület" : "Szakterület"}</FieldLabel>
          <Input id="app-specialty" value={form.specialty} onChange={(e) => update("specialty", e.target.value)} aria-invalid={invalid("specialty")} disabled={disabled} />
          <FieldError>{errors.specialty}</FieldError>
        </Field>

        <Field data-invalid={invalid("workplace")}>
          <FieldLabel htmlFor="app-workplace">Munkahely{student ? " (nem kötelező)" : ""}</FieldLabel>
          <Input id="app-workplace" autoComplete="organization" value={form.workplace} onChange={(e) => update("workplace", e.target.value)} aria-invalid={invalid("workplace")} disabled={disabled || form.noWorkplace} />
          {!student ? (
            <>
              <FieldDescription>Munkahely hiányában jelölje be az alábbit.</FieldDescription>
              <Field orientation="horizontal">
                <Checkbox id="app-no-workplace" checked={form.noWorkplace} onCheckedChange={(checked) => update("noWorkplace", checked === true)} disabled={disabled} />
                <FieldLabel htmlFor="app-no-workplace" className="font-normal">Nincs állandó munkahelyem</FieldLabel>
              </Field>
            </>
          ) : null}
          <FieldError>{errors.workplace}</FieldError>
        </Field>

        {category === "rendes" ? (
          <FieldSet data-invalid={invalid("medicalDegree")}>
            <FieldLegend>Végzettség</FieldLegend>
            <FieldDescription>Rendes tagság esetén az éves tagdíj orvos vagy gyógyszerész végzettséggel 10 000 Ft, egyébként 5 000 Ft.</FieldDescription>
            <div className="flex flex-col gap-2" role="radiogroup" aria-invalid={invalid("medicalDegree")}>
              {[
                { value: "orvos", label: "Orvos vagy gyógyszerész végzettségű vagyok" },
                { value: "nem_orvos", label: "Nem orvos és nem gyógyszerész végzettségű vagyok" },
              ].map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="medicalDegree" value={option.value} checked={form.medicalDegree === option.value} onChange={() => update("medicalDegree", option.value as FullFormInput["medicalDegree"])} disabled={disabled} className="size-4 accent-mavet-navy" />
                  {option.label}
                </label>
              ))}
            </div>
            <FieldError>{errors.medicalDegree}</FieldError>
          </FieldSet>
        ) : null}

        <FieldSet>
          <FieldLegend>Nyilatkozatok</FieldLegend>
          <Field data-invalid={invalid("statutes")} orientation="horizontal">
            <Checkbox id="app-statutes" checked={statutes} onCheckedChange={(c) => setStatutes(c === true)} aria-invalid={invalid("statutes")} disabled={disabled} />
            <FieldContent>
              <p className="text-sm leading-6"><FieldLabel htmlFor="app-statutes" className="inline font-normal leading-6">Elfogadom a Magyar Vidékegészségügyi Társaság </FieldLabel><Link className="font-medium underline underline-offset-4" target="_blank" href="/a-tarsasagrol#alapszabaly">Alapszabályát</Link>.</p>
              <FieldError>{errors.statutes}</FieldError>
            </FieldContent>
          </Field>
          <Field data-invalid={invalid("privacy")} orientation="horizontal">
            <Checkbox id="app-privacy" checked={privacy} onCheckedChange={(c) => setPrivacy(c === true)} aria-invalid={invalid("privacy")} disabled={disabled} />
            <FieldContent>
              <p className="text-sm leading-6"><FieldLabel htmlFor="app-privacy" className="inline font-normal leading-6">Megismertem az </FieldLabel><Link className="font-medium underline underline-offset-4" target="_blank" href="/adatkezeles">Adatkezelési tájékoztatót</Link>, és hozzájárulok, hogy a MAVET a tagsági jelentkezésem elbírálása és a tagsági nyilvántartás céljából kezelje az adataimat.</p>
              <FieldError>{errors.privacy}</FieldError>
            </FieldContent>
          </Field>
        </FieldSet>
      </FieldGroup>

      {message ? (
        <Alert variant={message.type === "error" ? "destructive" : "default"} aria-live="polite">
          {message.type === "ok" ? <CheckCircle2Icon className="text-mavet-blue" /> : null}
          <AlertTitle>{message.type === "ok" ? "Mentve" : "Nem sikerült"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={disabled}>
          {busy === "finalizing" ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
          {busy === "finalizing" ? "Küldés…" : "Jelentkezés véglegesítése"}
        </Button>
        <Button type="button" variant="soft" size="lg" onClick={handleSave} disabled={disabled}>
          {busy === "saving" ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
          Mentés, később folytatom
        </Button>
      </div>
    </form>
  )
}
