> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Szakmai anyagok

## Funkcionális specifikáció

**Dokumentum állapota:** egyeztetés alatt  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Oldaltérkép-fejezet:** 1.2  
**A dokumentum célja:** a MAVET szakmai ajánlásokat, előadásokat, publikációkat, videókat, betegedukációs anyagokat és letölthető dokumentumokat kezelő publikus és tagi felületének leírása.

## Tartalom

1. Forrásalap és hatókör  
2. Besorolás, tartalomátadási módok és hozzáférési szintek  
3. Szakmai anyagok listaoldala  
4. Szakmai anyag részletes oldala  
5. Hozzáférés-ellenőrzés és felhasználói utak  
6. Adminisztratív kezelés  
7. Mentési és hibaállapotok  
8. Hatókörből kizárt elemek és nyitott döntések  
9. Elfogadási kritériumok  

---

## 1. Forrásalap és hatókör

### 1.1. A MAVET-anyagok rögzített állításai

A MAVET weboldalának előzetes vázlata a szakmai anyagok közé sorolja:

- a szakmai ajánlásokat;
- az előadásokat;
- a publikációkat;
- a videókat;
- a betegedukációs anyagokat;
- a letölthető dokumentumokat.

Ugyanez a forrás azt írja, hogy a megtekintés részben regisztrációhoz kötött. A forrásanyagok nem írják le a listaoldal, a részletes oldal, a keresés vagy az adminisztratív kezelés pontos felépítését. Ezt a dokumentum a forrásokkal összhangban, induló funkcionális modellként rendezi.

### 1.2. A modul határa

A szakmai anyagok modul a MAVET által közzétett szakmai tartalmak megjelenítését, hozzáférés-ellenőrzését és adminisztratív kezelését tartalmazza. A forrásanyagokban korábban „belső dokumentumokként” említett, csak tagoknak szánt szervezeti tartalmak is ebben a modulban kezelendők, anyagonként aktív tagi hozzáféréssel. Külön belső dokumentumtár nem készül. A tagok saját dokumentum- vagy egyéb fájlfeltöltése nem része ennek a modulnak.

Az absztraktok, konferenciaanyagok és konferenciafelvételek konferenciafüggő tartalmai külön konferenciamodulhoz tartoznak, amennyiben ezek kezelése bekerül a projekt hatókörébe.

---

## 2. Besorolás, tartalomátadási módok és hozzáférési szintek

### 2.1. Kategóriák és besorolás

Minden szakmai anyag egy elsődleges kategóriához tartozik. A kategória a tartalom témaköri vagy szerkesztési besorolása; önmagában nem határozza meg, hogy az anyag fájlként vagy hivatkozásként jelenik meg.

- **Szakmai ajánlás**;
- **Előadás**;
- **Publikáció**;
- **Videó**;
- **Betegedukációs anyag**;
- **Letölthető dokumentum**.

Az adminisztrátor a tartalom létrehozásakor választja ki a kategóriát. Egy anyaghoz induláskor egy elsődleges kategória tartozik. A kategóriák a közös listaoldalon szűrőként jelennek meg; külön kategória-aloldalak nem készülnek.

### 2.2. Tartalomátadási módok

Az anyagok tényleges tartalma kétféle módon kezelhető:

- **Letölthető fájl:** az adminisztrátor dokumentumot, például PDF-et vagy más letölthető fájlt kapcsol az anyaghoz;
- **Hivatkozott vagy beágyazott tartalom:** az adminisztrátor külső hivatkozást ad meg, például videóhoz vagy más online tartalomhoz. A hivatkozás technikai támogatás esetén beágyazva jelenhet meg; ha külső oldal nyílik meg, az mindig új böngészőfülön történik.

Egy szakmai anyaghoz induláskor egy tartalomátadási mód tartozik. A választott módhoz tartozó fájl vagy hivatkozás kötelező; hiányos anyag nem menthető el megjeleníthető szakmai anyagként.

### 2.3. Anyagonkénti hozzáférési szint

Az adminisztrátor minden egyes szakmai anyagnál külön beállítja a hozzáférési szintet:

- **Publikus:** a tartalom bejelentkezés nélkül megtekinthető;
- **Aktív tag számára elérhető:** a teljes tartalom csak aktív tagként, bejelentkezés után tekinthető meg.

Az anyag kategóriája önmagában nem határozza meg a hozzáférést. Ugyanazon kategórián belül lehetnek publikus és csak aktív tag számára elérhető anyagok.

Az aktív tag számára elérhető anyagok fedik le a forrásanyagokban említett, zárt tagi felületen elérhető belső dokumentumokat is; ezekhez nem készül külön dokumentumtári oldal vagy külön jogosultsági modell.

Tagjelölt, illetve „Elfogadott, fizetésre vár” állapotú jelentkező nem kap hozzáférést az aktív tagoknak fenntartott szakmai anyagokhoz. A hozzáférés az aktív tagsági állapot létrejöttével nyílik meg.

