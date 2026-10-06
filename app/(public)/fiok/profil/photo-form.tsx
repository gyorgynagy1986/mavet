"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { removeProfilePhoto, uploadProfilePhoto } from "./actions"

export function PhotoForm({ photoUrl, configured }: { photoUrl: string | null; configured: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  function pick(f: File | null) {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function upload() {
    if (!file) return
    setBusy(true)
    const fd = new FormData()
    fd.set("photo", file)
    const r = await uploadProfilePhoto(fd)
    if (r.ok) {
      toast.success(r.message)
      pick(null)
      if (inputRef.current) inputRef.current.value = ""
      router.refresh()
    } else toast.error(r.message)
    setBusy(false)
  }

  async function remove() {
    if (!window.confirm("Eltávolítja a profilképét?")) return
    setBusy(true)
    const r = await removeProfilePhoto()
    if (r.ok) {
      toast.success(r.message)
      router.refresh()
    } else toast.error(r.message)
    setBusy(false)
  }

  const shown = preview ?? photoUrl

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profilkép</CardTitle>
        <CardDescription>JPEG, PNG vagy WebP, legfeljebb 10 MB. A képet a rendszer négyzetesre vágja és 512 képpontra méretezi; mentés előtt előnézetet mutat.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob URL preview and remote photo; no next/image domain config needed
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-10 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {!configured ? <p className="text-sm text-destructive">A képtárolás ezen a környezeten nincs beállítva.</p> : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Profilkép kiválasztása"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
            disabled={busy || !configured}
            className="text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-mavet-navy hover:file:bg-muted"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={upload} disabled={busy || !file || !configured}>
              {busy ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
              {preview ? "Előnézet mentése" : "Feltöltés"}
            </Button>
            {preview ? (
              <Button variant="outline" onClick={() => { pick(null); if (inputRef.current) inputRef.current.value = "" }} disabled={busy}>Elvetés</Button>
            ) : null}
            {photoUrl && !preview ? (
              <Button variant="destructive" onClick={remove} disabled={busy}>
                <Trash2Icon data-icon="inline-start" />
                Kép eltávolítása
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
