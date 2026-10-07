"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExternalLinkIcon, EyeIcon, EyeOffIcon, ImageIcon, SaveIcon, StarIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { PostArticle } from "@/components/posts/post-article"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { UPLOAD_MAX_BYTES, downscaleImage } from "@/lib/client/downscale-image"
import {
  DEFAULT_LINK_LABEL,
  EXCERPT_MAX,
  POSTS_PATH,
  TITLE_MAX,
  budapestToUtc,
  isClockTime,
  isIsoDate,
  splitParagraphs,
  toPostView,
  validatePost,
  type PostErrors,
  type PostInput,
  type PostStatus,
} from "@/lib/posts"
import { PHOTO_ACCEPT, PHOTO_MESSAGES, photoFileError } from "@/lib/validation/photo"
import { deletePost, removePostImage, savePost, setPostFeatured, uploadPostImage, type SaveIntent } from "./actions"

const LIST_PATH = `${ADMIN_HOME_PATH}/aktualitasok`
const IMAGE_CLIENT_MAX_EDGE = 2400

interface Props {
  /** null while the post has never been saved. */
  id: string | null
  initial: PostInput
  status: PostStatus
  featured: boolean
  slug: string | null
  imageUrl: string | null
  imagesConfigured: boolean
  /** The event is over: it cannot be featured. */
  past: boolean
}

/**
 * One form for news and events. The fields are saved together with an explicit button (unsaved changes
 * are marked and leaving the page asks first); the single-purpose controls (home page highlight, image)
 * save at once.
 */
