import { MavetEmblem } from "@/components/brand/mavet-emblem"
import { MavetLogo } from "@/components/brand/mavet-logo"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { AlreadyLoggedIn } from "./already-logged-in"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

/** Only same-origin paths are accepted as a return target. */
function safeCallbackUrl(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || !value.startsWith("/") || value.startsWith("//")) return ADMIN_HOME_PATH
  return value
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(params.callbackUrl)
  const session = await getServerAuthSession()
  const adminSession = session && isAdmin(session) ? session : null
  // A member session in the same browser (one NextAuth cookie) must not block
  // the admin login: the form is shown and a successful admin sign-in replaces it.
  const memberSession = session && !isAdmin(session) ? session : null

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Brand panel */}
      <section className="relative isolate flex flex-col justify-between overflow-hidden bg-mavet-hero px-6 py-8 text-white sm:px-10 lg:w-[46%] lg:px-14 lg:py-12">
        <div className="absolute inset-0 -z-10 bg-mavet-grid" aria-hidden="true" />
        <MavetEmblem
          variant="mono"
          className="absolute -right-24 -bottom-32 -z-10 w-[32rem] text-white opacity-[0.06]"
          aria-hidden="true"
        />
        <MavetLogo tone="dark" className="text-xl sm:text-2xl" />
        <div className="my-10 max-w-md lg:my-0">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-mavet-gold uppercase">Adminisztráció</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-balance sm:text-4xl">
            Helyszín. Közösség. Szemlélet.
          </h1>
          <p className="mt-4 text-base leading-7 text-white/75">
            A Magyar Vidékegészségügyi Társaság weboldalának kezelőfelülete. A belépés e-mailben kapott, egyszer használható kóddal történik.
          </p>
        </div>
        <p className="hidden text-xs text-white/50 lg:block">Csak kijelölt adminisztrátorok számára. Minden belépési kísérlet naplózásra kerül.</p>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center bg-mavet-surface px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {adminSession ? (
            <AlreadyLoggedIn name={adminSession.user.name} email={adminSession.user.email} callbackUrl={callbackUrl} />
          ) : (
            <LoginForm
              callbackUrl={callbackUrl}
              initialError={typeof params.error === "string" ? params.error : null}
              memberEmail={memberSession?.user.email ?? null}
            />
          )}
        </div>
      </section>
    </div>
  )
}
