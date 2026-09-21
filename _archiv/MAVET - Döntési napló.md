> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Döntési napló és munkajegyzetek

**Dokumentum állapota:** élő munkadokumentum  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**A dokumentum célja:** a feltárt ellentmondások, közösen kialakított irányok és az ügyféllel még lezárandó döntések nyomon követése.  
**Szabály:** csak a „döntve” állapotú tételek kerülhetnek változtatás nélkül a végleges funkcionális specifikációba.

## Tartalom

1. Állapotjelölések és azonosítók kezelése
2. D-001–D-004 – Fiók, tagsági kategóriák és tagdíj
3. D-005–D-008 – Pártoló tagság, munkacsoportok, aktualitások és bemutatkozó oldal
4. D-009–D-012 – Tagi profilok, fizetés, kategóriaellenőrzés és szakmai anyagok
5. D-013–D-016 – Tartalomátadás, külső hivatkozások, belső dokumentumok és partnerek

## Állapotjelölések

- **Nyitott:** a források nem adnak elég információt, vagy az ügyfél döntése szükséges.
- **Tisztázandó:** van közösen preferált irány, de az még nem végleges döntés.
- **Döntve:** közösen és egyértelműen elfogadott üzleti szabály; átvezethető a specifikációba.
- **Forrásellentmondás:** a rendelkezésre álló dokumentumok eltérő állítást tartalmaznak.

## Azonosítók kezelése

A központi nyitott döntési lista `ND-xx` azonosítói állandók. Lezáráskor a tétel kikerül a `MAVET - Nyitott döntések.md` aktív listájából, de az eredeti azonosítóval ebben a naplóban marad visszakereshető. Az azonosítókat nem számozzuk újra és nem használjuk fel újra.

---

## D-001 – Önálló, tagságtól független regisztrált felhasználó

**Téma**  
Szükséges-e olyan fiók, amely mögött nincs folyamatban lévő tagsági jelentkezés és nincs aktív tagság?

**Források jelenlegi állítása**  
A tagsági leírás az online jelentkezést, a kategóriaválasztást és a tagfelvételi folyamatot együtt kezeli. A tagi profil és a zárt felület kifejezetten a tagsághoz kapcsolódik. Nem került elő egyértelmű, tagságtól független fiókhasználati eset.

**Közös munkairány**  
A fiók létrehozása a tagsági jelentkezés része legyen. A rendszer üzleti értelemben ne kezeljen külön „csak regisztrált” felhasználói típust. A regisztrációkor a jelentkezőnek a választott kategóriához szükséges teljes adatlapot is ki kell töltenie; az e-mail-cím sikeres megerősítése automatikusan létrehozza a tagsági jelentkezést és a tagjelölti állapotot.

**Nyitott kérdés**  
Konferencia-regisztráció vagy egyéb szolgáltatás elérhető lesz-e aktív tagság nélküli személyek számára? Ha igen, ehhez szükség lehet külön fiók- vagy vendégfolyamatra.

**Státusz:** Tisztázandó  
**Célfejezet:** Funkcionális specifikáció 1.5., 4. fejezet, 5.1. fejezet; oldaltérkép 2–4. fejezet.

---

## D-002 – Tagsági jelentkezés és tagdíjfizetés időzítése

**Téma**  
A jelentkező mikor fizet tagdíjat a jelentkezés elfogadásához képest?

**Források jelenlegi állítása**  
A tagsági kategóriák leírása szerint az online jelentkezés és a kategóriaválasztás indítja a tagfelvételi folyamatot. A díjmentes kategóriánál a pozitív döntés automatikusan aktiválja a tagságot. A korábbi vázlat a tagdíj jelentkezéskori befizetését és negatív döntésnél visszatérítés lehetőségét említi. A szerződés a tagdíjfizetési modult tartalmazza, de a fizetés időzítését nem rögzíti.

**Közös munkairány**  
Előnyösebb folyamat: **jelentkezés → döntésre jogosult személy általi elfogadás → tagdíjfizetési felhívás → aktív tagság**. Ez elkerüli az elutasított kérelmek miatti visszatérítési folyamatot.

**Rögzített szabály**  
Amennyiben az elfogadott tagsági kategóriához nem tartozik tagdíj, a döntés automatikusan aktiválja a tagságot. Nincs további adminisztratív lépés; az új tag elektronikus értesítést kap a tagsága létrejöttéről. *(Lezárt központi kérdés: ND-02.)*

