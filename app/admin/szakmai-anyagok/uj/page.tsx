import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { normalizeMaterial } from "@/lib/materials"
import { listCategories } from "@/lib/server/materials"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { Button } from "@/components/ui/button"
import { MaterialForm } from "../material-form"

export const metadata: Metadata = { title: "Új szakmai anyag" }
export const dynamic = "force-dynamic"

export default async function NewMaterialPage() {
  const categories = await listCategories()
  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${ADMIN_HOME_PATH}/szakmai-anyagok`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza a listához
      </Button>
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Szakmai anyagok</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Új anyag</h1>
      </header>
      <MaterialForm id={null} initial={normalizeMaterial({})} status="rejtett" categories={categories} file={null} storageConfigured={isBlobConfigured()} />
    </div>
  )
}
