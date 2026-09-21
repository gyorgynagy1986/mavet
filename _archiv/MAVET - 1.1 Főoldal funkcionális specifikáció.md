> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Főoldal

## Funkcionális specifikáció

**Dokumentum állapota:** egyeztetés alatt  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Oldaltérkép-fejezet:** 1.1  
**A dokumentum célja:** a MAVET publikus főoldalának felépítése, tartalmi blokkjai és működése.  

## Tartalom

1. A főoldal szerepe
2. Oldalszerkezet áttekintése  
3. Hero blokk  
4. A Társaságról blokk  
5. Aktualitások blokk: hírek és események  
6. Munkacsoportok és projektek blokk  
7. Hírlevél-feliratkozás blokk  
8. Támogatók és együttműködő partnerek sáv  
9. Tartalomkezelés és adminisztratív kezelhetőség  
10. Reszponzív működés  

---

## 1. A főoldal szerepe

A főoldal a MAVET elsődleges publikus belépési pontja. Célja, hogy a látogató rövid idő alatt megértse a Társaság küldetését, könnyen elindíthassa a tagsági jelentkezést, és képet kapjon az aktuális szakmai tevékenységekről, eseményekről és bekapcsolódási lehetőségekről.

A főoldal a következő felhasználói utat támogatja:

**Megismerés → Csatlakozás → Részvétel**

## 2. Oldalszerkezet áttekintése

A főoldal lefelé görgethető, egymást követő tartalmi blokkokból épül fel.

1. Hero blokk
2. A Társaságról blokk
3. Aktualitások blokk: kiemelt aktualitás, hírek és események
4. Munkacsoportok és projektek blokk
5. Hírlevél-feliratkozás blokk
6. Támogatók és együttműködő partnerek sáv

A blokkok egymás után jelennek meg. A látogató a blokkban elhelyezett hivatkozásokkal és gombokkal a megfelelő részletes aloldalra vagy folyamatba léphet tovább.

## 3. Hero blokk

A hero blokk a főoldal első, kiemelt felületi eleme. A MAVET identitását röviden közvetíti, és elsődleges cselekvésként a tagsági jelentkezés felé irányítja a látogatót.

### Felület és tartalom

**Hero blokk elemei**

- teljes szélességű, kiemelt főoldali kép;
- rövid főüzenet / szlogen;
- legfeljebb két mondatos lead szöveg;
- elsődleges CTA gomb: **„Csatlakozom a MAVET-hez”**.

A szlogen kiinduló változata: **„Helyszín. Közösség. Szemlélet.”**. A pontos szöveg az adminisztrációs felületen módosítható tartalomként kezelendő.

### Működés

1. A látogató megnyitja a főoldalt.
2. A rendszer megjeleníti az aktuálisan beállított hero képet, főüzenetet és lead szöveget.
3. A látogató a „Csatlakozom a MAVET-hez” gombra kattint.
4. A rendszer a tagsági jelentkezést indító publikus oldalra navigál.

- A hero blokk minden publikus látogató számára megjelenik.
- A CTA gomb tagsági jelentkezést indít; nem hoz létre önálló, tagságtól független felhasználói fiókot.
- A hero blokkban egyetlen elsődleges CTA szerepel.

## 4. A Társaságról blokk

A blokk tömören bemutatja a MAVET-et és a vidékegészségügyi szemléletet.

### Felület és tartalom

**A Társaságról blokk elemei**

- szekciócím;
- rövid bemutató szöveg;
- másodlagos CTA gomb: **„Ismerje meg a Társaságot”**.

A rövid bemutató szöveg a küldetésnyilatkozat tömör, főoldalra szerkesztett változata. Terjedelme legfeljebb két rövid bekezdés.

### Működés

1. A látogató elolvassa a rövid bemutatást.
2. A látogató az „Ismerje meg a Társaságot” gombra kattint.
3. A rendszer az „A Társaságról” részletes aloldalra navigál.

- A főoldali szöveg nem tartalmazza teljes terjedelmében a küldetésnyilatkozatot vagy a Társaság történetét.

## 5. Aktualitások blokk: hírek és események

Az aktualitások blokk egy közös, vizuálisan egységes felületen mutatja be a MAVET legfontosabb híreit és eseményeit. Célja, hogy az oldal ne csak bemutatkozó felületként, hanem aktív szakmai közösségként jelenjen meg.

### 5.1. Felület és tartalom

**Blokk elemei**

- szekciócím: **„Aktualitások”**;
- egy kiemelt aktualitás-kártya, ha az adminisztrátor ilyet kijelöl;
- kiemelt kártya mellett legfeljebb öt további, kisebb hír- és eseménykártya; kiemelt kártya nélkül legfeljebb hat normál kártya;
- „Összes aktualitás” hivatkozás.

