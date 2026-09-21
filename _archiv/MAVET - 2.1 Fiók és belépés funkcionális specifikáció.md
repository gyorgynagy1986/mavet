> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Fiók, regisztráció és belépés

## Funkcionális specifikáció

**Dokumentum állapota:** egyeztetés alatt  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Oldaltérkép-fejezet:** 2.1  
**A dokumentum célja:** a tagsági jelentkezéshez kapcsolódó fiók létrehozása, a bejelentkezés és a saját profil kezelésének egyértelmű leírása.

## Tartalom

1. A felhasználói fiók alapelvei  
2. Fiók létrehozása a tagsági jelentkezés részeként  
3. Bejelentkezés és kijelentkezés  
4. E-mail-cím megerősítése és jelszó-visszaállítás  
5. Saját fiók és profil  
6. Publikus láthatóság és tagi profil  
7. Visszajelzések, hibaállapotok és biztonság  
8. Nyitott döntések  

---

## 1. A felhasználói fiók alapelvei

A MAVET-ben a felhasználói fiók a tagsági jelentkezéshez kapcsolódik. A látogató nem hoz létre külön, tagságtól független „csak regisztrált” fiókot: a regisztráció és a tagsági jelentkezés egyetlen folyamat.

A fiók használható tagjelölti és aktív tagi állapotban is. A tagjelölt a folyamatban lévő jelentkezésével kapcsolatos információkat látja, az aktív tag pedig a tagságához tartozó szolgáltatásokat is eléri. Az egyes tartalmakhoz és funkciókhoz való hozzáférést a tagsági állapot, a tagsági kategória, illetve ahol szükséges, a tagdíjfizetés rendezettsége határozza meg.

## 2. Fiók létrehozása a tagsági jelentkezés részeként

A látogató a tagsági tájékoztató oldalról vagy a főoldal „Csatlakozom a MAVET-hez” gombjáról indítja el a tagsági jelentkezést.

A folyamat elején a jelentkező kiválasztja a kívánt tagsági kategóriát, majd kitölti a választott kategóriához szükséges teljes tagsági jelentkezési adatlapot, megadja a fiók e-mail-címét és jelszavát, valamint elfogadja az adatkezelési tájékoztatót. A regisztráció csak akkor indítható el, ha minden kötelező jelentkezési adat és nyilatkozat rendelkezésre áll. A részletes mezőjegyzék, a kategóriánkénti eltérések és az esetleges feltöltések a `MAVET - 2.1 Tagsági életciklus és tagfelvétel funkcionális specifikáció.md` dokumentumban szerepelnek.

A tagjelölti állapot kizárólag az e-mail-cím sikeres megerősítésével, automatikusan jön létre. A félbehagyott, hiányos vagy e-mailben nem megerősített regisztráció nem minősül tagjelölti jelentkezésnek.

Ha a megadott e-mail-címhez már fiók tartozik, a rendszer nem hoz létre új fiókot. A látogató bejelentkezhet, jelszó-visszaállítást indíthat, vagy bejelentkezés után a jelentkezési folyamatot folytathatja.

Az erre jogosult személy az adminisztrációs felületen rögzíti a jelentkezés elfogadását vagy elutasítását. Díjmentes tagsági kategória elfogadása után a tagjelölt fizetési lépés nélkül aktív taggá válik. Tagdíjköteles kategória elfogadása után a rendszer fizetési felhívást küld; a tagjelölt a beérkezett tagdíj után válik aktív taggá.

## 3. Bejelentkezés és kijelentkezés

A bejelentkezési oldalon a felhasználó e-mail-címével és jelszavával lép be. Sikeres belépés után a rendszer a saját fiók kezdőnézetére irányítja, ahonnan a felhasználó eléri a profilját, a jelentkezése vagy tagsága aktuális állapotát, valamint a jogosultsága szerinti funkciókat.

A bejelentkezési oldalon egyértelműen elérhető:

- a tagsági jelentkezés és fiók létrehozásának indítása a még nem regisztrált látogatók számára;
- az elfelejtett jelszó folyamata;
- a bejelentkezés gombja.

A felhasználó a fiókjából bármikor kijelentkezhet. Kijelentkezés után a rendszer megszünteti az adott böngészőben aktív bejelentkezést, és a tagi felületek ismét csak bejelentkezés után érhetők el.