Tagdíjköteles kategóriánál a teljes regisztráció e-mail-cím megerősítése tagjelölti állapotot hoz létre. Elfogadás után a rendszer Stripe-alapú online tagdíjfizetési felhívást küld; a tagjelölt a befizetés beérkezése után válik aktív taggá. A fizetési határidő, az emlékeztetők és a nemfizetés következménye még nyitott kérdés (ND-01).

**Nyitott kérdések**  

- Meddig érvényes a jóváhagyás utáni fizetési felhívás?
- Mi történik nemfizetés vagy sikertelen fizetés esetén?

**Státusz:** Tisztázandó  
**Célfejezet:** Funkcionális specifikáció 5.1. és 6. fejezet; függelék 15.2.

---

## D-003 – Tagsági kategóriák és jogosultságok

**Téma**  
A rendszerben kezelt tagsági kategóriák, valamint a hozzájuk kapcsolódó jogosultságok.

**Források jelenlegi állítása**  
A tagsági kategóriák anyaga hat kategóriát nevez meg: rendes, hallgatói, ifjúsági, érdemes, tiszteletbeli és pártoló tag. A rendes és ifjúsági tag teljes jogú, szavazati joggal. A hallgatói és tiszteletbeli tag tanácskozási joggal szerepel. Az érdemes tag elismerés, tagdíjmentes és legfeljebb 20 fő lehet. A pártoló tag magánszemély, szervezet vagy vállalkozás lehet, de a részletes jogosultságai nincsenek leírva.

**Közös munkairány**  
Az oldaltérkép és a specifikáció az „aktív tag” gyűjtőfogalmat használja; az egyes felületek pontos hozzáférését tagsági kategória és szükség esetén rendezett díjfizetés szabályozza.

**Rögzített szabály**  
A munkacsoporthoz csatlakozás az aktív tagság minden kategóriája számára elérhető. A tagjelölt nem csatlakozhat, amíg nem válik aktív taggá. *(Lezárt központi kérdés: ND-09.)*

**Nyitott kérdések**  

- Milyen konkrét digitális jogosultságai vannak a pártoló tagnak?
- Mely kategóriák szerepelhetnek a tagi névjegyzékben?
- A hallgatói és tiszteletbeli tag milyen digitális tartalmakhoz fér hozzá?
- A tagsági kategóriák változhatnak-e a tag által, vagy csak adminisztrátor által?

**Státusz:** Tisztázandó  
**Célfejezet:** Funkcionális specifikáció 1.5., 3.3., 5.1. és 6.1.; függelék 15.1.

---

## D-004 – Érdemes és tiszteletbeli tagság keletkezése

**Téma**  
Önálló jelentkezéssel, jelöléssel vagy a Társaság döntésével jön létre-e az érdemes és a tiszteletbeli tagság?

**Forrásellentmondás**  
A kategóriaoldal mindkét kategóriánál „Jelentkezem” gombot jelez. A tartalmi leírás szerint az érdemes tagság belső elismerés, a tiszteletbeli tagságot pedig a Társaság adományozhatja. Ezek alapján a publikus önjelentkezés nem egyértelmű és valószínűleg nem kívánatos.

**Javasolt irány**  
E kategóriák létrehozása adminisztratív/elnökségi folyamattal történjen. A publikus „Jelentkezem” helyett legfeljebb jelölési vagy kapcsolatfelvételi lehetőség szerepeljen, ha ezt az ügyfél kéri.

**Státusz:** Nyitott  
**Célfejezet:** Funkcionális specifikáció 5.1.7.; oldaltérkép 6. fejezet.

---

## D-005 – Szervezeti vagy vállalati pártoló tagság

**Téma**  
A pártoló tagság magánszemélyek mellett szervezetek és vállalkozások számára is elérhető.

**Források jelenlegi állítása**  
A pártoló tagság leírása kifejezetten említi a magánszemélyt, szervezetet és vállalkozást. A tagsági profil adatlapja ugyanakkor csak természetes személy profiljára alkalmas mezőket sorol fel.

**Következtetés**  
A szervezeti/vállalati jelentkezéshez külön adatlap, szervezeti adatmodell és képviselői jogosultság szükséges; ezt nem lehet a természetes személy profiljának változtatás nélküli újrahasználatával megoldani.

**Nyitott kérdések**  

- Ki lehet a szervezeti fiók elsődleges és további képviselője?
- Mely szervezeti adatok jelennek meg publikusan?
- A szervezeti pártoló tag részt vehet-e a tagi névjegyzékben, eseményeken vagy munkacsoportokban?

**Státusz:** Tisztázandó  
**Célfejezet:** Funkcionális specifikáció 5.1.3., 5.2. és 5.3.; függelék 15.1. és 15.4.

---

