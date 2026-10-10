import { SiteContainer } from "@/components/site-container"
import { Card, CardContent } from "@/components/ui/card"
import { ForgotPasswordForm } from "./forgot-password-form"

export const dynamic = "force-dynamic"

export default function ForgotPasswordPage() {
  return (
    <SiteContainer className="flex max-w-xl flex-col gap-6 py-12 sm:py-16">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Elfelejtett jelszó</h1>
        <p className="leading-7 text-muted-foreground">Adja meg a tagi fiókjához tartozó e-mail-címet. Ha a címhez aktivált fiók tartozik, egy óráig érvényes, egyszer használható linket küldünk az új jelszó beállításához.</p>
      </section>
      <Card>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </SiteContainer>
  )
}
