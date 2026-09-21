# MAVET csökkentett funkcionalitású weboldal funkcionális specifikációja

**Verzió:** 0.3  
**Dátum:** 2026. szeptember 21.  
**Állapot:** fejlesztésre előkészített első változat  
**Belső munkanév:** CSÖK

## 1. A változat célja

A csökkentett funkcionalitású weboldal célja, hogy a Magyar Vidékegészségügyi Társaság a teljes weboldal és tagsági rendszer elkészülte előtt nyilvánosan elérhető, hiteles és mobilon is használható online bemutatkozó felülettel rendelkezzen.

Ez a változat a végleges domainen jelenik meg, és később ugyanebben a projektben fejlődik tovább a teljes funkcionalitású rendszerré. Nem különálló, eldobható bemutató készül. A most kialakított oldalszerkezetet, szemantikus HTML-felépítést és újrahasználható komponenseket ezért úgy kell megvalósítani, hogy azok a későbbi fejlesztés során megtarthatók és bővíthetők legyenek.

A változat elsősorban statikus, tájékoztató tartalmakat mutat. Nem tartalmaz bejelentkezést, felhasználói fiókot, teljes tagsági jelentkezést, fizetést, tagi névjegyzéket, konferencia-regisztrációt vagy védett tartalmat. A látogató két, backendkapcsolatot igénylő műveletet végezhet:

1. előzetes tagsági jelentkezést rögzíthet, amelyet a teljes rendszer elkészülésekor folytathat;
2. kapcsolatfelvételi üzenetet küldhet a Társaságnak.

## 2. Megvalósítási keret

### 2.1. Technológiai követelmények

- A felület Next.js App Router és TypeScript használatával készül.
- A vizuális alapot Tailwind CSS, shadcn és Base UI komponensek adják.
- A megjelenés semleges, szürkeárnyalatos, reszponzív wireframe. Végleges arculat, márkaszínek és márkabetűtípus nem része ennek a változatnak.
- Minden aloldali route-szegmens saját `layout.tsx` fájlt kap.
- A `layout.tsx` fájlok szerveroldali komponensek; nem tartalmazhatnak `"use client"` direktívát.
- A `page.tsx` fájlok szemantikus HTML-t használnak, és ahol lehetséges, szerveroldali komponensek maradnak.
- A kliensoldali működés kizárólag az interaktív elemek külön komponenseiben jelenik meg, például a mobilmenüben és az űrlapokban.
- Az aloldalak címe egységes, tömör cím–leírás blokkként jelenik meg: háttérszín, keret és külön hero-szakasz nélkül, a kapcsolódó tartalommal azonos bal oldali konténervonalon.
- Az oldal nem használ analitikai vagy marketingcélú követőkódot.
- A változat működéséhez nem szükséges, hozzájárulást igénylő süti nem használható.
- A tartalom magyar nyelven készül.

### 2.2. Front-end és backend határa

A front-end biztosítja az oldalak, üres és hibás állapotok, űrlapok, validációk és visszajelzések teljes felületét. Az előzetes tagsági jelentkezések tárolását, a visszaigazoló és későbbi folytatásra hívó e-mailek kiküldését, a visszaélések korlátozását, valamint a kapcsolatfelvételi üzenetek továbbítását a backend valósítja meg.

A front-end nem tárolja tartósan a beküldött e-mail-címeket vagy kapcsolatfelvételi üzeneteket a böngészőben. A backend végpontjai a projekt API-rétegén keresztül kapcsolódnak a felülethez, hogy a későbbi backendcsere ne igényelje az oldalkomponensek átírását.

### 2.3. Tartalmi alapelvek

- A közzétett szövegek a rendelkezésre álló MAVET-forrásanyagokból és a teljes funkcionális specifikáció lezárt szabályaiból készülnek.
- A forrásanyagok nyelvi hibái, ismétlései és elírásai javíthatók a jelentés megváltoztatása nélkül.
- Hiányzó név, kép, partner, vezető, díjazott vagy esemény nem helyettesíthető valósnak látszó kitalált adattal.
- Fejlesztés közben semleges, egyértelműen jelölt helyőrzők használhatók. Nyilvános élesítés előtt a kapcsolati és jogi helyőrzőket végleges adatra kell cserélni.
- Üres tartalmi modul nem jelenik meg pusztán azért, hogy a végleges oldal teljes menüszerkezetét előre utánozza. Kivétel a jelen specifikációban kifejezetten meghatározott „Hamarosan” állapot.

