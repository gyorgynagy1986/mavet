# MAVET weboldal és tagsági rendszer funkcionális specifikációja

**Verzió:** 0.3  
**Dátum:** 2026. szeptember 6.  
**Állapot:** ügyfél-egyeztetésre előkészített munkaváltozat

A dokumentum a Magyar Vidékegészségügyi Társaság weboldalának és tagsági rendszerének működését írja le. Bemutatja, hogy a látogató, a jelentkező és a tag milyen felületeket ér el, milyen adatokat ad meg, és milyen eredménnyel használja a rendszer funkcióit. Az egyes moduloknál szerepel az ügyfél által kezelhető tartalom és a szükséges szervezeti döntés; külön adminisztrációs képernyőleírás nem része a dokumentumnak.

Az ügyféllel elfogadtatandó működési javaslatokat és a még tisztázandó kérdéseket a 13. fejezet gyűjti össze. A kérdésazonosítók az érintett fejezetekben is megjelennek. A konferenciamodul a 11. fejezetben fenntartott helyen később kerül kidolgozásra. Ez a változat a nyitott kérdések és a konferencia kidolgozása előtt nem tekinthető a teljes rendszer végleges specifikációjának.

## Tartalom

1. Rendszeráttekintés és hozzáférések
2. Navigáció és általános működés
3. Főoldal
4. Bemutatkozó és tájékoztató oldalak
5. Aktualitások
6. Szakmai anyagok és dokumentumok
7. Regisztráció és tagsági jelentkezés
8. Tagdíjfizetés és tagsági megújítás
9. Saját fiók és profilok
10. E-mailes kommunikáció és hírlevél
11. Konferenciamodul
12. Közös működési és ellenőrzési követelmények
13. Ügyféllel egyeztetendő döntések és tartalomátadás

## 1. Rendszeráttekintés és hozzáférések

### 1.1. A rendszer feladata

A weboldal bemutatja a Társaság céljait, tevékenységét, híreit, eseményeit és szakmai anyagait. A látogató tagságra jelentkezhet, a jelentkezését a MAVET elbírálja. Az aktív tag a saját fiókjából kezeli személyes profilját, eléri a tagi dokumentumokat és a kereshető tagi névjegyzéket, valamint befizetheti tagsági díját.

A publikus tájékoztatás és a tagsági folyamat egymásra épül: a látogató megismeri a Társaságot, tájékozódik a tagságról, majd elindítja a jelentkezést. A konferencia ehhez kapcsolódó, később részletezendő rendszerterület.

### 1.2. Felhasználói állapotok

A felhasználói fiók, a tagsági állapot és a megjelenési beállítás külön fogalom. A fiók megléte önmagában nem ad tagi jogosultságot; a saját profil elrejtése nem szünteti meg az aktív tagságot.

| Állapot | Jelentés |
| --- | --- |
| Látogató | A publikus oldalak használója. Nincs bejelentkezve. |
| E-mail-megerősítésre váró regisztráló | Kitöltötte és elindította a regisztrációt, de még nem erősítette meg az e-mail-címét. Nincs elbírálandó tagsági jelentkezése. |
| Tagjelölt | E-mailben megerősített jelentkezése elbírálás alatt áll. |
| Elfogadott, fizetésre vár | Jelentkezését elfogadták, de az aktiváláshoz szükséges első tagdíjat még nem fizette be. |
| Aktív tag | Díjmentes kategóriában elfogadott, vagy díjköteles kategóriában elfogadott és az érvényes tagsági időszak díját megfizető felhasználó. |
| Elutasított jelentkező | Jelentkezését elutasították; a fiókjából új jelentkezést indíthat. |
| Lejárt tagságú felhasználó | Korábbi tagsága lejárt. Fiókja és saját profilja megmaradt, tagi jogosultságai megszűntek. |

A vezetői, elnökségi vagy bizottsági tisztség szervezeti adat. Nem azonos az adminisztrátori jogosultsággal. Jelentkezést elfogadni vagy elutasítani, illetve tagsági kategóriát módosítani adminisztrátori jogosultsággal lehet. A tisztség önmagában nem biztosít adminisztrátori hozzáférést.

### 1.3. Hozzáférési szabályok

Minden aktív tag azonos hozzáférést kap a rendszerben közzétett tagi szakmai anyagokhoz és dokumentumokhoz, valamint a tagi névjegyzékhez. A hozzáférés nem függ a tagsági kategóriától. A teljes névjegyzék az összes megjelenést engedélyező aktív tagot tartalmazza; az elrejtett tagokat más tag sem láthatja benne.

| Funkció | Látogató | Tagjelölt vagy fizetésre váró | Aktív tag | Elutasított vagy lejárt tagságú |
| --- | --- | --- | --- | --- |
| Publikus oldalak és publikus anyagok | Igen | Igen | Igen | Igen |
| Saját jelentkezés állapota | Nem | Igen | Saját tagsági állapot | Igen, ha van korábbi jelentkezés |
| Tagi anyagok teljes tartalma | Nem | Nem | Igen | Nem |
| Tagi névjegyzék, keresés és tagi profilok | Nem | Nem | Igen | Nem |
| Első tagdíj befizetése | Nem | Elfogadás után | Nem releváns | Elutasítás után új elfogadás szükséges |
| Megújítás vagy lejárt tagság újrafizetése | Nem | Nem | Megújításkor | Lejárt tagság esetén igen |
| Munkacsoport-csatlakozás | Nem | Nem | Jogosult; folyamata még nyitott | Nem |

**Ügyféllel elfogadtatandó javaslat – ND-08:** a tagjelölti állapot nem ad hozzáférést a tagi dokumentumokhoz, névjegyzékhez vagy más tagi funkcióhoz. A jelen dokumentum ezt a működést írja le; ennek ügyféloldali elfogadása szükséges.

Külön kedvezményfunkció, kuponkezelés és önálló tagi szolgáltatáskatalógus nem készül. A tagsági kategóriához tartozó díj vagy díjmentesség a tagdíjkezelés része. A tagsági kategóriák szervezeten belüli, például közgyűlési jogosultságai tájékoztató tartalomként jelenhetnek meg; online szavazási funkció nem része ennek a leírásnak.

## 2. Navigáció és általános működés

### 2.1. Oldalak és belépési pontok

A publikus navigációból elérhető a Főoldal, A Társaságról, Tagság, Munkacsoportok, Aktualitások, Szakmai anyagok, Díjazottak és elismerések, valamint Kapcsolat oldal. A fejléc logója a főoldalra vezet. A tagsági jelentkezés és a bejelentkezés jól felismerhető belépési pontot kap.

Bejelentkezés után a Saját fiók mindig elérhető. Az aktív tag ezen felül eléri a Tagi névjegyzéket. A tagi névjegyzék nem publikus oldal; tartalma bejelentkezés nélkül és inaktív tagsággal közvetlen hivatkozásról sem olvasható.

Önálló részletes oldala van a hírnek, eseménynek és megjelenést engedélyező tagi profilnak. A szakmai anyagokhoz, munkacsoportokhoz, partnerekhez és díjazottakhoz nem készül külön részletező oldal. A konferencia belépési pontjai a 11. fejezet kidolgozásakor kerülnek véglegesítésre.

A láblécből közvetlenül elérhető az Impresszum, az Adatkezelési tájékoztató és a Süti-tájékoztató. Ezek önállóan hivatkozható tájékoztatók. Mobilon a menü nyitható és bezárható; a navigáció minden képernyőméreten ugyanazokat a jogosultsági szabályokat követi.

### 2.2. Listák, keresés és lapozás

