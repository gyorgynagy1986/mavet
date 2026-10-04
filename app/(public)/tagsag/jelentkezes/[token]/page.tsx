import Link from "next/link"
import { ArrowLeftIcon, CheckCircle2Icon, CircleAlertIcon, ClockIcon, LinkIcon, XCircleIcon } from "lucide-react"
import { SiteContainer } from "@/components/site-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import dbConnect from "@/lib/db-connect"
import { MembershipApplicationModel, unfinishedApplicationStatuses, type MembershipApplicationCategory, type MembershipApplicationDocument } from "@/lib/models/membership-application"
import { categoryName, findByContinueToken, formatDateTime, fullName, hashToken } from "@/lib/server/applications"
import { FullApplicationForm } from "./full-application-form"

export const dynamic = "force-dynamic"

export default async function ContinueApplicationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Unfinished applications need a valid (unexpired) token; decided ones may
  // still show their status with an old link.
  let app: MembershipApplicationDocument | null = await findByContinueToken(token)
  if (!app && token.length >= 20 && token.length <= 128) {
    await dbConnect()
    app = await MembershipApplicationModel.findOne({ continueTokenHash: hashToken(token), status: { $nin: [...unfinishedApplicationStatuses] } }).lean<MembershipApplicationDocument | null>()
  }

  if (!app) {
    return (
      <SiteContainer className="flex max-w-3xl flex-col gap-6 py-12 sm:py-16">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Érvénytelen vagy lejárt link</AlertTitle>
          <AlertDescription>
            A jelentkezés folytatásához használt link nem érvényes, vagy lejárt. Ha korábban már jelezte jelentkezési szándékát, a rövid űrlap újbóli beküldésével ugyanarra az e-mail-címre új linket küldünk, a megkezdett jelentkezése nem vész el.
          </AlertDescription>
        </Alert>
        <Button variant="soft" className="w-fit" render={<Link href="/tagsag/jelentkezes" />} nativeButton={false}>
          <LinkIcon data-icon="inline-start" />
          Új link kérése
        </Button>
      </SiteContainer>
    )
  }

  // First open of the link = e-mail verified.
  if (app.status === "elozetes") {
    await dbConnect()
    await MembershipApplicationModel.updateOne(
      { _id: app._id, status: "elozetes" },
      { $set: { status: "megerositett", emailVerifiedAt: new Date(), lastActivityAt: new Date() } },
    )
    app = { ...app, status: "megerositett" }
  }

  const name = fullName(app)
  const category = categoryName(app.category)

  if ((unfinishedApplicationStatuses as readonly string[]).includes(app.status)) {
    return (
      <SiteContainer className="flex max-w-4xl flex-col gap-6 py-12 sm:py-16">
        <Button variant="soft" className="w-fit" render={<Link href="/tagsag" />} nativeButton={false}>
          <ArrowLeftIcon data-icon="inline-start" />
          Vissza a tagsági kategóriákhoz
        </Button>
        <section className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-2xl font-semibold">Tagsági jelentkezés: adatlap</h1>
          <p className="leading-7 text-muted-foreground">
            Köszönjük, {name}! Az e-mail-címét megerősítettük. Kérjük, töltse ki az alábbi adatlapot a(z) <strong>{category}</strong> kategóriához. A kitöltést bármikor elmentheti és később, ugyanezzel a linkkel folytathatja; a jelentkezés csak a véglegesítéssel kerül elbírálásra.
          </p>
        </section>
        <Card>
          <CardContent>
            <FullApplicationForm
              token={token}
              category={app.category as MembershipApplicationCategory}
              initial={{
                birthDate: app.birthDate ? app.birthDate.toISOString().slice(0, 10) : "",
                postalCode: app.address?.postalCode ?? "",
                city: app.address?.city ?? "",
                street: app.address?.street ?? "",
                country: app.address?.country ?? "Magyarország",
                phone: app.phone ?? "",
                specialty: app.specialty ?? "",
                workplace: app.workplace ?? "",
                noWorkplace: app.noWorkplace ?? false,
                medicalDegree: app.medicalDegree === true ? "orvos" : app.medicalDegree === false ? "nem_orvos" : "",
              }}
            />
          </CardContent>
        </Card>
      </SiteContainer>
    )
  }

  const status =
    app.status === "bekuldott"
      ? { icon: <ClockIcon />, title: "Jelentkezése elbírálás alatt", text: `Adatlapját ${app.submittedAt ? formatDateTime(app.submittedAt) : ""}-kor véglegesítette. A döntésről e-mailben értesítjük; addig nincs további teendője.` }
      : app.status === "elfogadva"
        ? { icon: <CheckCircle2Icon className="text-mavet-blue" />, title: "Jelentkezését elfogadtuk", text: "Üdvözöljük a MAVET tagjai között! A fiók aktiválásához szükséges levelet külön küldjük." }
        : app.status === "elutasitva"
          ? { icon: <XCircleIcon />, title: "Jelentkezését nem fogadtuk el", text: app.decisionMessage || "A döntésről e-mailben küldtünk tájékoztatást. Ugyanazzal az e-mail-címmel új jelentkezést indíthat." }
          : { icon: <CircleAlertIcon />, title: "A jelentkezés lezárult", text: "Ez a jelentkezés lezárult. Kérdés esetén a Kapcsolat oldalon érhet el minket." }

  return (
    <SiteContainer className="flex max-w-3xl flex-col gap-6 py-12 sm:py-16">
      <Alert aria-live="polite">
        {status.icon}
        <AlertTitle>{status.title}</AlertTitle>
        <AlertDescription>{status.text}</AlertDescription>
      </Alert>
      <Card>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div><div className="text-muted-foreground">Név</div><div className="font-medium">{name}</div></div>
          <div><div className="text-muted-foreground">Kategória</div><div className="font-medium">{category}</div></div>
          <div><div className="text-muted-foreground">E-mail</div><div className="font-medium">{app.email}</div></div>
          <div><div className="text-muted-foreground">Beküldve</div><div className="font-medium">{app.submittedAt ? formatDateTime(app.submittedAt) : "–"}</div></div>
        </CardContent>
      </Card>
      {app.status === "elutasitva" ? (
        <Button className="w-fit" render={<Link href={`/tagsag/jelentkezes?category=${app.category === "erdemes" ? "rendes" : app.category}`} />} nativeButton={false}>
          Új jelentkezés indítása
        </Button>
      ) : null}
    </SiteContainer>
  )
}
