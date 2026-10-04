import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="A Társaságról"
        description="A MAVET a magyar falu- és vidékegészségügy szakmai hagyományaira építve dolgozik a vidéki közösségek egészségéért."
      />
      <SiteContainer className="max-w-4xl py-12 sm:py-16">
        <article className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Küldetésünk</h2>
            <p className="leading-7 text-muted-foreground">
              A magyar lakosság egészségi állapotának javítása, az egészségügyi ellátáshoz való méltányos hozzáférés elősegítése, valamint a vidéki közösségek egészségének fejlesztése kiemelt nemzeti érdek.
            </p>
            <p className="leading-7 text-muted-foreground">
              A MAVET számára a vidékegészségügy nem kizárólag földrajzi fogalom, hanem olyan szakmai szemlélet, amely lakóhelytől függetlenül magas színvonalú, fenntartható, közösségközpontú és bizonyítékokon alapuló ellátást kíván elősegíteni. A vidéki térségek és az azokhoz kapcsolódó közösségek sajátos egészségügyi kihívásait vizsgáljuk, és helyi közösségekre épülő megoldásokat keresünk.
            </p>
            <p className="leading-7 text-muted-foreground">
              Fórumot teremtünk mindazok számára, akik munkájukkal hozzájárulnak a vidéki és a vidékkel kapcsolatba kerülő lakosság egészségének javításához. Célunk az egészségügyi egyenlőtlenségek csökkentése, az alapellátás, a szakellátás és a közösségi egészségügy fejlesztése, valamint a hazai és nemzetközi tudományos együttműködések erősítése.
            </p>
            <p className="leading-7 text-muted-foreground">
              Munkánkat a tudományos igényesség, a szakmai függetlenség, az etikus működés, az interdiszciplináris együttműködés, az innováció és a társadalmi felelősségvállalás vezérli. Nyitottak vagyunk minden egészségügyi és más szakember, kutató, oktató, döntéshozó, hallgató és érdeklődő felé, aki támogatja céljaink megvalósítását.
            </p>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <div aria-hidden="true" className="aspect-video rounded-xl border bg-muted" />
            <div className="flex flex-col gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Helyszín. Közösség. Szemlélet.</CardTitle>
                  <CardDescription>A vidékegészségügy egyszerre helyi és országos közös ügy.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>A tudomány az együttműködésben válik cselekvéssé.</CardTitle>
                  <CardDescription>Különböző szakterületek közös gondolkodásából születnek fenntartható megoldások.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          <Separator />

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">A Társaság története</h2>
            <p className="leading-7 text-muted-foreground">
              A Magyar Faluegészségügyi Tudományos Társaságot 2003-ban tizenkét, Magyarország különböző térségeiben élő háziorvos alapította. Céljuk a falusi betegellátás európai színvonalú fejlesztése és az volt, hogy a falun élők az egészségügyi ellátásban a városiakhoz hasonló lehetőségekhez jussanak.
            </p>
            <p className="leading-7 text-muted-foreground">
              A Társaság kezdetektől a megelőzésre és a folyamatos betegtájékoztatásra, oktatásra épített. A faluegészségügy önálló tudományterületként való meghonosításán és magyarországi egyetemi oktatásán is dolgozott. Hazai és nemzetközi szakmai kapcsolatai, szakértői, kutatói és oktatói tevékenysége révén hozzájárult a faluegészségügy fejlődéséhez.
            </p>
            <p className="leading-7 text-muted-foreground">
              A 2026-os év fordulópontot jelentett: Dr. Simek Ágnes alapító elnök átadta a stafétát, a szervezet pedig Magyar Vidékegészségügyi Társaság, azaz MAVET néven kezdett új korszakot. A névváltoztatás megőrzi a faluegészségügy értékeit, eredményeit és közösségét, miközben a vidékegészségügy tágabb, interdiszciplináris megközelítését állítja a középpontba.
            </p>
            <p className="leading-7 text-muted-foreground">
              A MAVET a több évtizedes szakmai hagyományra építve, a XXI. század egészségügyi kihívásaira válaszolva kíván hozzájárulni a magyar lakosság egészségi állapotának javításához.
            </p>
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Vezetőség</h2>
            <p className="leading-7 text-muted-foreground">
              A Társaság vezetőségét különböző szakterületekről érkező, a vidék egészségének fejlesztése iránt elkötelezett szakemberek alkotják. A részletes névsor és a személyes bemutatkozások hamarosan!
            </p>
          </section>
        </article>
      </SiteContainer>
    </>
  )
}
