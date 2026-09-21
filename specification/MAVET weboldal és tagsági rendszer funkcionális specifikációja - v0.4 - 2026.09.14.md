# MAVET weboldal és tagsági rendszer funkcionális specifikációja

**Verzió: 0.4**

**Dátum: 2026\. szeptember 14\.**

**Állapot:** ügyfél-egyeztetésre előkészített munkaváltozat

A dokumentum a Magyar Vidékegészségügyi Társaság weboldalának és tagsági rendszerének működését írja le. Bemutatja, hogy a látogató, a jelentkező és a tag milyen felületeket ér el, milyen adatokat ad meg, és milyen eredménnyel használja a rendszer funkcióit. Az egyes moduloknál szerepel az ügyfél által kezelhető tartalom és a szükséges szervezeti döntés; külön adminisztrációs képernyőleírás nem része a dokumentumnak.

A korábbi ügyfélegyeztetések döntései az érintett fejezetek működési szabályaiba beépültek. A 13\. fejezet a lezárt egyeztetési pontok státuszát, a még nyitott kérdéseket és a szükséges tartalomátadást gyűjti össze. A konferenciamodul a 11\. fejezetben fenntartott helyen később kerül kidolgozásra. Ez a változat a konferenciamodul és a 13\. fejezetben jelzett, még nyitott technikai paraméterek lezárása előtt nem tekinthető a teljes rendszer végleges specifikációjának.

# **Tartalom**

