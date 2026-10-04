import Link from "next/link"
import { ArrowRightIcon, ScrollTextIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ADMIN_HOME_PATH } from "@/lib/auth-paths"
import { getServerAuthSession, isSuperAdmin } from "@/lib/server/auth/session"

export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  const session = await getServerAuthSession()
  const superAdmin = isSuperAdmin(session)
  const firstName = session?.user.name?.split(" ").at(-1) ?? null

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-mavet-blue uppercase">Adminisztráció</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {firstName ? `Üdvözöljük, ${firstName}!` : "Üdvözöljük!"}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Ez a MAVET weboldal kezelőfelületének első változata. A tartalmi modulok (jelentkezések, hírek, események, szakmai anyagok) a következő fejlesztési körökben kerülnek ide.
        </p>
      </header>

      <section aria-labelledby="gyors-muveletek" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <h2 id="gyors-muveletek" className="sr-only">Gyors műveletek</h2>

        {superAdmin ? (
          <Card>
            <CardHeader>
              <ShieldCheckIcon className="size-6 text-mavet-blue" aria-hidden="true" />
              <CardTitle>Adminok</CardTitle>
              <CardDescription>Új adminisztrátor felvétele, szerep módosítása, jogosultság visszavonása.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="soft" render={<Link href={`${ADMIN_HOME_PATH}/adminok`} />} nativeButton={false}>
                Megnyitás
                <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {superAdmin ? (
          <Card>
            <CardHeader>
              <ScrollTextIcon className="size-6 text-mavet-blue" aria-hidden="true" />
              <CardTitle>Naplók</CardTitle>
              <CardDescription>Belépési kísérletek és jogosultság-változások időrendben.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="soft" render={<Link href={`${ADMIN_HOME_PATH}/naplo`} />} nativeButton={false}>
                Megnyitás
                <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-dashed">
          <CardHeader>
            <UsersIcon className="size-6 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-muted-foreground">Tagsági jelentkezések</CardTitle>
            <CardDescription>A következő fejlesztési körben érkezik: elbírálás, kategória-módosítás, befizetések rögzítése.</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  )
}
