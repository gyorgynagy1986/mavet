"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { deleteCategory, moveCategory, saveCategory, type CategoryActionResult } from "../actions"

export interface CategoryRow {
  id: string
  name: string
  used: number
}

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [newName, setNewName] = useState("")
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null)

  function run(fn: () => Promise<CategoryActionResult>, after?: () => void) {
    start(async () => {
      const r = await fn()
      if (r.ok) {
        toast.success(r.message)
        after?.()
        router.refresh()
      } else toast.error(r.message)
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>Kategóriák</CardTitle>
          <CardDescription>A publikus lista ebben a sorrendben kínálja a szűrőt. Olyan kategória törölhető, amelyhez nem tartozik anyag.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {categories.map((c, i) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 px-5 py-3">
                {editing?.id === c.id ? (
                  <form
                    className="flex flex-1 gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      run(() => saveCategory(c.id, editing.name), () => setEditing(null))
                    }}
                  >
                    <Input value={editing.name} onChange={(e) => setEditing({ id: c.id, name: e.target.value })} maxLength={80} autoFocus aria-label="Kategória neve" className="h-9" />
                    <Button type="submit" size="sm" disabled={pending}>Mentés</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)} disabled={pending}>Mégse</Button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{c.used} anyag</span>
                    <Button size="icon-sm" variant="ghost" aria-label="Feljebb" disabled={pending || i === 0} onClick={() => run(() => moveCategory(c.id, "fel"))}><ArrowUpIcon /></Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Lejjebb" disabled={pending || i === categories.length - 1} onClick={() => run(() => moveCategory(c.id, "le"))}><ArrowDownIcon /></Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Átnevezés" disabled={pending} onClick={() => setEditing({ id: c.id, name: c.name })}><PencilIcon /></Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Törlés" disabled={pending || c.used > 0} className="text-destructive" onClick={() => window.confirm(`Törli a(z) „${c.name}” kategóriát?`) && run(() => deleteCategory(c.id))}><Trash2Icon /></Button>
                  </>
                )}
              </li>
            ))}
            {categories.length === 0 ? <li className="px-5 py-8 text-center text-sm text-muted-foreground">Még nincs kategória. Vegyen fel egyet jobbra.</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Új kategória</CardTitle>
          <CardDescription>Például: Ajánlások, Előadások, Publikációk, Betegedukáció, Belső dokumentumok.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              run(() => saveCategory(null, newName), () => setNewName(""))
            }}
          >
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={80} placeholder="Kategória neve" aria-label="Új kategória neve" className="h-9" />
            <Button type="submit" size="sm" disabled={pending || !newName.trim()}>
              <PlusIcon data-icon="inline-start" />
              Felvétel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