### 2.4. Minimális tartalmi adatok

Egy szakmai anyag minimális kezelendő adatai:

- cím;
- kategória;
- rövid összefoglaló vagy lead;
- tartalomátadási mód;
- a választott módhoz tartozó fájl vagy hivatkozás;
- a hozzáférési szint.

Opcionálisan kezelhető:

- szerző vagy közreműködő;
- megjelenési dátum;
- borítókép vagy előnézeti kép;
- további kapcsolódó hivatkozás.

Külön piszkozat- vagy közzétételi állapot nem része az induló modellnek. A rendszer csak hiánytalan, a választott fájlt vagy hivatkozást tartalmazó anyagot menti megjeleníthető rekordként.

---

## 3. Szakmai anyagok listaoldala

### 3.1. Oldal célja és elérése

A **Szakmai anyagok** önálló publikus aloldal. Az oldal bejelentkezés nélkül megnyitható, de az aktív tagoknak fenntartott anyagok teljes tartalma csak megfelelő jogosultsággal érhető el.

### 3.2. Lista és kategóriaszűrő

A listaoldal a hiánytalanul mentett szakmai anyagokat áttekinthető listában vagy kártyás elrendezésben jeleníti meg. A kategóriák közös listán választható szűrőként jelennek meg:

- Összes;
- Szakmai ajánlások;
- Előadások;
- Publikációk;
- Videók;
- Betegedukációs anyagok;
- Letölthető dokumentumok.

A kategóriaváltás nem módosítja az anyag hozzáférési szintjét; csak a megjelenített tartalmi kört szűkíti. A kategóriákhoz nem tartozik külön lista- vagy részletező aloldal.

### 3.3. Anyagkártya

Egy listaelem vagy kártya legalább az alábbiakat tartalmazza:

- kategória;
- cím;
- rövid összefoglaló vagy lead;
- tartalomátadási mód;
- opcionális dátum;
- hozzáférési jelölés, ha az anyag csak aktív tag számára érhető el;
- részletes oldalra vezető hivatkozás.

A teljes kártya vagy egyértelmű „Megnyitás” / „Részletek” hivatkozás megnyitja az anyag részletes oldalát.

### 3.4. Üres állapot

Ha egy kategóriához nem tartozik hiánytalanul mentett anyag, az oldal rövid, közérthető üres állapotot jelenít meg. Nem jelenik meg üres kártya vagy hibás hivatkozás.

---

## 4. Szakmai anyag részletes oldala

### 4.1. Megjelenített tartalom

Az anyag részletes oldala önállóan megnyitható oldal. A megjelenített elemek:

- kategória;
- cím;
- rövid összefoglaló;
- letöltési lehetőség vagy hivatkozott/beágyazott tartalom, a választott tartalomátadási mód szerint;
- szerző vagy közreműködő, ha megadott;
- dátum, ha megadott;
- kapcsolódó hivatkozások és letöltések, ha megadottak;
- visszavezető hivatkozás a szakmai anyagok listájára.

### 4.2. Tartalomátadási mód szerinti megjelenítés

- Letölthető fájl esetén a dokumentum leírása és a letöltési lehetőség jelenik meg.
- Hivatkozott vagy beágyazott tartalom esetén a megadott külső tartalom hivatkozása, technikai támogatás esetén pedig beágyazott megjelenítése jelenik meg. A külső hivatkozás új böngészőfülön nyílik meg.

Az induló rendszer nem ír elő egyetlen konkrét videó- vagy dokumentumtár-szolgáltatót.

### 4.3. Hiányos vagy nem elérhető tartalom

Hiányos vagy nem létező anyag közvetlen megnyitásakor a rendszer nem jeleníti meg a tartalmat, hanem egyértelmű „A szakmai anyag nem érhető el” állapotot ad. Hiányos anyag a listában sem jelenhet meg.

---

## 5. Hozzáférés-ellenőrzés és felhasználói utak

### 5.1. Publikus anyag

Publikus anyag esetén a látogató bejelentkezés nélkül:

1. megnyithatja a szakmai anyagok listaoldalát;
2. kiválaszthatja az anyagot;
3. megtekintheti a részletes oldalt;
4. elérheti a kapcsolódó publikus hivatkozást vagy letöltést.

### 5.2. Aktív taghoz kötött anyag

Aktív taghoz kötött anyag esetén:

- aktív tag bejelentkezés után megtekintheti a részletes tartalmat és a kapcsolódó letöltést;
- be nem jelentkezett látogató, tagjelölt vagy fizetésre váró jelentkező nem tekintheti meg a korlátozott tartalmat;
- a rendszer egyértelmű hozzáférési üzenetet és bejelentkezési vagy tagsági csatlakozási lehetőséget kínálhat.