## D-006 – Munkacsoporthoz csatlakozás

**Téma**  
Milyen tagsági feltétellel lehet munkacsoporthoz csatlakozni?

**Források jelenlegi állítása**  
A munkacsoportok anyaga szerint a jelentkezés feltétele az aktív MAVET-tagság.

**Rögzített szabály**  
A munkacsoporthoz csatlakozás az aktív tagsághoz kötött munkacsoport-funkció. Az aktív tagság minden kategóriája számára elérhető; tagjelölt nem csatlakozhat, amíg nem válik aktív taggá. *(Lezárt központi kérdés: ND-09.)*

**Státusz:** Döntve  
**Célfejezet:** Funkcionális specifikáció 3.6.3.; Oldaltérkép V2 1.2. fejezet.

---

## D-007 – Főoldali aktualitások, hírlevél és partnerlogók

**Rögzített szabályok**  

- Mobilon az aktualitáskártyák egy oszlopban, egymás alatt jelennek meg; nincs oldalirányú lapozó kártyasor. *(Lezárt központi kérdés: ND-18.)*
- A főoldalon összesen legfeljebb hat aktualitáskártya jelenhet meg: egy kiemelt és legfeljebb öt normál kártya, vagy kiemelt nélkül hat normál kártya. *(Lezárt központi kérdés: ND-19.)*
- A főoldalra kiemelt munkacsoportok és projektek feltöltése, illetve kiválasztása az ügyfél tartalmi döntése; ezt nem szükséges külön üzleti döntésként vagy induló listaként rögzíteni. *(Lezárt központi kérdés: ND-20.)*
- A hírlevél-feliratkozás egyszeres; megerősítő e-mailes folyamat nincs. *(Lezárt központi kérdés: ND-21.)*
- A partnerlogóhoz külső hivatkozás opcionálisan rendelhető. *(Lezárt központi kérdés: ND-22.)*

**Státusz:** Döntve  
**Célfejezet:** Főoldal funkcionális specifikáció 5., 7. és 8. fejezet.

---

## D-008 – Az „A Társaságról” oldal szerkezete

**Rögzített szabály**  
Az „A Társaságról” tartalmai egyetlen publikus oldalon jelennek meg. A küldetés és jövőkép, a történet, a vezetőség és bizottságok, valamint a hivatalos dokumentumok az oldalon belüli horgonyos navigációval érhetők el. *(Lezárt központi kérdés: ND-25.)*

**Státusz:** Döntve  
**Célfejezet:** A Társaságról funkcionális specifikáció 1–2. fejezet; oldaltérkép 1. fejezet.

---

## D-009 – Publikus tagi profilok és láthatóság

**Rögzített szabály**  
Csak aktív tag rendelkezhet publikus tagi profillal. Az aktív tagságról szóló megerősítő e-mail a saját profilra vezet, ahol a tag beállíthatja a publikus megjelenést és a megjelenő adatokat. Publikusan megjeleníthető: név, portrékép, szakterület, munkahely, rövid szakmai bemutatkozás, szakmai érdeklődési területek és munkacsoport-tagság. A születési adatok, postai cím, telefonszám, e-mail-cím, tagsági azonosító és fizetési adatok mindig privátak. A láthatóság módosítása azonnal érvényesül és nem igényel jóváhagyást. A publikus névjegyzék egyszerű lista, kereső és szűrő nélkül. A vezetők és bizottsági tagok ugyanazt az általános publikus tagi profilt használják; nem készül számukra külön profilrendszer. Ha egy ilyen személy kikapcsolja a publikus megjelenést, a neve, kártyája és profilja sem jelenhet meg. *(Lezárt központi kérdések: ND-27, ND-28.)*

**Státusz:** Döntve  
**Célfejezet:** A Társaságról funkcionális specifikáció 5–6. fejezet; Fiók és belépés funkcionális specifikáció 5–6. fejezet; Tagsági életciklus és tagfelvétel funkcionális specifikáció 8. fejezet.

---

## D-010 – Tagdíjfizetési szolgáltató

**Rögzített szabály**  
A tagsági jelentkezéshez és az éves tagsági díjhoz kapcsolódó online fizetés Stripe-on keresztül történik. Ez a döntés kizárólag a tagsági díjra vonatkozik; a konferencia fizetési folyamata külön specifikációs téma.

**Státusz:** Döntve  
**Célfejezet:** Funkcionális specifikáció 6.3. és 11.5.; oldaltérkép 3. fejezet.

---

## D-011 – Hallgatói és ifjúsági tagság ellenőrzése

