import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import mongoose from "mongoose"
import { ArrowLeftIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { PostModel, type PostDocument } from "@/lib/models/post"
import { POST_STATUS_LABEL, POST_TYPE_LABEL, budapestDate, normalizePost } from "@/lib/posts"
import { formatDateTime } from "@/lib/server/applications"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { PostForm } from "../post-form"

export const metadata: Metadata = { title: "Bejegyzés szerkesztése" }
export const dynamic = "force-dynamic"

const BASE = `${ADMIN_HOME_PATH}/aktualitasok`

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) notFound()
  await dbConnect()
  const post = await PostModel.findById(id).lean<PostDocument | null>()
  if (!post) notFound()
  const now = new Date()

  const initial = normalizePost({
    type: post.type,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    publishedDate: post.publishedAt ? budapestDate(post.publishedAt) : "",
    startDate: post.startDate ?? "",
    startTime: post.startTime ?? "",
    endDate: post.endDate ?? "",
    endTime: post.endTime ?? "",
    location: post.location,
    linkUrl: post.linkUrl,
    linkLabel: post.linkLabel,
  })

  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${BASE}?tipus=${post.type}`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza az aktualitásokhoz
      </Button>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">{POST_TYPE_LABEL[post.type]}</p>
          <Badge variant={post.status === "kozzetett" ? "default" : "outline"}>{POST_STATUS_LABEL[post.status]}</Badge>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">{post.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Utoljára módosítva: {formatDateTime(post.updatedAt)}{post.updatedByEmail ? ` · ${post.updatedByEmail}` : ""}</p>
      </header>
      <PostForm
        id={post._id.toString()}
        initial={initial}
        status={post.status}
        featured={post.featured === true}
        slug={post.slug}
        imageUrl={post.image?.url ?? null}
        imagesConfigured={isBlobConfigured()}
        past={post.type === "esemeny" && Boolean(post.endsAt && post.endsAt.getTime() <= now.getTime())}
      />
    </div>
  )
}