A hírek, az eseménylisták, a szakmai anyagok és a tagi névjegyzék hosszabb listái számozott lapozást kapnak. A lapozó mutatja az aktuális oldalt, és lehetővé teszi az előző vagy következő oldal, illetve egy oldalszám kiválasztását. Ha minden találat elfér egy oldalon, lapozó nem jelenik meg. A javasolt oldalméretek a 13.4. fejezetben szerepelnek jóváhagyandó paraméterként.

A keresés és szűrés a teljes, az adott felhasználó által elérhető állományon működik. Feltételváltáskor a lista az első találati oldalra áll. A lapozás megtartja a keresési és szűrési feltételeket. A részletes oldalról a listához visszatérve a korábbi listaállapot visszaállítható.

A tagi névjegyzék kereshető. A szakmai anyagok cím alapján kereshetők és kategória szerint szűrhetők; további keresési mező vagy szűrő nem készül. A bemutatkozó oldalak, munkacsoportok és a főoldali előnézetek nem kapnak lapozót. Teljes webhelyre kiterjedő globális kereső nem készül ebben a változatban.

### 2.3. Általános visszajelzések

A rendszer elkülöníti a betöltést, az üres listát, a sikertelen műveletet és a jogosultsághiányt. Kötelező vagy hibás adat esetén a visszajelzés az érintett mezőhöz kapcsolódik. Sikertelen mentéskor a nem érzékeny kitöltött mezők megmaradnak; a jelszót nem tölti vissza a rendszer.

A tagi tartalom megnyitásakor a be nem jelentkezett látogató belépési lehetőséget kap. A bejelentkezett, de nem aktív tag a saját állapotának megfelelő tájékoztatást kap; lejárt tagságnál ez a tagdíjfizetésre is elvezet. A már jelentkezett felhasználót a rendszer nem irányítja új fiók létrehozására.

Nem létező vagy visszavont tartalom nem jeleníthető meg. Az elrejtett személy profiljánál a visszajelzés nem árul el nevet vagy más profiladatot.

## 3. Főoldal

### 3.1. Szerkezet és bemutatkozás

A főoldal sorrendben a hero blokkot, a Társaság rövid bemutatását, az Aktualitások előnézetét, a Munkacsoportok előnézetét, a hírlevél-feliratkozást és a partneri szakaszt tartalmazza.

A hero blokk egy kiemelt képet, szerkeszthető főüzenetet, rövid bevezetőt és egy elsődleges „Csatlakozom a MAVET-hez” gombot jelenít meg. A gomb a tagsági jelentkezéshez vezet. Már bejelentkezett felhasználónál a saját tagsági állapothoz illeszkedő fióknézet nyílik meg; meglévő aktív tagsághoz nem indul új jelentkezés.

A rövid bemutatkozó blokk legfeljebb két rövid bekezdésből és az „Ismerje meg a Társaságot” hivatkozásból áll. A hivatkozás az A Társaságról oldalra vezet. A teljes küldetésnyilatkozat és történet azon az oldalon olvasható.

### 3.2. Aktualitások előnézete

A blokk összesen legfeljebb hat kártyát mutat rácsos elrendezésben. Asztali nézetben nincs oldalirányú kártyalapozó; mobilon a kártyák egymás alatt jelennek meg.

Az admin egy közzétett hírt vagy aktuális eseményt jelölhet ki kiemeltként. A kiemelés első helyen, vizuálisan megkülönböztetve jelenik meg. A többi hely automatikusan töltődik: először a folyamatban lévő és közelgő események az 5. fejezet szerinti sorrendben, majd a legfrissebb hírek kerülnek be. Egy tartalom csak egyszer szerepelhet. Kiemelés nélkül mind a hat hely automatikus.

Ha a kiemelt esemény korábbivá válik, vagy a kijelölt tartalmat visszavonják, a kiemelés megszűnik a főoldalon, és a helyét az automatikus lista tölti fel. Ha hatnál kevesebb elem áll rendelkezésre, a rendszer csak ezeket mutatja; nincs üres kártya. Ha nincs megjeleníthető hír vagy aktuális esemény, a blokk rejtve marad.

A kártya a típust, címet, rövid összefoglalót és releváns dátumot mutatja; eseménynél a megadott helyszínt is. A kép hiányában egységes alapértelmezett kép használatos. A kártyáról a részletes oldal, az „Összes aktualitás” hivatkozásról az Aktualitások oldal nyílik meg.

### 3.3. Munkacsoportok előnézete

Az admin három vagy négy munkacsoportot választhat ki a főoldalra. Ha ennél kevesebb megjeleníthető elem van, csak a rendelkezésre álló elemek jelennek meg. Egy kártya nevet, rövid leírást és opcionális képet tartalmaz. Csoportvezető neve a főoldali kártyán nem jelenik meg.

A kártya a Munkacsoportok oldal megfelelő szakaszához vezet. Az „Összes munkacsoport” a teljes oldalt nyitja meg. A főoldalról közvetlen csatlakozás nem indul. Üres állomány esetén a blokk nem jelenik meg.

### 3.4. Hírlevél és partnerek

A hírlevélblokk tagság nélkül használható; működését a 10. fejezet írja le.

A partneri szakasz szerkeszthető bevezetőt, partnerneveket, opcionális logókat és opcionális külső hivatkozásokat tartalmaz. A külső hivatkozások új böngészőfülön nyílnak meg. Nem készül külön partnerlista- vagy partner-részletező oldal. Partneri adat nélkül a szakasz rejtve marad.

A főoldal képei, szövegei, kiemelése és partneradatai adminisztrátori jogosultsággal szerkeszthetők. A gombok funkciója a fent meghatározott felhasználói utakhoz kötött.

## 4. Bemutatkozó és tájékoztató oldalak

### 4.1. A Társaságról

Az oldal egyetlen publikus oldalon, belső horgonyos navigációval mutatja be a küldetést és jövőképet, a történetet, a vezetőséget és bizottságokat, valamint az alapszabályt és hivatalos dokumentumokat. A küldetés és a történet szerkeszthető szöveg, amelyhez képek kapcsolhatók.

A vezetőségi és bizottsági kártya nevet, tisztséget, engedélyezett portrét és a megfelelő profilra mutató hivatkozást jelenít meg. Csak aktív és megjelenést engedélyező személy szerepelhet. A megjelenés kikapcsolása a teljes kártyát, a nevet és a profilhivatkozást is eltávolítja; a vezetői tisztség nem kivétel. A bizottság neve és feladatleírása önálló szervezeti tartalomként ettől még megjelenhet.

A hivatalos dokumentumok listájában cím, rövid leírás, dátum vagy verzió és megnyitási vagy letöltési lehetőség szerepel. Az alapszabály kiemelt elem. Ide kizárólag publikus dokumentum kerül; a belső dokumentumok a Szakmai anyagok modulban kezelendők.

A szövegek, bizottságok, tisztségek és dokumentumok szerkeszthetők. A vezetőségi és bizottsági tagok név szerint, a bizottságok megnevezésük szerint automatikusan ABC-sorrendben jelennek meg; ez a sorrend nem módosítható kézzel. Csak aktív és megjelenést engedélyező személy jelenik meg. A bizottságok és induló dokumentumok tartalomátadási kérdéseit ND-26 és ND-29 tartalmazza.

### 4.2. Tagság

A publikus Tagság oldal bemutatja a csatlakozás célját és előnyeit, a tagsági kategóriákat, a tagdíjakat és a jelentkezés rövid menetét. A kategóriák áttekinthető blokkokban jelennek meg, szerkeszthető leírással és jóváhagyott díjinformációval.