## 3. Oldaltérkép és navigáció

### 3.1. Nyilvános oldalak

| Oldal | Javasolt útvonal | Rendeltetés |
| --- | --- | --- |
| Főoldal | `/` | Rövid bemutatkozás és fő tartalmi belépési pontok |
| A Társaságról | `/a-tarsasagrol` | Küldetés, történet és vezetőségi bemutatkozás |
| Tagság | `/tagsag` | A tagság célja és kategóriái |
| Előzetes tagsági jelentkezés | `/tagsag/jelentkezes` | Jelentkezési szándék rögzítése a teljes folyamat elkészültéig |
| Munkacsoportok | `/munkacsoportok` | A szakmai munkacsoportok általános bemutatása és felsorolása |
| Aktualitások | `/aktualitasok` | Két, ügyfél által adott statikus hír listája |
| Hír részletei | `/aktualitasok/{slug}` | A kiválasztott statikus hír teljes szövege |
| Szakmai anyagok | `/szakmai-anyagok` | „Hamarosan” üres állapot |
| Kapcsolat | `/kapcsolat` | Elérhetőségek, közösségi hivatkozás és kapcsolatfelvételi űrlap |
| Adatkezelési tájékoztató | `/adatkezeles` | A CSÖK-változat adatkezelési tájékoztatója |
| Impresszum | `/impresszum` | Az üzemeltető adatai és jogi alapinformációk |
| Süti-tájékoztató | `/suti-tajekoztato` | A sütimentes működés és az esetleges technikailag szükséges sütik ismertetése |

### 3.2. Elsődleges navigáció

A fejlécben a következő menüpontok jelennek meg:

1. Főoldal;
2. A Társaságról;
3. Tagság;
4. Munkacsoportok;
5. Aktualitások;
6. Kapcsolat.

A logó vagy annak semleges helyőrzője a főoldalra vezet. Az asztali és mobil navigációban egyértelmű „Jelentkezem” gomb vezet a `/tagsag/jelentkezes` oldalra. Bejelentkezés, regisztráció és „Saját fiók” menüpont nem jelenik meg.

Mobilon a navigáció nyitható és bezárható menüben jelenik meg. A mobilmenü megnyitásakor a billentyűzetfókusz a menübe kerül, bezárásakor visszatér a megnyitó gombra.

### 3.3. Lábléc

A lábléc tartalmazza:

- a Társaság nevét;
- a végleges kapcsolati e-mail-címet;
- a Facebook-oldal hivatkozását, ha azt az élesítésig átadják;
- az Impresszum hivatkozását;
- az Adatkezelési tájékoztató hivatkozását;
- a Süti-tájékoztató hivatkozását;
- rövid jelzést arról, hogy a weboldal fejlesztés alatt áll.

Instagram-hivatkozás csak akkor jelenik meg, ha az élesítés előtt valódi, jóváhagyott cím érkezik.

## 4. Fejlesztés alatti állapot jelzése

### 4.1. Folyamatos információs sáv

Minden oldalon, a navigáció fölött látható egy fekete hátterű, fehér szövegű, keskeny információs sáv: „A MAVET új weboldala folyamatosan bővül. Hamarosan új tartalmakkal és online funkciókkal várjuk.” A sávból a `/tagsag/jelentkezes` oldalra lehet továbblépni. Külön felugró párbeszédablak nem jelenik meg.

A sáv nem takarhatja el a navigációt vagy az oldal műveleti elemeit, és mobilon sem okozhat vízszintes görgetést.

## 5. Főoldal

### 5.1. Tartalmi sorrend

A főoldal sorrendben a következő részeket tartalmazza:

1. hero és rövid önmeghatározás;
2. rövid küldetésbemutatás;
3. a Társaság megismerésére vezető blokk;
4. munkacsoportok előnézete;
5. Facebook-követésre és kapcsolatfelvételre vezető blokk.

