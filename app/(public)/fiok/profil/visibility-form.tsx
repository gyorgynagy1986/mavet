"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { updateVisibility } from "./actions"

type Flags = { enabled: boolean; photo: boolean; specialty: boolean; workplace: boolean; bio: boolean; interests: boolean; workgroups: boolean }

const FIELDS: { key: keyof Omit<Flags, "enabled">; label: string }[] = [
  { key: "photo", label: "Profilkép" },
  { key: "specialty", label: "Szakterület" },
  { key: "workplace", label: "Munkahely" },
  { key: "bio", label: "Bemutatkozás" },
  { key: "interests", label: "Érdeklődési területek" },
  { key: "workgroups", label: "Munkacsoport-tagság" },
]

export function VisibilityForm({ initial, boardMember, office }: { initial: Flags; boardMember: boolean; office: string | null }) {
  const router = useRouter()
  const [flags, setFlags] = useState<Flags>(initial)
  const [pending, startTransition] = useTransition()
  const saved = useRef<Flags>(initial)

  /** Every change is saved at once (9.3: no approval step); on failure the switch jumps back. */
  function apply(next: Flags) {
    const previous = saved.current
    setFlags(next)
    startTransition(async () => {
      try {
        const r = await updateVisibility(next)
        if (r.ok) {
          saved.current = next
          toast.success(r.message)
          router.refresh()
        } else {
          setFlags(previous)
          toast.error(r.message)
        }
      } catch {
        setFlags(previous)
        toast.error("A beállítás mentése nem sikerült. Próbálja újra.")
      }
    })
  }

  return (
    <Card className={flags.enabled ? "border-mavet-blue/40" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {flags.enabled ? <EyeIcon className="size-5 text-mavet-blue" aria-hidden="true" /> : <EyeOffIcon className="size-5 text-muted-foreground" aria-hidden="true" />}
          Megjelenés engedélyezése
        </CardTitle>
        <CardDescription>
          Bekapcsolva a neve és az alább engedélyezett adatai megjelennek a tagi névjegyzékben és a részletes tagi profilján, amelyet csak bejelentkezett, aktív tagok látnak.
          {boardMember ? ` Mivel ${office ? `${office}ként ` : ""}a Társaság vezetőségének vagy bizottságának tagja, bekapcsolva a publikus bemutatkozó oldalon is megjelenik.` : " Általános tagként a kapcsoló nem tesz publikussá: a weboldal látogatói nem látják."}
          {" "}Kikapcsolva sehol nem jelenik meg, a vezetőségi oldalon sem. A változás azonnal érvényes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex items-center gap-3 text-sm font-semibold">
          <Switch checked={flags.enabled} onCheckedChange={(c) => apply({ ...flags, enabled: c === true })} disabled={pending} />
          {flags.enabled ? "Engedélyezve" : "Kikapcsolva"}
          {pending ? <Spinner className="size-4 text-muted-foreground" /> : null}
        </label>
        <fieldset className={!flags.enabled ? "opacity-50" : undefined} disabled={!flags.enabled || pending}>
          <legend className="mb-2 text-sm text-muted-foreground">A név mellett megjeleníthető adatok:</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <Checkbox checked={flags[f.key]} onCheckedChange={(c) => apply({ ...flags, [f.key]: c === true })} />
                {f.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Elérhetőségi, születési és fizetési adatok soha nem jelennek meg más tagoknak.</p>
        </fieldset>
        <p className="text-xs text-muted-foreground">Minden változtatás azonnal mentésre kerül, külön mentés gomb nincs.</p>
      </CardContent>
    </Card>
  )
}