**Aktualitás-kártya**

A kiemelt aktualitás lehet hír vagy esemény. Nem kizárólag hír jelölhető kiemeltként; így például egy következő MAVET Kongresszus is megjelenhet elsődleges tartalomként.

Elemei:

- borítókép;
- tartalomtípus-jelölő: „Hír” vagy „Esemény”;
- cím;
- rövid lead;
- hír esetén megjelenés dátuma;
- esemény esetén eseménydátum és – ha megadott – helyszín;
- kattintható teljes kártya vagy egyértelmű „Részletek” hivatkozás.

### 5.2. Kártyaelrendezés és böngészés

Nagy képernyőn az aktualitások vízszintes kártyasorban jelennek meg. Az első, kiemelt aktualitás-kártya két egységnyi szélességet foglal el, a normál kártyák egy egységnyi szélességűek.

Ha a megjelenítendő tartalom szélessége meghaladja a rendelkezésre álló helyet, a látogató oldalirányban böngészheti a kártyasort. A böngészéshez látható előre/hátra vezérlők tartoznak; érintőképernyőn az oldalirányú lapozó gesztus is használható.

Kis képernyőn a kiemelt kártya teljes elérhető szélességben jelenik meg. A további kártyák egymás alatt, egyoszlopos elrendezésben jelennek meg; mobilnézetben nincs oldalirányban lapozható kártyasor.

### 5.3. Működés

1. A rendszer betölti a megjelenésre jogosult híreket és eseményeket.
2. A rendszer az adminisztrációban kijelölt kiemelt aktualitást első helyen jeleníti meg.
3. A rendszer a további kijelölt vagy legfrissebb elemeket normál kártyaként jeleníti meg.
4. A látogató kártyára kattintva a hír vagy esemény részletes oldalára jut.
5. A látogató az „Összes aktualitás” hivatkozásra kattintva az aktualitások közös listaoldalára jut.

### 5.4. Üres és hibaállapotok

- Ha nincs kijelölt kiemelt aktualitás, a rendszer nem jelenít meg üres kiemelt kártyát; a blokk normál kártyás elrendezésben indul.
- Ha nincs publikus hír és esemény, az aktualitások blokk nem jelenik meg a főoldalon.
- Hiányzó borítókép esetén a rendszer az adott tartalomtípushoz beállított alapértelmezett képet jeleníti meg.
- Érvénytelen, archivált vagy nem publikus tartalom nem jelenhet meg a blokkban.

- Egy időben legfeljebb egy kiemelt aktualitás jelenhet meg a főoldalon.
- A kiemelt aktualitás adminisztrátor által kiválasztható hír vagy esemény.
- Minden kártyán a tartalom típusa és időbeli relevanciája egyértelműen felismerhető.
- A blokkban összesen legfeljebb hat aktualitáskártya jelenhet meg: egy kiemelt és öt normál kártya, vagy kiemelt nélkül hat normál kártya.

## 6. Munkacsoportok és projektek blokk

A blokk bemutatja a MAVET szakmai közösségeit és projektjeit, valamint felkelti az érdeklődést a részvétel iránt. A munkacsoportok listája és kártyás bemutatása publikus; a munkacsoporthoz csatlakozás az aktív MAVET-tagság minden kategóriája számára elérhető.

### Felület és tartalom

**Blokk elemei**

- szekciócím;
- rövid bevezető szöveg;
- három vagy négy kiemelt munkacsoport-/projektkártya;
- másodlagos CTA gomb: **„Összes munkacsoport és projekt”**.

**Munkacsoport-/projektkártya elemei**

- munkacsoport vagy projekt neve;
- rövid leírás;
- vezető neve, ha megadott;
- opcionális kép vagy illusztráció;
- „Megnézem” hivatkozás a munkacsoportok és projektek publikus oldalára.

### Működés

1. A rendszer a főoldalra kijelölt három vagy négy munkacsoportot/projektet megjeleníti.
2. A látogató egy kártyára vagy a „Megnézem” hivatkozásra kattint.
3. A rendszer a munkacsoportok és projektek publikus oldalára navigál, és a kiválasztott elemhez görget, ha az adott elemhez tartozó horgony rendelkezésre áll.
4. A látogató az „Összes munkacsoport és projekt” gombra kattintva a teljes publikus listára jut.