### 5.2. Hero

A hero a két jóváhagyott mottót és rövid önmeghatározást használja; semleges képi helyőrző nem jelenik meg:

- „Helyszín. Közösség. Szemlélet.”
- „A tudomány az együttműködésben válik cselekvéssé.”

Az elsődleges művelet a „Jelentkezem”, amely az előzetes jelentkezési oldalra vezet. Másodlagos műveletként az „Ismerje meg a Társaságot” az A Társaságról oldalra vezet.

Az előzetes jelentkezésről egyértelműen jelezni kell, hogy nem teljes tagsági jelentkezés, és nem hoz létre fiókot vagy tagsági jogosultságot.

### 5.3. Bemutatkozó blokk

A blokk a küldetésnyilatkozat rövid, szerkesztett kivonatát jeleníti meg. A teljesebb küldetés és történet az A Társaságról oldalon olvasható.

### 5.4. Munkacsoport-előnézet

A főoldal a teljes specifikáció szerinti hat munkacsoport nevét mutatja semleges kártyákon. Asztali nézetben a kártyák háromoszlopos rácsban jelennek meg. A kártyák a Munkacsoportok oldalra vezetnek. Vezetőnév, jelentkezési gomb vagy kitöltetlen leírás nem jelenik meg.

## 6. A Társaságról oldal

### 6.1. Küldetés és jövőkép

Az oldal bemutatja a Társaság küldetését, a vidékegészségügy értelmezését, az egészségügyi egyenlőtlenségek csökkentésének célját, az alapellátás, szakellátás és közösségi egészségügy fejlesztését, valamint a két mottót. A hosszabb forrásszöveg jól olvasható bekezdésekre és alcímekre bontható.

A két mottó asztali nézetben két egymás alatti kártyán jelenhet meg egy semleges, szürke 16:9-es helyőrző mellett. Mobilon ezek egymás alá törnek. A helyőrző dekoratív, nem helyettesít valódi fényképet vagy illusztrációt.

### 6.2. A Társaság története

A történeti szakasz bemutatja:

- a Magyar Faluegészségügyi Tudományos Társaság 2003-as alapítását;
- a falusi betegellátás fejlesztését, a megelőzés és betegoktatás szerepét, valamint a faluegészségügy önálló tudományterületként és egyetemi oktatásban való meghonosításának célját;
- a hazai és nemzetközi szakmai kapcsolatok, szakértői, kutatói és oktatói tevékenység szerepét;
- a 2026-os szervezeti megújulást, Dr. Simek Ágnes alapító elnök stafétaátadását és a Magyar Vidékegészségügyi Társaság név felvételét;
- a korábbi értékek továbbvitelét, az interdiszciplináris vidékegészségügyi szemléletet és a XXI. század egészségügyi kihívásaira adott válasz szándékát.

A történeti szakasz a jelenlegi ügyfélanyagban szereplő személynevet tartalmazza. Új személynév vagy történeti állítás csak jóváhagyott ügyfélanyag alapján vehető fel.

### 6.3. Vezetőség

Mivel nincs teljes, jóváhagyott vezetőségi névsor és képkészlet, személyi kártyák nem jelennek meg. Az oldal általános szöveggel mutatja be, hogy a vezetőség különböző szakterületekről érkező, a vidék egészségének fejlesztése iránt elkötelezett szakemberekből áll; a részletes névsor és személyes bemutatkozások hamarosan várhatók.

A későbbi névsor és profilok számára a szerkezet bővíthető marad, de üres portrék vagy kitalált személyek nem jelennek meg.

## 7. Tagság oldal

### 7.1. Tartalmi cél

A Tagság oldal bemutatja a MAVET-tagság közösségi és szakmai célját, a tagsági kategóriákat, valamint egy korlátozott, előzetes tagsági jelentkezést biztosít. A jelentkezés nem hoz létre felhasználói fiókot, tagjelölti állapotot, tagsági jogosultságot vagy fizetési kötelezettséget.

Az oldal bemutatja:

