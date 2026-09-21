> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Funkcionális specifikáció – formátum-iránytű

**Dokumentum állapota:** belső munkajegyzet  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**A dokumentum célja:** a MAVET-specifikációk formai és tartalmi egységesítési szabályainak rögzítése.

## Rendeltetés

Ez belső munkajegyzet. A MAVET végleges funkcionális specifikációjának formátumát és elvárt részletességét rögzíti a „Kapaszkodó fejlesztőházak” minta alapján. Nem ügyfélnek szánt dokumentum és nem a MAVET megoldásának tartalma.

## Tartalom

1. A követendő dokumentumkarakter
2. Ajánlott fejezetszerkezet
3. Minden funkció/alfejezet kötelező belső sémája
4. A minta erős, megtartandó elemei
5. Amit a MAVET-specifikációban pontosabbá kell tenni
6. Írási szabályok a későbbi specifikációhoz
7. Minőségi kapu az ügyfél-elfogadás előtt

## A követendő dokumentumkarakter

- Magyar nyelvű, számozott fejezetekből és alfejezetekből álló funkcionális specifikáció.
- Tartalomjegyzékben előre látható a teljes hatókör.
- A dokumentum rövid rendszer- vagy modulbevezetővel indul, majd képernyő- és folyamatközpontúan bontja ki a követelményeket.
- A leírás megfigyelhető viselkedést rögzít: ki mit lát, mire kattint, mi történik, és milyen visszajelzést kap.
- A design csak annyiban része a specifikációnak, amennyiben funkcionális következménye van (például kártyás lista, kétoszlopos blokk, reszponzív lejátszó).

## Ajánlott fejezetszerkezet

1. Dokumentumkezelés és elfogadási keret
   - verzió, dátum, megrendelő, jóváhagyó;
   - a specifikáció célja, hatálya, értelmezési szabályai;
   - elfogadás utáni változtatások kezelése (külön változásigény és becslés).
2. Projektáttekintés és szerepkörök
   - üzleti cél, célcsoportok, felhasználói szerepek és jogosultságok.
3. Rendszerarchitektúra, navigáció és általános működés
   - oldaltérkép, globális elemek, jogosultsági állapotok, mobil/reszponzív elvárások.
4. Funkcionális modulok
   - modulonként és aloldalanként részletes működés.
5. Adminisztráció és tartalomkezelés
   - minden, ügyfél által szerkeszthető adat, folyamat és jogosultság.
6. Integrációk és kommunikációk
   - külső rendszerek, e-mailek, értesítések, átadott adatok és hibakezelés.
7. Üzleti szabályok, validációk és kivételkezelés
   - egyértelmű, tesztelhető szabályok.
8. Nem funkcionális és átadási követelmények
   - biztonság/adatvédelem, támogatott böngészők, teljesítmény, analitika, üzemeltetési és átadási kör.
9. Kifejezetten kizárt elemek és nyitott döntések
   - az elfogadás előtt minden nyitott tétel lezárandó; később ez a fejezet védi a scope-ot.
10. Elfogadási kritériumok
   - a részspecifikációval párhuzamos, az `ELFOGADASI_KRITERIUMOK` mappában tárolt belső fejlesztési segédanyag; rövid, ellenőrizhető kritériumok a lényeges funkciókhoz.

## Minden funkció/alfejezet kötelező belső sémája

Az alfejezet a számozott cím alatt közvetlenül egy rövid, cím nélküli bevezető bekezdéssel indul. Ez írja le, mire szolgál a funkció és mely szerepkör használja. Ne használjunk ehhez külön „Cél és hatókör”, „A blokk szerepe” vagy hasonló alcímet.

