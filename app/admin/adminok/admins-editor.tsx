"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon, ShieldOffIcon, ShieldPlusIcon, UserPlusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AdminUserListItem } from "@/lib/server/admin-users"

const ROLE_LABEL: Record<string, string> = { SUPERADMIN: "Főadmin", ADMIN: "Admin", USER: "Nincs jog" }

function formatDate(iso: string | null): string {
  if (!iso) return "még nem lépett be"
  return new Date(iso).toLocaleString("hu-HU", { timeZone: "Europe/Budapest", dateStyle: "short", timeStyle: "short" })
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = (await res.json().catch(() => null)) as { error?: string } | null
  return json?.error ?? fallback
}

export function AdminsEditor({ initialAdmins, currentUserId }: { initialAdmins: AdminUserListItem[]; currentUserId: string }) {
  const router = useRouter()
  const [admins, setAdmins] = useState(initialAdmins)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setCreating(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      })
      if (!res.ok) throw new Error(await readError(res, "Nem sikerült felvenni az adminisztrátort."))
      const json = (await res.json()) as { data: AdminUserListItem; promoted: boolean }
      setAdmins((prev) => [...prev.filter((a) => a.id !== json.data.id), json.data].sort(sortAdmins))
      setEmail("")
      setName("")
      toast.success(json.promoted ? `${json.data.email} előléptetve adminisztrátorrá.` : `${json.data.email} felvéve adminisztrátorként.`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hiba történt.")
    } finally {
      setCreating(false)
    }
  }

  async function changeRole(admin: AdminUserListItem, role: "ADMIN" | "USER") {
    const who = admin.name || admin.email
    if (role === "USER" && !window.confirm(`Biztosan visszavonja ${who} adminisztrátori jogosultságát? A fiók megmarad, de az admin felületet nem éri el többé.`)) return
    setBusyId(admin.id)
    try {
      const res = await fetch(`/api/admin/users/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error(await readError(res, "A módosítás nem sikerült."))
      const json = (await res.json()) as { data: AdminUserListItem }
      setAdmins((prev) => (role === "USER" ? prev.filter((a) => a.id !== admin.id) : prev.map((a) => (a.id === admin.id ? json.data : a))))
      toast.success(role === "USER" ? `${who} jogosultsága visszavonva.` : `${who} szerepe: ${ROLE_LABEL[role]}.`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hiba történt.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>Jelenlegi adminisztrátorok</CardTitle>
          <CardDescription>{admins.length} fiók. A főadminisztrátor szerepe és az Ön saját szerepe innen nem módosítható.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {admins.map((admin) => {
              const self = admin.id === currentUserId
              const locked = self || admin.role === "SUPERADMIN"
              return (
                <li key={admin.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{admin.name || admin.email}</span>
                      <Badge variant={admin.role === "SUPERADMIN" ? "default" : "secondary"}>{ROLE_LABEL[admin.role] ?? admin.role}</Badge>
                      {self ? <Badge variant="outline">Ön</Badge> : null}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-muted-foreground">{admin.email}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">Utolsó belépés: {formatDate(admin.lastLoginAt)}</div>
                  </div>
                  {!locked ? (
                    <Button variant="destructive" size="sm" disabled={busyId === admin.id} onClick={() => changeRole(admin, "USER")}>
                      {busyId === admin.id ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <ShieldOffIcon data-icon="inline-start" aria-hidden="true" />}
                      Jog visszavonása
                    </Button>
                  ) : null}
                </li>
              )
            })}
            {admins.length === 0 ? <li className="px-6 py-8 text-center text-sm text-muted-foreground">Nincs adminisztrátor.</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlusIcon className="size-5 text-mavet-blue" aria-hidden="true" />
            Új adminisztrátor
          </CardTitle>
          <CardDescription>Ha az e-mail-címhez már tartozik tagi fiók, azt léptetjük elő.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate} noValidate>
            <div className="space-y-2">
              <Label htmlFor="new-admin-name">Név</Label>
              <Input id="new-admin-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoComplete="off" disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-admin-email">E-mail-cím</Label>
              <Input id="new-admin-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" disabled={creating} />
            </div>
            <Button type="submit" className="w-full" disabled={creating || !email.trim() || name.trim().length < 2}>
              {creating ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <ShieldPlusIcon data-icon="inline-start" aria-hidden="true" />}
              Felvétel adminisztrátornak
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function sortAdmins(a: AdminUserListItem, b: AdminUserListItem): number {
  if (a.role !== b.role) return a.role === "SUPERADMIN" ? -1 : 1
  return a.name.localeCompare(b.name, "hu")
}