A bemutatott kategóriák: rendes, hallgatói, ifjúsági, érdemes, tiszteletbeli és pártoló tagság. A publikus természetes személy jelentkezési folyamatot a 7. fejezet határozza meg. Érdemes és tiszteletbeli tagsághoz nem jelenik meg önjelentkezési gomb a létrejöttük szabályának tisztázásáig (ND-06). Szervezeti pártoló tagság nem vezethető a természetes személy űrlapjára (ND-07).

A tagdíjösszegek és érvényességi időszakok a fizetéshez használt beállításokból jelennek meg, hogy a tájékoztató és a fizetendő összeg ne térjen el. A díjmentességet egyértelműen jelölni kell; hiányzó díj nem értelmezhető nulla forintként. A díjak véglegesítése ND-33 tárgya.

A folyamat rövid összefoglalása: kategóriaválasztás és adatlap; e-mail-megerősítés; elbírálás; elfogadás után díjmentes aktiválás vagy tagdíjfizetés. Az oldalról a közös jelentkezés indítható. Külön űrlap, FAQ-modul vagy kedvezménykezelés nem készül ezen az oldalon. A bemutató szövegek szerkeszthetők.

### 4.3. Munkacsoportok

A publikus oldal bevezető szöveget és munkacsoportkártyákat tartalmaz. A munkacsoport témája, rövid leírása, megjeleníthető vezetője és opcionális képe látható.

A kiinduló munkacsoport-témák: Telemedicina; Mesterséges intelligencia; Point of Care és eszközfejlesztés; Kompetenciafejlesztés és hatáskörbővítés; Ellátásszervezés és menedzsment; Humánerőforrásmenedzsment és utánpótlás; Kutatás-fejlesztés; Életmódorvostan és Longevity. A megnevezések, leírások, képek és megjelenési sorrend szerkeszthetők. Hiányzó mező nem jelenik meg üres címkével.

Munkacsoporthoz csak aktív tag csatlakozhat, tagsági kategóriától függetlenül. Be nem jelentkezett látogató belépési vagy jelentkezési lehetőséget kap; tagjelölt a saját folyamatára, lejárt tagságú felhasználó a megújításra vonatkozó tájékoztatást látja.

**Nyitott döntés – ND-30:** a csatlakozás továbbított érdeklődés, automatikus munkacsoport-tagság vagy jóváhagyást igénylő kérelem legyen-e; ki tartja nyilván a tagságot, hogyan lehet kilépni, és milyen értesítés szükséges. A munkacsoport-tagság szervezeti adat, amelyet a tag nem írhat át a profiljában. A csatlakozás gombjának végleges eredménye e döntés lezárásával kerül a specifikációba. Belső chat, fórum és együttműködési felület jelenleg nem meghatározott funkció.

### 4.4. Díjazottak és elismerések

Az oldal díjtípusonként, azon belül év szerint sorolja fel a díjazottakat. A díjtípus neve és leírása, az év és a díjazott neve kezelhető; az évek legújabbal kezdve jelennek meg. Egy évhez több díjazott is tartozhat, és személy, szervezet vagy szerzői közösség neve is megadható. A díjazotti bejegyzés nem hoz létre tagi fiókot.

A díjtípusok: MAVET Díj; MAVET Közösségért Díj; MAVET Ifjúsági Díj; MAVET Életműdíj; Kiemelkedő Tudományos Közlemény Díj; Örökös Tiszteletbeli Elnök. A bevezető, a díjleírások, az éves bejegyzések és a sorrend szerkeszthető. Üres évhelyőrzők és hiányos díjazotti bejegyzések nem jelennek meg.

A Díjazottak és elismerések publikus oldal. Külön díjazotti részletező oldal nem készül. A díjazotti bejegyzés nem hivatkozik tagi profilra, ezért a tag profiljának megjelenési beállítása a díjazotti névbejegyzést nem érinti. Az esetleges fénykép és szakmai önéletrajz megjelenési módja ND-34 alatt tisztázandó.

### 4.5. Kapcsolat és jogi tájékoztatók

A publikus Kapcsolat oldal a Társaság nevét, megadott címét, kapcsolati e-mail-címét, megadott telefonszámát és hivatalos közösségimédia-hivatkozásait mutatja. Ezek adminisztrátori jogosultsággal szerkeszthetők.

Az üzenetküldő űrlap kötelező mezői: név, e-mail-cím, üzenet és az adatkezelési tájékoztatóhoz kapcsolódó nyilatkozat. A tájékoztató közvetlenül megnyitható. A rendszer ellenőrzi a kitöltést és az e-mail formátumát, majd a beállított címzettnek továbbítja az üzenetet. Siker vagy hiba az űrlap helyén jelenik meg. Sikertelen küldéskor a kitöltött adatok megmaradnak. A feladónak külön automatikus másolatküldés nem része az alapfolyamatnak.

Az Impresszum, az Adatkezelési tájékoztató és a Süti-tájékoztató szerkeszthető szöveges tartalom. Végleges szövegük és a nyilatkozatok szövegezése ügyféloldali jóváhagyást igényel. A sütibeállítások működését a 12. fejezet rögzíti.

## 5. Aktualitások

### 5.1. Oldalszerkezet

Az Aktualitások közös publikus oldalán két tartalmi szakasz szerepel. Elöl a folyamatban lévő és közelgő események listája jelenik meg, alatta a hírek. Ha nincs aktuális esemény, a hírek kerülnek felülre. A korábbi eseményeket külön „Korábbi események” nézetből lehet megnyitni, ahonnan vissza lehet térni az aktuális listához.

Nem készül azonos funkciójú további „Összes / Hírek / Események” szűrősor. A két szakasz külön címet és saját listát kap. A hosszú esemény- és hírlisták egymástól függetlenül lapozhatók a 2.2. fejezet szerint. Üres hírállománynál rövid tájékoztatás jelenik meg; a korábbi események akkor is elérhetők, ha nincs aktuális esemény.

### 5.2. Időrend és események besorolása

Eseményhez kezdő dátum kötelező, kezdő időpont megadható. Többnapos eseménynél záró dátum is megadható; ez nem lehet a kezdésnél korábbi. Egyetlen dátummal az esemény az adott nap végéig aktuális. Záró dátum időpont nélkül a zárónap végét jelenti. Megadott befejezési időpont esetén addig aktuális. Az időbeli besorolás magyarországi helyi idő szerint történik.

A folyamatban lévő események szerepelnek először, majd a közelgők kezdő dátum szerint növekvő sorrendben. A korábbi események nézetében a legutóbb véget ért esemény jelenik meg elöl. A hírek a közzétételi dátumuk szerint csökkenő sorrendben jelennek meg. Azonos dátumnál rögzített belső sorrend biztosítja, hogy lapozáskor a találatok ne ugráljanak.

A befejezett esemény automatikusan átkerül a korábbi események közé, de részletes oldala és hivatkozása megmarad. A korábbivá válás nem jelent tartalom-visszavonást. A lejárt eseményen jelentkezési felhívás nem jelenik meg; a leírás továbbra is olvasható.

### 5.3. Kártyák és részletes oldalak

A hírkártya címet, rövid összefoglalót, közzétételi dátumot és opcionális képet tartalmaz. Az eseménykártyán cím, rövid összefoglaló, dátum vagy időszak, megadott helyszín és opcionális kép szerepel. A kártya a saját részletes oldalra vezet. A listaoldalon kép nélkül is megjelenhet a kártya.

A hír részletes oldala a címet, dátumot, összefoglalót, teljes cikket és megadott képet mutatja. Hírhez kapcsolódó hivatkozás és dokumentum nem csatolható. Az esemény részletes oldala a címet, időpontokat, helyszínt, leírást és megadott képeket mutatja, továbbá aktuális eseménynél opcionális jelentkezési vagy információs hivatkozást. Külső jelentkezési link megnyitása önmagában nem jelent MAVET-rendszerben kezelt eseményregisztrációt.

