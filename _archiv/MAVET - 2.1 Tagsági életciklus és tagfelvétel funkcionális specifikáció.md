> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Tagsági életciklus és tagfelvétel

## Funkcionális specifikáció

**Dokumentum állapota:** egyeztetés alatt  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Oldaltérkép-fejezet:** 2.1  
**A dokumentum célja:** a tagsági jelentkezés, elbírálás, aktiválás és tagdíjfizetés üzleti folyamatának fejlesztési alapja.  
**Kapcsolódó dokumentumok:** `MAVET - 2.1 Fiók és belépés funkcionális specifikáció.md`, `MAVET - Nyitott döntések.md`, `MAVET - Döntési napló.md`.

## Tartalom

1. Alapelv és hatókör
2. Fogalmak és állapotok
3. Publikus jelentkezési kategóriák
4. Jelentkezési folyamat
   4.1. Belépési pont
   4.2. Kategóriaválasztás
   4.3. Kötelező adatok
   4.4. Kategóriához kapcsolódó ellenőrzések
   4.5. E-mail-cím megerősítése
   4.6. Regisztráció véglegesítése és tagjelölti státusz
5. Elbírálás és utólagos javítás
6. Aktiválás és tagdíj
   6.1. Díjmentes kategória
   6.2. Tagdíjköteles kategória
   6.3. Fizetési felhívás a saját fiókban
   6.4. Fizetési hatókör
7. Hozzáférések állapot szerint
8. Értesítések
9. Hatókörből kizárt vagy nyitott elemek
10. Elfogadási kritériumok

---

## 1. Alapelv és hatókör

A MAVET-ben a regisztráció és a tagsági jelentkezés egyetlen folyamat. Nincs tagságtól független, önálló „csak regisztrált” felhasználó: a látogató a tagsági jelentkezéshez hoz létre fiókot.

A tagjelölti állapot nem a fiók létrejöttével, hanem automatikusan az e-mail-cím megerősítésével keletkezik. A regisztrációhoz minden kötelező mezőt ki kell tölteni és minden szükséges nyilatkozatot el kell fogadni; a megerősítő hivatkozás megnyitása külön űrlapbeküldés nélkül hozza létre a tagsági jelentkezést.

A specifikáció a természetes személyek publikus tagfelvételi folyamatát rögzíti. Nem határozza meg a szervezeti vagy vállalati pártoló tagság képviseleti modelljét, és nem rendezi az érdemes vagy tiszteletbeli tagság keletkezésének folyamatát.

## 2. Fogalmak és állapotok

| Fogalom vagy állapot | Jelentés | Elérhető fő művelet |
|---|---|---|
| Kitöltés alatt | A látogató még nem nyújtotta be a jelentkezést. Nem tagjelölt és nem tag. | Jelentkezési űrlap kitöltése, e-mail-cím megerősítése |
| Tagjelölt | Teljesen kitöltött, e-mailben megerősített regisztrációval létrejött tagsági jelentkezése van; a döntés még nem született meg. | Jelentkezési állapot megtekintése |
| Elfogadott, fizetésre vár | Tagdíjköteles kategória jelentkezését elfogadták, de a tagdíj még nem érkezett be. | Stripe-fizetési felhívás teljesítése |
| Aktív tag | Díjmentes kategóriában elfogadott, tagdíjköteles kategóriában elfogadott és a tagdíjat megfizető személy. | Tagi szolgáltatások és saját profil használata |
| Elutasított | A jelentkezést nem fogadták el. | A döntésről szóló tájékoztatás megtekintése |

A tagjelölt a létrejött tagsági jelentkezése állapotát és saját jelentkezési adatait elérheti, de nem kap tagsági kedvezményt és nem használhat egyéb tagi szolgáltatást. Ez a jelenlegi munkairány; ügyféloldali véglegesítése az ND-08 nyitott döntés tárgya.

## 3. Publikus jelentkezési kategóriák

Publikus jelentkezés induláskor az alábbi természetes személy kategóriákhoz érhető el:

