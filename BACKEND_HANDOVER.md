# Backend átadás – front-end szerződés

**Állapot:** a CSÖK-változat két publikus végpontjának szerződése rögzítve; a
teljes rendszer további végpontjai később kerülnek ide.

## 1. Határ és felelősség

A front-end (működő wireframe) az átadási pont (D-002). A backend fejlesztő
felel a valódi adatokért, a szerveroldali üzleti logikáért, az e-mail-küldésért,
a fájltárolásért, a fizetési integrációért, a biztonságért és az adminisztrációs
felületért (D-008). A backend fejlesztő **nem építi újra** a képernyőket és az
interakciókat: azok a front-end körben készen átadásra kerülnek.

A felület az adatokat **valódi HTTP API-rétegen** keresztül éri el (D-003):
a böngésző egy típusos klienst hív, ami Next.js route handlereket szólít meg.
A handlerek jelenleg mintaadatot szolgáltatnak (`lib/data/*`). A backend
integráció annyi, hogy a handlerek belseje valódi adatforrásra cserélődik – a
végpontok és a válaszformátumok változatlanok maradnak.

## 2. CSÖK API-végpontok

### `POST /api/preliminary-membership-applications`

Kérés: `category` (`rendes`, `hallgatoi`, `ifjusagi`, `erdemes` vagy `partolo`),
opcionális `title` (üres, `Dr.` vagy `Prof.`), `lastName`, `firstName`, `email`,
`consent: true`, `privacyNoticeVersion`. Siker: `200` vagy `201`; hibás adat:
`400`; korlátozás: `429` opcionális `Retry-After` fejléccel; átmeneti hiba: `500`
vagy `503`.

Az adatkezelési cél az előzetes tagsági jelentkezés rögzítése, a visszaigazoló
e-mail és a teljes jelentkezési folyamat elkészültekor küldendő folytatási
felhívás. Ez az adatállomány nem egyesíthető hírlevél-feliratkozókkal. A backend
duplikációt gátol, korlátozza a visszaélést, igazolhatóvá teszi a hozzájárulást,
visszaigazoló e-mailt küld, de nem hoz létre fiókot vagy tagjelölti állapotot.

### `POST /api/contact-messages`

Kérés: `name`, `email`, `message`, `consent: true`, `privacyNoticeVersion`.
Siker: `201`; hibás adat: `400`; korlátozás: `429` opcionális `Retry-After`
fejléccel; átmeneti hiba: `500` vagy `503`.

A backend ellenőrzi a mezőket (név 2–100 karakter, érvényes e-mail, üzenet
10–5000 karakter, `consent: true`), IP-nként 10 percenként 5 üzenetre
korlátozza a beküldést, az üzenetet a `contact_messages` gyűjteményben rögzíti
a hozzájárulás bizonyítékával (időpont, tájékoztató-azonosító, IP-hash,
user agent), majd értesítő e-mailt küld a `MAIL_TO` címre. Az értesítés
`Reply-To` fejléce a feladó címe, így a kapcsolattartó közvetlenül válaszolhat.
A feladó nem kap automatikus visszaigazolást. Ha az e-mail-küldés hibázik, az
üzenet mentve marad, a hiba a rekord `notifications.lastError` mezőjébe kerül,
és a válasz így is `201`.

Mindkét CSÖK handler éles megvalósítás (MongoDB Atlas + Upstash + SendGrid):
a `preliminary-membership-applications` 2026-09-22-től, a `contact-messages`
2026-09-26-tól (lásd CHANGELOG). A válaszkódok és a kérés alakja a fenti
szerződés szerint rögzített.

## 3. Elvárt adatok és állapotok

_Az egyes területek (tartalom, fiók, tagsági életciklus, fizetés, tagi
névjegyzék, szakmai anyagok, konferencia) adatköre a tervezés során kerül ide._

## 4. Nyitott döntések, amelyek a backendet érintik

A projekt-specifikáció nyitott `ND-xx` kérdései közül az alábbiak befolyásolják a
backend működését: ND-01 (első tagdíj elmaradása), ND-17 (számla és díjbekérő),
ND-30 (munkacsoport-csatlakozás kezelése), ND-33 (díjak és éves időszak),
ND-37 (fájlok, formátumok, videóbeágyazás), ND-38 (megújítási értesítés),
ND-44 (hírlevélküldés). Ezek lezárása nélkül az érintett funkció nem
tekinthető véglegesnek.

## 5. Technikai környezet

- Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn komponensek (D-004).
- Nincs `src/` könyvtár, az import alias `@/*`.
- Minden aloldal saját `layout.tsx`-szel rendelkezik, szerveroldali
  komponensként; a `page.tsx` szemantikus HTML és szerveroldali, az interaktív
  részek külön kliens komponensekben élnek (D-005).
- A prototípus nem tartalmaz valódi hitelesítést, fizetést és külső
  szolgáltatást (D-006, D-007).