## 4. E-mail-cím megerősítése és jelszó-visszaállítás

A fiók létrehozásakor megadott e-mail-cím megerősítéséhez a rendszer egyszer használható hivatkozást küld a jelentkezőnek. A hivatkozás megnyitásával az e-mail-cím megerősítetté válik.

Elfelejtett jelszó esetén a felhasználó az e-mail-címének megadásával jelszó-visszaállítást kérhet. A rendszer a megadott címre egyszer használható, időben korlátozott visszaállító hivatkozást küld. A hivatkozás megnyitása után a felhasználó új jelszót állít be, majd ezzel be tud jelentkezni.

A rendszer nem jelzi ki a látogatónak, hogy egy adott e-mail-címhez tartozik-e fiók. A jelszó-visszaállítás kérése után semleges visszajelzést ad arról, hogy ha a címhez fiók tartozik, a szükséges e-mail elküldésre került.

## 5. Saját fiók és profil

### 5.1. Saját fiók

A bejelentkezett tagjelölt a létrejött tagsági jelentkezése állapotát és a saját jelentkezési adatait tekintheti meg. Aktív tag a saját profilját is megtekintheti és szerkesztheti. A profil a tagsági nyilvántartás személyes és szakmai adatait, valamint az ezekhez kapcsolódó megjelenési beállításokat tartalmazza.

### 5.2. Személyes és szakmai adatok, profilkép

Az alábbi adatok az aktív tag saját profiljában kezelhetők:

- név;
- portrékép;
- születési dátum és hely;
- szervezeti tisztség vagy szerepkör;
- szakterület;
- munkahely;
- kapcsolattartási adatok;
- munkacsoportok;
- szakmai érdeklődési területek;
- rövid szakmai bemutatkozás.

Az aktív tag egy profilképet tölthet fel a saját profiljához. A feltöltés előtt a rendszer előnézetet mutat; a tag a képet mentés előtt lecserélheti vagy elvetheti. Mentés után a tag bármikor új képpel cserélheti le vagy eltávolíthatja a profilképet. A rendszer közérthető hibaüzenetet ad, ha a fájl képként nem használható.

Az induló rendszerben a profilképen kívül a tag nem tölthet fel saját dokumentumot vagy más fájlt a profiljához. A szakmai anyagok, belső dokumentumok és konferencia-absztraktok nem a profilkép-feltöltés funkciójának részei.

A fiók felületén a felhasználó a jelentkezésének vagy tagságának aktuális állapotát is látja. Aktív tag esetén itt jelenik meg a tagsági kategória és a tagdíjfizetéshez kapcsolódó aktuális tájékoztatás is. Tagjelölt számára a jelenlegi munkairány szerint sem tagsági kedvezmény, sem egyéb tagi szolgáltatás nem érhető el; e szabály ügyféloldali véglegesítése még szükséges.

### 5.3. Jelszó módosítása

A felhasználó a fiókjában jelszót is módosíthat. A módosításhoz a rendszer a jelenlegi jelszó megadását, majd az új jelszó kétszeri megadását kéri.

### 5.4. Fiók és tagság törlése

A tagjelölt vagy aktív tag a saját fiókjában azonnal törölheti a fiókját és a tagságát. A rendszer a végső megerősítés előtt egyértelmű figyelmeztetést jelenít meg a következményekről: a bejelentkezési hozzáférés, a tagsági státusz, a saját profil és annak publikus megjelenése megszűnik. A felhasználó ekkor még megszakíthatja a műveletet.

A törléshez a felhasználó megadja a jelenlegi jelszavát, majd külön megerősíti a végleges törlést. A megerősítés után a rendszer azonnal megszünteti a fiókot és a tagságot, eltávolítja a publikus profil megjelenését, valamint visszaigazoló e-mailt küld. A törölt fiók nem állítható vissza; későbbi csatlakozáshoz új tagsági jelentkezést kell indítani.

A jogszabály vagy számviteli kötelezettség alapján kötelezően megőrzendő adatok csak a szükséges körben maradhatnak meg, a felhasználó számára nem hozzáférhető módon. Ez nem akadályozza a fiók és az aktív tagság azonnali megszüntetését.