- rendes tag;
- hallgatói tag;
- ifjúsági tag;
- természetes személy pártoló tag.

Az érdemes és a tiszteletbeli tagság nem része a publikus jelentkezési folyamatnak. Keletkezésük módja külön döntést igényel (ND-06).

A szervezeti vagy vállalati pártoló tagság nem használhatja változtatás nélkül a természetes személyek űrlapját. Saját adatlapját, képviseleti szabályait és jogosultságait későbbi specifikáció rögzíti (ND-07).

## 4. Jelentkezési folyamat

### 4.1. Belépési pont

A látogató a főoldal „Csatlakozom a MAVET-hez” felhívásáról vagy a Tagság oldalról indítja a „Tagsági jelentkezés és fiók létrehozása” folyamatot.

A bejelentkezési oldalról ugyanez a folyamat kizárólag még nem regisztrált látogató számára érhető el. Már meglévő fiókhoz a rendszer nem hoz létre második fiókot; a felhasználó bejelentkezik, vagy jelszó-visszaállítást kér.

### 4.2. Kategóriaválasztás

A jelentkező kiválasztja a kívánt tagsági kategóriát. A rendszer közérthetően megjeleníti a kategória feltételeit, a tagdíjmentességet vagy tagdíjfizetési kötelezettséget, valamint a jelentkezéshez szükséges adatokat.

A rendszer nem jeleníthet meg „Jelentkezem” műveletet az érdemes és tiszteletbeli tagságnál, amíg az ND-06 kérdés nem zárul le.

### 4.3. Kötelező adatok

A természetes személy jelentkezőnek a regisztrációhoz az alábbi adatokat kell megadnia:

- teljes név;
- születési dátum;
- levelezési cím;
- e-mail-cím;
- telefonszám;
- szakterület;
- munkahely;
- választott tagsági kategória;
- jelszó és a jelszó ismételt megadása;
- az Alapszabály elfogadása;
- az adatkezelési tájékoztató elfogadása.

A rendszer a kötelező mezők üresen hagyását, az e-mail-cím formátumát, a jelszó ismétlésének egyezését és az életkori feltételeket a regisztráció indítása előtt ellenőrzi. Hibás vagy hiányzó adat esetén az érintett mezőnél közérthető hibaüzenet jelenik meg.

### 4.4. Kategóriához kapcsolódó ellenőrzések

A rendes tag és az ifjúsági tag nagykorú természetes személy lehet. Az ifjúsági tagság felső korhatárát a rendszer a megadott születési dátum alapján ellenőrzi, a mindenkori kategóriaszabály szerint.

A hallgatói tagsághoz az induló rendszerben nem kell hallgatói jogviszonyt igazoló dokumentumot feltölteni. A rendszer nem végez dokumentumalapú hallgatói jogviszony-ellenőrzést.

Az esetleges későbbi igazoláskérés vagy dokumentumfeltöltés új döntés és változásigény tárgya.

### 4.5. E-mail-cím megerősítése

A rendszer egyszer használható, lejáró megerősítő hivatkozást küld a megadott e-mail-címre. A hivatkozás megnyitása megerősíti az e-mail-címet, véglegesíti a regisztrációt és automatikusan létrehozza a tagsági jelentkezést.

Lejárt vagy felhasznált hivatkozás esetén a rendszer új megerősítő hivatkozás kérését ajánlja fel. A jelszó-visszaállítási folyamat a fiókbiztonsági specifikáció szerint működik.

### 4.6. Regisztráció véglegesítése és tagjelölti státusz

A rendszer nem jelenít meg külön „Jelentkezés beküldése” műveletet. Ha a jelentkező minden kötelező adatot megadott és a regisztrációt elindította, az e-mail-cím megerősítése véglegesíti a regisztrációt és automatikusan létrehozza a tagsági jelentkezést.

Sikeres e-mail-megerősítéskor a rendszer:

1. rögzíti a jelentkezés adatait és a megerősítés időpontját;
2. tagjelölti állapotba helyezi a jelentkezőt;
3. visszaigazoló e-mailt küld a tagsági jelentkezés létrejöttéről;
4. a fiókban megjeleníti a „Jelentkezés létrejött, elbírálás alatt” állapotot.

