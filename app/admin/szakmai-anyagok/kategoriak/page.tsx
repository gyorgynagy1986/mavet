import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { MaterialModel } from "@/lib/models/material"
import { listCategories } from "@/lib/server/materials"
import { Button } from "@/components/ui/button"
import { CategoryManager } from "./category-manager"

export const metadata: Metadata = { title: "Anyag-kategóriák" }
export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  await dbConnect()
  const [categories, usage] = await Promise.all([
    listCategories(),
    MaterialModel.aggregate<{ _id: unknown; n: number }>([{ $match: { categoryId: { $ne: null } } }, { $group: { _id: "$categoryId", n: { $sum: 1 } } }]),
  ])
  const used = new Map(usage.map((u) => [String(u._id), u.n]))
  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${ADMIN_HOME_PATH}/szakmai-anyagok`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza az anyagokhoz
      </Button>
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Szakmai anyagok</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Kategóriák</h1>
      </header>
      <CategoryManager categories={categories.map((c) => ({ id: c.id, name: c.name, used: used.get(c.id) ?? 0 }))} />
    </div>
  )
}