### 5.5. Saját konferencia-regisztrációk

A Saját fiókban külön elérési pont jelenhet meg a felhasználó saját konferencia-regisztrációihoz. Ez nem új tagi szolgáltatás, hanem a külön konferenciamodulban kezelt regisztrációk személyes áttekintése és részleteinek elérése.

A megjelenés és a jogosultság a konferenciamodul szabályai szerint működik; a konferencia-regisztrációra jogosultak köre és a kapcsolódó adatmezők külön döntés, illetve külön konferencia-specifikáció tárgya.

## 6. Publikus láthatóság és tagi profil

Ebben a szakaszban a tag két, saját adatainak felhasználását érintő beállítást kezel: a profiladatok publikus megjelenését és az e-mail-listára való fel- vagy leiratkozást. A tagsági nyilvántartás kötelező adatai nem kapcsolhatók ki egy egyszerű beállítással; a tagság megszüntetésére a 5.4. fejezet szerinti törlés szolgál.

A tag a saját fiókjában bármikor feliratkozhat az e-mail-listára vagy leiratkozhat róla. A módosítás a későbbi, e-mail-listán küldött kommunikációra vonatkozik.

Csak aktív tagnak lehet publikus tagi profilja, a publikus megjelenésről pedig maga a tag dönt. Az aktív tagságról szóló megerősítő e-mail a saját profiljára vezet, ahol a tag ezt a beállítást elérheti. A saját profilban egyértelműen elkülönülnek a tagsági nyilvántartáshoz szükséges adatok és a publikusan megjeleníthető adatok.

Az aktív tag külön beállíthatja, hogy a neve, portréképe, szakterülete, munkahelye, rövid szakmai bemutatkozása, szakmai érdeklődési területei és munkacsoport-tagsága közül melyek jelenhessenek meg a publikus profilján. A születési adatok, postai cím, telefonszám, e-mail-cím, tagsági azonosító és fizetési adatok nem tehetők publikussá. A vezetői és bizottsági kártyák is erre az általános, publikus tagi profilra vezetnek; ezekhez nem készül külön bemutatkozóprofil-rendszer.

Ha a tag nem kíván publikusan megjelenni, a rendszer nem jeleníti meg sem a publikus tagi névjegyzékben, sem közvetlenül elérhető publikus profiloldalként, sem vezetőségi vagy bizottsági személyt bemutató kártyán. A beállítás módosítása azonnal érvényesül, és nem igényel adminisztrátori jóváhagyást. Ez nem érinti a tagsági nyilvántartásban szereplő adatokat és a tagi felületen elérhető szolgáltatásokat.

A publikus tagi névjegyzék egyszerű lista a publikusan megjelenő aktív tagokról. Az induló változatban nem tartalmaz keresőt vagy szűrőt.

## 7. Visszajelzések, hibaállapotok és biztonság

Az űrlapoknál a rendszer közérthető, az érintett mezőhöz kapcsolódó visszajelzést ad, ha kötelező adat hiányzik, az e-mail-cím formátuma hibás, vagy a két jelszó nem egyezik. Sikertelen mentéskor a már megadott adatok a felhasználó számára megmaradnak.

Sikertelen bejelentkezéskor a rendszer nem árulja el, hogy az e-mail-cím vagy a jelszó hibás; semleges hibaüzenetet jelenít meg. Ismételt sikertelen próbálkozások esetén a rendszer korlátozhatja az újabb bejelentkezési próbálkozásokat.

Az e-mail-megerősítő és jelszó-visszaállító hivatkozások csak egyszer használhatók fel és lejárnak. Lejárt vagy már felhasznált hivatkozás esetén a rendszer felajánlja új hivatkozás kérését.

## 8. Nyitott döntések

- **ND-01:** jóváhagyott, tagdíjköteles jelentkezésnél a fizetési felhívás határideje, az emlékeztetők és a nemfizetés következménye.
- **ND-03:** szükség lehet-e később a tagságtól független fiókra, például külső konferencia-résztvevők számára.
- **ND-08:** a tagjelölt pontosan mely szolgáltatásokat érheti el az elbírálásig. Jelenlegi munkairány: tagsági kedvezmény és egyéb tagi szolgáltatás nem érhető el.