1. **Előfeltételek** – például bejelentkezés, jogosultság, rendelkezésre álló adat.
2. **Felület és adatok** – képernyő/blokk neve, mezők, címkék, gombok, listaoszlopok; kötelező/opcionális jelöléssel.
3. **Normál folyamat** – számozott felhasználói lépések és rendszerreakciók.
4. **Üzleti szabályok** – döntési logika, határértékek, állapotátmenetek és egyediségek. Ezeket ne külön „Üzleti szabályok” alcím alatt írjuk, hanem a releváns működési, állapot- vagy felületi leírás végén, cím nélküli bekezdésben vagy felsorolásban.
5. **Validáció és hibaállapotok** – mikor, hol és milyen szövegű/természetű hibaüzenet jelenik meg; mi nem történhet meg.
6. **Sikerállapot és utóhatás** – visszajelzés, átirányítás, e-mail/értesítés, mentett adat, naplózás, következő állapot.
7. **Adminisztratív kezelhetőség** – ki és hogyan állíthatja be, módosíthatja vagy archiválhatja.
8. **Elfogadási kritériumok** – Given/When/Then vagy ezzel egyenértékű tesztelhető mondatok. Ezek nem az ügyfélnek szánt részspecifikációban, hanem az `ELFOGADASI_KRITERIUMOK` mappában, a megfelelő dokumentumot leképező külön fájlban szerepelnek.

## A minta erős, megtartandó elemei

- Hierarchikus számozás és funkcionális csoportosítás.
- Rövid bevezető minden nagyobb rendszerterülethez.
- Felületi elemek explicit felsorolása.
- A folyamat leírása a felhasználói kattintástól a rendszer válaszáig.
- Kötelező mezők, mezőformátumok és adatvédelmi nyilatkozatok jelölése.
- Inline validáció, sikeres állapot, üres/hibás állapot leírása.
- Kontextusfüggő tartalom és navigáció megnevezése.
- E-mailes vagy külső rendszerhatás kimondása.

## Amit a MAVET-specifikációban pontosabbá kell tenni

A minta jó narratív funkcionális leírás, de önmagában több ponton még értelmezést hagy a fejlesztőnek. A végleges MAVET-dokumentumban az alábbiakat mindig explicit módon kell lezárni:

- szerepkörök és pontos jogosultságok;
- teljes oldal- és menütérkép, minden útvonal és belépési pont;
- mezőszintű adatmodell: típus, kötelezőség, formátum, maximum, egyediség, láthatóság;
- állapotgépek (pl. tervezet/elküldött/jóváhagyott/törölt) és megengedett átmenetek;
- keresés, szűrés, rendezés, lapozás és üres lista viselkedése;
- értesítések címzettje, kiváltó oka, sablonjának tartalma, újraküldés és sikertelenség;
- fájlkezelés, adatmegőrzés, törlés/archiválás és jogosulatlan hozzáférés kezelése;
- külső integrációk tulajdonosa, felelősségi határa és kiesési viselkedése;
- mobil-, akadálymentességi-, böngésző- és teljesítményelvárások;
- minden „pl.”, „opcionális”, „tetszés szerint”, „szükség szerint” vagy „stb.” kifejezés helyett döntés vagy konfigurációs szabály;
- minden kimondatlanul feltételezett funkció kizárása vagy külön felvétele a hatókörbe.

## Írási szabályok a későbbi specifikációhoz

- Az egyes részspecifikációk elejére ne kerüljön külön „A dokumentum tartalma és lehatárolása” vagy hasonló kizárási lista. A dokumentum saját fejezetei önmagukban jelöljék ki a tárgyát; a globális scope- és lehatárolási kérdéseket a központi specifikációs keret kezeli.
- Ne megoldási technológiát, hanem ellenőrizhető üzleti és felhasználói eredményt írjunk elő, kivéve ha a technológia szerződésesen fontos.
- Egy követelmény egyértelmű, kijelentő mondat legyen; kerüljük a kétértelmű jelzőket (pl. „gyors”, „modern”, „megfelelő”).
- A „rendszer” minden mondata legyen tesztelhető: konkrét kiváltó esemény, eredmény és érintett szerepkör tartozzon hozzá.
- A képi terv, arculat, szöveg, jogi szöveg és külső szolgáltatói fiók által biztosítandó elemeit külön jelöljük felelőssel és határidővel.
- A még eldöntetlen kérdések ne rejtve maradjanak a szövegben: külön döntési listába kerüljenek, és az elfogadás előtt zárjuk le őket.

## Minőségi kapu az ügyfél-elfogadás előtt

A dokumentum csak akkor tekinthető elfogadásra késznek, ha minden lényeges folyamatnál meghatározott:

- ki használja;
- milyen adatból indul;
- milyen lépéseken és döntéseken megy keresztül;
- mi történik siker, hiba, megszakítás és jogosultsághiány esetén;
- milyen adat, értesítés vagy állapot marad a folyamat után;
- mi tartozik kifejezetten a projektbe, és mi nem.
