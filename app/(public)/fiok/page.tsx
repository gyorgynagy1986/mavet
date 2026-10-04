import { redirect } from "next/navigation"
import { CheckCircle2Icon, ClockIcon, CircleAlertIcon } from "lucide-react"
import { SiteContainer } from "@/components/site-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dbConnect from "@/lib/db-connect"
import { ADMIN_HOME_PATH, MEMBER_LOGIN_PATH } from "@/lib/auth-paths"
import { formatHuf } from "@/lib/data/membership-fees"
import { UserModel, type UserDocument } from "@/lib/models/user"
import { categoryName, formatDate, formatDateTime } from "@/lib/server/applications"
import { getServerAuthSession, isAdmin } from "@/lib/server/auth/session"
import { SignOutButton } from "./sign-out-button"
import { ChangePasswordForm } from "./change-password-form"
import { Toaster } from "@/components/ui/sonner"

export const dynamic = "force-dynamic"

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  aktiv: { label: "Aktív tag", variant: "default" },
  fizetesre_var: { label: "Elfogadva, tagdíjra vár", variant: "secondary" },
  aktivalasra_var: { label: "Aktiválásra vár", variant: "outline" },
  lejart: { label: "Lejárt tagság", variant: "destructive" },
  megszunt: { label: "Megszűnt", variant: "outline" },
}

export default async function AccountPage() {
  const session = await getServerAuthSession()
  if (!session) redirect(`${MEMBER_LOGIN_PATH}`)
  if (isAdmin(session)) redirect(ADMIN_HOME_PATH)

  await dbConnect()
  const user = await UserModel.findById(session.user.id).lean<UserDocument | null>()
  if (!user) redirect(MEMBER_LOGIN_PATH)

  const m = user.membership
  const status = m?.status ? STATUS[m.status] : null
  const fullName = [user.title, user.lastName, user.firstName].filter(Boolean).join(" ") || user.name

  return (
    <SiteContainer className="flex max-w-4xl flex-col gap-6 py-12 sm:py-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Saját fiók</h1>
          <p className="mt-1 text-muted-foreground">{fullName} · {user.email}</p>
        </div>
        <SignOutButton />
      </header>

      {m?.status === "fizetesre_var" && m.feeDue ? (
        <Alert>
          <ClockIcon />
          <AlertTitle>Első tagdíj: {formatHuf(m.feeDue.amount ?? 0)} ({m.feeDue.forYear}. év)</AlertTitle>
          <AlertDescription>
            Tagsága a befizetés igazolásával válik aktívvá. Határidő: {m.feeDue.dueAt ? formatDate(m.feeDue.dueAt) : "–"}. Az online (SimplePay) fizetés és a banki átutalás adatai hamarosan itt lesznek elérhetők; addig a Kapcsolat oldalon érdeklődhet.
          </AlertDescription>
        </Alert>
      ) : null}
      {m?.status === "aktiv" ? (
        <Alert>
          <CheckCircle2Icon className="text-mavet-blue" />
          <AlertTitle>Tagsága aktív</AlertTitle>
          <AlertDescription>Érvényes {m.paidThroughYear ? `${m.paidThroughYear}. december 31-ig` : "a tagsági időszak végéig"}. A tagi anyagok, a névjegyzék és a profilbeállítások a következő fejlesztési ütemben érkeznek.</AlertDescription>
        </Alert>
      ) : null}
      {m?.status === "megszunt" ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Tagsága megszűnt</AlertTitle>
          <AlertDescription>A tagi felületek nem érhetők el. Kérdés esetén a Kapcsolat oldalon érhet el minket; új tagsághoz új jelentkezés szükséges.</AlertDescription>
        </Alert>
      ) : null}
      {m?.status === "lejart" ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Tagsága lejárt</AlertTitle>
          <AlertDescription>A tagdíj befizetésével a tagság új elbírálás nélkül helyreállítható.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Tagság</CardTitle>
          <CardDescription>A tagsági kategóriát és állapotot a Társaság kezeli.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div><div className="text-muted-foreground">Állapot</div><div className="mt-0.5">{status ? <Badge variant={status.variant}>{status.label}</Badge> : "–"}</div></div>
          <div><div className="text-muted-foreground">Kategória</div><div className="font-medium">{categoryName(m?.category)}</div></div>
          <div><div className="text-muted-foreground">Elfogadva</div><div className="font-medium">{m?.acceptedAt ? formatDateTime(m.acceptedAt) : "–"}</div></div>
          <div><div className="text-muted-foreground">Aktiválva</div><div className="font-medium">{m?.activatedAt ? formatDateTime(m.activatedAt) : "–"}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adataim</CardTitle>
          <CardDescription>A jelentkezéskor megadott adatok. A szerkesztés és a megjelenési beállítások a következő ütemben érkeznek.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div><div className="text-muted-foreground">Név</div><div className="font-medium">{fullName}</div></div>
          <div><div className="text-muted-foreground">Telefon</div><div className="font-medium">{user.phone || "–"}</div></div>
          <div><div className="text-muted-foreground">Szakterület</div><div className="font-medium">{user.specialty || "–"}</div></div>
          <div><div className="text-muted-foreground">Munkahely</div><div className="font-medium">{user.workplace || "–"}</div></div>
          <div className="sm:col-span-2"><div className="text-muted-foreground">Levelezési cím</div><div className="font-medium">{[user.address?.postalCode, user.address?.city, user.address?.street, user.address?.country].filter(Boolean).join(", ") || "–"}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jelszó módosítása</CardTitle>
          <CardDescription>A jelenlegi jelszó megadásával. Elfelejtett jelszó esetén a bejelentkezési oldalról kérhet visszaállító linket.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
      <Toaster />
    </SiteContainer>
  )
}