Mindkét oldal önállóan hivatkozható, és visszavezet a listához. Csak közzétett tartalom olvasható. Hír vagy esemény létrehozható, szerkeszthető, közzétehető és visszavonható. Visszavonás után a listákból és a főoldalról is eltűnik, közvetlen hivatkozással sem érhető el.

## 6. Szakmai anyagok és dokumentumok

### 6.1. Tartalmi kör

A közös anyagtár szakmai ajánlásokat, előadásokat, publikációkat, videókat, betegedukációs anyagokat és letölthető dokumentumokat kezel. A belső szervezeti dokumentumok is itt szerepelnek, tagi hozzáféréssel; nem készül külön belső dokumentumtár. A nyilvános hivatalos dokumentumokra az A Társaságról oldal is hivatkozhat.

Egy anyag egy kategóriába sorolható. A kategória szűrésre szolgál, nem határozza meg a hozzáférést vagy a technikai formát. Az anyag formája dokumentum vagy beágyazott videó. A dokumentum feltöltött fájlja vagy külső hivatkozása új böngészőfülön nyílik meg; a támogatott szolgáltató videója közvetlenül az anyaglistában ágyazható be. A beágyazható szolgáltatók és fájlkorlátok ND-37 tárgyai. Saját videófeltöltő és videófeldolgozó funkció nem készül ebben a változatban.

### 6.2. Adatok és közzététel

Kötelező a cím, kategória, rövid összefoglaló, az anyag formája, a hozzá tartozó fájl vagy videóhivatkozás, valamint a hozzáférési szint. Opcionális a szerző és a megjelenési dátum. Többfájlos csomag és további csatolmánykezelés nem része az anyag alapmodelljének.

Az admin létrehozhatja és szerkesztheti az anyagot, továbbá külön kapcsolóval közzéteheti vagy elrejtheti. Új anyag alapértelmezetten rejtett. Közzétételhez minden kötelező adatnak rendelkezésre kell állnia. Az elrejtett anyag nem szerepel a listában, saját tárolású fájlja más felhasználók számára nem érhető el. Az elrejtés nem törlés: az anyag később újra közzétehető.

### 6.3. Hozzáférés

Anyagonként két hozzáférési szint választható: „Publikus” és „Csak aktív tagoknak”. Minden aktív tag eléri az összes közzétett tagi anyagot. Tagjelölt, fizetésre váró, elutasított és lejárt tagságú felhasználó csak a publikus teljes tartalmakhoz fér hozzá, az ND-08 javaslat szerint.

**Nyitott döntés – ND-35:** a tagi anyagok címe, összefoglalója és kártyája megjelenjen-e a publikus listában zárolt előnézetként, vagy az anyag létezése is csak aktív tagnak legyen látható. A döntéstől függetlenül a teljes tartalom és a saját tárolású fájl nem adható át jogosulatlanul.

A hozzáférés ellenőrzése a saját tárolású fájl tényleges megnyitására is kiterjed. Publikusból tagivá tett anyag új megnyitása már tagi jogosultságot igényel. Korábban letöltött példányt a rendszer nem tud visszavonni. Külső tartalomnál a MAVET a hivatkozás vagy beágyazás saját felületén való megjelenését szabályozza.

### 6.4. Lista és megnyitás

A lista cím szerinti keresővel, kategóriaszűrővel és számozott lapozással használható. A kártya címet, kategóriát, összefoglalót, tartalomformát és megadott dátumot mutat. A tagi hozzáférési jelölés a látható kártyán jelenik meg. Üres találati listánál egyértelmű üres állapot látható.

A dokumentum megnyitása vagy letöltése új böngészőfülön történik, a videó pedig a listában jelenik meg beágyazva; külön szakmaianyag-részletező oldal nem készül. Hiányzó, elrejtett vagy megszűnt anyag nem nyitható meg. Külső szolgáltatói kiesés nem változtatja meg a tagsági jogosultságot. A tagok saját dokumentumot nem tölthetnek fel ebbe a modulba.

## 7. Regisztráció és tagsági jelentkezés

### 7.1. Jelentkezési kategóriák és adatlap

A természetes személyek publikus jelentkezési kategóriái: rendes, hallgatói, ifjúsági és természetes személy pártoló tagság. Az érdemes és tiszteletbeli tagság létrejötte ND-06, a szervezeti pártoló tagság adatai és kezelése ND-07 szerint tisztázandó.

A kategória kiválasztása után a rendszer megjeleníti a feltételeket és a kategóriához tartozó mezőket. A regisztráció és a tagsági jelentkezés egy folyamat; önálló, általános regisztráció ezen kívül nem indul.

| Adat | Kötelezőség és működés |
| --- | --- |
| Teljes név | Kötelező. |
| Születési dátum | Kötelező; érvényes, nem jövőbeli dátum. |
| Levelezési cím | Kötelező; irányítószám, település, cím és ország. |
| E-mail-cím | Kötelező; a fiók belépési azonosítója. |
| Telefonszám | Kötelező. |
| Szakterület | Kötelező; hallgatónál tanulmányi területként értelmezhető. |
| Munkahely | Hallgatói kategóriában nem kötelező, a jelentkezéshez nem szükséges megadni. Más kategóriában a munkahellyel nem rendelkezők kezelése ND-39 szerint tisztázandó. |
| Tagsági kategória | A publikus jelentkezéshez választható kategóriák egyike. |
| Jelszó és ismétlése | Új fióknál kötelező; a két értéknek egyeznie kell. |
| Alapszabály és adatkezelési nyilatkozat | Külön, kötelező jelölések, megnyitható tájékoztatókkal. |

A profilkép, a bemutatkozás és az érdeklődési területek nem feltételei a jelentkezésnek. Hallgatói jogviszonyt igazoló fájlt a rendszer nem kér és nem kezel. A rendes és ifjúsági tagság nagykorúsághoz kötött; az ifjúsági felső korhatár ellenőrzése a születési dátum alapján történik. Az érdemes kategória feltételeit és esetleges létszámkorlátját a szervezet ellenőrzi; ehhez a rendszer nem végez automatikus ellenőrzést. A korhatár, a hallgatói feltétel és a későbbi kategóriaváltás részletei ND-24 és ND-39 alatt véglegesítendők.

### 7.2. Beküldés és e-mail-megerősítés

A jelentkező egyetlen regisztrációs művelettel adja át a teljes kötelező adatlapot. A rendszer ellenőrzi az adatokat, és egyszer használható, lejáró e-mail-megerősítő hivatkozást küld. A hivatkozás sikeres használata automatikusan létrehozza a tagjelölti jelentkezést; további „Jelentkezés beküldése” művelet nincs.

A beadott jelentkezés adatai ettől kezdve nem szerkeszthetők a jelentkező által. A rendszer visszaigazolást küld, és a saját fiókban megjeleníti az „Elbírálás alatt” állapotot és a beküldött adatokat. Hiányos vagy e-mailben nem megerősített regisztráció nem hoz létre elbírálandó jelentkezést. Lejárt hivatkozásnál új megerősítés kérhető.

Egy e-mail-címhez egy fiók tartozhat. Meglévő fiók esetén bejelentkezés vagy jelszó-visszaállítás után folytatható az állapotnak megfelelő művelet. A publikus válasz nem teszi közzé, hogy a cím szerepel-e a nyilvántartásban.

### 7.3. Elbírálás

