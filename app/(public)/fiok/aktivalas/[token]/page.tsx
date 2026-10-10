import { CircleAlertIcon } from "lucide-react"
import { SiteContainer } from "@/components/site-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { formatHuf } from "@/lib/data/membership-fees"
import { categoryName, formatDate } from "@/lib/server/applications"
import { findByActivationToken } from "@/lib/server/members"
import { ActivationForm } from "./activation-form"

export const dynamic = "force-dynamic"

export default async function ActivationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const user = await findByActivationToken(token)

  if (!user || user.membership?.status !== "aktivalasra_var") {
    return (
      <SiteContainer className="flex max-w-3xl flex-col gap-6 py-12 sm:py-16">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Érvénytelen vagy lejárt aktiváló link</AlertTitle>
          <AlertDescription>
            A link nem érvényes, lejárt, vagy a fiók már aktiválva van. Ha már beállította a jelszavát, lépjen be a Bejelentkezés oldalon; ha a link lejárt, a Kapcsolat oldalon kérhet újat a Társaságtól.
          </AlertDescription>
        </Alert>
      </SiteContainer>
    )
  }

  const feeDue = user.membership?.feeDue
  const fullName = [user.title, user.lastName, user.firstName].filter(Boolean).join(" ")

  return (
    <SiteContainer className="flex max-w-3xl flex-col gap-6 py-12 sm:py-16">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Fiók aktiválása</h1>
        <p className="leading-7 text-muted-foreground">
          Üdvözöljük, {fullName}! Tagsági jelentkezését ({categoryName(user.membership?.category)}) a Társaság elfogadta. A tagi felület eléréséhez állítson be egy jelszót; a belépési azonosítója az e-mail-címe: <strong>{user.email}</strong>.
        </p>
      </section>
      {feeDue?.amount ? (
        <Alert>
          <AlertTitle>Első tagdíj: {formatHuf(feeDue.amount)} ({feeDue.forYear}. év)</AlertTitle>
          <AlertDescription>
            Az aktiválás után a tagság a tagdíj befizetésének igazolásával válik aktívvá. Határidő: {feeDue.dueAt ? formatDate(feeDue.dueAt) : "–"}. A fizetési módokat a fiókjában találja.
          </AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardContent>
          <ActivationForm token={token} />
        </CardContent>
      </Card>
    </SiteContainer>
  )
}
