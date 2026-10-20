import type { Metadata } from "next"
import Link from "next/link"
import mongoose from "mongoose"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { MATERIAL_STATUS_LABEL, normalizeMaterial } from "@/lib/materials"
import { MaterialModel, type MaterialDocument } from "@/lib/models/material"
import { listCategories } from "@/lib/server/materials"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MaterialForm } from "../material-form"

export const metadata: Metadata = { title: "Szakmai anyag" }
export const dynamic = "force-dynamic"

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) notFound()
  await dbConnect()
  const [material, categories] = await Promise.all([MaterialModel.findById(id).lean<MaterialDocument | null>(), listCategories()])
  if (!material) notFound()

  const initial = normalizeMaterial({
    title: material.title,
    categoryId: material.categoryId?.toString() ?? "",
    summary: material.summary,
    kind: material.kind,
    access: material.access,
    author: material.author,
    publishedDate: material.publishedDate ?? "",
    documentSource: material.documentSource,
    externalUrl: material.externalUrl,
    videoProvider: material.videoProvider,
    videoRef: material.videoId,
  })

  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${ADMIN_HOME_PATH}/szakmai-anyagok`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza a listához
      </Button>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Szakmai anyagok</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{material.title}</h1>
        </div>
        <Badge variant={material.status === "kozzetett" ? "default" : "outline"} className="h-7 px-3 text-sm">{MATERIAL_STATUS_LABEL[material.status]}</Badge>
      </header>
      <MaterialForm
        id={id}
        initial={initial}
        status={material.status}
        categories={categories}
        file={material.file?.url ? { name: material.file.name ?? "fájl", size: material.file.size ?? 0 } : null}
        storageConfigured={isBlobConfigured()}
      />
    </div>
  )
}