- A főoldali kártyák nem tartalmaznak közvetlen „Csatlakozom” műveletet.
- A munkacsoporthoz csatlakozás a munkacsoportok és projektek publikus oldaláról indítható, aktív tagság ellenőrzése mellett; a jogosultság az aktív tagság minden kategóriájára kiterjed.
- Ha nincs megjeleníthető munkacsoport vagy projekt, a teljes blokk rejtve marad.

## 7. Hírlevél-feliratkozás blokk

A blokk lehetőséget ad a látogatónak, hogy e-mailben értesüljön a MAVET híreiről, eseményeiről és szakmai aktualitásairól. A feliratkozás nem igényel tagságot vagy felhasználói fiókot.

### Felület és adatok

**Hírlevél-feliratkozás blokk elemei**

- rövid felhívás;
- e-mail-cím beviteli mező – kötelező;
- adatkezelési tájékoztató elfogadása jelölőnégyzet – kötelező;
- hivatkozás az adatkezelési tájékoztatóra;
- „Feliratkozom” gomb.

### Működés

1. A látogató megadja e-mail-címét.
2. A látogató elfogadja az adatkezelési tájékoztatót.
3. A látogató a „Feliratkozom” gombra kattint.
4. A rendszer ellenőrzi az e-mail-cím formátumát és a kötelező hozzájárulás állapotát.
5. Sikeres ellenőrzés esetén a rendszer rögzíti a feliratkozási kérelmet.
6. A rendszer a blokkban sikeres feliratkozási üzenetet jelenít meg.

### Validáció és hibaállapotok

- Üres e-mail-cím esetén az e-mail mező alatt inline hibaüzenet jelenik meg.
- Nem megfelelő formátumú e-mail-cím esetén az e-mail mező alatt inline hibaüzenet jelenik meg.
- Elfogadatlan adatkezelési tájékoztató esetén a jelölőnégyzet alatt inline hibaüzenet jelenik meg.
- Sikertelen mentés esetén a rendszer egyértelmű, nem technikai nyelvű hibaüzenetet jelenít meg, és a látogató adatai nem vesznek el a mezőkből.
- Már feliratkozott e-mail-cím esetén a rendszer nem hoz létre duplikált feliratkozást; a pontos visszajelzés szövege a hírlevél-specifikációban rögzítendő.

- A feliratkozás a főoldalon publikus funkció.
- A feliratkozási adatok nem hoznak létre tagsági vagy felhasználói fiókot.
- A feliratkozás egyszeres: az űrlap sikeres elküldésével azonnal véglegessé válik, megerősítő e-mailes folyamat nélkül.

## 8. Támogatók és együttműködő partnerek sáv

A főoldal alsó részén visszafogott, vizuálisan elkülönülő sáv jeleníti meg a MAVET támogatóit és együttműködő partnereit. A sáv célja a kapcsolati háló és a szakmai együttműködések láthatóvá tétele, nem elsődleges konverziós felület.

### Felület és tartalom

**Partneri sáv elemei**

- szekciócím: **„Partnereink és támogatóink”**;
- a MAVET által jóváhagyott rövid bevezető szöveg;
- adminisztrátor által megadott partnernév és – ha rendelkezésre áll – partnerlogó;
- opcionális külső weboldal-hivatkozás a partner nevéhez vagy logójához.

A MAVET-forrásanyag ennél a résznél csak az alábbi bevezető szöveget adja:

> „Hiszünk az együttműködés erejében. Köszönjük mindazoknak a szervezeteknek, intézményeknek és partnereknek a bizalmát és támogatását, akikkel együtt dolgozhatunk a vidék egészségügyének fejlesztéséért.”

Az induló változatban nem készül külön partnerlista- vagy partner-részletező oldal, és nem kötelező külön partnerbemutatás. Külső hivatkozás csak akkor jelenik meg, ha az ügyfél azt megadja; külső hivatkozás új böngészőlapon nyílik meg. Ha nincs megjeleníthető partneri adat, a sáv nem jelenik meg.

## 9. Tartalomkezelés és adminisztratív kezelhetőség

A főoldal tartalmi elemeit adminisztrátori jogosultsággal rendelkező felhasználó kezeli.

**Adminisztrációban kezelhető főoldali elemek**

- hero kép, főüzenet, lead és CTA célja;
- A Társaságról blokk szövege és CTA célja;
- kiemelt aktualitás kiválasztása;
- kiemelt munkacsoportok és projektek kiválasztása;
- partneri sáv bevezető szövege, partnerei, nevei, logói és külső hivatkozásai.

Az adminisztrátor csak publikus és aktív státuszú tartalmat jelölhet ki a főoldali megjelenéshez.

## 10. Reszponzív működés

Az oldal minden tartalmi blokkja mobil, tablet és asztali képernyőn is használható.
