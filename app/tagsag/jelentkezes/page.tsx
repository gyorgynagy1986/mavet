import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { PreliminaryMembershipForm } from "@/components/preliminary-membership-form"
import { SiteContainer } from "@/components/site-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { preliminaryMembershipCategories } from "@/lib/data/site"

export default async function PreliminaryMembershipPage({ searchParams }: PageProps<"/tagsag/jelentkezes">) {
  const { category } = await searchParams
  const requestedCategory = typeof category === "string" ? category : ""
  const initialCategory = preliminaryMembershipCategories.some((item) => item.id === requestedCategory) ? requestedCategory : ""

  return <SiteContainer className="flex max-w-4xl flex-col gap-6 py-12 sm:py-16"><Button variant="soft" className="w-fit" render={<Link href="/tagsag" />} nativeButton={false}><ArrowLeftIcon data-icon="inline-start" />Vissza a tagsági kategóriákhoz</Button><section className="flex max-w-3xl flex-col gap-3"><h1 className="text-2xl font-semibold">Jelentkezési szándék rögzítése</h1><p className="leading-7 text-muted-foreground">Az alábbi adatok rögzítésével jelezheti jelentkezési szándékát. Amikor elkészül a teljes jelentkezési folyamat, ugyanarra az e-mail-címre küldünk felhívást a folytatáshoz.</p></section><Card><CardContent><PreliminaryMembershipForm initialCategory={initialCategory} /></CardContent></Card></SiteContainer>
}
