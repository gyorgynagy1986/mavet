"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { CheckIcon, Loader2Icon, LinkIcon, BellIcon, XIcon, ArchiveIcon, SaveIcon, KeyRoundIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { membershipCategories } from "@/lib/data/site"
import type { MembershipApplicationStatus } from "@/lib/models/membership-application"
import { useRouter } from "next/navigation"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { acceptApplication, deleteApplication, rejectApplication, resendActivationLink, resendContinueLink, saveInternalNote, sendManualReminder, withdrawApplication, type ActionResult } from "./actions"

export function ApplicationActions({ id, status, category, internalNote, awaitingActivation, canDelete }: { id: string; status: MembershipApplicationStatus; category: string; internalNote: string; awaitingActivation: boolean; canDelete: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [acceptCategory, setAcceptCategory] = useState(category)
  const [rejectMessage, setRejectMessage] = useState("")
  const [note, setNote] = useState(internalNote)

  function run(label: string, fn: () => Promise<ActionResult>, confirmText?: string, after?: () => void) {
    if (confirmText && !window.confirm(confirmText)) return
    startTransition(async () => {
      const result = await fn()
      if (result.ok) {
        toast.success(result.message)
        after?.()
      } else toast.error(result.message || `${label} sikertelen.`)
    })
  }

  const unfinished = status === "elozetes" || status === "megerositett"
  const open = unfinished || status === "bekuldott"

  return (
    <div className="space-y-6">
      {status === "bekuldott" ? (
        <Card>
          <CardHeader>
            <CardTitle>Elbírálás</CardTitle>
            <CardDescription>Elfogadáskor létrejön a tagi fiók, és a jelentkező aktiváló linket kap (díjköteles kategóriánál 2027-től fizetési felhívással). A kategória felülírható (spec 7.3).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="accept-category">Elfogadott kategória</Label>
              <select
                id="accept-category"
                value={acceptCategory}
                onChange={(e) => setAcceptCategory(e.target.value)}
                disabled={pending}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {membershipCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button className="w-full" disabled={pending} onClick={() => run("Elfogadás", () => acceptApplication(id, acceptCategory), "Biztosan elfogadja a jelentkezést? A jelentkező értesítést kap.")}>
                {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <CheckIcon data-icon="inline-start" aria-hidden="true" />}
                Elfogadás
              </Button>
            </div>
            <div className="space-y-2 border-t border-border pt-5">
              <Label htmlFor="reject-message">Indoklás a jelentkezőnek (nem kötelező)</Label>
              <Textarea id="reject-message" value={rejectMessage} onChange={(e) => setRejectMessage(e.target.value)} rows={3} maxLength={2000} disabled={pending} placeholder="Ez a szöveg az elutasító levélbe kerül." />
              <Button variant="destructive" className="w-full" disabled={pending} onClick={() => run("Elutasítás", () => rejectApplication(id, rejectMessage), "Biztosan elutasítja a jelentkezést? A jelentkező értesítést kap, és új jelentkezést indíthat.")}>
                <XIcon data-icon="inline-start" aria-hidden="true" />
                Elutasítás
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {status === "elfogadva" && awaitingActivation ? (
        <Card>
          <CardHeader>
            <CardTitle>Aktiváló link</CardTitle>
            <CardDescription>A jelentkező még nem aktiválta a fiókját. Az újraküldés új, 7 napig érvényes linket generál.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="soft" className="w-full" disabled={pending} onClick={() => run("Link küldése", () => resendActivationLink(id))}>
              <KeyRoundIcon data-icon="inline-start" aria-hidden="true" />
              Aktiváló link újraküldése
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {unfinished ? (
        <Card>
          <CardHeader>
            <CardTitle>Folytató link</CardTitle>
            <CardDescription>A jelentkező még nem véglegesítette az adatlapot. Új linket vagy emlékeztetőt küldhet neki.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="soft" disabled={pending} onClick={() => run("Link küldése", () => resendContinueLink(id))}>
              <LinkIcon data-icon="inline-start" aria-hidden="true" />
              Folytató link újraküldése
            </Button>
            <Button variant="soft" disabled={pending} onClick={() => run("Emlékeztető", () => sendManualReminder(id))}>
              <BellIcon data-icon="inline-start" aria-hidden="true" />
              Emlékeztető küldése most
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Belső jegyzet</CardTitle>
          <CardDescription>Csak az adminok látják.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={4000} disabled={pending} />
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run("Mentés", () => saveInternalNote(id, note))}>
            <SaveIcon data-icon="inline-start" aria-hidden="true" />
            Jegyzet mentése
          </Button>
        </CardContent>
      </Card>

      {!open && canDelete ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Végleges törlés</CardTitle>
            <CardDescription>Főadminisztrátori művelet, például adattörlési kérés esetén. A jelentkezés és a hozzá tartozó levélnapló törlődik, a művelet az admin naplóba kerül. Új jelentkezést a törlés nélkül is indíthat ugyanazzal a címmel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" disabled={pending} onClick={() => run("Törlés", () => deleteApplication(id), "Végleg törli a jelentkezést? Ez nem vonható vissza.", () => router.replace(`${ADMIN_HOME_PATH}/jelentkezesek`))}>
              <Trash2Icon data-icon="inline-start" aria-hidden="true" />
              Jelentkezés törlése
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {open ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Lezárás döntés nélkül</CardTitle>
            <CardDescription>Ha a jelentkező visszalépett vagy törlést kért. A link érvénytelenné válik, e-mail nem megy ki.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => run("Lezárás", () => withdrawApplication(id), "Biztosan lezárja a jelentkezést döntés nélkül?")}>
              <ArchiveIcon data-icon="inline-start" aria-hidden="true" />
              Jelentkezés lezárása
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