export function PostForm({ id, initial, status, featured, slug, imageUrl, imagesConfigured, past }: Props) {
  const router = useRouter()
  const [data, setData] = useState<PostInput>(initial)
  // What is stored on the server; moved forward after each successful save, so an image upload or a
  // refresh never throws away text that is still being typed.
  const [baseline, setBaseline] = useState<PostInput>(initial)
  const [errors, setErrors] = useState<PostErrors>({})
  const [busy, setBusy] = useState<SaveIntent | "delete" | "feature" | "image" | null>(null)
  const [isFeatured, setIsFeatured] = useState(featured)
  const fileRef = useRef<HTMLInputElement>(null)

  const isEvent = data.type === "esemeny"
  const isPublic = status === "kozzetett"
  const dirty = JSON.stringify(data) !== JSON.stringify(baseline)
  const disabled = busy !== null

  useEffect(() => {
    if (!dirty) return
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", onLeave)
    return () => window.removeEventListener("beforeunload", onLeave)
  }, [dirty])

  function update<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setData({ ...data, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  async function save(intent: SaveIntent) {
    const local = validatePost(data, intent === "publish" || (intent === "keep" && isPublic))
    setErrors(local)
    if (Object.keys(local).length > 0) {
      toast.error(intent === "publish" ? "Közzétételhez töltse ki a jelölt mezőket." : "Néhány mező hibás.")
      return
    }
    setBusy(intent)
    try {
      const r = await savePost(id, data, intent)
      if (r.ok) {
        toast.success(r.message)
        setBaseline(data)
        if (intent === "unpublish") setIsFeatured(false)
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
    if (!id || !window.confirm("Véglegesen törli a bejegyzést a képével együtt? Ez nem vonható vissza.")) return
    setBusy("delete")
    try {
      const r = await deletePost(id)
      if (r.ok) {
        toast.success(r.message)
        router.replace(`${LIST_PATH}?tipus=${data.type}`)
      } else toast.error(r.message)
    } catch {
      toast.error("A törlés nem sikerült.")
    } finally {
      setBusy(null)
    }
  }

  async function toggleFeatured(next: boolean) {
    if (!id) return
    setIsFeatured(next)
    setBusy("feature")
    try {
      const r = await setPostFeatured(id, next)
      if (r.ok) toast.success(r.message)
      else {
        setIsFeatured(!next)
        toast.error(r.message)
      }
    } catch {
      setIsFeatured(!next)
      toast.error("A kiemelés mentése nem sikerült.")
    } finally {
      setBusy(null)
    }
  }

  async function uploadImage(file: File | null) {
    if (fileRef.current) fileRef.current.value = ""
    if (!id || !file) return
    const invalid = photoFileError(file)
    if (invalid) return void toast.error(invalid)
    setBusy("image")
    try {
      const prepared = await downscaleImage(file, IMAGE_CLIENT_MAX_EDGE)
      if (prepared.size > UPLOAD_MAX_BYTES) return void toast.error(PHOTO_MESSAGES.tooLargeToSend)
      const fd = new FormData()
      fd.set("image", prepared)
      const r = await uploadPostImage(id, fd)
      if (r.ok) {
        toast.success(r.message)
        router.refresh()
      } else toast.error(r.message)
    } catch {
      toast.error(PHOTO_MESSAGES.network)
    } finally {
      setBusy(null)
    }
  }

  async function removeImage() {
    if (!id || !window.confirm("Eltávolítja a képet? A tárolóból is végleg törlődik.")) return
    setBusy("image")
    try {
      const r = await removePostImage(id)
      if (r.ok) {
        toast.success(r.message)
        router.refresh()
      } else toast.error(r.message)
    } catch {
      toast.error(PHOTO_MESSAGES.deleteFailed)
    } finally {
      setBusy(null)
    }
  }

  // Live preview: the same component and data shape as the public page.
  const datesOk = isIsoDate(data.startDate) && (!data.startTime || isClockTime(data.startTime)) && (!data.endDate || isIsoDate(data.endDate)) && (!data.endTime || isClockTime(data.endTime))
  const preview = toPostView(
    {
      _id: id ?? "elonezet",
      type: data.type,
      slug: slug ?? "elonezet",
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      status,
      publishedAt: isIsoDate(data.publishedDate) ? budapestToUtc(data.publishedDate, "12:00") : isEvent ? null : new Date(),
      image: { url: imageUrl },
      startDate: isEvent && datesOk ? data.startDate : null,
      startTime: data.startTime || null,
      endDate: data.endDate || null,
      endTime: data.endTime || null,
      location: data.location,
      linkUrl: data.linkUrl,
      linkLabel: data.linkLabel,
    },
    new Date(),
  )
  const invalid = (key: keyof PostErrors) => Boolean(errors[key]) || undefined

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEvent ? "Esemény adatai" : "Hír adatai"}</CardTitle>
            <CardDescription>A szöveg egyszerű szöveg: a bekezdéseket üres sorral válassza el. Jobbra azonnal látja, hogyan jelenik meg.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} noValidate className="flex flex-col gap-6">
              <FieldGroup>
                <Field data-invalid={invalid("title")}>
                  <FieldLabel htmlFor="post-title">Cím</FieldLabel>
                  <Input id="post-title" value={data.title} onChange={(e) => update("title", e.target.value)} disabled={disabled} maxLength={TITLE_MAX + 50} aria-invalid={invalid("title")} />
                  <FieldError>{errors.title}</FieldError>
                </Field>

                <Field data-invalid={invalid("excerpt")}>
                  <FieldLabel htmlFor="post-excerpt">Rövid összefoglaló</FieldLabel>
                  <Textarea id="post-excerpt" value={data.excerpt} onChange={(e) => update("excerpt", e.target.value)} disabled={disabled} rows={3} aria-invalid={invalid("excerpt")} />
                  <FieldDescription>A kártyán és a cikk elején jelenik meg. {data.excerpt.length} / {EXCERPT_MAX} karakter.</FieldDescription>
                  <FieldError>{errors.excerpt}</FieldError>
                </Field>

                {isEvent ? (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={invalid("startDate")}>
                        <FieldLabel htmlFor="post-start-date">Kezdő dátum</FieldLabel>
                        <Input id="post-start-date" type="date" value={data.startDate} onChange={(e) => update("startDate", e.target.value)} disabled={disabled} aria-invalid={invalid("startDate")} />
                        <FieldError>{errors.startDate}</FieldError>
                      </Field>
                      <Field data-invalid={invalid("startTime")}>
                        <FieldLabel htmlFor="post-start-time">Kezdő időpont (nem kötelező)</FieldLabel>
                        <Input id="post-start-time" type="time" value={data.startTime} onChange={(e) => update("startTime", e.target.value)} disabled={disabled} aria-invalid={invalid("startTime")} />
                        <FieldError>{errors.startTime}</FieldError>
                      </Field>
                      <Field data-invalid={invalid("endDate")}>
                        <FieldLabel htmlFor="post-end-date">Záró dátum (többnapos eseménynél)</FieldLabel>
                        <Input id="post-end-date" type="date" value={data.endDate} min={data.startDate || undefined} onChange={(e) => update("endDate", e.target.value)} disabled={disabled} aria-invalid={invalid("endDate")} />
                        <FieldError>{errors.endDate}</FieldError>
                      </Field>
                      <Field data-invalid={invalid("endTime")}>
                        <FieldLabel htmlFor="post-end-time">Befejezés időpontja (nem kötelező)</FieldLabel>
                        <Input id="post-end-time" type="time" value={data.endTime} onChange={(e) => update("endTime", e.target.value)} disabled={disabled} aria-invalid={invalid("endTime")} />
                        <FieldError>{errors.endTime}</FieldError>
                      </Field>
                    </div>
                    <p className="-mt-2 text-xs text-muted-foreground">Magyar idő szerint. Befejezési időpont nélkül az esemény a (záró) nap végéig számít aktuálisnak, utána magától a korábbi események közé kerül.</p>

                    <Field data-invalid={invalid("location")}>
                      <FieldLabel htmlFor="post-location">Helyszín (nem kötelező)</FieldLabel>
                      <Input id="post-location" value={data.location} onChange={(e) => update("location", e.target.value)} disabled={disabled} placeholder="Például: Algyő, Kastélykert Fogadó, vagy „Online”" aria-invalid={invalid("location")} />
                      <FieldError>{errors.location}</FieldError>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={invalid("linkUrl")}>
                        <FieldLabel htmlFor="post-link">Jelentkezési vagy információs link (nem kötelező)</FieldLabel>
                        <Input id="post-link" type="url" inputMode="url" value={data.linkUrl} onChange={(e) => update("linkUrl", e.target.value)} disabled={disabled} placeholder="https://…" aria-invalid={invalid("linkUrl")} />
                        <FieldDescription>Külső oldal; új lapon nyílik meg, és csak aktuális eseménynél látszik.</FieldDescription>
                        <FieldError>{errors.linkUrl}</FieldError>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="post-link-label">A gomb felirata</FieldLabel>
                        <Input id="post-link-label" value={data.linkLabel} onChange={(e) => update("linkLabel", e.target.value)} disabled={disabled} placeholder={DEFAULT_LINK_LABEL} />
                      </Field>
                    </div>
                  </>
                ) : (
                  <Field data-invalid={invalid("publishedDate")} className="sm:max-w-xs">
                    <FieldLabel htmlFor="post-date">Megjelenés dátuma</FieldLabel>
                    <Input id="post-date" type="date" value={data.publishedDate} onChange={(e) => update("publishedDate", e.target.value)} disabled={disabled} aria-invalid={invalid("publishedDate")} />
                    <FieldDescription>Üresen hagyva a közzététel napja lesz. A hírek e szerint rendeződnek, a legfrissebb elöl.</FieldDescription>
                    <FieldError>{errors.publishedDate}</FieldError>
                  </Field>
                )}

                <Field data-invalid={invalid("body")}>
                  <FieldLabel htmlFor="post-body">{isEvent ? "Az esemény leírása" : "A cikk szövege"}</FieldLabel>
                  <Textarea id="post-body" value={data.body} onChange={(e) => update("body", e.target.value)} disabled={disabled} rows={16} className="min-h-72 leading-6" aria-invalid={invalid("body")} />
                  <FieldDescription>{splitParagraphs(data.body).length} bekezdés. Új bekezdéshez hagyjon ki egy üres sort.</FieldDescription>
                  <FieldError>{errors.body}</FieldError>
                </Field>
              </FieldGroup>

              {dirty ? (
                <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                  Nem mentett módosítások vannak. {isPublic ? "A látogatók a mentésig a korábbi változatot látják." : ""}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={disabled || (!dirty && id !== null)}>
                  {busy === "keep" ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
                  {id === null ? "Mentés piszkozatként" : isPublic ? "Módosítások mentése" : "Piszkozat mentése"}
                </Button>
                {isPublic ? (
                  <Button type="button" variant="outline" onClick={() => void save("unpublish")} disabled={disabled}>
                    {busy === "unpublish" ? <Spinner data-icon="inline-start" /> : <EyeOffIcon data-icon="inline-start" />}
                    Visszavonás
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

        {id !== null ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Kép</CardTitle>
                <CardDescription>Nem kötelező. JPEG, PNG vagy WebP, legfeljebb 10 MB; a kiválasztás után azonnal mentődik.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex aspect-[16/9] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted sm:w-64">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Vercel Blob URL, already resized WebP
                    <img src={imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {!imagesConfigured ? <p className="text-sm text-destructive">{PHOTO_MESSAGES.notConfigured}</p> : null}
                  <input ref={fileRef} type="file" accept={PHOTO_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void uploadImage(e.target.files?.[0] ?? null)} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="soft" onClick={() => fileRef.current?.click()} disabled={disabled || !imagesConfigured}>
                      {busy === "image" ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
                      {imageUrl ? "Kép cseréje" : "Kép feltöltése"}
                    </Button>
                    {imageUrl ? (
                      <Button type="button" variant="destructive" onClick={() => void removeImage()} disabled={disabled}>
                        <Trash2Icon data-icon="inline-start" />
                        Kép eltávolítása
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StarIcon className="size-5 text-mavet-gold" aria-hidden="true" />
                  Megjelenés az oldalon
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm">
                <label className="flex items-center gap-3 font-semibold">
                  <Switch checked={isFeatured} onCheckedChange={(c) => void toggleFeatured(c === true)} disabled={disabled || !isPublic || past} />
                  Kiemelés a főoldalon
                  {busy === "feature" ? <Spinner className="size-4 text-muted-foreground" /> : null}
                </label>
                <p className="text-muted-foreground">
                  {!isPublic ? "Csak közzétett bejegyzés emelhető ki." : past ? "Korábbi esemény nem emelhető ki." : "Egyszerre egy bejegyzés lehet kiemelt; bekapcsolva a korábbi kiemelés megszűnik. A kapcsoló azonnal ment."}
                </p>
                <p className="text-muted-foreground">
                  Cím az oldalon: <span className="font-medium text-foreground">{POSTS_PATH}/{slug}</span> (nem változik, ha átírja a címet).
                </p>
                {isPublic && slug ? (
                  <Button variant="soft" className="w-fit" render={<Link href={`${POSTS_PATH}/${slug}`} target="_blank" />} nativeButton={false}>
                    <ExternalLinkIcon data-icon="inline-start" aria-hidden="true" />
                    Megnyitás az oldalon
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <Card className="h-fit xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle>Előnézet</CardTitle>
          <CardDescription>Így jelenik meg a részletes oldalon{dirty ? " (a nem mentett módosításokkal)" : ""}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-background p-5 sm:p-7">
            <PostArticle post={preview} headingLevel="h2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
