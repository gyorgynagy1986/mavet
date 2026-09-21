> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Nyitott döntések

**Dokumentum állapota:** élő egyeztetési lista  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**A dokumentum célja:** a funkcionális specifikáció elkészítéséhez szükséges, még nem véglegesített üzleti és működési döntések összegyűjtése ügyfél-egyeztetésre.

## Tartalom

1. Tagság és felhasználói fiókok
2. Munkacsoportok és szakmai anyagok
3. Díjazottak és elismerések
4. Konferenciamodul
5. Fizetés, számlázás és külső szolgáltatások
6. Adminisztráció és jogosultságok
7. A Társaságról
8. Karbantartási előzmények

## Használat

- Minden új specifikációs dokumentum végén szerepelhetnek saját nyitott kérdések.
- Az ebben a dokumentumban szereplő lista ezek közös, központi gyűjtőhelye.
- Egy kérdés csak akkor kerül ki a listából, ha a döntés egyértelműen megszületett, és azt átvezettük a megfelelő funkcionális specifikációba.
- Az `ND-xx` azonosító állandó: egy azonosítót nem számozunk át és nem használunk fel újra. Lezáráskor a tétel átkerül a `MAVET - Döntési napló.md` dokumentumba; ezért az aktív listában szándékosan lehet számozási hézag.
- A kérdések megfogalmazása ügyfél számára is érthető; technikai megoldási részletek csak akkor szerepelnek bennük, ha a döntéshez szükségesek.

## Jelölések

- **Nyitott:** ügyfél- vagy szervezeti döntés szükséges.
- **Egyeztetés alatt:** van előzetes irány, de még nem végleges.

A lezárt tételek nem szerepelnek ebben az aktív listában; a döntési naplóban kereshetők vissza az eredeti azonosítójukkal.

---

## 1. Tagság és felhasználói fiókok

### ND-01 – A tagdíjfizetés időpontja

**Állapot:** Egyeztetés alatt

**Kérdés**  
A jóváhagyott, tagdíjköteles jelentkező meddig fizethet, hány emlékeztetőt kapjon, és mi történjen nemfizetés esetén?

**Jelenlegi előzetes irány**  
Teljes regisztráció és e-mail-cím megerősítése → tagjelölt → elfogadás → tagdíjfizetési felhívás → beérkezett fizetés → aktív tagság. Díjmentes kategóriában az elfogadás után nincs fizetési felhívás, a jelentkező aktív taggá válik.

**Miért szükséges a döntés?**  
A fizetés időzítése már rögzített, de a fizetési határidő, az emlékeztetők száma és időzítése, valamint a nemfizetés következménye nélkül a folyamat nem fejleszthető egyértelműen.

### ND-03 – Tagságtól független felhasználói fiók

**Állapot:** Egyeztetés alatt

**Kérdés**  
Szükség van-e olyan felhasználói fiókra, amely nem kapcsolódik tagsági jelentkezéshez vagy aktív tagsághoz?

**Jelenlegi előzetes irány**  
Nem. A fiók létrehozása a tagsági jelentkezés része, ezért üzleti értelemben nincs külön „csak regisztrált” felhasználói típus.

**Miért szükséges a döntés?**  
Ha nem tagok is jelentkezhetnek konferenciára vagy érhetnek el bejelentkezéshez kötött tartalmakat, külön fiók- vagy vendégfolyamatra lehet szükség.

### ND-04 – Pártoló tag jogosultságai

**Állapot:** Nyitott

**Kérdés**  
Milyen digitális jogok és szolgáltatások illetik meg a pártoló tagot?

**Példák a döntendő kérdésekre**

- Láthatja-e a tagi névjegyzéket és megjelenhet-e benne?
- Hozzáfér-e az aktív tagoknak korlátozott szakmai anyagokhoz?
- Jelentkezhet-e konferenciára tagi feltételekkel?
- Csatlakozhat-e munkacsoporthoz?

### ND-05 – Hallgatói és tiszteletbeli tag jogosultságai

**Állapot:** Nyitott

**Rögzített szabályok**  
A hallgatói tag részt vehet a rendezvényeken és bekapcsolódhat a munkacsoportok munkájába. A tiszteletbeli tag részt vehet a rendezvényeken. Mindkét kategória tanácskozási joggal vehet részt a Közgyűlésen. A munkacsoporthoz csatlakozás az aktív tagság minden kategóriája számára elérhető.