Nincs külön hiánypótlási állapot. A kötelező mezők hiánya eleve megakadályozza a regisztráció elindítását.

## 5. Elbírálás és utólagos javítás

Az adminisztrációs felületen erre jogosult személy rögzíti a jelentkezés elfogadását vagy elutasítását. A specifikáció nem határozza meg, hogy ezt a szervezeten belül pontosan mely személy vagy testület végzi.

Ha a jelentkezés tartalmában a regisztráció véglegesítése után javítás szükséges, a jelentkezést nem kell hiánypótlási állapotba tenni. A döntésre jogosult személy elfogadhatja a jelentkezést, majd e-mailben egyeztet a jelentkezővel az érintett adat helyesbítéséről. A rendszer ehhez nem vezet külön állapotot vagy javítási folyamatot; aktív tagként a személy a saját profilján is módosíthatja az adatát.

Elutasításkor a rendszer döntésről szóló értesítést küld. Új jelentkezés csak új tagsági jelentkezési folyamat indításával nyújtható be.

## 6. Aktiválás és tagdíj

### 6.1. Díjmentes kategória

Ha a jelentkező díjmentes tagsági kategóriába jelentkezett, az elfogadás rögzítése után automatikusan aktív taggá válik. A rendszer erről elektronikus értesítést küld, és hozzáférést ad az aktív tagi szolgáltatásokhoz.

### 6.2. Tagdíjköteles kategória

Ha a jelentkező tagdíjköteles kategóriába jelentkezett, az elfogadás után „Elfogadott, fizetésre vár” állapotba kerül. A rendszer Stripe-alapú online fizetési felhívást küld. A tagjelölt kizárólag a tagdíj beérkezése után válik aktív taggá.

A fizetési felhívás határideje, az emlékeztetők száma és időzítése, valamint a sikertelen vagy elmaradt fizetés következménye az ND-01 nyitott döntés része.

### 6.3. Fizetési felhívás a saját fiókban

Az „Elfogadott, fizetésre vár” állapotú jelentkező a saját fiókjában látja, hogy a jelentkezését elfogadták, de a tagsági aktiváláshoz a tagdíj befizetése még szükséges. A fiókban megjelenik a fizetendő tagsági díjhoz és a Stripe-fizetés elindításához kapcsolódó tájékoztatás.

A fizetés a Stripe felületén vagy a Stripe által biztosított fizetési folyamatban történik. A rendszer csak a Stripe-tól érkező sikeres fizetési visszaigazolás után állítja a jelentkezőt aktív tagi státuszba. A sikeres fizetésig a jelentkező nem kap aktív tagi jogosultságokat.

Megszakított vagy sikertelen fizetés esetén a jelentkező „Elfogadott, fizetésre vár” állapotban marad, és a saját fiókjából újraindíthatja a fizetési folyamatot. A határidő, az emlékeztetők és a nemfizetés következménye az ND-01 szerint kezelendő.

### 6.4. Fizetési hatókör

A Stripe a tagsági jelentkezéshez és az éves tagsági díjhoz kapcsolódó online fizetés szolgáltatója. A konferencia-regisztráció és annak átutalásos fizetési folyamata külön modul; nem része ennek a tagsági életciklusnak.

## 7. Hozzáférések állapot szerint

| Funkció | Kitöltés alatt | Tagjelölt | Elfogadott, fizetésre vár | Aktív tag |
|---|---:|---:|---:|---:|
| Regisztrációs és tagsági jelentkezési adatok kitöltése | Igen | Nem | Nem | Nem |
| Létrejött tagsági jelentkezés adatai és állapota | Nem | Igen | Igen | Nem |
| Tagdíjfizetés | Nem | Nem | Igen | Éves megújításkor |
| Tagsági kedvezmények és tagi szolgáltatások | Nem | Nem | Nem | Igen |
| Saját profil teljes szerkesztése | Nem | Csak saját jelentkezési adatok | Csak a fizetéshez vagy jelentkezéshez szükséges adatok | Igen |
| Munkacsoporthoz csatlakozás | Nem | Nem | Nem | Igen |