Az admin a beküldött jelentkezést fogadja el vagy utasítja el. A folyamat nem tartalmaz jelentkező által szerkeszthető hiánypótlást, és nem indokolja hibás adatok miatt a jelentkezés előzetes elfogadását. A későbbi sajátprofil-módosítás nem írja át a már elbírált jelentkezést.

Díjmentes kategória elfogadása automatikus aktív tagságot eredményez. Díjköteles kategória elfogadása „Elfogadott, fizetésre vár” állapotot és fizetési felhívást eredményez. A döntésről a felhasználó e-mailt kap, állapota a fiókjában is látható.

Az admin az elfogadáskor és a későbbi tagság során is módosíthat tagsági kategóriát. A kategóriát a tag nem módosíthatja. A változtatás hatálybalépése, az eltérő díj és a már befizetett időszak kezelése ND-24 alatt tisztázandó; automatikus díjkülönbözet-elszámolás nem feltételezett funkció.

### 7.4. Elutasítás és új jelentkezés

Elutasításkor a fiók megmarad, a döntés megtekinthető, és tagi hozzáférés nem keletkezik. A felhasználó ugyanazzal az e-mail-címmel, a meglévő fiókjába belépve új jelentkezést indíthat. Nem szükséges és nem is hozható létre második fiók.

Az új jelentkezés új adatlap, amely a véglegesítésig szerkeszthető. Beküldése új tagjelölti állapotot hoz létre; a korábbi jelentkezés és döntése nem íródik felül. A már megerősített, változatlan e-mail-címet nem kell újra megerősíteni. Egy fiókhoz egyszerre legfeljebb egy elbírálás alatt vagy első fizetésre váró jelentkezés tartozhat. Elutasításból nem történik automatikus átsorolás pártoló tagnak.

## 8. Tagdíjfizetés és tagsági megújítás

### 8.1. Fizetési szolgáltató és első tagdíj

A tagdíjfizetés szolgáltatója a SimplePay. Díjköteles, elfogadott jelentkezésnél a saját fiók megjeleníti a kategóriát, a fizetendő összeget, a kapcsolódó időszakot és a fizetés indításának lehetőségét. Az e-mailes felhívás ugyanennek a fiókbeli műveletnek az elérését biztosítja.

A felhasználó a SimplePay fizetési folyamatában teljesíti a befizetést, majd visszatérhet a MAVET oldalára. A visszatérő oldal önmagában nem igazolja a fizetést: a rendszer a szolgáltató ellenőrzött sikeres visszaigazolása alapján aktiválja a tagságot. Később érkező visszaigazolásnál a felület feldolgozás alatti állapotot mutat. Sikertelen vagy megszakított fizetés után a fiókból újra lehet próbálkozni.

Ugyanazon sikeres befizetés ismételt szolgáltatói visszaigazolása nem aktiválhat vagy hosszabbíthat újra tagságot, és nem küldhet újabb sikerlevelet. A már rendezett díjtételhez új fizetés nem indítható. Az első befizetés határideje az elfogadástól számított 14 nap. A rendszer 7 nap elteltével, majd a határidő lejárta előtt 1 nappal automatikus emlékeztetőt küld. Az elmaradó első befizetés következménye ND-01 alatt marad nyitott.

### 8.2. Éves megújítás

A díjköteles aktív tagsághoz lejárati időpont tartozik. A lejárat előtt X nappal a rendszer egy értesítőt és befizetési felhívást küld a tagnak. Az X nap értékét az ügyfél határozza meg (ND-38). A levélben az összeg, az érintett időszak, a határidő és a fiókbeli fizetési lehetőség szerepel. Ugyanez a saját fiókban is megjelenik.

Határidőben teljesített, visszaigazolt befizetés a következő időszakra megújítja a tagságot. A már kifizetett időszak nem rövidülhet meg a korábbi befizetés miatt. A naptári éves vagy más éves időszak meghatározása, valamint az időszakváltás pontos szabálya ND-33 tárgya.

Ha a tagság lejáratáig nem érkezik be a megújítás sikeres visszaigazolása, a tagság automatikusan lejár. A tagi dokumentumok, a névjegyzék és a tagsághoz kötött funkciók hozzáférése megszűnik; a személy eltűnik a tagi listából, keresőből és esetleges publikus vezetőségi megjelenésből. A fiók és a saját profil megmarad. Nincs automatikusan feltételezett türelmi idő.

Díjmentes kategóriában nincs fizetési felhívás, és a befizetés hiánya miatt nincs lejáratás. Az esetleges jogosultsági feltétel megszűnése kategóriamódosítással rendezendő, az ND-24 szabályai szerint.

### 8.3. Lejárt tagság helyreállítása

A lejárt tagságú felhasználó beléphet a saját fiókjába, megtekintheti és szerkesztheti megőrzött profilját, valamint elindíthatja a tagdíj befizetését. Sikeres, ellenőrzött SimplePay-visszaigazolás után automatikusan újra aktív tag lesz. Nem szükséges új jelentkezés és új adminisztrátori elbírálás.

A rendszer a megfizetett időszakot és az új lejáratot megjeleníti. A névjegyzékbeli és vezetőségi megjelenés az aktív tagság visszaállásával csak akkor tér vissza, ha a felhasználó korábban engedélyezte a megjelenést. A rendszer a kapcsolót nem állítja át helyette.

### 8.4. Bizonylatok és kivételes esetek

A fizetési felhívás a fizetendő összegről és a befizetés indításáról szóló rendszerüzenet. Nem jelenti automatikusan számviteli díjbekérő vagy számla kiállítását. A számla, díjbekérő és egyéb bizonylat kibocsátója, formája, számlázási adatköre és a szükséges integráció ND-17 alatt véglegesítendő.

A visszatérítést, téves vagy többszörös tényleges befizetést, visszaterhelést és a fizetés közbeni fióktörlés következményeit a MAVET a rendszeren kívül intézi; ezekhez nem készül automatikus folyamat. A konferencia fizetése külön kidolgozandó; a jelen fejezet tagdíjról szól.

## 9. Saját fiók és profilok

### 9.1. Bejelentkezés és fiókáttekintés

A felhasználó e-mail-címmel és jelszóval lép be. Hibás belépésnél semleges visszajelzést kap. A saját fiók a jelentkezés vagy tagság aktuális állapotát, az ahhoz tartozó műveleteket és a megadott adatokat mutatja. A kijelentkezés megszünteti az adott böngésző bejelentkezését.

Az elfelejtett jelszó funkció egyszer használható, lejáró hivatkozást küld. A kérelemre adott válasz nem árulja el a fiók létezését. Belépve a jelszó a jelenlegi jelszó és az új jelszó kétszeri megadásával módosítható. Lejárt vagy már felhasznált visszaállító link esetén új kérhető.

### 9.2. Saját profil adatai

Az aktív és a lejárt tagságú felhasználó szerkesztheti személyes és szakmai profiladatait. A tagjelölt és a fizetésre váró jelentkező a beadott jelentkezési adatokat csak olvassa; a jelentkezés szerkesztése nem lehetséges. Az elutasított jelentkező új jelentkezési adatlapot indíthat a 7.4. fejezet szerint.

| Adatkör | Saját szerkesztés | Más felhasználó számára megjeleníthető |
| --- | --- | --- |
| Név | Aktív és korábbi tagként igen | Engedélyezett profilnál kötelező megjelenési adat |
| Profilkép | Feltölthető, cserélhető, törölhető | A tag mezőbeállítása szerint |
| Szakterület, munkahely | Igen | A tag mezőbeállítása szerint |
| Bemutatkozás, érdeklődési területek | Igen | A tag mezőbeállítása szerint |
| Születési dátum és hely | Igen; változás nem sorol át automatikusan | Nem |
| Levelezési cím, telefonszám | Igen | Nem |
| Fiók e-mail-címe | Nem módosítható a felhasználói felületen; szükség esetén a MAVET a rendszeren kívül intézi | Nem |
| Tisztség, tagsági kategória, azonosító | Nem; szervezeti adat | Tisztség a megfelelő bemutatás része; azonosító nem látható |
| Munkacsoport-tagság | Nem; ND-30 szerinti szervezeti adat | A tag mezőbeállítása szerint |
| Díjfizetés és lejárat | Nem; rendszer által kezelt adat | Nem |