**Rögzített szabály**  
Az induló rendszer hallgatói tagsághoz nem kér és nem kezel hallgatói jogviszonyt igazoló dokumentumfeltöltést. Ifjúsági tagságnál a rendszer a megadott születési dátum alapján ellenőrzi a mindenkori életkori feltételt.

**Státusz:** Döntve  
**Célfejezet:** Tagsági életciklus és tagfelvétel specifikáció 4.4. fejezet; funkcionális specifikáció 5.1.2. fejezet.

---

## D-012 – Szakmai anyagok anyagonkénti hozzáférése

**Rögzített szabály**  
A szakmai anyagok hozzáférése nem kizárólag tartalmi kategória szerint dől el. Az adminisztrátor minden egyes szakmai anyagnál külön állítja be, hogy az **Publikus**, vagy csak **Aktív tag számára elérhető** legyen. A tagjelölt és a fizetésre váró jelentkező nem kap hozzáférést az aktív tagoknak fenntartott anyagokhoz. A hat kategória: szakmai ajánlás, előadás, publikáció, videó, betegedukációs anyag és letölthető dokumentum.

**Forrásalap**  
A weboldal előzetes váza ezeket a tartalomtípusokat sorolja fel, és a megtekintést részben regisztrációhoz köti. A konkrét anyagonkénti adminisztratív beállítást a közös egyeztetés rögzítette.

**Státusz:** Döntve  
**Célfejezet:** Szakmai anyagok funkcionális specifikáció 2., 5. és 6. fejezet; Oldaltérkép V2 1.2. fejezet.

---

## D-013 – Szakmai anyagok tartalomátadási módjai

**Rögzített szabály**  
A szakmai anyagok hat kategóriája besorolásként működik, nem külön technikai tartalomtípusként és nem külön aloldalként. Az anyag tényleges tartalma kétféle módon kezelhető: **letölthető fájlként**, vagy **hivatkozott/beágyazott tartalomként**. A választott módhoz tartozó fájl vagy hivatkozás kötelező. Külön piszkozat- vagy közzétételi állapot nem része az induló modellnek; hiányos anyag nem menthető megjeleníthető rekordként.

**Státusz:** Döntve  
**Célfejezet:** Szakmai anyagok funkcionális specifikáció 2., 3., 4., 6. és 7. fejezet; Oldaltérkép V2 1.2. fejezet.

---

## D-014 – Külső hivatkozások megnyitása

**Rögzített szabály**  
A szakmai anyagokban szereplő külső hivatkozások új böngészőfülön nyílnak meg. Ez a szabály a közvetlenül megnyitott külső hivatkozásokra és a beágyazás helyett használt külső megnyitásra is vonatkozik.

**Státusz:** Döntve  
**Célfejezet:** Szakmai anyagok funkcionális specifikáció 2.2., 4.2. és 9. fejezet; elfogadási kritériumok 12. pont.

---

## D-015 – Belső dokumentumok kezelése

**Rögzített szabály**  
A forrásanyagokban a zárt tagi felület részeként említett belső dokumentumokat nem külön dokumentumtárban kell kezelni. Ezek a szakmai anyagok moduljába kerülnek, és anyagonként beállítható, hogy csak aktív tag számára legyenek elérhetők. Külön belső dokumentumtár-oldal és külön jogosultsági modell nem készül.

**Státusz:** Döntve  
**Célfejezet:** Szakmai anyagok funkcionális specifikáció 1.2., 2.3., 8. fejezet; Oldaltérkép V2 2.2. és 4. fejezet.

---

## D-016 – Támogatók és együttműködő partnerek főoldali szakasza

**Rögzített szabály**  
A támogatók és együttműködő partnerek az induló változatban nem önálló publikus aloldalon jelennek meg, hanem a főoldal külön szakaszában. A szakasz a MAVET-forrásban szereplő rövid bevezető szöveget, valamint az adminisztrátor által megadott partnerneveket és – ha rendelkezésre áll – logókat jeleníti meg. Külön partner-részletező oldal és kötelező részletes partnerbemutatás nem készül. Megadott külső hivatkozás opcionálisan rendelhető a partnerhez, és új böngészőlapon nyílik meg.

**Forrásalap**  
A `mavetanyagokmd/Partnereink és támogatóink.md` fájl csak a szakasz címét és egy rövid köszönő/bevezető szöveget tartalmaz; partnerneveket, részletes leírásokat vagy kötelező aloldalt nem ad meg.

**Státusz:** Döntve  
**Célfejezet:** Főoldal funkcionális specifikáció 8–9. fejezet; Oldaltérkép V2 1.1. fejezet; Funkcionális specifikáció 3.1.7. és 8.9.