Az aktív tagi hozzáférés kategóriánkénti részletszabályait a szerepkör- és jogosultsági mátrix egészíti ki. A tagjelölti hozzáférések véglegesítése az ND-08 lezárásáig nyitott marad; a táblázat a jelenlegi munkairányt rögzíti.

## 8. Értesítések

| Esemény | Címzett | Kötelező tartalom |
|---|---|---|
| E-mail-cím megerősítése | Jelentkező | Egyszer használható, lejáró megerősítő hivatkozás |
| Tagsági jelentkezés létrejött | Tagjelölt | Regisztráció és elbírálás alatt állapot visszaigazolása |
| Jelentkezés elfogadva, díjmentes | Aktív tag | Aktiválás visszaigazolása és a saját profilra vezető hivatkozás |
| Jelentkezés elfogadva, tagdíjköteles | Elfogadott, fizetésre váró tagjelölt | Stripe-fizetési felhívás |
| Tagdíj beérkezett | Aktív tag | Aktiválás visszaigazolása, fizetési tájékoztatás és a saját profilra vezető hivatkozás |
| Jelentkezés elutasítva | Elutasított jelentkező | Döntésről szóló tájékoztatás |

Az ND-01 lezárása után a fizetési emlékeztetők is bekerülnek az értesítési katalógusba.

## 9. Hatókörből kizárt vagy nyitott elemek

- Szervezeti vagy vállalati pártoló tag adatlapja, képviselete és jogosultságai: ND-07.
- Érdemes és tiszteletbeli tagság keletkezésének módja: ND-06.
- Tagjelölti kedvezmények és egyéb tagi szolgáltatások végleges köre: ND-08.
- Jóváhagyott tagdíjfizetés határideje, emlékeztetői és nemfizetés kezelése: ND-01.
- A konferencia-regisztráció jogosultsága, adatai és fizetése: külön konferenciamodul-specifikáció.

## 10. Elfogadási kritériumok

1. A látogató egyetlen folyamatban választ tagsági kategóriát, tölti ki a kötelező jelentkezési adatokat, hoz létre fiókot és erősíti meg az e-mail-címét.
2. Hiányos, e-mailben nem megerősített vagy kötelező nyilatkozat nélküli regisztráció nem hozhat létre tagsági jelentkezést.
3. A tagjelölti állapot az e-mail-cím sikeres megerősítésével, külön jelentkezésbeküldő művelet nélkül keletkezik.
4. Hallgatói tagsághoz a rendszer nem kér és nem kezel hallgatói jogviszonyt igazoló feltöltést.
5. Ifjúsági tagságnál a rendszer a megadott születési dátumból ellenőrzi a kategória életkori feltételét.
6. Díjmentes kategória elfogadása után a jelentkező fizetés nélkül aktív taggá válik.
7. Tagdíjköteles kategória elfogadása után a jelentkező csak sikeres Stripe-fizetés után válik aktív taggá.
8. Az „Elfogadott, fizetésre vár” állapotú jelentkező a saját fiókjában látja a fizetési felhívást és elindíthatja a Stripe-fizetést.
9. Megszakított vagy sikertelen fizetés esetén a jelentkező nem válik aktív taggá, és a fizetési folyamat újraindítható.
10. A tagjelölt és a fizetésre váró jelentkező nem kap tagsági kedvezményt, nem használhat egyéb tagi szolgáltatást és nem csatlakozhat munkacsoporthoz.
11. A rendszer nem használ hiánypótlási állapotot; a regisztráció véglegesítése után szükséges adatjavítást e-mailes egyeztetés kezel.
12. A dokumentum nem feltételezi, hogy a döntést meghatározott szervezeti szerepkör hozza meg.
13. Az aktív taggá válást visszaigazoló e-mail a tag saját profiljára vezet, ahol a tag a publikus megjelenését beállíthatja.