**Nyitott kérdés**  
A hallgatói és tiszteletbeli tag a felsorolt részvételi lehetőségeken túl milyen digitális szolgáltatásokhoz fér hozzá a rendszerben?

**Miért szükséges a döntés?**  
A jelenlegi tartalmi leírás nem részletezi például a tagi névjegyzék, az aktív tagoknak korlátozott szakmai anyagok és a konferencia tagi feltételeinek hozzáférését.

### ND-06 – Érdemes és tiszteletbeli tagság létrejötte

**Állapot:** Nyitott

**Kérdés**  
Az érdemes és tiszteletbeli tagság önálló jelentkezéssel, más személy általi jelöléssel vagy a Társaság döntésével jön létre?

**Miért szükséges a döntés?**  
Az előzetes tartalom ezeket elismerésként írja le, miközben a kategóriakártyákon „Jelentkezem” gomb szerepel. A rendszerben csak a tényleges folyamatot szabad megvalósítani.

### ND-07 – Szervezeti vagy vállalati pártoló tagság

**Állapot:** Nyitott

**Kérdés**  
Milyen adatokkal jelentkezhet szervezet vagy vállalkozás pártoló tagnak, és ki kezelheti a szervezet fiókját?

**Példák a döntendő kérdésekre**

- Ki legyen az elsődleges kapcsolattartó és lehet-e több képviselő?
- Mely szervezeti adatok legyenek láthatók a publikus partneri vagy tagi felületen?
- A szervezeti pártoló tag milyen jogosultságokat kapjon?

### ND-08 – Tagjelölti hozzáférések

**Állapot:** Nyitott

**Kérdés**  
Véglegesen kizárható-e minden tagsági kedvezmény és egyéb tagi szolgáltatás a tagjelölti állapotból az elbírálás végéig?

**Jelenlegi munkairány**  
A tagjelölt a létrejött tagsági jelentkezése állapotát és saját jelentkezési adatait eléri, de nem kap tagsági kedvezményt és nem használhat egyéb tagi szolgáltatást.

**Miért szükséges a döntés?**  
Az előzetes anyag tagjelölti kedvezményeket és szolgáltatásokat említ, míg a jelenlegi munkairány ezeket kizárja. Az ügyfélnek ezt a szabályt még véglegesítenie kell.

### ND-33 – Publikus tagdíjösszegek és érvényesség

**Állapot:** Nyitott

**Kérdés**  
Mekkora legyen az egyes tagsági kategóriák tagdíja, milyen időszakra érvényes a díj, és mely kategóriák legyenek díjmentesek?

**Miért szükséges a döntés?**  
A MAVET-forrásban több kategóriánál nincs kitöltve a konkrét összeg. A Tagság oldal csak ügyfél által véglegesített díjakat jeleníthet meg, és a Stripe-fizetés is ezekre az értékekre épül.

---

## 2. Munkacsoportok és szakmai anyagok

### ND-30 – Munkacsoportok működése és a csatlakozás kezelése

**Állapot:** Nyitott

**Kérdés**  
Az aktív tag munkacsoporthoz való csatlakozása automatikus legyen-e, vagy a munkacsoport vezetője vagy más kijelölt személy fogadja el a kérést? A rendszer maga tartsa-e nyilván a munkacsoport-tagságot, vagy csak továbbítsa a csatlakozási szándékot?

**Kapcsolódó tisztázandó elemek**

- Milyen csatornán folyik a munkacsoport belső együttműködése: a weboldalon kívül, például levelezőlistán vagy más eszközben, vagy a rendszerben?
- Mi a munkacsoportvezető szerepe és feladata a csatlakozások kezelésében?
- Kell-e csatlakozási értesítés és visszaigazolás a tagnak?

**Miért szükséges a döntés?**  
A forrásanyag aktív tagsághoz köti a csatlakozást és munkacsoportvezetőt jelöl, de nem határozza meg a belső együttműködés eszközét, a csatlakozás elfogadását vagy a tagság nyilvántartásának módját.

## 3. Díjazottak és elismerések

### ND-34 – Díjazottak címadása és részletes adatai

**Állapot:** Nyitott

**Kérdés**  
Mi legyen a díjazottak oldalának végleges bevezető címe a forrásban szereplő „Akikre (különösen - kell?) büszkék vagyunk...” helyett, és szükség van-e a díjazottakhoz az éves néven túl fényképre vagy szakmai önéletrajzra?