A rövid bemutatkozás legfeljebb 500 karakter. A születési hely opcionális profiladat, nem jelentkezési feltétel. A profilképből egy aktuális kép tárolható. Feltöltés után mentés előtt előnézet jelenik meg; a kép cserélhető vagy elvethető. Nem támogatott formátumnál vagy túl nagy fájlnál közérthető hibaüzenet jelenik meg. A fájlkorlát ND-37-ben véglegesítendő. Más saját dokumentum vagy fájl nem tölthető a profilhoz.

A profiladat megváltoztatása nem módosítja visszamenőleg a korábbi jelentkezést, fizetést vagy elbírálási döntést. Szervezeti tisztség, kategória és munkacsoport-tagság nem írható át szabad profilmezőként.

### 9.3. Megjelenés engedélyezése és teljes elrejtés

A profilnak egy közös „Megjelenés engedélyezése” kapcsolója van. Új profilnál a megjelenés alapértelmezetten kikapcsolt; az aktiváló e-mail a saját profilhoz vezet, ahol a tag ezt beállíthatja.

Általános tag bekapcsolt megjelenéssel is csak az aktív tagok számára látható a névjegyzékben és saját részletes profilján. Vezetőségi, elnökségi vagy bemutatott bizottsági tag bekapcsolt megjelenéssel a publikus bemutatkozó oldalon és publikus profilként is megjelenhet. A publikus megjelenést a szervezeti kijelölés és a tag engedélye együttesen teszi lehetővé; általános tagot a kapcsoló nem tesz publikussá.

Kikapcsolt megjelenésnél a személy sem a publikus vezetőségi vagy bizottsági felületen, sem a tagi listában, sem a tagi kereső találatai között, sem közvetlen profilhivatkozáson nem jelenhet meg. Ez a vezetőkre is ugyanúgy vonatkozik. A rendszer más személyi bemutatásban, például munkacsoportvezető neveként sem kerülheti meg ezt a tiltást. A saját fiókban és az adminisztratív nyilvántartásban az adatok megmaradnak.

A változtatás jóváhagyás nélkül, a következő megnyitásokra és lekérésekre azonnal érvényes. A korábban már megjelenített vagy lementett tartalmat a rendszer nem tudja a látogató eszközéről eltávolítani. A rejtettség nem változtatja meg a tag más tartalmakhoz való hozzáférését.

Bekapcsolt megjelenésnél a név a személy azonosításához megjelenik. A tag külön engedélyezheti a portrét, szakterületet, munkahelyet, bemutatkozást, érdeklődési területeket és munkacsoport-tagságot. A vezető ugyanazon engedélyezett profiladatokat mutatja a publikus és a tagi felületen; külön mezőnkénti publikus/tagi beállításrendszer nem készül. A tisztséget az adminisztratív szervezeti adat határozza meg. Kapcsolattartási, születési, azonosító- és fizetési adatok más felhasználóknak nem jelennek meg.

### 9.4. Kereshető tagi névjegyzék

A névjegyzék kizárólag bejelentkezett aktív tagnak elérhető. A lista az aktív, megjelenést engedélyező személyeket név szerinti ábécérendben mutatja, számozott lapozással. A találatban a név és a megjelenésre engedélyezett szakmai adatok láthatók; a találatról a tag részletes profilja nyílik meg.

A névkereső a teljes látható tagállományban keres részleges névegyezéssel, kis- és nagybetűtől függetlenül. Más személy rejtett adatai nem szolgálhatnak keresési feltételként vagy találati kivonatként. Nincs találat esetén üres állapot és a keresés törlésének lehetősége jelenik meg. További kategória-, intézmény- vagy szakterületi szűrő nem készül az induló névjegyzékhez.

### 9.5. Fiók és tagság törlése

A fiókkal rendelkező felhasználó a saját fiókból kezdeményezheti annak végleges törlését. A rendszer a következményeket ismerteti, a jelenlegi jelszót és külön megerősítést kér. A felhasználó a véglegesítés előtt megszakíthatja a műveletet.

Megerősítés után a belépési hozzáférés, az esetleges aktív tagság és a mások számára elérhető profil megszűnik. A rendszer visszaigazoló e-mailt küld. A törölt fiók nem állítható vissza; újbóli csatlakozás új jelentkezést igényel. A kötelezően megőrzendő nyilvántartások elkülönítetten, a meghatározott megőrzési szabály szerint maradhatnak fenn.

A törlés nem azonos a díjnemfizetés miatti lejárattal: lejáratkor a fiók és a profil megmarad. A befizetésekkel és folyamatban lévő ügyekkel kapcsolatos kivételes eseteket a MAVET a rendszeren kívül intézi. Konferencia-regisztráció törlési következményeit a konferenciafejezet kidolgozása rendezi.

## 10. E-mailes kommunikáció és hírlevél

### 10.1. Fiókhoz és tagsághoz kapcsolódó értesítések

A fiók és tagság működéséhez szükséges levelek külön kezelendők a hírlevéltől. A hírlevélről való leiratkozás nem kapcsolja ki a jelszó-visszaállító, jelentkezési vagy fizetési értesítéseket.

| Kiváltó esemény | Címzett | Levél tartalma |
| --- | --- | --- |
| Regisztráció indítása | Jelentkező | E-mail-megerősítő hivatkozás |
| Jelentkezés létrejötte vagy új jelentkezés | Jelentkező | Elbírálás alatti állapot és saját fiók elérése |
| Díjmentes elfogadás | Új aktív tag | Aktiválás és profilbeállítások elérése |
| Díjköteles elfogadás | Elfogadott jelentkező | Összeg, időszak és első fizetési felhívás |
| Első fizetési felhívás után 7 nappal | Fizetésre váró jelentkező | Emlékeztető a befizetésre |
| Első fizetési határidő előtt 1 nappal | Fizetésre váró jelentkező | Utolsó emlékeztető a befizetésre |
| Elutasítás | Jelentkező | Döntés és a saját fiók elérése |
| Sikeres befizetés | Fizető felhasználó | Aktiválás, megújítás vagy helyreállítás; időszak és fiókelérés |
| Lejárat előtt X nappal | Díjköteles aktív tag | Megújítási értesítő és befizetési felhívás |
| Jelszó-visszaállítás kérése | Érintett fiók tulajdonosa | Egyszer használható visszaállító hivatkozás |
| Fióktörlés | Törlő felhasználó | A megszüntetés visszaigazolása |

A fiókbeli állapot az elsődleges tájékoztatási felület: sikertelen e-mail-kézbesítés nem vonja vissza a sikeres elbírálást vagy befizetést. Az e-mailek feladónevét és válaszcímét az ügyfél adja meg.

### 10.2. Hírlevél-feliratkozás és leiratkozás

A publikus feliratkozó űrlap e-mail-címet és külön hírlevél-feliratkozási nyilatkozatot kér, elérhető adatkezelési tájékoztatóval. Érvényes adatokkal a feliratkozás azonnal végleges; nincs megerősítő e-mailes lépés. A feliratkozás nem hoz létre fiókot vagy tagságot.