- a MAVET-tagság közösségi és szakmai célját;
- az interdiszciplináris szakmai közösséget;
- a rendezvényekhez, munkacsoportokhoz és későbbi szakmai tartalmakhoz kapcsolódó lehetőségeket;
- a teljes specifikációban meghatározott tagsági kategóriákat: Rendes, Hallgatói, Ifjúsági, Érdemes, Tiszteletbeli és Pártoló tagság.

### 7.2. Kategóriák bemutatása

A kategóriák kártyákon jelennek meg. A kártyák rövid, közérthető leírást, a végleges specifikációval összhangban álló jogosultsági vagy alkalmassági tájékoztatást, valamint csak jóváhagyott esetben tagdíjinformációt adnak.

| Kategória | CSÖK-oldalon megjelenő, a teljes specifikációhoz igazított leírás | Művelet |
| --- | --- | --- |
| Rendes tag | Teljes jogú tagsági forma nagykorú természetes személyek számára, akik elfogadják a Társaság céljait és Alapszabályát. | „Jelentkezem” |
| Hallgatói tag | Kapcsolódási lehetőség nagykorú, közép- vagy felsőoktatásban tanuló hallgatóknak. | „Jelentkezem” |
| Ifjúsági tag | Teljes jogú tagsági forma a 35. életév betöltéséig jelentkező fiatal szakemberek számára. | „Jelentkezem” |
| Érdemes tag | Az Érdemes tagságra önjelentkezés indítható; a kategóriába sorolásról az Elnökség dönt. | „Jelentkezem” |
| Tiszteletbeli tag | A Társaság által adományozható elismerés a vidékegészségügy fejlődéséhez kiemelkedően hozzájáruló személyeknek. | Nincs önjelentkezés; az Elnökség dönt. |
| Pártoló tag | Kapcsolódási lehetőség természetes személyeknek, akik támogatni kívánják a Társaság célkitűzéseit. | „Jelentkezem” |

A kártyán lévő „Jelentkezem” gomb a `/tagsag/jelentkezes?category={azonosító}` aloldalra vezet, és a választott kategóriát előre kitölti az űrlapon. A közvetlenül megnyitott jelentkezési oldalon a látogató maga választ kategóriát. A Tiszteletbeli tagság kártyáján nincs jelentkezési gomb.

A tagdíjösszegek csak akkor jelenhetnek meg, ha azok az élesítéskor továbbra is jóváhagyottak. Ennek hiányában a felület nem mutat összeget, és nem használ kitöltetlen „Tagdíj összege” mezőt.

### 7.3. Előzetes tagsági jelentkezés

Az űrlap külön, `/tagsag/jelentkezes` útvonalú aloldalon jelenik meg, saját szerveroldali `layout.tsx` fájllal. Címe „Jelentkezési szándék rögzítése”. Előtte rövid tájékoztatás jelzi:

> A teljes tagsági jelentkezéshez szükséges funkciók még fejlesztés alatt állnak. Az alábbi adatok rögzítésével jelezheti jelentkezési szándékát; amikor a folyamat elkészül, ugyanarra az e-mail-címre küldünk felhívást a jelentkezés folytatásához.

Az űrlap mezői:

| Mező | Követelmény |
| --- | --- |
| Tagsági kategória | Kötelező. Választható: Rendes, Hallgatói, Ifjúsági, Érdemes vagy Pártoló. Tiszteletbeli nem választható. |
| Titulus | Opcionális. Külön választómező: nincs, Dr. vagy Prof. |
| Vezetéknév | Kötelező. |
| Keresztnév | Kötelező. |
| E-mail-cím | Kötelező, formailag érvényes. |
| Adatkezelési hozzájárulás | Kötelező jelölőnégyzet, közvetlen hivatkozással az Adatkezelési tájékoztatóra. |

A hozzájárulás kifejezetten az előzetes jelentkezés rögzítésére, a visszaigazoló e-mailre és a teljes jelentkezés elkészültekor küldendő folytatási felhívásra vonatkozik. Nem hírlevél- vagy általános marketing-hozzájárulás.

Érvényes beküldéskor a backend rögzíti az előzetes jelentkezést, a felület egyértelmű sikerüzenetet mutat, és a jelentkező automatikus visszaigazoló e-mailt kap. A levél nem állíthatja, hogy a jelentkező tagjelölt vagy tag lett.

