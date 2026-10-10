"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SaveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { workgroupOptions } from "@/lib/data/site"
import { BIO_MAX, validateProfile, type ProfileErrors, type ProfileInput } from "@/lib/validation/profile"
import { PROFILE_SAVE_EVENT } from "@/lib/validation/photo"
import { updateProfile } from "./actions"

export function ProfileForm({ initial, email, category, office }: { initial: ProfileInput; email: string; category: string; office: string | null }) {
  const router = useRouter()
  const [form, setForm] = useState<ProfileInput>(initial)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [busy, setBusy] = useState(false)

  function update<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const local = validateProfile(form)
    setErrors(local)
    if (Object.keys(local).length > 0) return
    setBusy(true)
    // A picked photo that was not saved separately goes up together with the profile.
    window.dispatchEvent(new Event(PROFILE_SAVE_EVENT))
    const r = await updateProfile(form)
    if (r.ok) {
      toast.success(r.message)
      router.refresh()
    } else {
      setErrors(r.errors ?? {})
      toast.error(r.message)
    }
    setBusy(false)
  }

  const invalid = (k: keyof ProfileErrors) => Boolean(errors[k]) || undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adataim</CardTitle>
        <CardDescription>A módosítás nem írja át a korábbi jelentkezését vagy a tagsági nyilvántartás döntéseit. A kategóriát és a tisztséget a Társaság kezeli.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-6">
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-[8rem_1fr_1fr]">
              <Field>
                <FieldLabel htmlFor="p-title">Titulus</FieldLabel>
                <select id="p-title" value={form.title} onChange={(e) => update("title", e.target.value as ProfileInput["title"])} disabled={busy} className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  <option value="">Nincs</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </Field>
              <Field data-invalid={invalid("lastName")}><FieldLabel htmlFor="p-last">Vezetéknév</FieldLabel><Input id="p-last" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} disabled={busy} /><FieldError>{errors.lastName}</FieldError></Field>
              <Field data-invalid={invalid("firstName")}><FieldLabel htmlFor="p-first">Keresztnév</FieldLabel><Input id="p-first" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} disabled={busy} /><FieldError>{errors.firstName}</FieldError></Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field><FieldLabel>E-mail-cím</FieldLabel><Input value={email} readOnly disabled /><FieldDescription>Változtatásához a Társasághoz kell fordulni.</FieldDescription></Field>
              <Field><FieldLabel>Tagsági kategória</FieldLabel><Input value={category} readOnly disabled /></Field>
              <Field><FieldLabel>Tisztség</FieldLabel><Input value={office ?? "–"} readOnly disabled /></Field>
            </div>

            <FieldSet>
              <FieldLegend>Szakmai adatok</FieldLegend>
              <Field><FieldLabel htmlFor="p-specialty">Szakterület</FieldLabel><Input id="p-specialty" value={form.specialty} onChange={(e) => update("specialty", e.target.value)} disabled={busy} /></Field>
              <Field><FieldLabel htmlFor="p-workplace">Munkahely</FieldLabel><Input id="p-workplace" value={form.workplace} onChange={(e) => update("workplace", e.target.value)} disabled={busy} /></Field>
              <Field data-invalid={invalid("bio")}>
                <FieldLabel htmlFor="p-bio">Rövid bemutatkozás</FieldLabel>
                <Textarea id="p-bio" rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} disabled={busy} maxLength={BIO_MAX} />
                <FieldDescription>{form.bio.length} / {BIO_MAX} karakter</FieldDescription>
                <FieldError>{errors.bio}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="p-interests">Érdeklődési területek</FieldLabel>
                <Input id="p-interests" value={form.interests} onChange={(e) => update("interests", e.target.value)} disabled={busy} placeholder="pl. alapellátás, prevenció, telemedicina" />
                <FieldDescription>Vesszővel elválasztva, legfeljebb 10.</FieldDescription>
              </Field>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Munkacsoport-tagság</FieldLegend>
              <FieldDescription>Jelölje be azokat a munkacsoportokat, amelyekbe a csoportvezető felvette. A csatlakozási kérelmet a Munkacsoportok oldalon küldheti el.</FieldDescription>
              <div className="grid gap-2 sm:grid-cols-2">
                {workgroupOptions.map((w) => (
                  <label key={w.id} className="flex items-start gap-2 text-sm">
                    <Checkbox checked={form.workgroups.includes(w.id)} onCheckedChange={(c) => update("workgroups", c === true ? [...form.workgroups, w.id] : form.workgroups.filter((x) => x !== w.id))} disabled={busy} className="mt-0.5" />
                    {w.name}
                  </label>
                ))}
              </div>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Személyes adatok (más tagok nem látják)</FieldLegend>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={invalid("birthDate")}><FieldLabel htmlFor="p-birth">Születési dátum</FieldLabel><Input id="p-birth" type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} disabled={busy} className="w-fit" /><FieldError>{errors.birthDate}</FieldError></Field>
                <Field><FieldLabel htmlFor="p-birthplace">Születési hely</FieldLabel><Input id="p-birthplace" value={form.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} disabled={busy} /></Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
                <Field><FieldLabel htmlFor="p-postal">Irányítószám</FieldLabel><Input id="p-postal" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} disabled={busy} /></Field>
                <Field><FieldLabel htmlFor="p-city">Település</FieldLabel><Input id="p-city" value={form.city} onChange={(e) => update("city", e.target.value)} disabled={busy} /></Field>
              </div>
              <Field><FieldLabel htmlFor="p-street">Utca, házszám</FieldLabel><Input id="p-street" value={form.street} onChange={(e) => update("street", e.target.value)} disabled={busy} /></Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field><FieldLabel htmlFor="p-country">Ország</FieldLabel><Input id="p-country" value={form.country} onChange={(e) => update("country", e.target.value)} disabled={busy} /></Field>
                <Field data-invalid={invalid("phone")}><FieldLabel htmlFor="p-phone">Telefonszám</FieldLabel><Input id="p-phone" type="tel" autoComplete="tel" placeholder="+36 30 123 4567" aria-invalid={invalid("phone")} value={form.phone} onChange={(e) => update("phone", e.target.value)} disabled={busy} /><FieldError>{errors.phone}</FieldError></Field>
              </div>
            </FieldSet>
          </FieldGroup>
          <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={busy}>
            {busy ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
            Profil mentése
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
