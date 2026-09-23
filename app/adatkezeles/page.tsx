import type { ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { dataController, privacyNoticeEffectiveDate, processors, retention } from "@/lib/data/legal"
import { privacyNoticeVersion } from "@/lib/data/site"

function Placeholder({ children }: { children: ReactNode }) {
  return <em className="text-foreground/70">[{children}]</em>
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-xl font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

const sections = [
  ["adatkezelo", "1. Az adatkezelő"],
  ["fogalmak", "2. Fogalmak és jogszabályi háttér"],
  ["jelentkezes", "3. Előzetes tagsági jelentkezés"],
  ["kapcsolat", "4. Kapcsolatfelvétel"],
  ["technikai", "5. Technikai adatkezelés és visszaélés elleni védelem"],
  ["sutik", "6. Sütik"],
  ["cimzettek", "7. Címzettek és adatfeldolgozók"],
  ["harmadik-orszag", "8. Adattovábbítás harmadik országba"],
  ["biztonsag", "9. Adatbiztonság"],
  ["jogok", "10. Az érintettek jogai"],
  ["jogorvoslat", "11. Jogorvoslat"],
  ["egyeb", "12. Egyéb rendelkezések"],
] as const

export default function PrivacyPage() {
  const c = dataController
  return (
    <>
      <PageHeader title="Adatkezelési tájékoztató" description="Tájékoztatás a videkegeszseg.hu weboldalon végzett személyesadat-kezelésről az (EU) 2016/679 rendelet (GDPR) 13. cikke szerint." />
      <SiteContainer className="max-w-4xl py-12 sm:py-16">
        <article className="flex flex-col gap-10 leading-7 text-muted-foreground">
          <Alert>
            <AlertTitle>Élesítés előtti feltétel</AlertTitle>
            <AlertDescription>A szögletes zárójelben jelölt adatokat és a megőrzési időket a Társaságnak kell megadnia, illetve jóváhagynia. A nyilvános oldal nem indulhat hiányos adatkezelői adatokkal.</AlertDescription>
          </Alert>

          <p className="text-sm">Hatályos: {privacyNoticeEffectiveDate} napjától. A tájékoztató azonosítója: <code className="rounded bg-muted px-1 py-0.5 text-xs">{privacyNoticeVersion}</code>. Ezt az azonosítót minden hozzájárulással együtt rögzítjük, így utólag is megállapítható, melyik szöveget fogadta el az érintett.</p>

          <nav aria-label="Tartalom" className="rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Tartalom</p>
            <ol className="grid gap-1 text-sm sm:grid-cols-2">
              {sections.map(([id, title]) => <li key={id}><a className="underline-offset-4 hover:underline" href={`#${id}`}>{title}</a></li>)}
            </ol>
          </nav>

          <Section id="adatkezelo" title="1. Az adatkezelő">
            <p>A weboldalon megadott személyes adatok kezelője:</p>
            <dl className="rounded-lg border px-4">
              <Row label="Név">{c.name} ({c.shortName})</Row>
              <Row label="Székhely">{c.seat ?? <Placeholder>székhely</Placeholder>}</Row>
              <Row label="Nyilvántartó bíróság">{c.registrationCourt ?? <Placeholder>nyilvántartó törvényszék</Placeholder>}</Row>
              <Row label="Nyilvántartási szám">{c.registrationNumber ?? <Placeholder>nyilvántartási szám</Placeholder>}</Row>
              <Row label="Adószám">{c.taxNumber ?? <Placeholder>adószám</Placeholder>}</Row>
              <Row label="Képviselő">{c.representative ?? <Placeholder>képviselő neve és tisztsége</Placeholder>}</Row>
              <Row label="E-mail">
                <a className="underline underline-offset-4" href={`mailto:${c.email}`}>{c.email}</a>
              </Row>
              <Row label="Weboldal">{c.website}</Row>
              <Row label="Adatvédelmi ügyek">
                <a className="underline underline-offset-4" href={`mailto:${c.privacyEmail}`}>{c.privacyEmail}</a>
              </Row>
              <Row label="Adatvédelmi tisztviselő">
                {c.dataProtectionOfficer ? `${c.dataProtectionOfficer.name}, ${c.dataProtectionOfficer.email}` : "A Társaság a GDPR 37. cikke alapján adatvédelmi tisztviselő kijelölésére nem köteles, tisztviselőt nem jelölt ki. Adatvédelmi kérdésekben a fenti e-mail-címen áll rendelkezésre."}
              </Row>
            </dl>
          </Section>

          <Section id="fogalmak" title="2. Fogalmak és jogszabályi háttér">
            <p>A tájékoztatóban használt fogalmak (személyes adat, adatkezelés, adatkezelő, adatfeldolgozó, érintett, hozzájárulás) jelentése megegyezik az (EU) 2016/679 európai parlamenti és tanácsi rendelet (általános adatvédelmi rendelet, a továbbiakban: GDPR) 4. cikkében meghatározottakkal.</p>
            <p>Az adatkezelésre irányadó jogszabályok: a GDPR; az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Infotv.); az egyesülési jogról, a közhasznú jogállásról, valamint a civil szervezetek működéséről és támogatásáról szóló 2011. évi CLXXV. törvény (Ectv.); a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.); az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény (Ekertv.).</p>
            <p>A weboldal kiskorúaknak nem szól; tagsági jelentkezést az Alapszabály szerint nagykorú természetes személy nyújthat be. Az adatkezelő nem végez profilalkotást és nem hoz kizárólag automatizált adatkezelésen alapuló döntést (GDPR 22. cikk).</p>
          </Section>

          <Section id="jelentkezes" title="3. Előzetes tagsági jelentkezés">
            <dl className="rounded-lg border px-4">
              <Row label="Érintettek">A jelentkezési űrlapot kitöltő természetes személyek.</Row>
              <Row label="Kezelt adatok">Választott tagsági kategória; titulus (ha megadja); vezetéknév; keresztnév; e-mail-cím; a hozzájárulás időpontja; az elfogadott tájékoztató azonosítója; a böngésző azonosító karakterlánca (user agent); a beküldő IP-címének visszafejthetetlen (SHA-256) lenyomata. A nyers IP-címet nem tároljuk.</Row>
              <Row label="Célok">(a) A jelentkezés rögzítése és a tagjelölti státusz nyilvántartása; (b) automatikus visszaigazoló e-mail küldése a jelentkezőnek; (c) a Társaság kijelölt kapcsolattartójának értesítése az új jelentkezésről; (d) a Közgyűlés tagfelvételi döntésének előkészítése és a döntésről szóló tájékoztatás; (e) a hozzájárulás megtörténtének és tartalmának igazolása (GDPR 7. cikk (1) bekezdés).</Row>
              <Row label="Jogalap">Az (a)–(d) célokra: az érintett hozzájárulása, GDPR 6. cikk (1) bekezdés a) pont, egyúttal a tagsági jogviszony létrehozását megelőző, az érintett kérésére történő lépések megtétele, GDPR 6. cikk (1) bekezdés b) pont, tekintettel az Ectv. és az Alapszabály tagfelvételi szabályaira. Az (e) célra: az adatkezelő jogos érdeke, GDPR 6. cikk (1) bekezdés f) pont; a jogos érdek a hozzájárulás igazolhatóságához fűződő, a GDPR 7. cikk (1) bekezdéséből fakadó kötelezettség teljesítése.</Row>
              <Row label="Adatszolgáltatás">Az adatok megadása önkéntes, de a jelentkezés rögzítésének feltétele: a kötelező mezők nélkül a jelentkezés nem nyújtható be. Egy e-mail-címmel egy jelentkezés rögzíthető.</Row>
              <Row label="Megőrzés">Elbírálás alatt: {retention.applicationPending}. Elfogadás esetén: {retention.applicationAccepted}. Elutasítás vagy visszavonás esetén: {retention.applicationRejectedOrWithdrawn}.</Row>
              <Row label="Címzettek">A Társaság tagfelvételben közreműködő tisztségviselői és a Közgyűlés; a 7. pontban felsorolt adatfeldolgozók.</Row>
            </dl>
            <p>A jelentkezés nem hírlevél-feliratkozás, nem hoz létre felhasználói fiókot, és önmagában nem keletkeztet tagsági jogviszonyt. A jelentkezés a Közgyűlés döntéséig a fenti e-mail-címen bármikor visszavonható.</p>
          </Section>

          <Section id="kapcsolat" title="4. Kapcsolatfelvétel">
            <dl className="rounded-lg border px-4">
              <Row label="Érintettek">A kapcsolati űrlapot kitöltő vagy e-mailben megkereső személyek.</Row>
              <Row label="Kezelt adatok">Név; e-mail-cím; az üzenet tartalma és az abban az érintett által önkéntesen közölt további adatok; a beküldés időpontja; a hozzájárulás időpontja és az elfogadott tájékoztató azonosítója.</Row>
              <Row label="Cél">A megkeresés megválaszolása, kapcsolattartás.</Row>
              <Row label="Jogalap">Az érintett hozzájárulása, GDPR 6. cikk (1) bekezdés a) pont.</Row>
              <Row label="Adatszolgáltatás">Önkéntes; a név, az e-mail-cím és az üzenet nélkül a megkeresés nem küldhető el.</Row>
              <Row label="Megőrzés">{retention.contactMessage[0].toUpperCase() + retention.contactMessage.slice(1)}, kivéve, ha a megkeresésből jogviszony keletkezik, ekkor az arra irányadó ideig.</Row>
              <Row label="Címzettek">A Társaság kijelölt kapcsolattartója; a 7. pontban felsorolt adatfeldolgozók közül a tárhely- és a levélküldő szolgáltató.</Row>
            </dl>
          </Section>

          <Section id="technikai" title="5. Technikai adatkezelés és visszaélés elleni védelem">
            <dl className="rounded-lg border px-4">
              <Row label="Kiszolgálási naplók">A weboldal minden lekérésekor a tárhelyszolgáltató technikai naplót rögzít: IP-cím, időpont, lekért oldal, HTTP-státusz, böngésző- és eszközadatok. Cél: a szolgáltatás biztonságos és hibamentes működtetése, támadások felismerése. Jogalap: az adatkezelő jogos érdeke (GDPR 6. cikk (1) bekezdés f) pont) a szolgáltatás rendelkezésre állásának és biztonságának fenntartásához. Megőrzés: {retention.serverLogs}.</Row>
              <Row label="Kérésszám-korlátozás">Az űrlapok automatizált, tömeges beküldésének megakadályozására a beküldő IP-címének visszafejthetetlen lenyomatát és a beküldések számát tároljuk. Jogalap: jogos érdek (GDPR 6. cikk (1) bekezdés f) pont). Megőrzés: {retention.rateLimit}.</Row>
              <Row label="E-mail-kézbesítés">A levélküldő szolgáltató a kézbesítésről naplót vezet (címzett, időpont, státusz). Megőrzés: {retention.emailDeliveryLogs}.</Row>
            </dl>
            <p>A jogos érdeken alapuló adatkezelések ellen az érintett a 10. pont szerint tiltakozhat. Az érdekmérlegelés eredménye: a technikai naplózás és a korlátozás az érintett jogait csak csekély mértékben érinti (a nyers IP-cím rövid ideig, illetve csak lenyomat formájában kerül tárolásra), míg nélküle a szolgáltatás nem üzemeltethető biztonságosan.</p>
          </Section>

          <Section id="sutik" title="6. Sütik">
            <p>A weboldal kizárólag a működéshez feltétlenül szükséges sütiket és böngészőtárolót használ; analitikai, marketing- vagy profilalkotási célú sütit nem alkalmaz, ezért az Ekertv. 13/A. § szerinti hozzájárulás-kérés nem szükséges. A részleteket a <a className="underline underline-offset-4" href="/suti-tajekoztato">Sütitájékoztató</a> tartalmazza.</p>
          </Section>

          <Section id="cimzettek" title="7. Címzettek és adatfeldolgozók">
            <p>Személyes adatot a Társaság harmadik személynek nem ad át, kivéve a jogszabályon alapuló hatósági vagy bírósági megkeresést. A weboldal működtetéséhez az alábbi adatfeldolgozókat veszi igénybe; ezek az adatokat kizárólag a Társaság írásbeli utasítása szerint, a GDPR 28. cikkének megfelelő adatfeldolgozói szerződés alapján kezelik, és azokat saját célra nem használhatják.</p>
            <dl className="flex flex-col gap-4">
              {processors.map((p) => (
                <div key={p.name} className="rounded-lg border p-4">
                  <dt className="font-medium text-foreground">{p.name}</dt>
                  <dd className="mt-1 flex flex-col gap-1 text-sm">
                    <span>{p.address}</span>
                    <span><span className="font-medium text-foreground">Tevékenység:</span> {p.role}.</span>
                    <span><span className="font-medium text-foreground">Érintett adatok:</span> {p.data}</span>
                    <span><span className="font-medium text-foreground">Adattárolás helye, garanciák:</span> {p.location}</span>
                    <a className="underline underline-offset-4" href={p.link} target="_blank" rel="noopener noreferrer">Adatvédelmi tájékoztató</a>
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="harmadik-orszag" title="8. Adattovábbítás harmadik országba">
            <p>Az adatfeldolgozók egy része az Amerikai Egyesült Államokban bejegyzett vállalkozás. Az adatok tárolása elsődlegesen az Európai Unió területén (Frankfurt) történik; ahol a szolgáltatás jellegéből adódóan USA-beli feldolgozás is történhet (levélküldés, ügyfélszolgálati hozzáférés), ott a továbbítás a GDPR 45. cikke szerinti megfelelőségi határozat (az Európai Bizottság (EU) 2023/1795 határozata az EU–USA adatvédelmi keretrendszerről) alapján, a keretrendszerben tanúsított szolgáltatók részére, továbbá a GDPR 46. cikk (2) bekezdés c) pontja szerinti általános szerződési feltételek kikötésével történik. Az általános szerződési feltételek másolata a Társaságtól a fenti e-mail-címen kérhető.</p>
          </Section>

          <Section id="biztonsag" title="9. Adatbiztonság">
            <p>A Társaság a GDPR 32. cikke szerint a kockázattal arányos technikai és szervezési intézkedéseket alkalmaz: a weboldal és az adatátvitel kizárólag titkosított (HTTPS/TLS) kapcsolaton érhető el; az adatbázis titkosítva tárol és csak hitelesített, korlátozott hozzáféréssel érhető el; a hozzáférési kulcsok a kódtól elkülönítve, titkosított környezeti változókban találhatók; az IP-cím kizárólag visszafejthetetlen lenyomatként kerül tárolásra; a jelentkezők adataihoz kizárólag a tagfelvételben közreműködő, titoktartásra kötelezett tisztségviselők férnek hozzá. Adatvédelmi incidens esetén a Társaság a GDPR 33–34. cikke szerint jár el: az incidenst 72 órán belül bejelenti a felügyeleti hatóságnak, és magas kockázat esetén az érintetteket is tájékoztatja.</p>
          </Section>

          <Section id="jogok" title="10. Az érintettek jogai">
            <p>Az érintett a fenti e-mail-címen vagy postai úton bármikor gyakorolhatja az alábbi jogait. A Társaság a kérelmet indokolatlan késedelem nélkül, de legkésőbb a beérkezéstől számított egy hónapon belül teljesíti; ez a határidő a kérelem összetettségére tekintettel további két hónappal meghosszabbítható, amiről az érintett tájékoztatást kap. A tájékoztatás és az intézkedés díjmentes, kivéve a nyilvánvalóan megalapozatlan vagy túlzó kérelmeket. A kérelmező személyazonosságának megerősítése kérhető.</p>
            <dl className="rounded-lg border px-4">
              <Row label="Hozzáférés (15. cikk)">Visszajelzés arról, hogy folyamatban van-e adatkezelés, és ha igen, hozzáférés az adatokhoz és a kezelés lényeges körülményeihez; az adatok másolatának kiadása.</Row>
              <Row label="Helyesbítés (16. cikk)">A pontatlan adat helyesbítése, a hiányos adat kiegészítése.</Row>
              <Row label="Törlés (17. cikk)">Az adat törlése, többek között ha a cél megszűnt, a hozzájárulást visszavonták, vagy az adatkezelés jogellenes; kivéve, ha az adatkezelés jogi kötelezettség teljesítéséhez vagy jogi igény érvényesítéséhez szükséges.</Row>
              <Row label="Korlátozás (18. cikk)">Az adatkezelés korlátozása, például a pontosság vitatása esetén az ellenőrzés idejére, vagy ha az érintett törlés helyett korlátozást kér.</Row>
              <Row label="Adathordozhatóság (20. cikk)">A hozzájáruláson vagy szerződésen alapuló, automatizáltan kezelt adatok kiadása tagolt, géppel olvasható formátumban, illetve továbbítása másik adatkezelőhöz.</Row>
              <Row label="Tiltakozás (21. cikk)">A jogos érdeken alapuló adatkezelés (5. pont) ellen az érintett saját helyzetével kapcsolatos okból tiltakozhat; ekkor az adat csak akkor kezelhető tovább, ha azt kényszerítő erejű jogos ok indokolja.</Row>
              <Row label="Hozzájárulás visszavonása (7. cikk (3) bekezdés)">A hozzájárulás bármikor, indokolás nélkül visszavonható; a visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét. A jelentkezés visszavonása a tagfelvételi eljárás megszüntetésével jár.</Row>
            </dl>
          </Section>

          <Section id="jogorvoslat" title="11. Jogorvoslat">
            <p>Ha az érintett úgy ítéli meg, hogy személyes adatainak kezelése sérti a GDPR-t, kérjük, elsőként a Társasághoz forduljon a fenti elérhetőségen, hogy a kérdést közvetlenül rendezhessük. Ettől függetlenül az érintett jogosult:</p>
            <dl className="rounded-lg border px-4">
              <Row label="Hatósági panasz (77. cikk)">Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH), 1055 Budapest, Falk Miksa utca 9–11.; postacím: 1363 Budapest, Pf. 9.; telefon: +36 1 391 1400; e-mail: ugyfelszolgalat@naih.hu; honlap: <a className="underline underline-offset-4" href="https://www.naih.hu" target="_blank" rel="noopener noreferrer">www.naih.hu</a>.</Row>
              <Row label="Bírósági jogorvoslat (79. cikk)">Az érintett a lakóhelye vagy tartózkodási helye szerint illetékes törvényszék előtt pert indíthat az adatkezelővel vagy az adatfeldolgozóval szemben. A per elbírálása a törvényszék hatáskörébe tartozik (Infotv. 23. §).</Row>
              <Row label="Kártérítés (82. cikk)">Aki a GDPR megsértése következtében vagyoni vagy nem vagyoni kárt szenvedett, kártérítésre jogosult.</Row>
            </dl>
          </Section>

          <Section id="egyeb" title="12. Egyéb rendelkezések">
            <p>A Társaság a tájékoztatót egyoldalúan módosíthatja, különösen jogszabályváltozás vagy az adatkezelés körülményeinek változása esetén. A hatályos tájékoztató mindig ezen az oldalon érhető el; a módosítás a közzététellel lép hatályba, az azonosító (verziószám) minden módosításkor változik. A már rögzített hozzájárulásoknál a Társaság nyilvántartja, hogy az érintett a tájékoztató melyik változatát fogadta el. Lényeges, az érintettek jogait érintő módosításról a Társaság az érintetteket e-mailben is értesíti.</p>
            <p>A tájékoztató a GDPR 12–14. cikkében előírt tartalommal készült. A tájékoztatóban nem szabályozott kérdésekben a 2. pontban felsorolt jogszabályok az irányadók.</p>
          </Section>
        </article>
      </SiteContainer>
    </>
  )
}