Ugyanazzal az e-mail-címmel ismételt beküldés nem hoz létre duplikátumot. A publikus felület semleges sikerüzenetet ad, és nem fedi fel, hogy az e-mail-cím korábban szerepelt-e a nyilvántartásban. A teljes rendszer elkészültekor a backend a rögzített e-mail-címre küldi el a folytatásra hívó üzenetet; a részletes adatlap, e-mail-megerősítés, elbírálás, fiók és esetleges fizetés csak akkor indul.

### 7.4. Javasolt API-szerződés

`POST /api/preliminary-membership-applications`

Kérés:

```json
{
  "category": "rendes",
  "title": "Dr.",
  "lastName": "Minta",
  "firstName": "Jelentkező",
  "email": "jelentkezo@example.hu",
  "privacyNoticeVersion": "csok-2026-09-21",
  "consent": true
}
```

Elvárt válaszok:

- `200` vagy `201`: az előzetes jelentkezés rögzítve, illetve az e-mail-cím már korábban rögzítve volt;
- `400`: hiányos vagy hibás adat;
- `429`: túl sok beküldési kísérlet;
- `500` vagy `503`: átmeneti szerveroldali hiba.

A publikus válasz nem különböztetheti meg az új és a korábbi e-mail-címet. A működő éles backend visszaigazoló e-mailt küld mindkét esetben a saját kommunikációs szabályai szerint, de fiókot nem hoz létre.

## 8. Munkacsoportok oldal

### 8.1. Bevezetés

Az oldal a munkacsoportokat a Társaság szakmai munkájának motorjaiként mutatja be. Ismerteti, hogy azok nem kizárólag egy-egy szakma köré, hanem közös témák és kihívások mentén szerveződnek.

### 8.2. Megjelenített munkacsoportok

A teljes funkcionális specifikáció szerinti induló témák jelennek meg:

- Telemedicina;
- Mesterséges intelligencia;
- Point of Care, kompetenciafejlesztés és hatáskörbővítés;
- Ellátásszervezés és menedzsment;
- Humánerőforrás-menedzsment és utánpótlás;
- Longevity.

A csoportok egységes, statikus kártyákon jelennek meg. Mivel részletes, jóváhagyott leírás és vezetőlista nem áll rendelkezésre, a kártyák csak a csoport nevét mutatják. Nem jelenik meg üres „Vezető” vagy „Leírás” címke.

Munkacsoport-jelentkezési gomb vagy űrlap nem készül. Az oldal jelzi, hogy a részletes bemutatások és a csatlakozási lehetőségek a teljes oldal későbbi indulásakor válnak elérhetővé.

## 9. Aktualitások oldal

Az `/aktualitasok` oldal két, ügyfél által adott, statikus hírt mutat dátummal, címmel, rövid összefoglalóval és „Elolvasom” hivatkozással. A művelet a kártya tartalmi részében jelenik meg, nem elkülönített alsó sávban:

1. „Új fejezet kezdődik a Társaság életében” (2026. július 29.);
2. „Megalakult a MAVET új vezetése, elfogadták az új alapszabályt” (2026. szeptember 2.).

Minden hír saját, szerveroldalon renderelt `/aktualitasok/{slug}` oldalon jelenik meg a teljes, nyelvileg szerkesztett ügyfélanyaggal. A részletes oldal visszahivatkozást tartalmaz az Aktualitások listára, és saját `layout.tsx` fájlt kap.

Hírlista-kezelés, adminisztráció, keresés, szűrés, lapozás, eseménykezelés és automatikus publikálás nem készül.

## 10. Szakmai anyagok oldal

A `/szakmai-anyagok` oldalon rövid, semleges üres állapot jelenik meg:

> A MAVET szakmai anyagai a weboldal következő fejlesztési ütemében válnak elérhetővé.

Dokumentum, videó, letöltés, keresés, kategóriaszűrő, zárolt előnézet vagy tagi hozzáférés nem készül. A felület nem keltheti azt a benyomást, hogy a még nem elérhető anyagok közvetlen hivatkozással megnyithatók.