Már feliratkozott címre nem keletkezik új bejegyzés. A felület semleges sikerüzenetet ad. Hibás vagy hiányos adat esetén nem történik feliratkozás; sikertelen mentéskor a mezők megmaradnak.

A felhasználó a saját fiókjában is kezelheti a saját e-mail-címéhez tartozó feliratkozását. A fiókbeli beállítás és a publikus űrlap ugyanahhoz a feliratkozói nyilvántartáshoz kapcsolódik. A hírlevélben szereplő leiratkozási hivatkozás fiók és bejelentkezés nélkül is használható; leiratkozás után új hírlevél nem küldhető az adott feliratkozás alapján. Újbóli feliratkozás új nyilatkozattal lehetséges.

**Nyitott döntés – ND-44:** a hírlevél szerkesztése és kiküldése külső szolgáltatói felületen vagy a MAVET-rendszeren belül történjen-e, milyen szerkesztési és címzettválasztási funkció szükséges. A feliratkozás leírása nem helyettesíti a teljes hírlevélküldés véglegesítését.

## 11. Konferenciamodul

A konferenciamodul részletes specifikációja még nem készült el. Ebben a fejezetben később kerül meghatározásra a konferencia publikus bemutatása, a jelentkezésre jogosultak köre, a résztvevői adatok, a fizetés, az absztraktbeküldés és a saját konferenciaügyek elérése.

A nem tag résztvevők belépési vagy vendégfolyamata (ND-03 és ND-11), az absztraktbeküldés jogosultsága (ND-12), a jegytípusok és kiegészítők (ND-13), az árképzés (ND-14), valamint a módosítás és lemondás (ND-15) a konferencia kidolgozásakor véglegesítendő. Ezekről a jelen munkaváltozat nem rögzít kész működést vagy automatikus kizárást. Az általános tagi hozzáférések most rögzített szabályai önmagukban nem döntik el a konferenciára jelentkezők körét.

## 12. Közös működési és ellenőrzési követelmények

### 12.1. Szerkeszthetőség és adatkezelés

A bemutatkozó és tájékoztató szövegek, az oldalakon megadott képek, hírek, események, munkacsoport-bemutatások, díjazotti és partneri adatok adminisztrátori jogosultsággal kezelhetők. A szöveg szerkeszthetősége a meghatározott oldalszerkezeten belüli tartalmi módosítást jelenti; nem általános oldalépítő funkció.

Az admin a tagsági jelentkezésekről dönthet, és tagsági kategóriát módosíthat. A tag saját láthatósági kapcsolója a személy publikus és tagi megjelenését egyaránt szabályozza. Az adminisztratív nyilvántartás ettől függetlenül elérhető a feladat ellátására jogosult admin számára.

A nyilatkozatokhoz a megtörtént elfogadás időpontja és a tájékoztató azonosítható változata kapcsolódik. A végleges jogi tartalmakat és adatmegőrzési szabályokat az indulás előtt rögzíteni kell. A jelentkezés olvasási zárolása nem helyettesíti az adatkezelési megkeresések rendezését.

### 12.2. Hozzáférésvédelem és megbízható működés

A tagsági és adminisztratív jogosultságot a rendszer minden védett adatlekérésnél és műveletnél ellenőrzi. A gomb elrejtése önmagában nem hozzáférésvédelem. A névjegyzék, profil és fájl jogosultság nélkül közvetlen hivatkozásról sem adható át. Tagság lejárta vagy profil elrejtése után a korábbi bejelentkezés nem biztosít további jogosulatlan hozzáférést.

A bejelentkezés, regisztráció, megerősítőlevél-kérés és nyilvános üzenetküldés korlátozza az ismételt visszaélésszerű próbálkozásokat. A jelszavak nem olvashatók vissza. A feltöltések ellenőrzött formátummal és méretkorláttal működnek. A nem publikus személyes adatok és a tagi tartalmak nem kerülhetnek publikus listákba vagy jogosulatlan felhasználó számára kiszolgált válaszba.

Fizetési vagy hálózati hiba esetén nincs hamis sikerjelzés. A felhasználó az állapotot a saját fiókjában ellenőrizheti. Külső szolgáltatói visszaigazolás ismétlése nem okozhat duplikált jelentkezést, tagsági időszakot vagy befizetési eredményt.

### 12.3. Használhatóság és tájékoztatók

A felületek mobilon, tableten és asztali képernyőn is használhatók. A menük, űrlapok, kereső és lapozók billentyűzettel kezelhetők, a fókusz látható. A mezők felirattal rendelkeznek, a hibák az érintett mezőhöz kapcsolódnak, a státusz nem csak színnel jelzett. A képekhez a funkciójuknak megfelelő szöveges helyettesítés tartozik. Nem lehet levágott vagy más elem által takart műveleti gomb.

A publikus tartalomoldalak címe és hivatkozása megosztható. A tagi névjegyzék és a nem publikus profil nem szerepelhet publikus keresőindexelésre szánt oldallistában. A nem szükséges sütik és külső beágyazások a jóváhagyott sütibeállítások szerint tölthetők be. Ha hozzájárulást igénylő szolgáltatás nincs használatban, a felület nem kér hozzá felesleges engedélyt. A tényleges beágyazási szolgáltatáskör ND-37 szerint véglegesítendő.

Ez a dokumentum nem állapít meg fejlesztési ütemezést, designjóváhagyási folyamatot vagy díjazást.

### 12.4. Ellenőrizhető működési eredmények

A megvalósítás ellenőrzése az alábbi fő folyamatokra terjed ki. Az ND-azonosítóval jelzett részek csak az érintett döntés lezárása után véglegesíthetők.

1. Hiányos vagy nem megerősített első regisztráció nem hoz létre tagjelölti jelentkezést; teljes regisztráció megerősítése igen.
2. A jelentkező nem szerkesztheti a beadott adatlapját. Az admin elfogadhatja vagy elutasíthatja azt.
3. Elutasítás után ugyanazon fiókból új jelentkezés indítható, a korábbi döntés felülírása nélkül.
4. Díjmentes elfogadás aktivál; díjköteles elfogadás csak fizetési felhívást eredményez. Díjköteles kategóriában az aktiválás csak ellenőrzött sikeres SimplePay-fizetés után történik.
5. Az ND-08 javaslat elfogadásával minden nem aktív állapotban tiltott a tagi anyagok és a tagi névjegyzék hozzáférése.
6. Minden aktív tag azonos jogosultsággal éri el a közzétett tagi anyagokat és a látható tagok teljes névjegyzékét.
7. A megújítási felhívás a rögzített időpontban elkészül; nemfizetéskor a tagság lejár, a saját fiók és profil megmarad.
8. Lejárt tagság új befizetéssel, új elbírálás nélkül helyreállítható. Ismételt fizetési visszaigazolás nem hosszabbít kétszer.
9. A megjelenést kikapcsoló vezető neve, kártyája és profilja sem publikus oldalon, sem a tagi listában vagy keresőben nem érhető el. Általános tag engedélyezett profilja csak aktív tagoknak olvasható.
10. A tag saját tisztségét, kategóriáját és munkacsoport-tagságát nem szerkesztheti.
11. Az Aktualitások oldalon az aktuális események megelőzik a híreket; a befejezett esemény a korábbiak közé kerül, részletes oldala megmarad.
12. A főoldali előnézet legfeljebb hat, ismétlés nélküli kártyából áll; egy kézi kiemelés mellett a többi hely automatikus, oldalirányú lapozás nélkül.
13. A szakmai anyag elrejthető és ismét közzétehető. A saját tárolású tagi fájl közvetlen címről sem olvasható jogosultság nélkül.
14. A névkeresés a teljes látható taglistán működik. Lapozás közben a feltételek megmaradnak, feltételváltás az első oldalra visz.
15. A hírlevél-feliratkozás fiók nélkül működik, nem duplikál címet, a leiratkozás pedig bejelentkezés nélkül is elérhető és nem tiltja le a működéshez szükséges fiókleveleket.
16. A fióktörlés külön megerősítést igényel, megszünteti a hozzáférést és a profilmegjelenést, és nem tévesztendő össze a tagság lejáratával.