**Jelenlegi előzetes irány**  
Az induló oldal díjtípusonként és évenként felsorolja a díjazottakat. Fénykép és önéletrajz csak átadott tartalom esetén, opcionálisan jelenik meg; külön díjazotti részletező oldal nem része az induló változatnak.

**Miért szükséges a döntés?**  
A weboldal-előzetes fényképet és CV-t említ, a részletes díjazotti forrásanyag viszont csak díjtípusokat és évhelyőrzőket ad.

## 4. Konferenciamodul

### ND-11 – Konferencia-regisztrációra jogosultak köre

**Állapot:** Nyitott

**Kérdés**  
Ki jelentkezhet konferenciára: csak aktív tag, tagjelölt is, vagy teljesen külső résztvevő is?

**Miért szükséges a döntés?**  
A válasz meghatározza, hogy szükség van-e tagságtól független fiókra, vendégregisztrációra, illetve milyen adatokat kell a konferencia jelentkezésekor bekérni.

### ND-12 – Absztraktbeküldésre jogosultak köre

**Állapot:** Nyitott

**Kérdés**  
Ki küldhet be absztraktot: minden konferencia-résztvevő, csak aktív tag, vagy más meghatározott felhasználói kör?

### ND-13 – Konferencia-jegytípusok és kiegészítő tételek

**Állapot:** Nyitott

**Kérdés**  
A konferencián szükség lesz-e több jegytípus, napi jegy, étkezés, gála vagy kísérőprogram külön kiválasztására és fizetésére?

**Miért szükséges a döntés?**  
Az előzetes szerződéses anyagok ezen a ponton nem egységesek. A döntés jelentősen befolyásolja a konferencia-regisztráció és az árazás összetettségét.

### ND-14 – Konferencia-árképzés

**Állapot:** Nyitott

**Kérdés**  
Milyen díjszabás szükséges a konferenciához: egyetlen alapdíj, vagy például korai jelentkezési, normál, késői és helyszíni ár?

**Miért szükséges a döntés?**  
Az árképzés szabályai meghatározzák a jelentkezési űrlap, a fizetés és az adminisztráció működését.

### ND-15 – Konferencia lemondása és visszatérítése

**Állapot:** Nyitott

**Kérdés**  
Lehet-e konferencia-regisztrációt módosítani vagy lemondani, és ha igen, milyen határidővel és visszatérítési szabályokkal?

---

## 5. Fizetés, számlázás és külső szolgáltatások

### ND-17 – Számla és díjbekérő kiállítása

**Állapot:** Nyitott

**Kérdés**  
Ki és milyen rendszerben állítja ki a tagdíjhoz és konferencia-regisztrációhoz kapcsolódó díjbekérőt és számlát?

**Miért szükséges a döntés?**  
A rendszernek számlát vagy díjbekérőt kell kezelnie, miközben külső számlázórendszerhez való csatlakozás jelenleg nincs egyértelműen a scope-ban. A folyamatot jogilag és működésileg is pontosítani kell.

---

## 6. Adminisztráció és jogosultságok

### ND-23 – Elnökségi és adminisztrátori jogosultságok elválasztása

**Állapot:** Nyitott

**Kérdés**  
Ki hozhat tagsági döntést, és ki kezelheti a tagok, tartalmak, fizetések, konferenciák és e-mail-küldések adminisztrációját?

**Miért szükséges a döntés?**  
Meg kell különböztetni az általános adminisztrátori feladatokat az elnökségi jóváhagyást igénylő döntésektől, valamint szükség esetén a konferencia-szervezői szerepkörtől.

### ND-24 – Tagsági kategória módosítása

**Állapot:** Nyitott

**Kérdés**  
Ki és milyen esetben módosíthatja egy tag tagsági kategóriáját, például ifjúsági tagból rendes taggá váláskor?

---

## 7. A Társaságról

### ND-26 – Bizottságok induló köre és bemutatása

**Állapot:** Nyitott

**Kérdés**  
Mely bizottságok jelenjenek meg induláskor, és melyekhez készüljön rövid feladatleírás?

### ND-29 – Induláskor közzétett hivatalos dokumentumok

**Állapot:** Nyitott

**Kérdés**  
Az alapszabályon túl mely hivatalos dokumentumok legyenek induláskor publikusan elérhetők a weboldalon?

---

## 8. Karbantartási előzmények

| Dátum | Változás |
| --- | --- |
| 2026.08.14. | A központi nyitott döntési lista létrehozása. |