## 12. Kapcsolat oldal

### 12.1. Kapcsolati adatok

Az oldal a következő adatokat mutatja:

- Magyar Vidékegészségügyi Társaság;
- hivatalos kapcsolati e-mail-cím;
- Facebook-oldal hivatkozása;
- opcionálisan Instagram-oldal hivatkozása.

Fejlesztés közben egyértelműen jelölt mintaadat használható. Nyilvános élesítés előtt minden mintaelérhetőséget valódi, ügyfél által jóváhagyott adatra kell cserélni. Nem működő közösségimédia-hivatkozás nem jelenhet meg.

### 12.2. Kapcsolatfelvételi űrlap

Az űrlap mezői:

- név;
- e-mail-cím;
- üzenet;
- kötelező adatkezelési nyilatkozat.

A mezők felirattal rendelkeznek, a kötelező kitöltést és az e-mail formátumát a front-end ellenőrzi. A backend továbbítja az üzenetet az élesítés előtt megadott címzettnek, korlátozza a visszaélésszerű küldést, és a szükséges megőrzési szabály szerint kezeli az adatokat.

Sikeres küldéskor visszaigazolás jelenik meg. Hiba esetén nincs hamis sikerjelzés, és a nem érzékeny kitöltött mezők megmaradnak. A feladó automatikus másolatot nem kap.

### 12.3. Javasolt API-szerződés

`POST /api/contact-messages`

Kérés:

```json
{
  "name": "Minta Látogató",
  "email": "latogato@example.hu",
  "message": "Kapcsolatfelvételi üzenet.",
  "privacyNoticeVersion": "csok-2026-09-20",
  "consent": true
}
```

Elvárt válaszok:

- `201`: az üzenet továbbítása sikeres;
- `400`: hiányos vagy hibás adat;
- `429`: túl sok beküldési kísérlet;
- `500` vagy `503`: az üzenet nem továbbítható.

## 13. Jogi oldalak és induláskori minimumtájékoztatás

### 13.1. Adatkezelési tájékoztató

A CSÖK-változat adatkezelési tájékoztatója legalább a következőket tartalmazza:

- az adatkezelő végleges neve és elérhetősége;
- az előzetes tagsági jelentkezés célja;
- a kezelt adatok: választott tagsági kategória, titulus, vezetéknév, keresztnév, e-mail-cím, hozzájárulás időpontja és a tájékoztató verziója;
- a hozzájárulás mint jogalap;
- az adatkezelés időtartama: a teljes jelentkezési folyamat elérhetővé válásáig és a folytatásra hívó üzenet kiküldéséig, illetve a végleges jogi tájékoztatóban rögzített időpontig;
- az érintetti jogok és a törlési kérelem kapcsolati módja;
- a kapcsolatfelvételi űrlap adatkezelési célja, adatai és megőrzési ideje;
- az adatfeldolgozók vagy technikai szolgáltatók végleges adatai;
- a panasz és jogorvoslat lehetősége.

Az élesítés előtti végleges szöveget jogi szempontból az ügyfélnek jóvá kell hagynia. A fejlesztési placeholder nem minősül végleges jogi tájékoztatónak.

### 13.2. Impresszum

Az Impresszum legalább a Társaság végleges nevét, székhelyét, hivatalos kapcsolati címét, nyilvántartási adatait és a tárhelyszolgáltató szükséges adatait tartalmazza. Ezek hiányában fejlesztési placeholder használható, de a nyilvános élesítés előtt minden mezőt véglegesíteni kell.

## 14. Általános állapotok és visszajelzések

Az interaktív elemek elkülönítik:

- az alapállapotot;
- a beküldés folyamatban állapotát;
- a sikeres műveletet;
- a mezőszintű hibát;
- az általános vagy hálózati hibát;
- a túl sok próbálkozás miatti korlátozást.

Beküldés közben ugyanaz a művelet nem indítható többször. A visszajelzések nem csak színnel különböznek, és képernyőolvasó számára is érzékelhetők.