## 13. Ügyféllel egyeztetendő döntések és tartalomátadás

### 13.1. Elfogadandó működési javaslatok

**ND-08 – Tagi hozzáférés kezdete.** Elfogadható-e, hogy a tagjelölt még nem fér hozzá tagi dokumentumokhoz, a névjegyzékhez vagy más tagi funkcióhoz, és ezek kizárólag aktív tagsággal nyílnak meg? Ez eltér a korábbi, tagjelölti szolgáltatásokat és kedvezményeket említő elképzeléstől. Javaslat: aktív tagságig nincs tagi hozzáférés. Külön kedvezményfunkció nem készül.

**ND-04 és ND-05 – Egységes digitális hozzáférés.** Elfogadható-e, hogy minden aktív természetes személy tag, kategóriától függetlenül, ugyanazokat a közzétett tagi dokumentumokat és a kereshető tagi névjegyzéket éri el? Javaslat: igen. Az elrejtett személyek nem részei a más tagoknak látható listának. A szervezeti pártoló tagság külön kérdés.

### 13.2. Tagsági és pénzügyi döntések

**ND-01 – Elmaradó első tagdíj következménye.** Javaslat: az első befizetés határideje az elfogadástól számított 14 nap; a rendszer 7 nap után, majd a határidő lejárta előtt 1 nappal automatikus emlékeztetőt küld. Tisztázandó, hogy a 14 nap eredménytelen elteltével meddig maradhat a jelentkezés fizetésre váró állapotban, illetve milyen állapotba kerüljön.

**ND-06 – Érdemes és tiszteletbeli tagság.** Ki kezdeményezi és milyen módon jön létre? Javasolt az admin által rögzített szervezeti döntés, publikus önjelentkezés nélkül. Szükséges-e új személy meghívása, vagy csak meglévő tag átsorolása történik?

**ND-07 – Szervezeti pártoló tag.** A szervezetnek kell-e saját belépés és tagi funkció, vagy elegendő a szervezet és kapcsolattartója nyilvántartása? Milyen adatok, képviseleti lehetőségek és digitális jogosultságok szükségesek? Több képviselős szervezeti fiókot a jelen változat nem feltételez.

**ND-17 – Számla és díjbekérő.** Ki állítja ki, milyen rendszerben, milyen adatokból, és mit kell a MAVET-rendszernek automatikusan előállítania vagy továbbítania? Szükséges-e külső számlázó-integráció? A SimplePay-fizetés szolgáltatója meghatározott; a bizonylatolási folyamat még nem.

**ND-24 – Kategóriaváltás.** A kategóriát az admin módosítja. Mikortól hatályos a változtatás, hogyan érinti az aktuális és következő díjat, és mi történik hallgatói jogviszony megszűnésekor vagy az ifjúsági korhatár elérésekor? Javasolt az admin által kezelt változtatás, automatikus díjkülönbözet-számítás nélkül.

**ND-33 – Díjak és éves időszak.** Kategóriánként mekkora a díj, mi a pénznem, mely kategóriák díjmentesek, és naptári évre vagy más éves időszakra szól-e a befizetés? Lejárat utáni befizetésnél mikor kezdődik az új időszak? A fizetési felhívás és az éves lejárat pontos működéséhez ezek szükségesek.

**ND-38 – Megújítási értesítés.** Lejárat előtt hány nappal küldjük az egy értesítőt és befizetési felhívást? A határidő elmulasztásakor a tagság automatikusan lejár; a saját fiókból befizetéssel helyreállítható.

**ND-39 – Jelentkezési feltételek és mezők.** A hallgató nem köteles munkahelyet megadni. Más kategóriákban hogyan jelölhető, ha a jelentkezőnek nincs munkahelye? Megerősítendő a jelentkezési mezők kötelezősége, a hallgatói kategória feltétele és az ifjúsági korhatár pontos szabálya. Az érdemes kategória feltételeit és esetleges létszámkorlátját a szervezet ellenőrzi; ehhez nem készül automatikus rendszerellenőrzés.

### 13.3. Tartalom és további működés

**ND-30 – Munkacsoport-csatlakozás.** Szándék továbbítása vagy nyilvántartott munkacsoport-tagság szükséges? Automatikus a csatlakozás vagy jóváhagyásos? Ki kezeli, hogyan lehet kilépni, milyen visszajelzés és értesítés szükséges? A profilban a munkacsoport-tagság szervezeti adat marad.

**ND-35 – Tagi anyagok előnézete.** A nem aktív látogató lássa-e a tagi anyag címét és összefoglalóját például lakatos kártyán, vagy az anyag egyáltalán ne jelenjen meg számára? A belső szervezeti dokumentumokra is ugyanaz a szabály vonatkozzon-e?

**ND-37 – Fájlok és beágyazások.** Milyen dokumentumformátumokat és maximális méreteket kell kezelni, hol tároljuk a fájlokat, és mely külső videószolgáltatók beágyazása szükséges?

**ND-44 – Hírlevélküldés.** Hol történjen a levél szerkesztése és kiküldése, kell-e címzettcsoport, időzítés vagy más kampányfunkció? A feliratkozás és leiratkozás leírt működése mellett ezt külön kell véglegesíteni.

### 13.4. Javasolt alapparaméterek

Az alábbi értékek szerkesztési és megvalósítási javaslatok, nem korábban jóváhagyott ügyfélkövetelmények. Az elfogadás előtt véglegesítendők.

| Paraméter | Javasolt érték |
| --- | --- |
| Hírek és események oldalanként | 12 elem, listánként |
| Szakmai anyagok oldalanként | 12 elem |
| Tagi névjegyzék oldalanként | 20 személy |
| E-mail-megerősítő hivatkozás | 24 óráig használható |
| Jelszó-visszaállító hivatkozás | 1 óráig használható |
| Profilkép | JPEG, PNG vagy WebP; legfeljebb 5 MB |
| Névkeresés | Részleges névegyezés, kis- és nagybetűtől függetlenül |

A jelentkezési és tartalmi mezők további karakterkorlátai, a jelszókövetelmény és a dokumentumfájlok korlátai a mezőjegyzék véglegesítéséhez még rögzítendők. A profilbemutatkozás 500 karakteres korlátja a 9.2. fejezetben szerepel.

### 13.5. Átadandó tartalmak

A szerkeszthető tartalmak pontos szövege nem jelent új működési kérdést. Az induló feltöltéshez szükséges a jóváhagyott logó és képek, a bemutatkozó szövegek, kapcsolati adatok, tagdíjak, munkacsoport-leírások és vezetők, partneradatok, valamint az induló hírek, események és szakmai anyagok átadása.

**ND-26 – Bizottságok:** induló csoportok, feladatleírások és személyi összetétel. **ND-29 – Hivatalos dokumentumok:** az alapszabály és további publikus dokumentumok végleges fájljai. **ND-34 – Díjazottak:** végleges bevezető szöveg és valós éves bejegyzések; a fénykép és önéletrajz szükségessége és megjelenítése még működési döntés is.

Az eredeti anyagokban szereplő évhelyőrzők és hiányzó nevek nem tölthetők fel valós adatként. A rendszer az üres tartalmi mezőket az adott modul szabálya szerint kezeli.
