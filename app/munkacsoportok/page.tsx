import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { workgroups } from "@/lib/data/site"

export default function WorkgroupsPage() {
  return <><PageHeader title="Munkacsoportok" description="A MAVET szakmai munkájának motorjai a közös témák és kihívások mentén szerveződő munkacsoportok." /><SiteContainer className="flex flex-col gap-8 py-12 sm:py-16"><p className="max-w-3xl leading-7 text-muted-foreground">Hiszünk abban, hogy a legjobb megoldások különböző szakterületek együttműködéséből születnek. A részletes bemutatások, vezetők és csatlakozási lehetőségek a teljes oldal későbbi indulásakor válnak elérhetővé.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{workgroups.map((group) => <Card key={group}><CardHeader><CardTitle className="text-lg">{group}</CardTitle><CardDescription>Részletes bemutatás hamarosan.</CardDescription></CardHeader></Card>)}</div></SiteContainer></>
}