Nem létező oldal egységes 404-oldalt mutat, amely visszavezet a főoldalra. Váratlan oldalhiba esetén közérthető hibaállapot és újrapróbálási vagy főoldali továbblépési lehetőség jelenik meg.

## 15. Reszponzivitás és akadálymentesség

A fejlesztés belső akadálymentességi célértéke a WCAG 2.2 AA szint. Ez megvalósítási és ellenőrzési cél, nem külső megfelelőségi tanúsítás.

- Minden oldal mobilon, tableten és asztali képernyőn használható.
- A navigáció, hivatkozások és űrlapok billentyűzettel kezelhetők.
- A fókuszjelzés mindig látható.
- Az oldalankénti címszerkezet logikus; egy oldalnak egy elsődleges `h1` címe van.
- Minden űrlapmező programozott feliratot kap.
- A mezőhibák az érintett mezőhöz kapcsolódnak.
- A státuszok nem kizárólag színnel jelzettek.
- A dekoratív helyőrző képek nem kapnak felesleges felolvasandó leírást; tartalmi kép esetén megfelelő alternatív szöveg szükséges.
- Mobilon nem lehet vízszintes görgetés, levágott szöveg vagy más elem által takart gomb.
- A csökkentett mozgást kérő böngészőbeállítást tiszteletben kell tartani.

## 16. Kereső és megosztási viselkedés

A publikus tartalmi oldalak indexelhetők és közvetlenül hivatkozhatók. Oldalanként megfelelő magyar cím és rövid leírás készül. Külön keresőoptimalizálási projekt, strukturáltadat-rendszer, webhelytérképen túli kampányoptimalizálás és egyedi közösségi megosztási kép nem része ennek a változatnak.

A fejlesztési vagy előnézeti környezet nem indexelhető. A végleges domain indexelhetősége az élesítéskor engedélyezhető. Ezt környezetfüggő robots-beállításnak kell biztosítania, nem kézi élesítési fájlcserének. A publikus oldalakból webhelytérkép készül.

## 17. Kifejezetten kizárt funkciók

A CSÖK-változat nem tartalmazza:

- felhasználói regisztrációt vagy bejelentkezést;
- felhasználói fiókot és jelszókezelést;
- teljes tagsági jelentkezést, elbírálást vagy státuszkezelést;
- tagdíjat, SimplePay-fizetést vagy banki átutalás rögzítését;
- tagi profilokat vagy tagi névjegyzéket;
- adminisztrációs felületet vagy tartalomkezelő rendszert;
- hír- és eseménykezelő adminisztrációt;
- esemény- vagy konferencia-regisztrációt;
- díjazotti és partnerlistát;
- munkacsoport-jelentkezést;
- szakmai dokumentumok vagy videók közzétételét;
- fájlfeltöltést vagy letöltésvédelmet;
- hírlevélküldést vagy általános marketing-hozzájárulást;
- keresést, szűrést vagy lapozást;
- analitikát és marketingkövetést;
- végleges vizuális arculatot;
- angol nyelvű változatot.

Ezek a funkciók nem jelenhetnek meg működőnek látszó, de hatástalan gombként. Ahol a későbbi elérhetőség fontos, ott szöveges tájékoztatás használható. Az előzetes tagsági jelentkezés kizárólag a 7.3. fejezetben meghatározott korlátozott adatfelvételt jelenti.

## 18. Elfogadási kritériumok

