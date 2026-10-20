"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon, FileTextIcon, SaveIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MESSAGES,
  MATERIAL_ACCESS_LABEL,
  MATERIAL_KIND_LABEL,
  MATERIAL_SUMMARY_MAX,
  MATERIAL_TITLE_MAX,
  VIDEO_PROVIDER_LABEL,
  documentFileError,
  formatBytes,
  materialAccess,
  materialKinds,
  validateMaterial,
  videoProviders,
  youtubeId,
  type MaterialErrors,
  type MaterialInput,
  type MaterialStatus,
} from "@/lib/materials"
import type { CategoryOption } from "@/lib/server/materials"
import { attachMaterialFile, deleteMaterial, removeMaterialFile, saveMaterial, type MaterialSaveIntent } from "./actions"

const LIST_PATH = `${ADMIN_HOME_PATH}/szakmai-anyagok`

interface Props {
  id: string | null
  initial: MaterialInput
  status: MaterialStatus
  categories: CategoryOption[]
  file: { name: string; size: number } | null
  storageConfigured: boolean
}

const selectClass = "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"

export function MaterialForm({ id, initial, status, categories, file, storageConfigured }: Props) {
  const router = useRouter()
  const [data, setData] = useState<MaterialInput>(initial)
  const [baseline, setBaseline] = useState<MaterialInput>(initial)
  const [errors, setErrors] = useState<MaterialErrors>({})
  const [busy, setBusy] = useState<MaterialSaveIntent | "delete" | "file" | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isPublic = status === "kozzetett"
  const dirty = JSON.stringify(data) !== JSON.stringify(baseline)
  const disabled = busy !== null
  const isDocument = data.kind === "dokumentum"

  useEffect(() => {
    if (!dirty) return
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", onLeave)
    return () => window.removeEventListener("beforeunload", onLeave)
  }, [dirty])

  function update<K extends keyof MaterialInput>(key: K, value: MaterialInput[K]) {
    setData({ ...data, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  async function save(intent: MaterialSaveIntent) {
    const local = validateMaterial(data, intent === "publish" || (intent === "keep" && isPublic), file !== null)
    setErrors(local)
    if (Object.keys(local).length > 0) {
      toast.error(intent === "publish" ? "Közzétételhez töltse ki a jelölt mezőket." : "Néhány mező hibás.")
      return
    }
    setBusy(intent)
    try {
      const r = await saveMaterial(id, data, intent)
      if (r.ok) {
        toast.success(r.message)
        setBaseline(data)
        if (id) router.refresh()
        else router.replace(`${LIST_PATH}/${r.id}`)
      } else {
        setErrors(r.errors ?? {})
        toast.error(r.message)
      }
    } catch {
      toast.error("A mentés nem sikerült. Próbálja újra.")
    } finally {
      setBusy(null)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void save("keep")
  }

  async function remove() {
    if (!id || !window.confirm("Véglegesen törli az anyagot a fájljával együtt? Ez nem vonható vissza.")) return
    setBusy("delete")
    try {
      const r = await deleteMaterial(id)
      if (r.ok) {
        toast.success(r.message)
        router.replace(LIST_PATH)
      } else toast.error(r.message)
    } catch {
      toast.error("A törlés nem sikerült.")
    } finally {
      setBusy(null)
    }
  }

  /** Straight to the Blob store from the browser (token from our route), then recorded on the material. */
  async function uploadFile(picked: File | null) {
    if (fileRef.current) fileRef.current.value = ""
    if (!id || !picked) return
    const invalid = documentFileError(picked)
    if (invalid) return void toast.error(invalid)
    setBusy("file")
    setProgress(0)
    try {
      const blob = await upload(`szakmai-anyagok/${id}/${picked.name}`, picked, {
        access: "public",
        handleUploadUrl: "/api/admin/szakmai-anyagok/feltoltes",
        clientPayload: id,
        contentType: picked.type,
        onUploadProgress: (e) => setProgress(e.percentage),
      })
      const r = await attachMaterialFile(id, { url: blob.url, pathname: blob.pathname, contentType: picked.type, size: picked.size, name: picked.name })
      if (r.ok) {
        toast.success(r.message)
        if (errors.file) setErrors({ ...errors, file: undefined })
        router.refresh()
      } else toast.error(r.message)
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : DOCUMENT_MESSAGES.storage)
    } finally {
      setBusy(null)
      setProgress(null)
    }
  }

  async function removeFile() {
    if (!id || !window.confirm("Eltávolítja a fájlt? A tárolóból is végleg törlődik.")) return
    setBusy("file")
    try {
      const r = await removeMaterialFile(id)
      if (r.ok) {
        toast.success(r.message)
        router.refresh()
      } else toast.error(r.message)
    } catch {
      toast.error(DOCUMENT_MESSAGES.deleteFailed)
    } finally {
      setBusy(null)
    }
  }

  const invalid = (key: keyof MaterialErrors) => Boolean(errors[key]) || undefined
  const ytId = data.kind === "video" && data.videoProvider === "youtube" ? youtubeId(data.videoRef) : null

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Az anyag adatai</CardTitle>
          <CardDescription>Új anyag rejtett marad, amíg közzé nem teszi. Közzétételhez cím, kategória, összefoglaló és a dokumentum vagy videó kell.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <FieldGroup>
              <Field data-invalid={invalid("title")}>
                <FieldLabel htmlFor="m-title">Cím</FieldLabel>
                <Input id="m-title" value={data.title} onChange={(e) => update("title", e.target.value)} disabled={disabled} maxLength={MATERIAL_TITLE_MAX} aria-invalid={invalid("title")} />
                <FieldError>{errors.title}</FieldError>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={invalid("categoryId")}>
                  <FieldLabel htmlFor="m-category">Kategória</FieldLabel>
                  <select id="m-category" value={data.categoryId} onChange={(e) => update("categoryId", e.target.value)} disabled={disabled} className={selectClass} aria-invalid={invalid("categoryId")}>
                    <option value="">– válasszon –</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <FieldDescription>
                    <Link href={`${LIST_PATH}/kategoriak`} className="underline underline-offset-4">Kategóriák kezelése</Link>
                  </FieldDescription>
                  <FieldError>{errors.categoryId}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="m-access">Hozzáférés</FieldLabel>
                  <select id="m-access" value={data.access} onChange={(e) => update("access", e.target.value as MaterialInput["access"])} disabled={disabled} className={selectClass}>
                    {materialAccess.map((a) => <option key={a} value={a}>{MATERIAL_ACCESS_LABEL[a]}</option>)}
                  </select>
                  <FieldDescription>Tagi anyag kártyája a listában mindenkinek látszik, megnyitni csak aktív tag tudja.</FieldDescription>
                </Field>
              </div>

              <Field data-invalid={invalid("summary")}>
                <FieldLabel htmlFor="m-summary">Rövid összefoglaló</FieldLabel>
                <Textarea id="m-summary" value={data.summary} onChange={(e) => update("summary", e.target.value)} disabled={disabled} rows={3} maxLength={MATERIAL_SUMMARY_MAX} aria-invalid={invalid("summary")} />
                <FieldDescription>{data.summary.length} / {MATERIAL_SUMMARY_MAX} karakter.</FieldDescription>
                <FieldError>{errors.summary}</FieldError>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="m-author">Szerző (nem kötelező)</FieldLabel>
                  <Input id="m-author" value={data.author} onChange={(e) => update("author", e.target.value)} disabled={disabled} />
                </Field>
                <Field data-invalid={invalid("publishedDate")}>
                  <FieldLabel htmlFor="m-date">Megjelenés dátuma (nem kötelező)</FieldLabel>
                  <Input id="m-date" type="date" value={data.publishedDate} onChange={(e) => update("publishedDate", e.target.value)} disabled={disabled} aria-invalid={invalid("publishedDate")} />
                  <FieldDescription>A lista e szerint rendez, a legfrissebb elöl; dátum nélkül a végére kerül.</FieldDescription>
                  <FieldError>{errors.publishedDate}</FieldError>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="m-kind">Az anyag formája</FieldLabel>
                <select id="m-kind" value={data.kind} onChange={(e) => update("kind", e.target.value as MaterialInput["kind"])} disabled={disabled} className={selectClass}>
                  {materialKinds.map((k) => <option key={k} value={k}>{MATERIAL_KIND_LABEL[k]}</option>)}
                </select>
              </Field>

              {isDocument ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="m-source">A dokumentum forrása</FieldLabel>
                    <select id="m-source" value={data.documentSource} onChange={(e) => update("documentSource", e.target.value as MaterialInput["documentSource"])} disabled={disabled} className={selectClass}>
                      <option value="fajl">Feltöltött fájl</option>
                      <option value="link">Külső hivatkozás</option>
                    </select>
                  </Field>
                  {data.documentSource === "link" ? (
                    <Field data-invalid={invalid("externalUrl")}>
                      <FieldLabel htmlFor="m-url">A dokumentum webcíme</FieldLabel>
                      <Input id="m-url" type="url" inputMode="url" value={data.externalUrl} onChange={(e) => update("externalUrl", e.target.value)} disabled={disabled} placeholder="https://…" aria-invalid={invalid("externalUrl")} />
                      <FieldDescription>Új lapon nyílik meg. Tagi anyagnál a hivatkozást a rendszer csak aktív tagnak adja ki.</FieldDescription>
                      <FieldError>{errors.externalUrl}</FieldError>
                    </Field>
                  ) : (
                    <p className="-mt-2 text-xs text-muted-foreground">A fájlt a jobb oldali „Fájl” kártyán töltheti fel, az anyag első mentése után.</p>
                  )}
                </>
              ) : (
                <>
                  <Field data-invalid={invalid("videoProvider")}>
                    <FieldLabel htmlFor="m-provider">Videó forrása</FieldLabel>
                    <select id="m-provider" value={data.videoProvider} onChange={(e) => update("videoProvider", e.target.value as MaterialInput["videoProvider"])} disabled={disabled} className={selectClass} aria-invalid={invalid("videoProvider")}>
                      {videoProviders.map((p) => <option key={p} value={p}>{VIDEO_PROVIDER_LABEL[p]}</option>)}
                    </select>
                    <FieldDescription>A Bunny.net-es, tokennel védett lejátszás elő van készítve, de még nincs bekötve; amíg nincs, a tagi videó is YouTube-ról megy (nem listázott videóként).</FieldDescription>
                    <FieldError>{errors.videoProvider}</FieldError>
                  </Field>
                  <Field data-invalid={invalid("videoRef")}>
                    <FieldLabel htmlFor="m-video">{data.videoProvider === "youtube" ? "YouTube-videó címe vagy azonosítója" : "Bunny videó azonosítója"}</FieldLabel>
                    <Input id="m-video" value={data.videoRef} onChange={(e) => update("videoRef", e.target.value)} disabled={disabled} placeholder={data.videoProvider === "youtube" ? "https://www.youtube.com/watch?v=…" : "pl. 7f3a…"} aria-invalid={invalid("videoRef")} />
                    {ytId ? <FieldDescription>Felismert videó: {ytId}</FieldDescription> : null}
                    <FieldError>{errors.videoRef}</FieldError>
                  </Field>
                </>
              )}
            </FieldGroup>

            {dirty ? (
              <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                Nem mentett módosítások vannak. {isPublic ? "A látogatók a mentésig a korábbi változatot látják." : ""}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={disabled || (!dirty && id !== null)}>
                {busy === "keep" ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
                {id === null ? "Mentés (rejtett)" : isPublic ? "Módosítások mentése" : "Mentés"}
              </Button>
              {isPublic ? (
                <Button type="button" variant="outline" onClick={() => void save("hide")} disabled={disabled}>
                  {busy === "hide" ? <Spinner data-icon="inline-start" /> : <EyeOffIcon data-icon="inline-start" />}
                  Elrejtés
                </Button>
              ) : (
                <Button type="button" variant="gold" onClick={() => void save("publish")} disabled={disabled}>
                  {busy === "publish" ? <Spinner data-icon="inline-start" /> : <EyeIcon data-icon="inline-start" />}
                  {dirty || id === null ? "Mentés és közzététel" : "Közzététel"}
                </Button>
              )}
              {id !== null ? (
                <Button type="button" variant="destructive" className="ml-auto" onClick={() => void remove()} disabled={disabled}>
                  {busy === "delete" ? <Spinner data-icon="inline-start" /> : <Trash2Icon data-icon="inline-start" />}
                  Törlés
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {id !== null && isDocument && data.documentSource === "fajl" ? (
          <Card className={errors.file ? "border-destructive/60" : undefined}>
            <CardHeader>
              <CardTitle>Fájl</CardTitle>
              <CardDescription>PDF, Word, PowerPoint vagy Excel, legfeljebb 25 MB. A kiválasztás után azonnal feltöltődik; a korábbi fájl törlődik a tárolóból.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {!storageConfigured ? <p className="text-sm text-destructive">{DOCUMENT_MESSAGES.notConfigured}</p> : null}
              {file ? (
                <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  <FileTextIcon className="size-4 shrink-0 text-mavet-blue" aria-hidden="true" />
                  <span className="min-w-0 truncate font-medium">{file.name}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">{formatBytes(file.size)}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Még nincs fájl.</p>
              )}
              {errors.file ? <p className="text-sm text-destructive">{errors.file}</p> : null}
              {progress !== null ? (
                <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-mavet-blue transition-[width]" style={{ width: `${progress}%` }} />
                </div>
              ) : null}
              <input ref={fileRef} type="file" accept={DOCUMENT_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void uploadFile(e.target.files?.[0] ?? null)} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="soft" onClick={() => fileRef.current?.click()} disabled={disabled || !storageConfigured}>
                  {busy === "file" ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
                  {file ? "Fájl cseréje" : "Fájl feltöltése"}
                </Button>
                {file ? (
                  <Button type="button" variant="destructive" onClick={() => void removeFile()} disabled={disabled}>
                    <Trash2Icon data-icon="inline-start" />
                    Fájl eltávolítása
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {id === null && isDocument && data.documentSource === "fajl" ? (
          <Card>
            <CardHeader>
              <CardTitle>Fájl</CardTitle>
              <CardDescription>Mentse el az anyagot, utána itt tölthető fel a dokumentum.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!isDocument && ytId ? (
          <Card>
            <CardHeader>
              <CardTitle>Előnézet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-lg border border-border bg-black">
                <iframe src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`} title="Videó előnézet" className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Megjelenés</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {isPublic ? (
              <p>Közzétéve. <Link href="/szakmai-anyagok" target="_blank" className="underline underline-offset-4">Megnézem a listában</Link>.</p>
            ) : (
              <p>Rejtett: nem szerepel a listában, a fájlja másnak nem érhető el. Az elrejtés nem törlés.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
