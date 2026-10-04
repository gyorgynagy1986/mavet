import { redirect } from "next/navigation"
import { SiteContainer } from "@/components/site-container"
import { Card, CardContent } from "@/components/ui/card"
import { ADMIN_HOME_PATH, MEMBER_ACCOUNT_PATH } from "@/lib/auth-paths"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { MemberLoginForm } from "./member-login-form"

export const dynamic = "force-dynamic"

export default async function MemberLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const session = await getServerAuthSession()
  if (session) redirect(isAdmin(session) ? ADMIN_HOME_PATH : MEMBER_ACCOUNT_PATH)

  return (
    <SiteContainer className="flex max-w-xl flex-col gap-6 py-12 sm:py-16">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Bejelentkezés</h1>
        <p className="leading-7 text-muted-foreground">A tagi felület az elfogadott és aktivált tagsággal rendelkezők számára érhető el. A belépési azonosító a jelentkezéskor megadott e-mail-cím.</p>
      </section>
      <Card>
        <CardContent>
          <MemberLoginForm justActivated={params.aktivalva === "1"} />
        </CardContent>
      </Card>
    </SiteContainer>
  )
}
