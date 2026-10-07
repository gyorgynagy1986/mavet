"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { UPLOAD_MAX_BYTES, downscaleImage } from "@/lib/client/downscale-image"
import { PHOTO_ACCEPT, PHOTO_MESSAGES, PHOTO_SIZE, PROFILE_SAVE_EVENT, photoFileError } from "@/lib/validation/photo"
import { removeProfilePhoto, uploadProfilePhoto } from "./actions"

/** Twice the stored size, so the server-side crop still has detail to work with. */
const CLIENT_MAX_EDGE = PHOTO_SIZE * 2

export function PhotoForm({ photoUrl, configured }: { photoUrl: string | null; configured: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  function pick(f: File | null) {
    const invalid = f ? photoFileError(f) : null
    if (invalid) {
      toast.error(invalid)
      if (inputRef.current) inputRef.current.value = ""
      f = null
    }
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function upload() {
    if (!file || busy) return
    setBusy(true)
    try {
      const prepared = await downscaleImage(file, CLIENT_MAX_EDGE)
      if (prepared.size > UPLOAD_MAX_BYTES) {
        toast.error(PHOTO_MESSAGES.tooLargeToSend)
        return
      }
      const fd = new FormData()
      fd.set("photo", prepared)
      const r = await uploadProfilePhoto(fd)
      if (r.ok) {
        toast.success(r.message)
        pick(null)
        if (inputRef.current) inputRef.current.value = ""
        router.refresh()
      } else toast.error(r.message)
    } catch (error) {
      console.error("[photo-form] upload failed:", error)
      toast.error(PHOTO_MESSAGES.network)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm("Eltávolítja a profilképét? A kép a tárolóból is végleg törlődik.")) return
    setBusy(true)
    try {
      const r = await removeProfilePhoto()
      if (r.ok) {
        toast.success(r.message)
        router.refresh()
      } else toast.error(r.message)
    } catch {
      toast.error(PHOTO_MESSAGES.deleteFailed)
    } finally {
      setBusy(false)
    }
  }

  // Saving the profile form also saves a pending photo; leaving the page with one asks for confirmation.
  const uploadRef = useRef(upload)
  useEffect(() => {
    uploadRef.current = upload
  })
  const pending = Boolean(file)
  useEffect(() => {
    if (!pending) return
    const onSave = () => void uploadRef.current()
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener(PROFILE_SAVE_EVENT, onSave)
    window.addEventListener("beforeunload", onLeave)
    return () => {
      window.removeEventListener(PROFILE_SAVE_EVENT, onSave)
      window.removeEventListener("beforeunload", onLeave)
    }
  }, [pending])

  const shown = preview ?? photoUrl

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profilkép</CardTitle>
        <CardDescription>JPEG, PNG vagy WebP, legfeljebb 10 MB.</CardDescription>
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
            accept={PHOTO_ACCEPT}
            aria-label="Profilkép kiválasztása"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
            disabled={busy || !configured}
            className="text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-mavet-navy hover:file:bg-muted"
          />
          {preview ? (
            <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
              Ez még csak előnézet, a kép nincs mentve. Mentse a „Kép mentése” gombbal, vagy a profil mentésével együtt.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={upload} disabled={busy || !file || !configured}>
              {busy ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
              {preview ? "Kép mentése" : "Feltöltés"}
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
