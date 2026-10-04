"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon, RotateCcwIcon, SaveIcon, Trash2Icon, UserXIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { membershipCategories } from "@/lib/data/site"
import type { MembershipStatus } from "@/lib/models/user"
import { changeMemberCategory, deleteMember, restoreMembership, revokeMembership, type MemberActionResult } from "./actions"

export function MemberActions({ id, email, status, category, medicalDegree, canDelete }: { id: string; email: string; status: MembershipStatus; category: string; medicalDegree: boolean | null; canDelete: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [cat, setCat] = useState(category)
  const [medical, setMedical] = useState<boolean>(medicalDegree ?? false)
  const [reason, setReason] = useState("")
  const [notify, setNotify] = useState(true)
  const [confirmEmail, setConfirmEmail] = useState("")

  function run(fn: () => Promise<MemberActionResult>, confirmText?: string, after?: () => void) {
    if (confirmText && !window.confirm(confirmText)) return
    startTransition(async () => {
      const r = await fn()
      if (r.ok) {
        toast.success(r.message)
        after?.()
      } else toast.error(r.message)
    })
  }

  const selectClass = "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tagsági kategória</CardTitle>
          <CardDescription>A tag maga nem módosíthatja. A díjhatás a következő tagsági évtől érvényes (spec 7.3).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select aria-label="Kategória" value={cat} onChange={(e) => setCat(e.target.value)} disabled={pending} className={selectClass}>
            {membershipCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {cat === "rendes" ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={medical} onCheckedChange={(c) => setMedical(c === true)} disabled={pending} />
              Orvos vagy gyógyszerész végzettségű (10 000 Ft)
            </label>
          ) : null}
          <Button variant="soft" className="w-full" disabled={pending} onClick={() => run(() => changeMemberCategory(id, cat, cat === "rendes" ? medical : null))}>
            {pending ? <Loader2Icon className="animate-spin" /> : <SaveIcon data-icon="inline-start" />}
            Kategória mentése
          </Button>
        </CardContent>
      </Card>

      {status !== "megszunt" ? (
        <Card>
          <CardHeader>
            <CardTitle>Tagság visszavonása</CardTitle>
            <CardDescription>A tagi jogok megszűnnek, a fiók és a belépés megmarad. Visszafordítható.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="revoke-reason">Indoklás (a naplóba, és ha kéri, a levélbe)</Label>
              <Textarea id="revoke-reason" rows={3} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} disabled={pending} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={notify} onCheckedChange={(c) => setNotify(c === true)} disabled={pending} />
              Értesítő e-mail küldése a tagnak
            </label>
            <Button variant="destructive" className="w-full" disabled={pending} onClick={() => run(() => revokeMembership(id, reason, notify), "Biztosan visszavonja a tagságot?")}>
              <UserXIcon data-icon="inline-start" />
              Tagság visszavonása
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tagság helyreállítása</CardTitle>
            <CardDescription>A visszavonás visszafordítása; az állapot aktív (vagy tagdíjra vár, ha az első tagdíj nyitott).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="soft" className="w-full" disabled={pending} onClick={() => run(() => restoreMembership(id))}>
              <RotateCcwIcon data-icon="inline-start" />
              Helyreállítás
            </Button>
          </CardContent>
        </Card>
      )}

      {canDelete ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Fiók végleges törlése</CardTitle>
            <CardDescription>Nem vonható vissza. A belépés azonnal megszűnik, a jelentkezési rekordok anonimizálva maradnak a döntési előzmények miatt. Megerősítésként írja be a tag e-mail-címét.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="email" placeholder={email} value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} disabled={pending} aria-label="E-mail-cím megerősítése" />
            <Button
              variant="destructive"
              className="w-full"
              disabled={pending || confirmEmail.trim().toLowerCase() !== email}
              onClick={() => run(() => deleteMember(id, confirmEmail), "Végleg törli a fiókot? Ez nem vonható vissza.", () => router.replace(`${ADMIN_HOME_PATH}/tagok`))}
            >
              <Trash2Icon data-icon="inline-start" />
              Fiók törlése
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