1. A felsorolt oldalak közvetlen URL-ről elérhetők, és mindegyik saját szerveroldali `layout.tsx` fájllal rendelkezik.
2. A tartalmi `page.tsx` fájlok szerveroldali komponensek maradnak; kliensoldali kód csak az interaktív komponensekben található.
3. A felület minden alkalmazásforrása TypeScript vagy TSX; JavaScript vagy JSX alkalmazásforrás nem készül.
4. Minden oldal egyértelműen jelzi, hogy a weboldal fejlesztés alatt áll és egyes funkciók később érkeznek.
5. A fejlesztés-alatti állapot a navigáció fölötti fekete információs sávból és a láblécből minden oldalon megismerhető; külön felugró ablak nem jelenik meg.
7. Bejelentkezés, regisztráció, teljes tagsági jelentkezés, fizetés és tagi tartalom nem érhető el sem navigációból, sem közvetlen route-ról.
8. A Tagság oldalon a jelentkezhető kategóriák kártyáin működő „Jelentkezem” gomb a külön jelentkezési oldalra vezet és előre kitölti a kategóriát; a Tiszteletbeli tagságnál nincs ilyen gomb.
9. A Munkacsoportok oldal a teljes specifikáció szerinti témákat mutatja, de nem jelenít meg kitalált vezetőt vagy hiányzó leírást.
10. Az Aktualitások oldal a két ügyfél által adott statikus hírt és azok részletes oldalait mutatja; a Szakmai anyagok oldal közérthető „Hamarosan” állapotot mutat, fiktív tartalom nélkül.
11. Az előzetes jelentkezési űrlap csak tagsági kategóriát, titulust, vezetéknevet, keresztnevet, e-mail-címet és külön hozzájárulást kér.
12. Hiányzó kötelező mező, hibás e-mail-cím vagy hiányzó hozzájárulás esetén az űrlap nem küldhető be, és a felület mezőszintű hibát mutat.
13. Sikeres előzetes jelentkezés után egyértelmű visszaigazolás jelenik meg és visszaigazoló e-mail indul; ismételt cím nem hoz létre duplikált bejegyzést.
14. Szerver- vagy hálózati hiba nem eredményez hamis sikerjelzést.
15. Az előzetes jelentkezés adatai kizárólag a jelentkezés rögzítésére, visszaigazolására és a teljes folyamat folytatására hívó üzenetre használhatók; nem használhatók hírlevélre vagy más marketingcélra.
16. A kapcsolatfelvételi űrlap kötelező mezői és adatkezelési nyilatkozata működnek, siker és hiba esetén megfelelő visszajelzést adnak.
17. A backend mindkét publikus űrlapnál korlátozza a visszaélésszerű ismételt beküldést.
18. `429` válasz esetén a felület közérthető magyar korlátozási üzenetet mutat, és ha a backend `Retry-After` fejlécet küld, azt tiszteletben tartja; saját, megalapozatlan visszaszámlálást nem jelenít meg.
19. Az éles változat nem tartalmaz minta e-mail-címet, hibás közösségi hivatkozást vagy kitöltetlen jogi adatmezőt.
20. Az oldal nem használ analitikai követőt vagy nem szükséges hozzájárulásköteles sütit.
21. A felület mobilon, tableten és asztali méretben használható, vízszintes görgetés és takart műveleti elem nélkül.
22. A navigáció, hivatkozások és űrlapok billentyűzettel kezelhetők, a fókusz látható, a hibák nem csak színnel jelzettek, és a megvalósítás belső célként a WCAG 2.2 AA követelményeit követi.
23. Hiányzó személyek, partnerek, díjazottak, események és képek helyett nem jelenik meg valósnak látszó kitalált adat.
24. A teljes projekt későbbi funkciói a jelenlegi szerkezet továbbépítésével megvalósíthatók; a CSÖK-oldal nem különálló, eldobható kódbázis.

## 19. Élesítés előtt átadandó adatok

Az éles nyilvános megjelenés előtt az ügyfélnek át kell adnia vagy jóvá kell hagynia:

- a hivatalos kapcsolati e-mail-címet;
- a Facebook-oldal pontos hivatkozását;
- az esetleges Instagram-oldal pontos hivatkozását;
- az adatkezelő és az Impresszum kötelező szervezeti adatait;
- a tárhelyszolgáltató szükséges adatait;
- az előzetes jelentkezési és kapcsolatfelvételi adatkezelés végleges szövegét;
- a történeti szövegben szereplő személynevek publikálhatóságát;
- a végleges logót és minden publikálandó képet, ha addig rendelkezésre állnak;
- az előzetes jelentkezési és kapcsolatfelvételi backend végpontjait, e-mail-sablonjait és működő éles konfigurációját.

Ha a végleges logó vagy kép nem érkezik meg, a nyilvános változat semleges wireframe-helyőrzőt használhat. Kapcsolati, adatkezelési vagy impresszumadat azonban nem maradhat fiktív az éles oldalon.