A hozzáférés-ellenőrzésnek közvetlen részletesoldal-megnyitás esetén is működnie kell; a tartalom nem válhat elérhetővé pusztán az URL ismeretében.

---

## 6. Adminisztratív kezelés

Az adminisztrátor a tartalomkezelésben hiánytalan szakmai anyagot hozhat létre és szerkeszthet. Az anyag a mentés után a beállított hozzáférési szint szerint jelenik meg; külön közzétételi vagy visszavonási állapot nincs.

Minden anyagnál kezelhető:

- cím és rövid összefoglaló;
- kategória;
- tartalomátadási mód;
- a választott módhoz tartozó fájl vagy külső hivatkozás;
- szerző, közreműködő és dátum, ha szükséges;
- hozzáférési szint: **Publikus** vagy **Aktív tag számára elérhető**.

Az adminisztrátor a hozzáférési szintet anyagonként módosíthatja. A módosítás a következő megnyitástól érvényesül; publikusból tagi hozzáférésűvé tett anyag a továbbiakban csak aktív tagnak adható át.

Az adminisztrációban nem kezelhető tagi profilhoz kapcsolódó saját dokumentumfeltöltés. A modul tartalmait a MAVET vagy az arra jogosult adminisztrátorok teszik közzé.

---

## 7. Mentési és hibaállapotok

### 7.1. Mentési szabály

Az adminisztrátor csak akkor menthet megjeleníthető szakmai anyagot, ha a kötelező mezők, valamint a választott tartalomátadási módhoz tartozó fájl vagy hivatkozás kitöltött. Félkész anyag nem jelenik meg a publikus listában.

### 7.2. Hibaállapotok

- hiányzó kötelező tartalmi adat esetén az adminisztrátor az érintett mezőnél hibaüzenetet kap;
- hiányzó vagy hibás külső hivatkozás esetén a mentés nem tekinthető sikeresnek;
- nem jogosult felhasználónál a korlátozott tartalom nem jelenik meg;
- nem létező vagy hiányos anyagnál az oldal egyértelmű elérhetetlenségi állapotot mutat.

---

## 8. Hatókörből kizárt elemek és nyitott döntések

- A tagok saját szakmai dokumentum- vagy egyéb fájlfeltöltése nem része az induló rendszernek.
- Külön belső dokumentumtár nem része az induló rendszernek; a belső dokumentumként kezelt szervezeti tartalmak a szakmai anyagok között, aktív tagi hozzáféréssel jelennek meg.
- A konferencia-előadások, absztraktok és konferenciafelvételek külön konferenciamodulban kezelendők, ha erre külön döntés születik.
- A korlátozott anyagok metaadatai és előnézete megjelenjenek-e a publikus listában, vagy csak aktív tagnak látszódjanak: tisztázandó.
- Szükség van-e szabad szavas keresésre, szerző szerinti szűrésre vagy további címkékre: tisztázandó.
- A videók és letölthető fájlok technikai tárolási szolgáltatója és maximális fájlmérete: technikai döntés.

---

## 9. Elfogadási kritériumok

1. A Szakmai anyagok listaoldal bejelentkezés nélkül megnyitható.
2. A rendszer a hat MAVET-kategóriát kezeli besorolásként: szakmai ajánlás, előadás, publikáció, videó, betegedukációs anyag és letölthető dokumentum.
3. Egy szakmai anyag tartalma letölthető fájlként vagy hivatkozott/beágyazott tartalomként kezelhető.
4. A választott tartalomátadási módhoz tartozó fájl vagy hivatkozás kötelező; hiányos anyag nem menthető megjeleníthető rekordként.
5. Az adminisztrátor minden anyagnál külön beállíthatja a publikus vagy az aktív taghoz kötött hozzáférést.
6. Publikus anyag részletes oldala bejelentkezés nélkül megtekinthető.
7. Aktív taghoz kötött anyag teljes tartalma tagjelölt, fizetésre váró jelentkező vagy nem bejelentkezett látogató számára nem jelenik meg.
8. Aktív tag az aktív tagsága és bejelentkezése mellett megtekintheti a számára korlátozott anyagot.
9. A korlátozott tartalom közvetlen URL-ről sem érhető el jogosultság nélkül.
10. A listaelemek megjelenítik a kategóriát, címet, összefoglalót, tartalomátadási módot és a részletes oldalra vezető hivatkozást.
11. Az adminisztrátor létrehozhat és szerkeszthet hiánytalan szakmai anyagot; külön piszkozat- vagy közzétételi állapot nem szükséges.
12. A külső hivatkozások új böngészőfülön nyílnak meg.
13. Külön belső dokumentumtár nem készül; a belső dokumentumként kezelt szervezeti tartalmak az anyagonként korlátozható szakmai anyagok között jelennek meg.
14. A tagi profilhoz kapcsolódó saját dokumentumfeltöltés nem érhető el az induló rendszerben.
