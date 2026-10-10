import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { POST_TYPE_LABEL, normalizePost, type PostType } from "@/lib/posts"
import { isBlobConfigured } from "@/lib/server/profile-photo"
import { PostForm } from "../post-form"

export const metadata: Metadata = { title: "Új bejegyzés" }
export const dynamic = "force-dynamic"

const BASE = `${ADMIN_HOME_PATH}/aktualitasok`

export default async function NewPostPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const type: PostType = params.tipus === "esemeny" ? "esemeny" : "hir"

  return (
    <div className="space-y-6">
      <Button variant="soft" size="sm" className="w-fit" render={<Link href={`${BASE}?tipus=${type}`} />} nativeButton={false}>
        <ArrowLeftIcon data-icon="inline-start" />
        Vissza az aktualitásokhoz
      </Button>
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Új {POST_TYPE_LABEL[type].toLowerCase()}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{type === "hir" ? "Hír létrehozása" : "Esemény létrehozása"}</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">Az első mentés piszkozatot hoz létre; képet a mentés után lehet hozzáadni.</p>
      </header>
      <PostForm id={null} initial={normalizePost({ type })} status="piszkozat" featured={false} slug={null} imageUrl={null} imagesConfigured={isBlobConfigured()} past={false} />
    </div>
  )
}
