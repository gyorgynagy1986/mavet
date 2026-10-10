"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon, CircleCheckIcon, Loader2Icon, RotateCcwIcon, TimerIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestLoginCode } from "./actions"

const CODE_SECONDS = 180

type Message = { type: "error" | "success"; text: string } | null

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function LoginForm({ callbackUrl, initialError, memberEmail }: { callbackUrl: string; initialError: string | null; memberEmail: string | null }) {
  const router = useRouter()
  const [step, setStep] = useState<"request" | "verify">("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<Message>(
    initialError ? { type: "error", text: "A bejelentkezés nem sikerült. Kérjen új kódot." } : null,
  )
  const [countdown, setCountdown] = useState(CODE_SECONDS)

  useEffect(() => {
    if (step !== "verify") return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStep("request")
          setCode("")
          setMessage({ type: "error", text: "A kód lejárt. Kérjen újat." })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  async function handleRequest(event?: FormEvent) {
    event?.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setCode("")
    try {
      const result = await requestLoginCode(email)
      if (!result.ok) {
        setMessage({ type: "error", text: result.message })
        return
      }
      setMessage({ type: "success", text: "Ha a címhez adminisztrátori fiók tartozik, elküldtük a 6 jegyű kódot." })
      setCountdown(CODE_SECONDS)
      setStep("verify")
    } catch {
      setMessage({ type: "error", text: "Hálózati hiba történt. Próbálja újra." })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const result = await signIn("admin-otp", { email, code, redirect: false, callbackUrl })
      if (result?.error) {
        // NextAuth replaces thrown messages with "CredentialsSignin" in production; keep a neutral fallback.
        const text = result.error === "CredentialsSignin" ? "Érvénytelen vagy lejárt kód." : result.error
        setMessage({ type: "error", text })
        setSubmitting(false)
        return
      }
      setMessage({ type: "success", text: "Sikeres belépés, átirányítás…" })
      router.replace(callbackUrl)
      router.refresh()
    } catch {
      setMessage({ type: "error", text: "Váratlan hiba történt." })
      setSubmitting(false)
    }
  }

  const status = message ? (
    <Alert variant={message.type === "error" ? "destructive" : "default"} className={message.type === "success" ? "border-mavet-blue/30 bg-mavet-blue/5 text-mavet-navy" : undefined}>
      {message.type === "error" ? <CircleAlertIcon aria-hidden="true" /> : <CircleCheckIcon aria-hidden="true" className="text-mavet-blue" />}
      <AlertDescription>{message.text}</AlertDescription>
    </Alert>
  ) : null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-30px_rgb(11_45_91/0.35)]">
      <div className="h-1 bg-muted" aria-hidden="true">
        <div className={`h-full bg-mavet-gold transition-all duration-500 ${step === "request" ? "w-1/2" : "w-full"}`} />
      </div>

      {step === "request" ? (
        <form className="space-y-6 px-6 py-8 sm:px-8" onSubmit={handleRequest} noValidate>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Belépés</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Adja meg az adminisztrátori e-mail-címét; a belépési kódot e-mailben küldjük.</p>
          </div>
          {memberEmail ? (
            <Alert className="border-mavet-gold/40 bg-mavet-gold/10 text-mavet-navy">
              <CircleAlertIcon aria-hidden="true" className="text-mavet-navy" />
              <AlertDescription>
                Ebben a böngészőben jelenleg tagként van bejelentkezve ({memberEmail}). Az adminisztrátori belépés ezt a munkamenetet lecseréli.
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mail-cím</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              autoFocus
              className="h-10"
              placeholder="nev@példa.hu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
          {status}
          <Button type="submit" size="xl" className="w-full" disabled={submitting || email.trim().length === 0}>
            {submitting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Küldés…" : "Kód kérése"}
            {!submitting ? <ArrowRightIcon data-icon="inline-end" aria-hidden="true" /> : null}
          </Button>
        </form>
      ) : (
        <form className="space-y-6 px-6 py-8 sm:px-8" onSubmit={handleVerify} noValidate>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Belépési kód</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              A kódot a(z) <span className="font-semibold text-foreground">{email}</span> címre küldtük.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-code">6 jegyű kód</Label>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums" aria-live="polite">
                <TimerIcon className="size-3.5" aria-hidden="true" />
                {formatTime(countdown)}
              </span>
            </div>
            <Input
              id="login-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              className="h-12 text-center font-mono text-2xl tracking-[0.5em]"
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={submitting}
            />
          </div>
          {status}
          <Button type="submit" size="xl" className="w-full" disabled={submitting || code.length !== 6}>
            {submitting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Ellenőrzés…" : "Bejelentkezés"}
          </Button>
          <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setStep("request"); setMessage(null) }} disabled={submitting}>
              <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
              Vissza
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleRequest()} disabled={submitting}>
              <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
              Új kód kérése
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
