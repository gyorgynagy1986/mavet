import { redirect } from "next/navigation"
import { SiteContainer } from "@/components/site-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { ADMIN_HOME_PATH, MEMBER_LOGIN_PATH } from "@/lib/auth-paths"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { AccountNav } from "../account-nav"
import { SignOutButton } from "../sign-out-button"
import { DeleteAccountForm } from "./delete-account-form"

export const dynamic = "force-dynamic"

export default async function DeleteAccountPage() {
  const session = await getServerAuthSession()
  if (!session) redirect(MEMBER_LOGIN_PATH)
  if (isAdmin(session)) redirect(ADMIN_HOME_PATH)

  return (
    <SiteContainer className="flex max-w-4xl flex-col gap-6 py-12 sm:py-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Fiók törlése</h1>
          <p className="mt-1 text-muted-foreground">{session.user.email}</p>
        </div>
        <SignOutButton />
      </header>
      <AccountNav />
      <Alert variant="destructive">
        <AlertTitle>A törlés végleges, nem vonható vissza</AlertTitle>
        <AlertDescription>
          Megszűnik a belépési hozzáférése, az aktív tagsága és a más tagok számára látható profilja. A jogszabály alapján kötelezően megőrzendő nyilvántartási adatok elkülönítve maradnak meg. Ha később újra csatlakozna, új tagsági jelentkezést kell indítania. A folyamatban lévő befizetésekkel kapcsolatos kérdéseket a Társaság a rendszeren kívül rendezi.
        </AlertDescription>
      </Alert>
      <Card>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </SiteContainer>
  )
}
