import Link from "next/link"
import { CircleAlertIcon } from "lucide-react"
import { SiteContainer } from "@/components/site-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { findByPasswordResetToken } from "@/lib/server/members"
import { ResetPasswordForm } from "./reset-password-form"

export const dynamic = "force-dynamic"

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const user = await findByPasswordResetToken(token)

  if (!user) {
    return (
      <SiteContainer className="flex max-w-3xl flex-col gap-6 py-12 sm:py-16">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Érvénytelen vagy lejárt link</AlertTitle>
          <AlertDescription>A jelszó-visszaállító link egy óráig érvényes és egyszer használható. Kérjen újat az alábbi gombbal.</AlertDescription>
        </Alert>
        <Button className="w-fit" render={<Link href="/elfelejtett-jelszo" />} nativeButton={false}>Új link kérése</Button>
      </SiteContainer>
    )
  }

  return (
    <SiteContainer className="flex max-w-xl flex-col gap-6 py-12 sm:py-16">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Új jelszó beállítása</h1>
        <p className="leading-7 text-muted-foreground">Fiók: <strong>{user.email}</strong></p>
      </section>
      <Card>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </SiteContainer>
  )
}