[1\. Rendszeráttekintés és hozzáférések](#bookmark=id.b6qwp3kzavcc)

[2\. Navigáció és általános működés](#bookmark=id.t59euu182i0n)

[3\. Főoldal](#bookmark=id.f7o9cxog4x6t)

[4\. Bemutatkozó és tájékoztató oldalak](#bookmark=id.8cmw52y2g89o)

[5\. Aktualitások](#bookmark=id.6utvwfci8unn)

[6\. Szakmai anyagok és dokumentumok](#bookmark=id.xnfce1c8vrvt)

[7\. Regisztráció és tagsági jelentkezés](#bookmark=id.gokavdtc0b14)

[8\. Tagdíjfizetés és tagsági megújítás](#bookmark=id.xh581rs0th3o)

[9\. Saját fiók és profilok](#bookmark=id.i62wy1nicl5n)

[10\. E-mailes kommunikáció és hírlevél](#bookmark=id.pemzzlw1swat)

[11\. Konferenciamodul](#bookmark=id.g8jmu1rnrd6n)

[12\. Közös működési és ellenőrzési követelmények](#bookmark=id.cwog2wgsead6)

13\. Egyeztetési státusz, nyitott technikai kérdések és tartalomátadás

# **1\. Rendszeráttekintés és hozzáférések**

## **1.1. A rendszer feladata**

A weboldal bemutatja a Társaság céljait, tevékenységét, híreit, eseményeit és szakmai anyagait. A látogató tagságra jelentkezhet, a jelentkezését a MAVET elbírálja. Az aktív tag a saját fiókjából kezeli személyes profilját, eléri a tagi dokumentumokat és a kereshető tagi névjegyzéket, valamint befizetheti tagsági díját.

A publikus tájékoztatás és a tagsági folyamat egymásra épül: a látogató megismeri a Társaságot, tájékozódik a tagságról, majd elindítja a jelentkezést. A konferencia ehhez kapcsolódó, később részletezendő rendszerterület.

## **1.2. Felhasználói állapotok**

A felhasználói fiók, a tagsági állapot és a megjelenési beállítás külön fogalom. A fiók megléte önmagában nem ad tagi jogosultságot; a saját profil elrejtése nem szünteti meg az aktív tagságot.

| Állapot | Jelentés |
| :---- | :---- |
| Látogató | A publikus oldalak használója. Nincs bejelentkezve. |
| E-mail-megerősítésre váró regisztráló | Kitöltötte és elindította a regisztrációt, de még nem erősítette meg az e-mail-címét. Nincs elbírálandó tagsági jelentkezése. |
| Tagjelölt | E-mailben megerősített jelentkezése elbírálás alatt áll. |
| Elfogadott, fizetésre vár | Jelentkezését elfogadták, és az aktiváláshoz szükséges első tagdíj esedékes, de azt még nem fizette be. A 2026\. december 31-ig elfogadott tagokra ez az állapot nem alkalmazandó, mert 2026-ra nincs tagdíjfizetési kötelezettség. |
| Aktív tag | Díjmentes kategóriában elfogadott, díjköteles kategóriában az érvényes tagsági időszak díját megfizető felhasználó. A 2026\. december 31-ig elfogadott, egyébként díjköteles tag 2026-ra díjfizetés nélkül válik aktívvá. Az adott év decemberében megfizetett tagdíj az adott év hátralévő részére és a teljes következő naptári évre biztosítja a tagságot.” |
| Elutasított jelentkező | Jelentkezését elutasították; a fiókjából új jelentkezést indíthat. |
| Lejárt tagságú felhasználó | Korábbi tagsága lejárt. Fiókja és saját profilja megmaradt, tagi jogosultságai megszűntek. |

&nbsp;

A vezetői, elnökségi vagy bizottsági tisztség szervezeti adat. Nem azonos az adminisztrátori jogosultsággal. Jelentkezést elfogadni vagy elutasítani, illetve tagsági kategóriát módosítani adminisztrátori jogosultsággal lehet. A tisztség önmagában nem biztosít adminisztrátori hozzáférést.

## **1.3. Hozzáférési szabályok**

Minden aktív tag azonos hozzáférést kap a rendszerben közzétett tagi szakmai anyagokhoz és dokumentumokhoz, valamint a tagi névjegyzékhez. A hozzáférés nem függ a tagsági kategóriától. A teljes névjegyzék az összes megjelenést engedélyező aktív tagot tartalmazza; az elrejtett tagokat más tag sem láthatja benne.

| Funkció | Látogató | Tagjelölt vagy fizetésre váró | Aktív tag | Elutasított vagy lejárt tagságú |
| :---- | :---- | :---- | :---- | :---- |
| Publikus oldalak és publikus anyagok | Igen | Igen | Igen | Igen |
| Saját jelentkezés állapota | Nem | Igen | Saját tagsági állapot | Igen, ha van korábbi jelentkezés |
| Tagi anyagok teljes tartalma | Nem | Nem | Igen | Nem |
| Tagi névjegyzék, keresés és tagi profilok | Nem | Nem | Igen | Nem |
| Első tagdíj befizetése | Nem | Elfogadás után | Nem releváns | Elutasítás után új elfogadás szükséges |
| Megújítás vagy lejárt tagság újrafizetése | Nem | Nem | Megújításkor | Lejárt tagság esetén igen |
| Munkacsoport-csatlakozás | Nem | Nem | Jogosult; a 4.3. fejezet szerinti jelentkezési folyamatban | Nem |

&nbsp;

Külön kedvezményfunkció, kuponkezelés és önálló tagi szolgáltatáskatalógus nem készül. A tagsági kategóriához tartozó díj vagy díjmentesség a tagdíjkezelés része. A tagsági kategóriák szervezeten belüli, például közgyűlési jogosultságai tájékoztató tartalomként jelenhetnek meg; online szavazási funkció nem része ennek a leírásnak.

&nbsp;

# **2\. Navigáció és általános működés**

## **2.1. Oldalak és belépési pontok**

A publikus navigációból elérhető a Főoldal, A Társaságról, Tagság, Munkacsoportok, Aktualitások, Szakmai anyagok, Díjazottak és elismerések, valamint Kapcsolat oldal. A fejléc logója a főoldalra vezet. A tagsági jelentkezés (regisztráció) és a bejelentkezés jól felismerhető belépési pontot kap.

Bejelentkezés után a Saját fiók mindig elérhető. Az aktív tag ezen felül eléri a Tagi névjegyzéket. A tagi névjegyzék nem publikus oldal; tartalma bejelentkezés nélkül és inaktív tagsággal közvetlen hivatkozásról sem olvasható.

Önálló részletes oldala van a hírnek, eseménynek és megjelenést engedélyező tagi profilnak. A szakmai anyagokhoz, munkacsoportokhoz, partnerekhez és díjazottakhoz nem készül külön részletező oldal. A konferencia belépési pontjai a 11\. fejezet kidolgozásakor kerülnek véglegesítésre.

A láblécből közvetlenül elérhető az Impresszum, az Adatkezelési tájékoztató és a Süti-tájékoztató. Ezek önállóan hivatkozható tájékoztatók. Mobilon a menü nyitható és bezárható; a navigáció minden képernyőméreten ugyanazokat a jogosultsági szabályokat követi.

## **2.2. Listák, keresés és lapozás**

A hírek, az eseménylisták, a szakmai anyagok és a tagi névjegyzék hosszabb listái számozott lapozást kapnak. A lapozó mutatja az aktuális oldalt, és lehetővé teszi az előző vagy következő oldal, illetve egy oldalszám kiválasztását. Ha minden találat elfér egy oldalon, lapozó nem jelenik meg. A javasolt oldalméretek a 13.4. fejezetben szerepelnek jóváhagyandó paraméterként.

A keresés és szűrés a teljes, az adott felhasználó által elérhető állományon működik. Feltételváltáskor (szűréskor) a lista az első találati oldalra áll. A lapozás megtartja a keresési és szűrési feltételeket. A részletes oldalról a listához visszatérve a korábbi listaállapot visszaállítható.

A tagi névjegyzék kereshető. A szakmai anyagok cím alapján kereshetők és kategória szerint szűrhetők; további keresési mező vagy szűrő nem készül. A bemutatkozó oldalak, munkacsoportok és a főoldali előnézetek nem kapnak lapozót. Teljes webhelyre kiterjedő globális kereső nem készül ebben a változatban.

## **2.3. Általános visszajelzések**

A rendszer elkülöníti a betöltést, az üres listát, a sikertelen műveletet és a jogosultsághiányt. Kötelező vagy hibás adat esetén a visszajelzés az érintett mezőhöz kapcsolódik. Sikertelen mentéskor a nem érzékeny kitöltött mezők megmaradnak; a jelszót nem tölti vissza a rendszer.

A tagi tartalom megnyitásakor a be nem jelentkezett látogató belépési lehetőséget kap. A bejelentkezett, de nem aktív tag a saját állapotának megfelelő tájékoztatást kap; lejárt tagságnál ez a tagdíjfizetésre is elvezet. A már jelentkezett felhasználót a rendszer nem irányítja új fiók létrehozására.

Nem létező vagy visszavont tartalom nem jeleníthető meg.

# **3\. Főoldal**

## **3.1. Szerkezet és bemutatkozás**

A főoldal sorrendben a hero blokkot, a Társaság rövid bemutatását, az Aktualitások előnézetét, a Munkacsoportok előnézetét, a hírlevél-feliratkozást és a partneri szakaszt tartalmazza.

A hero blokk egy kiemelt képet, szerkeszthető főüzenetet, rövid bevezetőt és egy elsődleges „Csatlakozom a MAVET-hez” gombot jelenít meg. A gomb a tagsági jelentkezéshez vezet. Már bejelentkezett felhasználónál a saját tagsági állapothoz illeszkedő fióknézet nyílik meg; meglévő aktív tagsághoz nem indul új jelentkezés.

A rövid bemutatkozó blokk legfeljebb két rövid bekezdésből és az „Ismerje meg a Társaságot” hivatkozásból áll. A hivatkozás az A Társaságról oldalra vezet. A teljes küldetésnyilatkozat és történet azon az oldalon olvasható.

## **3.2. Aktualitások előnézete**

A blokk összesen legfeljebb hat kártyát mutat rácsos elrendezésben. Asztali nézetben nincs oldalirányú kártyalapozó; mobilon a kártyák egymás alatt jelennek meg.

Az admin egy közzétett hírt vagy aktuális eseményt jelölhet ki kiemeltként. A kiemelés első helyen, vizuálisan megkülönböztetve jelenik meg. A többi hely automatikusan töltődik: először a folyamatban lévő és közelgő események az 5\. fejezet szerinti sorrendben, majd a legfrissebb hírek kerülnek be. Egy tartalom csak egyszer szerepelhet. Kiemelés nélkül mind a hat hely automatikus.

Ha a kiemelt esemény korábbivá válik, vagy a kijelölt tartalmat visszavonják, a kiemelés megszűnik a főoldalon, és a helyét az automatikus lista tölti fel. Ha hatnál kevesebb elem áll rendelkezésre, a rendszer csak ezeket mutatja; nincs üres kártya. Ha nincs megjeleníthető hír vagy aktuális esemény, a blokk rejtve marad.

A kártya a típust, címet, rövid összefoglalót és releváns dátumot mutatja; eseménynél a megadott helyszínt is. A kép hiányában egységes alapértelmezett kép használatos. A kártyáról a részletes oldal, az „Összes aktualitás” hivatkozásról az Aktualitások oldal nyílik meg.

## **3.3. Munkacsoportok előnézete**

Az admin három vagy négy munkacsoportot választhat ki a főoldalra. Ha ennél kevesebb megjeleníthető elem van, csak a rendelkezésre álló elemek jelennek meg. Egy kártya nevet, rövid leírást és opcionális képet tartalmaz. Csoportvezető neve a főoldali kártyán nem jelenik meg.

A kártya a Munkacsoportok oldal megfelelő szakaszához vezet. Az „Összes munkacsoport” a teljes oldalt nyitja meg. A főoldalról közvetlen csatlakozás nem indul. Üres állomány esetén a blokk nem jelenik meg.

## **3.4. Hírlevél és partnerek**

A hírlevélblokk tagság nélkül használható; működését a 10\. fejezet írja le.

A partneri szakasz a főoldalon az admin által kiemeltként megjelölt partnereket mutatja. Egy partnerhez név, opcionális logó és opcionális külső hivatkozás tartozik; a külső hivatkozás új böngészőfülön nyílik meg. A blokkból az „Összes partner” hivatkozás külön partnerlista-oldalra vezet, ahol valamennyi közzétett partner megjelenik. Egyedi partner-részletező oldal nem készül. Partneri adat nélkül a főoldali szakasz rejtve marad.

A főoldal képei, szövegei, aktualitás- és munkacsoport-kiemelése, valamint a kiemelt partner státusza, logója és külső hivatkozása adminisztrátori jogosultsággal szerkeszthető. A gombok funkciója a fent meghatározott felhasználói utakhoz kötött.

&nbsp;

# **4\. Bemutatkozó és tájékoztató oldalak**

## **4.1. A Társaságról**

Az oldal egyetlen publikus oldalon, belső horgonyos navigációval mutatja be a küldetést és jövőképet, a történetet, a elnökséget és bizottságokat, valamint az alapszabályt és hivatalos dokumentumokat. A küldetés és a történet szerkeszthető szöveg, amelyhez képek kapcsolhatók.

&nbsp;

A elnökségi és bizottsági kártya nevet, tisztséget, engedélyezett portrét és a megfelelő profilra mutató hivatkozást jelenít meg. Csak aktív és megjelenést engedélyező személy szerepelhet. A megjelenés kikapcsolása a teljes kártyát, a nevet és a profilhivatkozást is eltávolítja; a vezetői tisztség nem kivétel. A bizottság neve és feladatleírása önálló szervezeti tartalomként ettől még megjelenhet.

&nbsp;

A hivatalos dokumentumok listájában cím, rövid leírás, dátum vagy verzió és megnyitási vagy letöltési lehetőség szerepel. Az alapszabály kiemelt elem. Ide kizárólag publikus dokumentum kerül; a belső dokumentumok a Szakmai anyagok modulban kezelendők.

&nbsp;

A szövegek, bizottságok, tisztségek és dokumentumok szerkeszthetők. Az elnökségi és bizottsági tagok név szerint, a bizottságok megnevezésük szerint automatikusan ABC-sorrendben jelennek meg; ez a sorrend nem módosítható kézzel. Csak aktív és megjelenést engedélyező személy jelenik meg. A bizottságok és induló dokumentumok tartalomátadási kérdéseit ND-26 és ND-29 tartalmazza. A névsorok ábécérendjét a személy neve határozza meg; a külön kezelt titulus (például Dr. vagy Prof.) a rendezést nem befolyásolja.

## **4.2. Tagság**

A publikus Tagság oldal bemutatja a csatlakozás célját és előnyeit, a tagsági kategóriákat, a tagdíjakat és a jelentkezés rövid menetét. A kategóriák áttekinthető blokkokban jelennek meg, szerkeszthető leírással és díjinformációval.

&nbsp;

A bemutatott kategóriák: rendes, hallgatói, ifjúsági, érdemes, tiszteletbeli és pártoló tagság. A publikus természetes személy jelentkezési folyamatot a 7\. fejezet határozza meg. Érdemes tagságra önjelentkezés indítható, azzal a tájékoztatással, hogy a kategóriába sorolásról az Elnökség dönt. Tiszteletbeli tagsághoz nem jelenik meg önjelentkezési gomb. Szervezeti pártoló tagsági funkcionalitás az első fejlesztési ütemben nem készül; természetes személy pártoló tagság továbbra is választható.

A tagdíjösszegek és érvényességi időszakok a fizetéshez használt beállításokból jelennek meg, hogy a tájékoztató és a fizetendő összeg ne térjen el. Az éves tagdíj naptári évre szól, tört éves díj nincs. A Rendes tagok közül az orvos vagy gyógyszerész végzettségűek éves tagdíja 10 000 Ft, a nem orvos és nem gyógyszerész végzettségű Rendes tagok, valamint az Ifjúsági tagok éves tagdíja 5 000 Ft. A Hallgatói és az Érdemes tagság díjmentes. A A 2026\. évben nincs tagdíjfizetési kötelezettség; az első kötelező időszak 2027\. Az adott év decemberében megfizetett tagdíj az adott év hátralévő részére és a teljes következő naptári évre biztosítja a tagságot.

A folyamat rövid összefoglalása: kategóriaválasztás és adatlap; e-mail-megerősítés; elbírálás; elfogadás után díjmentes aktiválás vagy tagdíjfizetés. Az oldalról a közös jelentkezés indítható. A bemutató szövegek szerkeszthetők.

## **4.3. Munkacsoportok**

A publikus oldal bevezető szöveget és munkacsoportkártyákat tartalmaz. A munkacsoport témája, rövid leírása, megjeleníthető vezetője, a rendszerben beállított vezetői e-mail-cím és opcionális képe kezelhető. A munkacsoport bemutatása körülbelül fél A4 oldalnyi tartalommal is használható.

A kiinduló munkacsoport-témák: Telemedicina; Mesterséges intelligencia; Point of Care, Kompetenciafejlesztés és hatáskörbővítés; Ellátásszervezés és menedzsment; Humánerőforrásmenedzsment és utánpótlás; Longevity. A megnevezések, leírások, képek és megjelenési sorrend szerkeszthetők. Hiányzó mező nem jelenik meg üres címkével.

Munkacsoporthoz csak aktív tag csatlakozhat, tagsági kategóriától függetlenül. Be nem jelentkezett látogató belépési vagy jelentkezési lehetőséget kap; tagjelölt a saját folyamatára, lejárt tagságú felhasználó a megújításra vonatkozó tájékoztatást látja.

&nbsp;

Munkacsoporthoz csak aktív tag jelentkezhet, tagsági kategóriától függetlenül. A csatlakozási gomb a weboldalon belül rövid űrlapot nyit meg, amelyen a tag rövid szöveges üzenetet adhat meg, és megjelenik a munkacsoport-vezető e-mail-címe. Beküldéskor a rendszer e-mailben továbbítja a kérelmet a munkacsoport-vezetőnek, a tagnak pedig visszaigazolást küld. A munkacsoport-vezető e-mailben jelzi a döntését; elfogadás esetén felkéri a tagot, hogy a saját profiljában jelölje be a munkacsoport-tagságát. Külön munkacsoport-vezetői vagy jóváhagyási adminfelület nem készül. A tag a saját profiljában később a munkacsoport-tagságot ki is kapcsolhatja. A rendszer nem ellenőrzi technikailag, hogy a profilbeállítást megelőzte-e vezetői jóváhagyás. Be nem jelentkezett látogató belépési vagy jelentkezési lehetőséget kap; tagjelölt a saját folyamatára, lejárt tagságú felhasználó a megújításra vonatkozó tájékoztatást látja. Belső chat, fórum és együttműködési felület nem része ennek a specifikációnak.

&nbsp;

## **4.4. Díjazottak és elismerések**

Az oldal díjtípusonként, azon belül év szerint sorolja fel a díjazottakat. A díjtípus neve és leírása, az év és a díjazott neve kezelhető; az évek legújabbal kezdve jelennek meg. Egy évhez több díjazott is tartozhat, és személy, szervezet vagy szerzői közösség neve is megadható. A díjazotti bejegyzés nem hoz létre tagi fiókot.

&nbsp;

A díjtípusok: MAVET Díj; MAVET Közösségért Díj; MAVET Ifjúsági Díj; MAVET Életműdíj; Kiemelkedő Tudományos Közlemény Díj; Örökös Tiszteletbeli Elnök. A bevezető, a díjleírások, az éves bejegyzések és a sorrend szerkeszthető. Üres évhelyőrzők és hiányos díjazotti bejegyzések nem jelennek meg.

A Díjazottak és elismerések publikus oldal. Külön díjazotti részletező oldal nem készül. A díjazotti bejegyzés nem hivatkozik tagi profilra, ezért a tag profiljának megjelenési beállítása a díjazotti névbejegyzést nem érinti. Fénykép és szakmai önéletrajz csak megfelelő adatkezelési hozzájárulás alapján tehető közzé. A jövőbeni díjazottaknál a hozzájárulást a díj átvételekor kell beszerezni; korábbi díjazottnál fénykép vagy önéletrajz csak dokumentálható hozzájárulás esetén jelenhet meg.

## **4.5. Kapcsolat és jogi tájékoztatók**

A publikus Kapcsolat oldal a Társaság nevét, megadott címét, kapcsolati e-mail-címét, megadott telefonszámát és hivatalos közösségimédia-hivatkozásait mutatja. Ezek adminisztrátori jogosultsággal szerkeszthetők.

Az üzenetküldő űrlap kötelező mezői: név, e-mail-cím, üzenet és az adatkezelési tájékoztatóhoz kapcsolódó nyilatkozat. A tájékoztató közvetlenül megnyitható. A rendszer ellenőrzi a kitöltést és az e-mail formátumát, majd a beállított címzettnek továbbítja az üzenetet. Siker vagy hiba az űrlap helyén jelenik meg. Sikertelen küldéskor a kitöltött adatok megmaradnak. A feladónak külön automatikus másolatküldés nem része az alapfolyamatnak.

Erről korábban nem beszéltünk: A társaság facebook oldalára vezető logót, linket ide be kellene illeszteni.

&nbsp;

Az Impresszum, az Adatkezelési tájékoztató és a Süti-tájékoztató szerkeszthető szöveges tartalom. Végleges szövegük és a nyilatkozatok szövegezése ügyféloldali jóváhagyást igényel. A sütibeállítások működését a 12\. fejezet rögzíti.

&nbsp;

# **5\. Aktualitások**

## **5.1. Oldalszerkezet**

Az Aktualitások közös publikus oldalán két tartalmi szakasz szerepel. Elöl a folyamatban lévő és közelgő események listája jelenik meg, alatta a hírek. Ha nincs aktuális esemény, a hírek kerülnek felülre. A korábbi eseményeket külön „Korábbi események” nézetből lehet megnyitni, ahonnan vissza lehet térni az aktuális listához.

&nbsp;

Nem készül azonos funkciójú további „Összes / Hírek / Események” szűrősor. A két szakasz külön címet és saját listát kap. A hosszú esemény- és hírlisták egymástól függetlenül lapozhatók a 2.2. fejezet szerint. Üres hírállománynál rövid tájékoztatás jelenik meg; a korábbi események akkor is elérhetők, ha nincs aktuális esemény.

## **5.2. Időrend és események besorolása**

Eseményhez kezdő dátum kötelező, kezdő időpont megadható. Többnapos eseménynél záró dátum is megadható; ez nem lehet a kezdésnél korábbi. Egyetlen dátummal az esemény az adott nap végéig aktuális. Záró dátum időpont nélkül a zárónap végét jelenti. Megadott befejezési időpont esetén addig aktuális. Az időbeli besorolás magyarországi helyi idő szerint történik.

A folyamatban lévő események szerepelnek először, majd a közelgők kezdő dátum szerint növekvő sorrendben. A korábbi események nézetében a legutóbb véget ért esemény jelenik meg elöl. A hírek a közzétételi dátumuk szerint csökkenő sorrendben jelennek meg. Azonos dátumnál rögzített belső sorrend biztosítja, hogy lapozáskor a találatok ne ugráljanak.

A befejezett esemény automatikusan átkerül a korábbi események közé, de részletes oldala és hivatkozása megmarad. A korábbivá válás nem jelent tartalom-visszavonást. A lejárt eseményen jelentkezési felhívás nem jelenik meg; a leírás továbbra is olvasható.

## **5.3. Kártyák és részletes oldalak**

A hírkártya címet, rövid összefoglalót, közzétételi dátumot és opcionális képet tartalmaz. Az eseménykártyán cím, rövid összefoglaló, dátum vagy időszak, megadott helyszín és opcionális kép szerepel. A kártya a saját részletes oldalra vezet. A listaoldalon kép nélkül is megjelenhet a kártya.

A hír részletes oldala a címet, dátumot, összefoglalót, teljes cikket és megadott képet mutatja. Hírhez kapcsolódó hivatkozás és dokumentum nem csatolható. Az esemény részletes oldala a címet, időpontokat, helyszínt, leírást és megadott képeket mutatja, továbbá aktuális eseménynél opcionális jelentkezési vagy információs hivatkozást. Külső jelentkezési link megnyitása önmagában nem jelent MAVET-rendszerben kezelt eseményregisztrációt.

Mindkét oldal önállóan hivatkozható, és visszavezet a listához. Csak közzétett tartalom olvasható. Hír vagy esemény létrehozható, szerkeszthető, közzétehető és visszavonható. Visszavonás után a listákból és a főoldalról is eltűnik, közvetlen hivatkozással sem érhető el.

# **6\. Szakmai anyagok és dokumentumok**

## **6.1. Tartalmi kör**

A közös anyagtár szakmai ajánlásokat, előadásokat, publikációkat, videókat, betegedukációs anyagokat és letölthető dokumentumokat kezel. A belső szervezeti dokumentumok is itt szerepelnek, tagi hozzáféréssel; nem készül külön belső dokumentumtár.&nbsp;

Egy anyag egy kategóriába sorolható. A kategória szűrésre szolgál, nem határozza meg a hozzáférést vagy a technikai formát. Az anyag formája dokumentum vagy beágyazott videó. A dokumentum feltöltött fájlja vagy külső hivatkozása új böngészőfülön nyílik meg. Publikus videó YouTube-ról beágyazható; csak aktív tagoknak szánt védett videóhoz Bunny.net alapú, tokennel védett lejátszás használatos, hogy a közvetlen videóhivatkozás ne legyen jogosultságellenőrzés nélkül tartósan újrahasználható. Saját videófeltöltő és videófeldolgozó funkció nem készül ebben a változatban. A dokumentumfájlok támogatott formátumai és méretkorlátai a 13.3. fejezetben maradnak nyitott technikai paraméterként.

## **6.2. Adatok és közzététel**

Kötelező a cím, kategória, rövid összefoglaló, az anyag formája, a hozzá tartozó fájl vagy videóhivatkozás, valamint a hozzáférési szint. Opcionális a szerző és a megjelenési dátum. Többfájlos csomag és további csatolmánykezelés nem része az anyag alapmodelljének.

Az admin létrehozhatja és szerkesztheti az anyagot, továbbá külön kapcsolóval közzéteheti vagy elrejtheti. Új anyag alapértelmezetten rejtett. Közzétételhez minden kötelező adatnak rendelkezésre kell állnia. Az elrejtett anyag nem szerepel a listában, saját tárolású fájlja más felhasználók számára nem érhető el. Az elrejtés nem törlés: az anyag később újra közzétehető.

## **6.3. Hozzáférés**

Anyagonként két hozzáférési szint választható: „Publikus” és „Csak aktív tagoknak”. Minden aktív tag eléri az összes közzétett tagi anyagot. Tagjelölt, fizetésre váró, elutasított és lejárt tagságú felhasználó csak a publikus teljes tartalmakhoz fér hozzá.

A csak aktív tagoknak szánt anyag címe, összefoglalója és kártyája a publikus listában zárolt előnézetként megjelenhet, egyértelmű tagi hozzáférési jelöléssel. A teljes tartalom, a védett videó és a saját tárolású fájl csak aktív tag számára adható át. Ugyanez a szabály vonatkozik a tagi belső szervezeti dokumentumokra is.

A hozzáférés ellenőrzése a saját tárolású fájl tényleges megnyitására is kiterjed. Publikusból tagivá tett anyag új megnyitása már tagi jogosultságot igényel. Korábban letöltött példányt a rendszer nem tud visszavonni. Külső tartalomnál a MAVET a hivatkozás vagy beágyazás saját felületén való megjelenését szabályozza.

## **6.4. Lista és megnyitás**

A lista cím szerinti keresővel, kategóriaszűrővel és számozott lapozással használható. A kártya címet, kategóriát, összefoglalót, tartalomformát és megadott dátumot mutat. A tagi hozzáférési jelölés a látható kártyán jelenik meg. Üres találati listánál egyértelmű üres állapot látható.

A dokumentum megnyitása vagy letöltése új böngészőfülön történik, a videó pedig a listában jelenik meg beágyazva; külön szakmaianyag-részletező oldal nem készül. Hiányzó, elrejtett vagy megszűnt anyag nem nyitható meg. Külső szolgáltatói kiesés nem változtatja meg a tagsági jogosultságot. A tagok saját dokumentumot nem tölthetnek fel ebbe a modulba.

# **7\. Regisztráció és tagsági jelentkezés**

## **7.1. Jelentkezési kategóriák és adatlap**

A természetes személyek publikus jelentkezési kategóriái: rendes, hallgatói, ifjúsági, érdemes és természetes személy pártoló tagság. Tiszteletbeli tagságra nincs publikus önjelentkezés. Szervezeti pártoló tagsági funkcionalitás az első fejlesztési ütemben nem készül.

A kategória kiválasztása után a rendszer megjeleníti a feltételeket és a kategóriához tartozó mezőket. A regisztráció és a tagsági jelentkezés egy folyamat; önálló, általános regisztráció ezen kívül nem indul.

| Adat | Kötelezőség és működés |
| :---- | :---- |
| Teljes név | Kötelező. |
| Titulus | Opcionális; külön legördülő mező, például nincs / Dr. / Prof. A titulus nem része a név szerinti ábécérendezésnek. |
| Születési dátum | Kötelező; érvényes, nem jövőbeli dátum. |
| Levelezési cím | Kötelező; irányítószám, település, cím és ország. Magyar irányítószám megadásakor a rendszer automatikusan kitölti a település nevét; a kitöltött érték szükség esetén ellenőrizhető. |
| E-mail-cím | Kötelező; a fiók belépési azonosítója. |
| Telefonszám | Kötelező. |
| Szakterület | Kötelező; hallgatónál tanulmányi területként értelmezhető. |
| Munkahely | Hallgatói kategóriában nem kötelező. Más kategóriában a mező mellett információs szöveg jelzi, hogy munkahely hiányában a „nincs állandó munkahelyem” érték adható meg. |
| Tagsági kategória | A publikus jelentkezéshez választható kategóriák egyike. Rendes tagság választásakor külön meg kell jelölni, hogy a jelentkező orvos/gyógyszerész vagy nem orvos/nem gyógyszerész végzettségű; ez határozza meg az éves tagdíjat. |
| Jelszó és ismétlése | Új fióknál kötelező; a két értéknek egyeznie kell. Nem követelmény az éves kötelező jelszócsere vagy az előző öt jelszó ismétlésének tiltása; a minimális jelszókövetelmény a 13.4. fejezetben véglegesítendő. |
| Alapszabály és adatkezelési nyilatkozat | Külön, kötelező jelölések, megnyitható tájékoztatókkal. |

&nbsp;

A profilkép, a bemutatkozás és az érdeklődési területek nem feltételei a jelentkezésnek. Hallgatói jogviszonyt igazoló fájlt a rendszer nem kér és nem kezel. Hallgatói tag minden 18\. életévét betöltött, középfokú vagy felsőoktatási hallgató lehet. Az Ifjúsági tagság a 35\. életév betöltéséig választható, és a felső korhatár ellenőrzése a születési dátum alapján történik. Az Ifjúsági tag a 35\. életév betöltésének évében még Ifjúsági kategóriában marad, a következő naptári év első napjától pedig a rendszer automatikusan Rendes tagsági kategóriába sorolja. Az Érdemes kategória feltételeit és esetleges létszámkorlátját az Elnökség ellenőrzi; ehhez a rendszer nem végez automatikus tartalmi ellenőrzést. Az egyéb kategóriaváltások szabályait a 7.3. fejezet tartalmazza.

## **7.2. Beküldés és e-mail-megerősítés**

A jelentkező egyetlen regisztrációs művelettel adja át a teljes kötelező adatlapot. A rendszer ellenőrzi az adatokat, és egyszer használható, lejáró e-mail-megerősítő hivatkozást küld. A hivatkozás sikeres használata automatikusan létrehozza a tagjelölti jelentkezést; további „Jelentkezés beküldése” művelet nincs.

A beadott jelentkezés adatai ettől kezdve nem szerkeszthetők a jelentkező által. A rendszer visszaigazolást küld, és a saját fiókban megjeleníti az „Elbírálás alatt” állapotot és a beküldött adatokat. Hiányos vagy e-mailben nem megerősített regisztráció nem hoz létre elbírálandó jelentkezést. Lejárt hivatkozásnál új megerősítés kérhető.

Egy e-mail-címhez egy fiók tartozhat. Meglévő fiók esetén bejelentkezés vagy jelszó-visszaállítás után folytatható az állapotnak megfelelő művelet. A publikus válasz nem teszi közzé, hogy a cím szerepel-e a nyilvántartásban.

## **7.3. Elbírálás**

Az admin a beküldött jelentkezést fogadja el vagy utasítja el. Új, e-mailben megerősített és elbírálandó jelentkezés létrejöttekor a kijelölt adminisztrátorok e-mailes értesítést kapnak; a jelentkezések az adminfelületen is követhetők.

A folyamat nem tartalmaz jelentkező által szerkeszthető hiánypótlást, és nem indokolja hibás adatok miatt a jelentkezés előzetes elfogadását. A későbbi sajátprofil-módosítás nem írja át a már elbírált jelentkezést.

Díjmentes kategória elfogadása automatikus aktív tagságot eredményez. Díjköteles kategória elfogadása esedékes első tagdíj esetén „Elfogadott, fizetésre vár” állapotot és fizetési felhívást eredményez. A 2026\. december 31-ig elfogadott, egyébként díjköteles jelentkező 2026-ra díjfizetés nélkül válik aktív taggá. Ha az első tagdíjat decemberben fizeti meg, a befizetés az adott év hátralévő részére és a teljes következő naptári évre biztosítja a tagságot. A döntésről a felhasználó e-mailt kap, állapota a fiókjában is látható.

Az admin az elfogadáskor és a későbbi tagság során is módosíthat tagsági kategóriát. A kategóriát a tag nem módosíthatja. A kategóriaváltás díjhatása a következő éves tagsági időszaktól érvényes; év közben automatikus díjkülönbözet-elszámolás vagy visszatérítés nem történik. Az Ifjúsági tag a 35\. életév betöltésének évében még Ifjúsági kategóriában marad, majd a következő naptári év első napjától a rendszer automatikusan Rendes tagsági kategóriába sorolja. A hallgatói jogviszony megszűnése miatti kategóriamódosítást az adminisztrátor végzi.

## **7.4. Elutasítás és új jelentkezés**

Elutasításkor a fiók megmarad, a döntés megtekinthető, és tagi hozzáférés nem keletkezik. A felhasználó ugyanazzal az e-mail-címmel, a meglévő fiókjába belépve új jelentkezést indíthat. Nem szükséges és nem is hozható létre második fiók. Érdemes tagsági jelentkezés elutasításakor a rendszer külön sablonlevélben jelzi, hogy a felhasználó a meglévő fiókjából Rendes tagságra új jelentkezést indíthat.

Az új jelentkezés új adatlap, amely a véglegesítésig szerkeszthető. Beküldése új tagjelölti állapotot hoz létre; a korábbi jelentkezés és döntése nem íródik felül. A már megerősített, változatlan e-mail-címet nem kell újra megerősíteni. Egy fiókhoz egyszerre legfeljebb egy elbírálás alatt vagy első fizetésre váró jelentkezés tartozhat. Elutasításból nem történik automatikus átsorolás pártoló tagnak.

# **8\. Tagdíjfizetés és tagsági megújítás**

## **8.1. Fizetési szolgáltató és első tagdíj**

A tagdíj kártyával SimplePayen keresztül vagy hagyományos banki átutalással teljesíthető. A saját fiók mindkét fizetési módhoz a szükséges információt megjeleníti.

Díjköteles, elfogadott jelentkezésnél a saját fiók megjeleníti a kategóriát, a fizetendő összeget, a kapcsolódó időszakot és a választható fizetési módokat. Az e-mailes felhívás ugyanennek a fiókbeli műveletnek az elérését biztosítja. Banki átutalásnál a szükséges számlaadatok és közleményadatok a felületen jelennek meg.

Kártyás fizetésnél a felhasználó a SimplePay fizetési folyamatában teljesíti a befizetést, majd visszatérhet a MAVET oldalára. A visszatérő oldal önmagában nem igazolja a fizetést: a rendszer a szolgáltató ellenőrzött sikeres visszaigazolása alapján aktiválja vagy újítja meg a tagságot. Később érkező visszaigazolásnál a felület feldolgozás alatti állapotot mutat. Sikertelen vagy megszakított kártyás fizetés után a fiókból újra lehet próbálkozni. Banki átutalás esetén az adminisztrátor a bankszámla ellenőrzése után manuálisan rögzíti a befizetést; ez a rögzítés aktiválja, megújítja vagy helyreállítja a tagságot.

Ugyanazon sikeres befizetés ismételt szolgáltatói visszaigazolása vagy ugyanazon átutalás ismételt adminisztratív rögzítése nem aktiválhat vagy hosszabbíthat újra tagságot, és nem küldhet újabb sikerlevelet. A már rendezett díjtételhez új fizetés nem indítható. Az első tagdíj rendezésére az elfogadástól számított egy hónap áll rendelkezésre. Egy hónap eredménytelen elteltével a rendszer ismételt emlékeztetőt küld. Ha az emlékeztető ellenére sem történik befizetés, a fizetésre váró jelentkezési folyamat megszakad; a fiók megmarad, de tagi jogosultság nem keletkezik.

## **8.2. Éves megújítás**

A díjköteles aktív tagság naptári évre szól. Az adott év decemberében megfizetett tagdíj az adott év hátralévő részére és a teljes következő naptári évre biztosítja a tagságot. Ha a következő évre érvényes tagdíj január 1-jén még nincs rendezve, a tag január 31-ig türelmi időt kap, amely alatt tagi jogosultságai megmaradnak. A rendszer január 15-én és január 30-án automatikus megújítási emlékeztetőt küld a még nem fizetett díjköteles tagnak. A levélben az összeg, az érintett év, a január 31-i határidő és a fiókbeli fizetési lehetőség szerepel.

Az ellenőrzött tagdíjfizetés a rá vonatkozó tagsági időszakra aktiválja vagy megújítja a tagságot. A már kifizetett időszak nem rövidülhet meg a korábbi befizetés miatt. Tört éves díj nincs.

Ha január 31-ig nem érkezik be ellenőrzött befizetés, a tagság február 1-jével lejár. A tagi dokumentumok, a névjegyzék és a tagsághoz kötött funkciók hozzáférése megszűnik; a személy eltűnik a tagi listából, keresőből és esetleges publikus elnökségi megjelenésből. A fiók és a saját profil megmarad.

Díjmentes kategóriában nincs fizetési felhívás, és a befizetés hiánya miatt nincs lejáratás. Az esetleges jogosultsági feltétel megszűnése kategóriamódosítással rendezendő a 7.3. fejezet szerint. A rendszer által egyértelműen megállapítható életkori kategóriaváltás automatikusan történhet; az egyéb, igazolást vagy szervezeti döntést igénylő kategóriaváltást az adminisztrátor végzi.

## **8.3. Lejárt tagság helyreállítása**

A lejárt tagságú felhasználó beléphet a saját fiókjába, megtekintheti és szerkesztheti megőrzött profilját, valamint elindíthatja a tagdíj befizetését. Ellenőrzött sikeres SimplePay-visszaigazolás vagy adminisztrátor által rögzített banki átutalás után automatikusan újra aktív tag lesz. Nem szükséges új jelentkezés és új adminisztrátori elbírálás. A rendszer a lejárást követő egy éven belül négyhavonta egy, összesen három helyreállítási emlékeztetőt küld, ha a tagság addig nem állt helyre.

&nbsp;

A rendszer a megfizetett időszakot és az új lejáratot megjeleníti. A névjegyzékbeli és elnökségi megjelenés az aktív tagság visszaállásával csak akkor tér vissza, ha a felhasználó korábban engedélyezte a megjelenést. A rendszer a kapcsolót nem állítja át helyette.

## **8.4. Bizonylatok és kivételes esetek**

A fizetési felhívás a fizetendő összegről és a befizetés módjáról szóló rendszerüzenet. Nem jelent automatikusan számviteli díjbekérő vagy számla kiállítását. Az első fejlesztési ütemben nem készül külső számlázó-integráció; a számlák kiállítása és kezelése manuálisan, a MAVET-rendszeren kívül történik. A rendszer nem küld automatikusan adatot számlázórendszernek.

A visszatérítést, téves vagy többszörös tényleges befizetést, visszaterhelést és a fizetés közbeni fióktörlés következményeit a MAVET a rendszeren kívül intézi; ezekhez nem készül automatikus folyamat. A konferencia fizetése külön kidolgozandó; a jelen fejezet tagdíjról szól.

# **9\. Saját fiók és profilok**

## **9.1. Bejelentkezés és fiókáttekintés**

A felhasználó e-mail-címmel és jelszóval lép be. Hibás belépésnél semleges visszajelzést kap. A saját fiók a jelentkezés vagy tagság aktuális állapotát, az ahhoz tartozó műveleteket és a megadott adatokat mutatja. A kijelentkezés megszünteti az adott böngésző bejelentkezését.

Az elfelejtett jelszó funkció egyszer használható, lejáró hivatkozást küld. A kérelemre adott válasz nem árulja el a fiók létezését. Belépve a jelszó a jelenlegi jelszó és az új jelszó kétszeri megadásával módosítható. Lejárt vagy már felhasznált visszaállító link esetén új kérhető.

## **9.2. Saját profil adatai**

Az aktív és a lejárt tagságú felhasználó szerkesztheti személyes és szakmai profiladatait. A tagjelölt és a fizetésre váró jelentkező a beadott jelentkezési adatokat csak olvassa; a jelentkezés szerkesztése nem lehetséges. Az elutasított jelentkező új jelentkezési adatlapot indíthat a 7.4. fejezet szerint.

| Adatkör | Saját szerkesztés | Más felhasználó számára megjeleníthető |
| :---- | :---- | :---- |
| Név | Aktív és korábbi tagként igen | Engedélyezett profilnál kötelező megjelenési adat |
| Titulus | Igen | Engedélyezett profilnál a név részeként megjeleníthető; az ábécérendezést nem befolyásolja |
| Profilkép | Feltölthető, cserélhető, törölhető | A tag mezőbeállítása szerint |
| Szakterület, munkahely | Igen | A tag mezőbeállítása szerint |
| Bemutatkozás, érdeklődési területek | Igen | A tag mezőbeállítása szerint |
| Születési dátum és hely | Igen; változás nem sorol át automatikusan | Nem |
| Levelezési cím, telefonszám | Igen | Nem |
| Fiók e-mail-címe | Nem módosítható a felhasználói felületen; szükség esetén a MAVET a rendszeren kívül intézi | Nem |
| Tisztség, tagsági kategória, azonosító | Nem; szervezeti adat | Tisztség a megfelelő bemutatás része; azonosító nem látható |
| Munkacsoport-tagság | Igen; a tag a saját profiljában be- és kikapcsolhatja | A tag mezőbeállítása szerint |
| Díjfizetés és lejárat | Nem; rendszer által kezelt adat | Nem |

&nbsp;

A rövid bemutatkozás legfeljebb 500 karakter. A születési hely opcionális profiladat, nem jelentkezési feltétel. A profilképből egy aktuális kép tárolható. JPEG, PNG vagy WebP kép tölthető fel legfeljebb 10 MB méretben. Online kivágó vagy képszerkesztő funkció nem készül; a rendszer a feltöltött képet szerveroldalon automatikusan átméretezi és optimalizálja, és mentés előtt előnézetet jelenít meg. A kép cserélhető vagy elvethető. Nem támogatott formátumnál vagy túl nagy fájlnál közérthető hibaüzenet jelenik meg. Más saját dokumentum vagy fájl nem tölthető a profilhoz.

A profiladat megváltoztatása nem módosítja visszamenőleg a korábbi jelentkezést, fizetést vagy elbírálási döntést. Szervezeti tisztség és tagsági kategória nem írható át szabad profilmezőként; a munkacsoport-tagságot a tag a 4.3. fejezetben leírt szervezeti folyamat alapján maga kezeli.

## **9.3. Megjelenés engedélyezése és teljes elrejtés**

A profilnak egy közös, kiemelt és jól látható „Megjelenés engedélyezése” kapcsolója van. A kapcsoló mellett rövid információs szöveg ismerteti, hogy bekapcsolása milyen tagi, illetve tisztség esetén publikus megjelenést tesz lehetővé. Új profilnál a megjelenés alapértelmezetten kikapcsolt; az aktiváló e-mail a saját profilhoz vezet, ahol a tag ezt beállíthatja.

&nbsp;

Általános tag bekapcsolt megjelenéssel is csak az aktív tagok számára látható a névjegyzékben és saját részletes profilján. Elnökségi vagy bemutatott bizottsági tag bekapcsolt megjelenéssel a publikus bemutatkozó oldalon és publikus profilként is megjelenhet. A publikus megjelenést a szervezeti kijelölés és a tag engedélye együttesen teszi lehetővé; általános tagot a kapcsoló nem tesz publikussá.

Kikapcsolt megjelenésnél a személy sem a publikus elnökségi vagy bizottsági felületen, sem a tagi listában, sem a tagi kereső találatai között, sem közvetlen profilhivatkozáson nem jelenhet meg. Ez a vezetőkre is ugyanúgy vonatkozik. A rendszer más személyi bemutatásban, például munkacsoportvezető neveként sem kerülheti meg ezt a tiltást. A saját fiókban és az adminisztratív nyilvántartásban az adatok megmaradnak.

&nbsp;

A változtatás jóváhagyás nélkül, a következő megnyitásokra és lekérésekre azonnal érvényes. A korábban már megjelenített vagy lementett tartalmat a rendszer nem tudja a látogató eszközéről eltávolítani. A rejtettség nem változtatja meg a tag más tartalmakhoz való hozzáférését.

Bekapcsolt megjelenésnél a név a személy azonosításához megjelenik. A tag külön engedélyezheti a portrét, szakterületet, munkahelyet, bemutatkozást, érdeklődési területeket és munkacsoport-tagságot. A vezető ugyanazon engedélyezett profiladatokat mutatja a publikus és a tagi felületen; külön mezőnkénti publikus/tagi beállításrendszer nem készül. A tisztséget az adminisztratív szervezeti adat határozza meg. Kapcsolattartási, születési, azonosító- és fizetési adatok más felhasználóknak nem jelennek meg.

## **9.4. Kereshető tagi névjegyzék**

A névjegyzék kizárólag bejelentkezett aktív tagnak elérhető. A lista az aktív, megjelenést engedélyező személyeket név szerinti ábécérendben mutatja, számozott lapozással. A rendezés a név alapján történik; a külön tárolt titulus (például Dr. vagy Prof.) nem része a rendezési kulcsnak. A találatban a név és a megjelenésre engedélyezett szakmai adatok láthatók; a találatról a tag részletes profilja nyílik meg.

A névkereső a teljes látható tagállományban keres részleges névegyezéssel, kis- és nagybetűtől függetlenül. Más személy rejtett adatai nem szolgálhatnak keresési feltételként vagy találati kivonatként. Nincs találat esetén üres állapot és a keresés törlésének lehetősége jelenik meg. További kategória-, intézmény- vagy szakterületi szűrő nem készül az induló névjegyzékhez.

## **9.5. Fiók és tagság törlése**

A fiókkal rendelkező felhasználó a saját fiókból kezdeményezheti annak végleges törlését. A rendszer a következményeket ismerteti, a jelenlegi jelszót és külön megerősítést kér. A felhasználó a véglegesítés előtt megszakíthatja a műveletet.

Megerősítés után a belépési hozzáférés, az esetleges aktív tagság és a mások számára elérhető profil megszűnik. A rendszer visszaigazoló e-mailt küld. A törölt fiók nem állítható vissza; újbóli csatlakozás új jelentkezést igényel. A kötelezően megőrzendő nyilvántartások elkülönítetten, a meghatározott megőrzési szabály szerint maradhatnak fenn.

A törlés nem azonos a díjnemfizetés miatti lejárattal: lejáratkor a fiók és a profil megmarad. A befizetésekkel és folyamatban lévő ügyekkel kapcsolatos kivételes eseteket a MAVET a rendszeren kívül intézi. Konferencia-regisztráció törlési következményeit a konferenciafejezet kidolgozása rendezi.

# **10\. E-mailes kommunikáció és hírlevél**

## **10.1. Fiókhoz és tagsághoz kapcsolódó értesítések**

A fiók és tagság működéséhez szükséges levelek külön kezelendők a hírlevéltől. A hírlevélről való leiratkozás nem kapcsolja ki a jelszó-visszaállító, jelentkezési vagy fizetési értesítéseket.

| Kiváltó esemény | Címzett | Levél tartalma |
| :---- | :---- | :---- |
| Regisztráció indítása | Jelentkező | E-mail-megerősítő hivatkozás |
| Jelentkezés létrejötte vagy új jelentkezés | Jelentkező | Elbírálás alatti állapot és saját fiók elérése |
| Díjmentes elfogadás | Új aktív tag | Aktiválás és profilbeállítások elérése |
| Díjköteles elfogadás | Elfogadott jelentkező | Összeg, időszak és első fizetési felhívás |
| Első fizetési felhívás után 1 hónappal | Fizetésre váró jelentkező | Ismételt emlékeztető a befizetésre; elmaradó fizetés esetén a jelentkezési folyamat megszakad |
| Január 15\. | Megújításra váró díjköteles tag | Megújítási emlékeztető és befizetési lehetőség |
| Elutasítás | Jelentkező | Döntés és a saját fiók elérése |
| Befizetés sikeres igazolása | Fizető felhasználó | Aktiválás, megújítás vagy helyreállítás; időszak és fiókelérés (SimplePay-visszaigazolás vagy admin által rögzített átutalás) |
| Január 30\. | Megújításra váró díjköteles tag | Utolsó emlékeztető a január 31-i türelmi határidő előtt |
| Jelszó-visszaállítás kérése | Érintett fiók tulajdonosa | Egyszer használható visszaállító hivatkozás |
| Fióktörlés | Törlő felhasználó | A megszüntetés visszaigazolása |
| Új elbírálandó jelentkezés létrejötte | Kijelölt adminisztrátor(ok) | Értesítés az új jelentkezésről és az adminfelület elérése |
| Érdemes tagsági kérelem elutasítása | Jelentkező | Tájékoztatás arról, hogy Rendes tagságra új jelentkezést indíthat a meglévő fiókjából |
| Munkacsoport-jelentkezés beküldése | Munkacsoport-vezető | A tag adatai és rövid üzenete |
| Munkacsoport-jelentkezés beküldése | Jelentkező tag | Visszaigazolás a kérelem elküldéséről |
| Lejárt tagság után 4 havonta, legfeljebb 1 évig | Lejárt tagságú felhasználó | Tagság helyreállításának lehetősége; összesen legfeljebb 3 emlékeztető |

&nbsp;

A fiókbeli állapot az elsődleges tájékoztatási felület: sikertelen e-mail-kézbesítés nem vonja vissza a sikeres elbírálást vagy befizetést. Az e-mailek feladónevét és válaszcímét az ügyfél adja meg.

## **10.2. Hírlevél-feliratkozás és leiratkozás**

A publikus feliratkozó űrlap e-mail-címet és külön hírlevél-feliratkozási nyilatkozatot kér, elérhető adatkezelési tájékoztatóval. Érvényes adatokkal a feliratkozás azonnal végleges; nincs megerősítő e-mailes lépés. A feliratkozás nem hoz létre fiókot vagy tagságot.

Már feliratkozott címre nem keletkezik új bejegyzés. A felület semleges sikerüzenetet ad. Hibás vagy hiányos adat esetén nem történik feliratkozás; sikertelen mentéskor a mezők megmaradnak.

A felhasználó a saját fiókjában is kezelheti a saját e-mail-címéhez tartozó feliratkozását. A fiókbeli beállítás és a publikus űrlap ugyanahhoz a feliratkozói nyilvántartáshoz kapcsolódik. A hírlevélben szereplő leiratkozási hivatkozás fiók és bejelentkezés nélkül is használható; leiratkozás után új hírlevél nem küldhető az adott feliratkozás alapján. Újbóli feliratkozás új nyilatkozattal lehetséges.

A hírlevélküldés a hirlevelekkuldese.hu külső szolgáltatás integrációjával történik. A hírlevelek szerkesztése és kampányszerű kiküldése a szolgáltatói felületen történik. A hírlevélről való leiratkozás nem érinti a fiók- és tranzakciós értesítéseket.

# **11\. Konferenciamodul**

A konferenciamodul részletes specifikációja még nem készült el.&nbsp;

# **12\. Közös működési és ellenőrzési követelmények**

## **12.1. Szerkeszthetőség és adatkezelés**

A bemutatkozó és tájékoztató szövegek, az oldalakon megadott képek, hírek, események, munkacsoport-bemutatások, munkacsoport-vezetői e-mail-címek, díjazotti és partneri adatok adminisztrátori jogosultsággal kezelhetők. Partnernél a kiemelt státusz, a logó és a külső hivatkozás is szerkeszthető. A szöveg szerkeszthetősége a meghatározott oldalszerkezeten belüli tartalmi módosítást jelenti; nem általános oldalépítő funkció.

Az admin a tagsági jelentkezésekről dönthet, és tagsági kategóriát módosíthat. A tag saját láthatósági kapcsolója a személy publikus és tagi megjelenését egyaránt szabályozza. Az adminisztratív nyilvántartás ettől függetlenül elérhető a feladat ellátására jogosult admin számára.

A nyilatkozatokhoz a megtörtént elfogadás időpontja és a tájékoztató azonosítható változata kapcsolódik. A végleges jogi tartalmakat és adatmegőrzési szabályokat az indulás előtt rögzíteni kell. A jelentkezés olvasási zárolása nem helyettesíti az adatkezelési megkeresések rendezését.

## **12.2. Hozzáférésvédelem és megbízható működés**

A tagsági és adminisztratív jogosultságot a rendszer minden védett adatlekérésnél és műveletnél ellenőrzi. A gomb elrejtése önmagában nem hozzáférésvédelem. A névjegyzék, profil és fájl jogosultság nélkül közvetlen hivatkozásról sem adható át. Tagság lejárta vagy profil elrejtése után a korábbi bejelentkezés nem biztosít további jogosulatlan hozzáférést.

A bejelentkezés, regisztráció, megerősítőlevél-kérés és nyilvános üzenetküldés korlátozza az ismételt visszaélésszerű próbálkozásokat. A jelszavak nem olvashatók vissza. A feltöltések ellenőrzött formátummal és méretkorláttal működnek. A nem publikus személyes adatok és a tagi tartalmak nem kerülhetnek publikus listákba vagy jogosulatlan felhasználó számára kiszolgált válaszba. A jelszókezelés nem ír elő kötelező éves jelszócserét vagy az előző öt jelszó használatának tiltását. A Bunny.net-en tárolt védett tagi videók lejátszási hozzáférése aktív tagsági jogosultsághoz és rövid élettartamú tokenhez kötött.

Fizetési vagy hálózati hiba esetén nincs hamis sikerjelzés. A felhasználó az állapotot a saját fiókjában ellenőrizheti. Külső szolgáltatói visszaigazolás ismétlése nem okozhat duplikált jelentkezést, tagsági időszakot vagy befizetési eredményt.

## **12.3. Használhatóság és tájékoztatók**

A felületek mobilon, tableten és asztali képernyőn is használhatók. A menük, űrlapok, kereső és lapozók billentyűzettel kezelhetők, a fókusz látható. A mezők felirattal rendelkeznek, a hibák az érintett mezőhöz kapcsolódnak, a státusz nem csak színnel jelzett. A képekhez a funkciójuknak megfelelő szöveges helyettesítés tartozik. Nem lehet levágott vagy más elem által takart műveleti gomb.

A publikus tartalomoldalak címe és hivatkozása megosztható. A tagi névjegyzék és a nem publikus profil nem szerepelhet publikus keresőindexelésre szánt oldallistában. A nem szükséges sütik használatát a rendszer minimalizálja; a hozzájárulási felület egyszerű, kevés lépéses működést céloz. A végleges hozzájárulási és elutasítási mechanizmust az indulás előtti jogi felülvizsgálathoz kell igazítani. Ha hozzájárulást igénylő szolgáltatás nincs használatban, a felület nem kér hozzá felesleges engedélyt.

&nbsp;

&nbsp;

12.4. Ellenőrizhető működési eredmények

A megvalósítás ellenőrzése az alábbi fő folyamatokra terjed ki. A még nyitott ND-azonosítóval jelzett részek csak az érintett döntés lezárása után véglegesíthetők.

1\. Hiányos vagy nem megerősített első regisztráció nem hoz létre tagjelölti jelentkezést; teljes regisztráció megerősítése igen.

2\. A jelentkező nem szerkesztheti a beadott adatlapját. Az admin elfogadhatja vagy elutasíthatja azt.

3\. Elutasítás után ugyanazon fiókból új jelentkezés indítható, a korábbi döntés felülírása nélkül.

4\. Díjmentes elfogadás aktivál; díjköteles elfogadás esedékes tagdíj esetén fizetési felhívást eredményez. Díjköteles kategóriában az aktiválás ellenőrzött sikeres SimplePay-fizetés vagy admin által rögzített banki átutalás után történik; a 2026-ban elfogadott tagok átmeneti díjmentes aktiválása kivétel.

5\. Minden nem aktív állapotban tiltott a tagi anyagok teljes tartalmának és a tagi névjegyzéknek a hozzáférése.

6\. Minden aktív tag azonos jogosultsággal éri el a közzétett tagi anyagokat és a látható tagok teljes névjegyzékét.

7\. 7\. Az adott év decemberében megfizetett tagdíj az adott év hátralévő részére és a teljes következő naptári évre biztosítja a tagságot. Ha január 1-jén a következő évre érvényes tagdíj még nincs rendezve, a január 31-i türelmi idő alatt a tagi jogosultság megmarad, január 15-én és 30-án emlékeztető készül. Ha január 31-ig nincs igazolt befizetés, a tagság február 1-jével lejár, a saját fiók és profil megmarad.

8\. Lejárt tagság SimplePay-fizetéssel vagy admin által rögzített átutalással, új elbírálás nélkül helyreállítható. Ismételt fizetési visszaigazolás vagy ugyanazon átutalás ismételt rögzítése nem hosszabbít kétszer. Lejárás után négyhavonta legfeljebb három helyreállítási emlékeztető készül.

9\. A megjelenést kikapcsoló vezető neve, kártyája és profilja sem publikus oldalon, sem a tagi listában vagy keresőben nem érhető el. Általános tag engedélyezett profilja csak aktív tagoknak olvasható.

10\. A tag saját tisztségét és tagsági kategóriáját nem szerkesztheti; munkacsoport-tagságát a saját profiljában maga jelölheti és törölheti. Az Ifjúsági tag a 35\. életév betöltésének évében még Ifjúsági kategóriában marad, majd a következő naptári év első napjától automatikusan Rendes tagsági kategóriába kerül.

11\. Az Aktualitások oldalon az aktuális események megelőzik a híreket; a befejezett esemény a korábbiak közé kerül, részletes oldala megmarad.

12\. A főoldali előnézet legfeljebb hat, ismétlés nélküli kártyából áll; egy kézi kiemelés mellett a többi hely automatikus, oldalirányú lapozás nélkül.

13\. A szakmai anyag elrejthető és ismét közzétehető. Cím alapján kereshető és kategória szerint szűrhető; a dokumentum új böngészőfülön nyílik meg, a videó a listában ágyazható be, külön részletező oldal nélkül. A saját tárolású tagi fájl közvetlen címről sem olvasható jogosultság nélkül.

14\. A névkeresés a teljes látható taglistán működik. Lapozás közben a feltételek megmaradnak, feltételváltás az első oldalra visz.

15\. A hírlevél-feliratkozás fiók nélkül működik, nem duplikál címet, a leiratkozás pedig bejelentkezés nélkül is elérhető és nem tiltja le a működéshez szükséges fiókleveleket.

16\. A fióktörlés külön megerősítést igényel, megszünteti a hozzáférést és a profilmegjelenést, és nem tévesztendő össze a tagság lejáratával.

17\. A munkacsoport-jelentkezési űrlap a weboldalon belül működik, a vezetőnek e-mailt, a tagnak visszaigazolást küld; a munkacsoport-tagság a tag saját profiljában módosítható.

18\. A névjegyzék és az elnökségi/bizottsági névsor ábécérendezése a név alapján történik; a Dr. és Prof. titulus nem befolyásolja a sorrendet.

19\. A főoldalon csak kiemelt partnerek jelennek meg, az „Összes partner” hivatkozás külön partnerlistát nyit; egyedi partner-részletező oldal nincs.

20\. A csak aktív tagoknak szánt szakmai anyag publikus kártyája zárolt előnézetként megjelenhet, de a teljes tartalom jogosulatlanul nem érhető el.

21\. A védett Bunny.net videó lejátszása csak aktív tagsági jogosultsággal és érvényes tokennel indul el.

# **13\. Ügyféllel egyeztetendő döntések és tartalomátadás**

## **13.1. Lezárt működési döntések**

**ND-04 és ND-05 – Egységes digitális hozzáférés.** Lezárva: minden aktív természetes személy tag, kategóriától függetlenül, ugyanazokat a közzétett tagi dokumentumokat és a kereshető tagi névjegyzéket éri el. Az elrejtett személyek nem részei a más tagoknak látható listának. A szervezeti pártoló tagsági funkció nem része az első ütemnek.

## **13.2. Lezárt tagsági és pénzügyi döntések**

A korábbi ND-01, ND-06, ND-07, ND-17, ND-24, ND-33, ND-38 és ND-39 egyeztetési pontok lezárultak. A végleges szabályokat a 4., 7., 8., 9\. és 10\. fejezet tartalmazza: egy hónapos első fizetési folyamat, Érdemes önjelentkezés, szervezeti pártoló funkció kizárása az első ütemből, SimplePay és banki átutalás, manuális számlázás, következő éves díjhatású kategóriaváltás, naptári éves tagdíj, január 31-i türelmi idő, valamint a véglegesített jelentkezési mezőszabályok.

## **13.3. Tartalom és további működés**

A korábbi ND-30, ND-35 és ND-44 egyeztetési pontok lezárultak; végleges működésük a 4.3., 6.3. és 10.2. fejezetben szerepel.

ND-37 – Dokumentumfeltöltési korlátok. A videószolgáltatókra vonatkozó döntés lezárult: publikus videóhoz YouTube, védett tagi videóhoz Bunny.net használatos. Még rögzítendő, hogy a szakmai dokumentumoknál pontosan mely fájlformátumok és maximális fájlméretek támogatottak.

## **13.4. Javasolt alapparaméterek**

Az alábbi értékek szerkesztési és megvalósítási javaslatok, nem korábban jóváhagyott ügyfélkövetelmények. Az elfogadás előtt véglegesítendők.

| Paraméter | Javasolt érték |
| :---- | :---- |
| Hírek és események oldalanként | 12-24 elem, listánként |
| Szakmai anyagok oldalanként | 12-24 elem |
| Tagi névjegyzék oldalanként | 24-48 személy |
| E-mail-megerősítő hivatkozás | 24 óráig használható |
| Jelszó-visszaállító hivatkozás | 1 óráig használható |
| Profilkép | JPEG, PNG vagy WebP; legfeljebb 10 MB; automatikus szerveroldali átméretezés és optimalizálás; online képszerkesztés nélkül |
| Névkeresés | Részleges névegyezés, kis- és nagybetűtől függetlenül |

&nbsp;

A jelentkezési és tartalmi mezők további karakterkorlátai, a minimális jelszókövetelmény és a szakmai dokumentumfájlok korlátai a mezőjegyzék véglegesítéséhez még rögzítendők. A jelszókövetelmény nem tartalmaz kötelező éves jelszócserét vagy az előző öt jelszó ismétlésének tiltását. A profilbemutatkozás 500 karakteres korlátja a 9.2. fejezetben szerepel.

## **13.5. Átadandó tartalmak**

A szerkeszthető tartalmak pontos szövege nem jelent új működési kérdést. Az induló feltöltéshez szükséges a jóváhagyott logó és képek, a bemutatkozó szövegek, kapcsolati adatok, tagdíjak, munkacsoport-leírások és vezetők, partneradatok, valamint az induló hírek, események és szakmai anyagok átadása.

**ND-26 – Bizottságok:** induló csoportok, feladatleírások és személyi összetétel. **ND-29 – Hivatalos dokumentumok:** az alapszabály és további publikus dokumentumok végleges fájljai. **ND-34 – Díjazottak:** végleges bevezető szöveg, valós éves bejegyzések, valamint azok a fényképek és önéletrajzok, amelyek közzétételéhez megfelelő hozzájárulás rendelkezésre áll.

Az eredeti anyagokban szereplő évhelyőrzők és hiányzó nevek nem tölthetők fel valós adatként. A rendszer az üres tartalmi mezőket az adott modul szabálya szerint kezeli.

&nbsp;