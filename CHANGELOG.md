# Változásnapló

A projekt változásnaplója (D-012). Bejegyzések dátuma szerint, csökkenő sorrendben.

---

## 2026-10-05 – Tagi profil, megjelenés engedélyezése, saját fióktörlés, tisztség

### Változások

- **Profil** (`/fiok/profil`, spec 9.2): titulus, név, születési adatok, cím,
  telefon, szakterület, munkahely, bemutatkozás (500 karakter), érdeklődési
  területek (legfeljebb 10), munkacsoport-tagság (a tag maga jelöli, 4.3).
  E-mail, kategória és tisztség csak olvasható. Fiók almenü: Áttekintés,
  Profil és megjelenés, Fiók törlése.
- **Profilkép**: JPEG/PNG/WebP, max 10 MB, `sharp` négyzetesre vág és 512 px-re
  méretez, WebP-ként a Vercel Blobba kerül (`BLOB_READ_WRITE_TOKEN`); előnézet
  mentés előtt, csere és törlés. Token nélkül a feltöltés tiltva, érthető
  üzenettel.
- **Megjelenés engedélyezése** (9.3): egy fő kapcsoló (alapból ki) +
  mezőnkénti engedélyek (kép, szakterület, munkahely, bemutatkozás,
  érdeklődés, munkacsoportok); a szöveg jelzi, hogy általános tagként csak a
  tagi felületen, vezetőségi jelöléssel a publikus oldalon is megjelenik.
  Azonnal érvényes.
- **Saját fióktörlés** (9.5, `/fiok/torles`): jelszó + „TÖRLÉS” megerősítés,
  a fiók és a profilkép törlődik, a jelentkezési rekordok anonimizálódnak,
  `fiok_torolve` sablonlevél, admin napló bejegyzés (`member_self_delete`).
- **Admin, tag részletező**: tisztség (szabad szöveg) és „megjelenhet a publikus
  elnökségi/bizottsági bemutatkozásban” jelölés (`boardMember`), naplózva
  (`member_office_change`); a profil új mezői és a megjelenés állapota
  látszanak.
- Munkacsoportok stabil azonosítóval (`workgroupOptions`, `lib/data/site.ts`).
  Új függőségek: `sharp`, `@vercel/blob`. Új env: `BLOB_READ_WRITE_TOKEN`.
- Tesztek: 3 új (profil-normalizálás és validáció, érdeklődési lista).

### Ismert korlátok

- A tagi névjegyzék és a részletes tagi profil (9.4), valamint az A Társaságról
  oldal elnökségi kártyái (4.1) a következő kör: a megjelenési adatok már
  rendelkezésre állnak hozzá.
- A munkacsoport-csatlakozási űrlap (4.3, e-mail a vezetőnek) még nincs.

---

## 2026-10-04 – Admin: Tagok (kategória, tagság visszavonása, fiók törlése)

### Változások

- **Tagok oldal** (`/admin/tagok`): állapotfülek (aktív, tagdíjra vár,
  aktiválásra vár, lejárt, megszűnt) darabszámmal, keresés névre és
  e-mail-címre. Részletező: tagsági adatok, profil, a tagnak kiment levelek,
  link a jelentkezésre.
- **Kategória módosítása** (spec 7.3): admin állítja, rendes tagnál az
  orvos/gyógyszerész jelöléssel; a díjhatás a következő tagsági évtől. Naplózva
  (`member_category_change`).
- **Tagság visszavonása**: állapot `megszunt`, a fiók és a belépés megmarad; a
  tag a fiókjában „Tagsága megszűnt” jelzést lát. Indoklás a naplóba, és
  választhatóan a tagnak küldött `tagsag_megszunt` sablonlevélbe. Visszafordítható
  („Helyreállítás”: aktív, vagy tagdíjra vár, ha az első tagdíj nyitott).
- **Fiók végleges törlése** (csak SUPERADMIN): e-mail-cím begépelésével
  megerősítve. A `users` rekord törlődik, a belépés azonnal megszűnik; a
  jelentkezési rekordok megmaradnak a döntési előzmények miatt, de a személyes
  mezők anonimizálódnak (spec 9.5 megőrzési elve). Naplózva (`member_delete`).
- **Jelentkezés végleges törlése** (csak SUPERADMIN, elutasított vagy lezárt
  jelentkezésre, ha nem tartozik hozzá tagi fiók): a rekord és a levélnaplója
  törlődik, az admin naplóba bejegyzés kerül (`application_delete`). Nem
  feltétele az újbóli jelentkezésnek: a lezárt/elutasított jelentkezés nem
  blokkolja az új beküldést.
- **Súgó** a Jelentkezések és a Tagok lista alatt: lenyitható magyarázat
  minden fülhöz (`app/admin/status-help.tsx`).
- Admin napló új akciói: `member_category_change`, `membership_revoke`,
  `membership_restore`, `member_delete`, `application_delete`.

### Ismert korlátok

- A tag saját fióktörlése (9.5, jelszóval) a profilkörben jön.
- A lejáratás és a megújítás (8.2) a fizetési körrel együtt.

---

## 2026-10-04 – Fejléc fiókmenü, elfelejtett jelszó, jelszócsere

### Változások

- **Fiókmenü a publikus fejlécben** (`components/account-menu.tsx`): a
  sessiont a kliens kéri le (`/api/auth/session`), így a publikus oldalak
  statikusak maradnak. Kijelentkezve „Bejelentkezés” ikon-gomb a `/belepes`
  oldalra; tagként név + menü (Saját fiók, Kijelentkezés); adminként
  Adminisztráció. Mobilon a menülap alján ugyanezek.
- **Elfelejtett jelszó** (`/elfelejtett-jelszo`): semleges válasz (nem derül
  ki, van-e fiók), IP-nként 5/10 perc és címenként 3/óra; aktivált tagi fiókra
  `jelszo_visszaallitas` sablon egyszer használható, 1 óráig érvényes linkkel
  (spec 13.4). **Új jelszó** (`/jelszo-visszaallitas/[token]`): D-020 szabály,
  mentés után automatikus belépés. **Jelszócsere** a `/fiok` oldalon jelenlegi
  + új jelszó kétszer (spec 9.1). Mind naplózva az `auth_logs`-ban
  (`PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_DONE`, `PASSWORD_CHANGED`).
- `/mavet-login`: tagi session mellett is megjelenik az admin űrlap (figyelmeztetéssel);
  korábban a főoldalra irányított.
- `robots.txt`: `/jelszo-visszaallitas/` tiltva.

### Ismert korlátok

- Profilszerkesztés, profilkép, megjelenési kapcsoló és tagi névjegyzék
  (spec 9.2–9.4) külön körben.

---

## 2026-10-04 – Elbírálás vége: tagi fiók elfogadáskor, aktiválás, tagi belépés (D-019, D-020)

### Változások

- **Tagsági adatok a `users` modellen:** profil (titulus, név, születési dátum,
  cím, telefon, szakterület, munkahely), `passwordHash`, aktiváló token,
  `membership` (állapot: `aktivalasra_var` / `fizetesre_var` / `aktiv` /
  `lejart` / `megszunt`, kategória, orvos/gyógyszerész jelölés, elfogadás és
  aktiválás ideje, `paidThroughYear`, első tagdíj összege/éve/határideje).
- **Tagdíj-szabályok** (`lib/data/membership-fees.ts`): kategóriánkénti díj,
  2026-os díjmentesség, decemberi befizetés = következő év, elfogadás-kori
  kimenet (aktív vagy fizetésre vár), 30 napos első határidő.
- **Elfogadás** az adminban: létrehozza vagy a meglévő tagi fiókhoz kapcsolja a
  tagságot, díjmentes vagy díjköteles aktiváló levelet küld (két új sablon:
  „Jelentkezés elfogadva (díjmentes aktiválás)”, „Jelentkezés elfogadva (tagdíj
  fizetendő)” összeggel, időszakkal, határidővel). Adminfiókhoz vagy már
  tagsággal rendelkező címhez nem rögzíthető. A részletező mutatja a fiók
  állapotát; „Aktiváló link újraküldése” gomb, amíg nincs aktiválva.
- **Aktiváló oldal** `/fiok/aktivalas/[token]` (7 nap): jelszó beállítása a
  D-020 szabály szerint, tagság aktiválása, automatikus belépés.
- **Tagi belépés** `/belepes`: NextAuth `member-password` provider (bcrypt,
  rate limit, semleges hiba, `auth_logs` csatorna `member-password`,
  `ACCOUNT_ACTIVATED` esemény). **Saját fiók** `/fiok`: tagsági állapot,
  kategória, érvényesség, első tagdíj felhívás, a jelentkezéskor megadott
  adatok, kijelentkezés. Admin session a `/fiok`-ról az adminba kerül.
- `robots.txt`: `/fiok`, `/tagsag/jelentkezes/<token>` tiltva. Új függőség:
  `bcryptjs`.
- **Tesztek:** 7 új (tagdíj-szabályok, jelszó); összesen 50.

### Ismert korlátok

- Nincs még fejléc-ikon, profilszerkesztés, megjelenési kapcsoló, tagi
  névjegyzék, elfelejtett jelszó (következő kör).
- Fizetés (SimplePay, banki átutalás rögzítése), első tagdíj emlékeztetője,
  évi megújítás és lejáratás külön körben; a `fizetesre_var` fiók addig csak
  tájékoztatást lát.
- Az aktiváló link lejárta után a tag a Kapcsolat oldalon kérhet újat; az
  admin a részletezőből küldi.

### Ellenőrzés

- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` – lásd
  QUALITY_GATE.md.

---

## 2026-10-04 – Kétlépcsős tagsági jelentkezés, adminos elbírálás, e-mail-sablonok, emlékeztető cron (D-018)

### Változások

- **Jelentkezés életciklusa** (`lib/models/membership-application.ts`):
  `elozetes` → `megerositett` → `bekuldott` → `elfogadva` / `elutasitva`
  (+ `visszavont`). Teljes adatlap-mezők a spec 7.1 szerint (születési dátum,
  cím, telefon, szakterület, munkahely vagy „nincs állandó munkahelyem”,
  rendes tagnál orvos/gyógyszerész jelölés), nyilatkozatok időbélyeggel, döntési
  adatok, belső jegyzet, emlékeztető-történet. A régi egyedi e-mail index helyett
  részleges egyedi index: egyszerre egy nyitott jelentkezés címenként.
  `npm run migrate:applications`: a meglévő `tagjelolt` rekordok `elozetes`-re,
  index csere.
- **Folytató link.** A rövid űrlap beküldése (`POST
  /api/preliminary-membership-applications`) után a jelentkező linket kap
  (`/tagsag/jelentkezes/[token]`, sha-256-tal tárolt token, 30 nap, minden
  küldéskor új). Első megnyitás = e-mail-cím ellenőrizve. Duplikált, még nem
  véglegesített jelentkezésnél a link újraküldése (napi 1×), elbírálás alatt
  lévőnél nincs levél; a válasz mindkét esetben azonos.
- **Teljes adatlap** (`full-application-form.tsx`): kategóriafüggő mezők,
  mezőszintű hibák, 2 mp-es automatikus mentés, „Mentés, később folytatom”,
  véglegesítés nyilatkozatokkal. Életkor-szabályok: 18 év, Ifjúsági 35 év
  alatt. Véglegesítés után a link állapotoldalt mutat (elbírálás alatt /
  elfogadva / elutasítva + új jelentkezés gomb).
- **Admin: Jelentkezések** (`/admin/jelentkezesek`): állapotfülek darabszámmal,
  részletező a teljes adatlappal, idővonallal, nyilatkozatokkal és a
  jelentkezéshez kiküldött levelekkel. Műveletek: elfogadás kategória-
  felülírással, elutasítás jelentkezőnek szánt indoklással (Érdemesnél külön
  sablon, spec 7.4), folytató link újraküldése, kézi emlékeztető, belső
  jegyzet, lezárás döntés nélkül. Minden művelet server action friss
  session-ellenőrzéssel.
- **E-mail-sablonrendszer** (`lib/server/email/*`, `email_templates`): 7 sablon
  (folytató link, emlékeztető, beérkezett, elfogadva, elutasítva, Érdemes
  elutasítva, admin értesítés) kódbeli alapértelmezéssel és az adminban
  szerkeszthető tárggyal + HTML-törzzsel. `{{változó}}` behelyettesítés
  HTML-escape-pel, közös MAVET-keret (fejléc, lábléc), szöveges változat
  automatikusan. `/admin/emailek`: lista, szerkesztő élő előnézettel
  (sandboxolt iframe), változó-chipek, ismeretlen változó jelzése, aktív/inaktív
  kapcsoló, alapértelmezett visszatöltése, teszt e-mail [TESZT] előtaggal.
- **E-mail-napló** (`email_logs`, `/admin/emailek/naplo`): minden sablonos
  küldés eredménye (elküldve / sikertelen / kihagyva), kiváltó (rendszer, cron,
  admin, teszt), kapcsolódó jelentkezés. Ugyanitt az ütemezett futások
  (`cron_runs`).
- **Emlékeztető cron** (`/api/cron/application-reminders`, `vercel.json`:
  naponta 07:00 UTC, `CRON_SECRET` Bearer): félbehagyott jelentkezésekre az
  utolsó aktivitás után 7, majd 14 nappal, legfeljebb 2 (kézi is számít).
- **Szövegek.** A Tagság/jelentkezés oldal és a rövid űrlap szövege a
  kétlépcsős folyamathoz igazítva; a levelek az ügyfél jóváhagyta mondatokat
  megtartják.
- **Tesztek.** 17 új (API-szerződés a folytató linkkel, renderer, adatlap-
  validáció és korhatárok, emlékeztető-ütemezés); összesen 43.

### Ismert korlátok

- Elfogadáskor még nem jön létre fiók; az elfogadó levél jelzi, hogy az
  aktiváló link külön érkezik (következő kör: `users` + aktiválás + jelszó +
  tagi belépés, díjköteles kategóriánál „fizetésre vár”).
- Nincs irányítószám → település automatikus kitöltés (spec 7.1), adatforrás
  szükséges hozzá.
- A sablon-HTML-t az admin szabadon írja; `<script>` tiltva, egyéb HTML-
  tisztítás nincs (adminisztrátori, nem publikus bevitel).
- A `package-lock.json` Windowson újragenerálva nem tartalmazza a más
  platformú natív csomagokat; Linux/macOS gépen `npm i --no-save
  @rolldown/binding-<platform>` kell a tesztekhez.

### Ellenőrzés

- `npm run typecheck`, `npm run lint` – sikeres.
- `npm run test` – 43 teszt sikeres (felhő-munkaterületen; a lokális
  környezetben a futás túllépte az időkorlátot).
- `npm run build` – sikeres (webpack, offline font-mock), 2 új publikus és
  7 új admin/cron útvonal.

---

## 2026-10-04 – Admin hitelesítés és adminkezelés (D-016, D-017)

### Változások

- **Route-csoportok.** A publikus oldalak az `app/(public)/` alá kerültek (az
  URL-ek változatlanok), a közös keret (fejlesztési sáv, fejléc, lábléc) a
  csoport `layout.tsx`-ében és a `PublicShell` komponensben van. A gyökér
  `app/layout.tsx` csak a `<html>`/`<body>` keretet, a betűket és a
  metaadatokat adja, így az admin és a belépő oldal saját keretet kap. A 404
  oldal maga teszi fel a publikus keretet (a gyökér alatt renderelődik).
- **Admin belépés** (`/mavet-login`, rejtett, `noindex`, `robots.txt`-ben is
  tiltva): e-mail + 6 jegyű, egyszer használatos kód. Az IMK projekt
  auth-rétegéből átemelve, MAVET-arculattal (navy márkapanel, embléma,
  Pagella címsor, arany haladásjelző). Kódkérés server actionnel, Redis
  tárolással (3 perc; címenként 1/perc és 20/nap; IP-nként 5 kérés/perc),
  user-enumeration védelemmel; kódellenőrzés NextAuth v4 credentials
  providerrel (`admin-otp`), timing-safe összehasonlítással, 5 hibás
  próbálkozás után zárolással, IP-nként 20 ellenőrzés/perc. JWT session 7
  nap; a szerep percenként újraolvasódik az adatbázisból, így a visszavont jog
  legfeljebb 1 percen belül mindenhol érvényesül.
- **Szerepek.** `users` gyűjtemény (`lib/models/user.ts`): `SUPERADMIN`,
  `ADMIN`, `USER`. A SUPERADMIN csak a `npm run seed:superadmin` scripttel
  (`SUPERADMIN_EMAIL`, `SUPERADMIN_NAME` env) vagy DB-szinten adható.
- **Admin keret** (`/admin`): szerveroldali layout friss session-ellenőrzéssel,
  fejléc a logóval és „Admin” jelzéssel, navigáció (Kezdőlap; SUPERADMIN-nak
  Adminok és Naplók), fiókmenü kijelentkezéssel, Toaster. A `proxy.ts` az
  `/admin/*` útvonalakat token nélkül a belépő oldalra, nem admin szereppel a
  főoldalra irányítja.
- **Adminok oldal** (`/admin/adminok`, SUPERADMIN): lista utolsó belépéssel,
  új admin felvétele név + e-mail alapján (meglévő tagi fiók előléptetése),
  jog visszavonása (átsorolás `USER`-re, nem törlés). Saját fiók és SUPERADMIN
  célpont nem módosítható. API: `GET`/`POST /api/admin/users`,
  `PATCH /api/admin/users/[id]`, mind `requireSuperAdmin` guarddal.
- **Naplók oldal** (`/admin/naplo`, SUPERADMIN): jogosultság-változások
  (`admin_audit_logs`) és belépési események (`auth_logs`) utolsó 100 sora.
- **Infra.** `lib/server/redis.ts` közös Upstash kliens (a rate limit is ezt
  használja), `lib/auth-paths.ts` függőségmentes útvonal-konstansok,
  `lib/server/auth/*` (verification, auth-logger, auth-options, session,
  admin-audit, login-code-mail), `types/next-auth.d.ts` típusbővítés.
  Új függőség: `next-auth@4`. Új env: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
  `SUPERADMIN_EMAIL`, `SUPERADMIN_NAME`.
- **Tesztek.** 9 új teszt (kódformátum, timing-safe összehasonlítás, zárolási
  küszöb, `requireAdmin`/`requireSuperAdmin` 401/403/átengedés, hibára zárt
  session-lekérés); összesen 26.
- **Dokumentáció.** D-016 és D-017 a döntési naplóban (D-002, D-006, D-008
  felülírva), `FEJLESZTESI_KERET.md` és `BACKEND_HANDOVER.md` frissítve.

### Ismert korlátok

- Az élesítéshez `NEXTAUTH_SECRET` és `NEXTAUTH_URL` beállítása, majd a seed
  script futtatása szükséges; nélkülük nincs belépés.
- Az admin menü egyelőre csak a Kezdőlapot, az Adminokat és a Naplókat
  tartalmazza; a tartalmi modulok (jelentkezések, hírek, események, szakmai
  anyagok) a következő körökben jönnek.
- Nincs 2FA és nincs admin IP-korlátozás; a belépési kód önmagában a második
  faktor (e-mail-hozzáférés).
- A tagi (USER) bejelentkezés (spec 9.1: e-mail + jelszó, jelszó-visszaállítás)
  külön körben készül.

### Ellenőrzés

- `npm run typecheck`, `npm run lint`, `npm run test` (26 teszt) – sikeres.
- `npm run build` – lásd QUALITY_GATE.md.

---

## 2026-09-26 – Kapcsolati űrlap élesítése, Facebook-oldal bekötése

### Változások

- **Éles kapcsolati végpont.** A `POST /api/contact-messages` a demó helyett a
  tagsági jelentkezéssel azonos infrastruktúrát használja: Upstash rate limit
  (IP-nként 5 üzenet / 10 perc), mentés az új `ContactMessage` modellbe
  (`contact_messages` gyűjtemény, hozzájárulás-bizonyítékkal), értesítő e-mail
  a `MAIL_TO` címre `Reply-To: feladó` fejléccel
  (`lib/server/contact-message-mails.ts`). Válaszkódok: 201 / 400 / 429 /
  500 / 503, a kérés alakja változatlan. A feladó nem kap visszaigazolást.
- **SEO-metaadatok.** A gyökér `title` alapértéke „Magyar Vidékegészségügyi
  Társaság (MAVET)”, az aloldalak sablonja „%s | Magyar Vidékegészségügyi
  Társaság”. A „fejlesztés alatt álló bemutatkozó weboldala” leírás helyett a
  hero bevezetőjével egyező, kereső- és megosztásbarát leírás. Új
  `metadataBase` (a `NEXT_PUBLIC_SITE_URL`-ből), `applicationName` és Open
  Graph adatok (`og:type`, `og:locale`, `og:site_name`, cím, leírás) a
  Facebook-megosztásokhoz.
- **Hero címsor.** A főoldal `h1`-e a Társaság teljes neve (az eddigi
  eyebrow-címke), a mottó `h2` lett. Az `Eyebrow` új `as` propja (alapból
  `p`) dönti el az elemet, így csak a hero címkéje címsor, a szekciócímkék
  továbbra is bekezdések, oldalanként egy `h1` marad. A címke `font-sans`
  osztályt kapott, hogy `h1`-ként se váltson a Palatino címsor-betűre.
- **Adatkezelési verzió.** A kapcsolati űrlap a fixen beírt `csok-2026-09-20`
  helyett a közös `privacyNoticeVersion` konstanst küldi.
- **Tesztek.** A kapcsolati végpontra 7 szerződésteszt (siker, e-mail-hiba
  melletti siker, hiányos és túl hosszú kérés, 429, 503, 500); összesen 17.
- **Fejlesztői környezet.** Projektszintű `.npmrc` (`legacy-peer-deps=false`),
  mert a gépszintű `legacy-peer-deps=true` mellett az npm kihagyta a vitest
  peer-függőségét (vite), és a tesztek nem indultak. A hiányzó
  `@rolldown/binding-win32-x64-msvc` natív csomag `npm i --no-save`-vel
  pótolható, a lockfile-t nem kell módosítani.

- **Facebook-hivatkozás.** A Társaság Facebook-oldalának címe bekerült a
  `contact.facebook` mezőbe (`lib/data/site.ts`). A `FacebookMark` ikon
  mostantól link, amely új lapon nyitja az oldalt (`rel="noopener noreferrer"`),
  hover- és fókuszállapottal, képernyőolvasónak szóló címkével.
- **Szövegek.** A főoldali „hamarosan elérhető” és a Kapcsolat oldali
  „az élesítés előtt kerül be” placeholder-mondatok végleges szövegre cserélve.

---

## 2026-09-24 – Ügyfél-visszajelzések (weboldal 1.0 javaslatok)

### Változások

- **Hero alacsony képernyőn.** Új `short-lg` Tailwind variant (legalább 1024 px
  széles és legfeljebb 760 px magas ablak). Ilyenkor kisebb a térköz, a h1
  48 px, a lead `text-lg`, az embléma köre `max-w-sm`. A h1 asztali mérete
  64 px, a mottó szavai mindig külön sorban állnak. A gombok 1366×768-on és
  150%-os skálázásnál is a hajtás fölött vannak.
- **Színes embléma világos háttéren.** Az `Eyebrow` új `emblem` propja:
  alapból színes (kék-arany), navy háttéren `mono`. A pillérkártyák ikonja is
  színes.
- **`soft` gombvariáns.** Világoskék kitöltés, navy szöveg; a navigáló
  másodlagos gombok ezt használják az `outline` helyett.
- **Kiszínesedő pillérkártyák.** Hoverre és fókuszra a duotone fotó fölé egy
  színes réteg úszik be. Érintőképernyőn ugyanez történik, amikor a kártya a
  képernyő közepére ér (`components/home/in-view-item.tsx`).
- **Csak világos megjelenés.** `color-scheme: only light` és a viewport
  `colorScheme`, hogy a mobilos kényszerített sötét mód ne barnítsa az aranyat.
- **Aloldal-fejléc.** A `PageHeader` halványkék sáv lett, jobb oldalt a
  hero tájkép halvány duotone változatával és embléma-vízjellel.

---

## 2026-09-22 – Előzetes jelentkezés: valódi backend

### Változások

- **Adatbázis.** `lib/db-connect.ts` (mongoose, Atlas, health-gated pool
  Vercel Fluid alá) és `lib/models/membership-application.ts` (séma:
  kategória, titulus, név, e-mail egyedi indexszel, `status: tagjelolt`,
  hozzájárulás-igazolás időponttal, tájékoztató-verzióval, IP-hash-sel,
  user agenttel, e-mail-kézbesítési könyvelés).
- **Kérésszám-korlátozás.** `lib/server/rate-limit.ts` (Upstash Redis,
  csúszóablak, 5 beküldés / IP / 10 perc; kulcs nélkül figyelmeztetéssel
  átenged).
- **E-mail.** `lib/server/mail.ts` (SendGrid, feladó `MAIL_FROM`), a jelentkezői
  visszaigazolás az ügyfél sablonszövegével és belső értesítés a `MAIL_TO`
  címre (`lib/server/membership-application-mails.ts`). Kulcs nélkül csak logol.
- **Route handler.** `POST /api/preliminary-membership-applications` menti a
  jelentkezőt, duplikált e-mailre `200 { duplicate: true }`-t ad újraküldés
  nélkül, korlátozáskor `429` + `Retry-After`, adatbázis-hibánál `503`.
- **Adatkezelési tájékoztató.** Alapszöveg a tényleges technológiával
  (adatfeldolgozók: Vercel, MongoDB Atlas, Upstash, SendGrid), jogalapokkal és
  érintetti jogokkal; a tájékoztató verziója (`privacyNoticeVersion`,
  `lib/data/site.ts`) minden hozzájárulással együtt tárolódik.
- **Környezet.** `.env.example` és `.env.local` váz: `MONGODB_URI`,
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SENDGRID_API_KEY`,
  `MAIL_FROM`, `MAIL_FROM_NAME`, `MAIL_TO`.
- **Teszt.** Az API-teszt mockolt adatbázissal és levélküldéssel fedi a sikeres
  mentést, a hibás adatot, a duplikációt, a korlátozást és az adatbázis-hibát.

### Ismert korlátok

- A kapcsolati űrlap (`/api/contact-messages`) továbbra is demó: nem ment és
  nem továbbít e-mailt.
- Az adatkezelési tájékoztató adatkezelői adatai és megőrzési idői az ügyfél
  jóváhagyására várnak.

---

## 2026-09-21 – Arculat: tokenek és főoldal

### Változások

- **Arculati alap (D-015).** A `globals.css` a „MAVET színpaletta v1.0” szerint
  kapott márkaszíneket (`mavet-*` tokenek) és erre épülő shadcn szemantikus
  színeket. Szövegbetű: Source Sans 3; H1–H3: Palatino verem (`--font-display`).
- **Embléma és logó.** Új `MavetEmblem` (színes és mono változat) és `MavetLogo`
  (vízszintes logó, világos és sötét tónus) komponens; a geometria és a
  logógradiensek a `lib/brand/emblem.ts`-ben vannak. A favicon és az Apple touch
  ikon az emblémából generálódik.
- **Főoldal.** Új hero (navy háttér, mottó, embléma), a mottó három pillére,
  küldetés, munkacsoport-kártyák ikonnal és sorszámmal, aktualitások blokk
  kiemelt hírrel, tagsági CTA-sáv.
- **Globális keret.** Fejléc a vízszintes logóval és arany aktív jelöléssel,
  fejlesztési sáv és lábléc navy tónusban. A gomb `gold` és `outline-inverse`
  változatot, valamint `xl` méretet kapott.

### Ismert korlátok

- A kézikönyv „Master V” path-adatai nem adják vissza a jóváhagyott emblémát,
  ezért az embléma a logólapról lett újrarajzolva. A végleges vektoros
  logócsomag (`mavet-symbol.svg`, `mavet-logo-horizontal.svg`) megérkezésekor a
  `lib/brand/emblem.ts` és a `MavetLogo` wordmarkja cserélendő.
- A Palatino rendszerbetű: Windowson és macOS-en elérhető, Androidon és Linuxon
  a verem következő talpas betűje jelenik meg.
- A kézikönyv másodlagos szövegszíne (#808080) nem teljesíti a WCAG AA-t
  folyószövegnél, ezért a `--muted-foreground` navy tónusú szürke (#4F5F7A).
- A pillérek és a tagsági CTA szövege munkaszöveg, ügyfél-jóváhagyásra vár.

### Ellenőrzés

- `npm run typecheck`, `npm run lint`, `npm run test` – sikeres.
- `npm run build` – sikeres; vizuális ellenőrzés 1440 és 390 képpont szélességen.

---

## 2026-09-21 – Előzetes tagsági jelentkezés

### Változások

- Az egyszeri indulási értesítés helyét átvette az előzetes tagsági jelentkezés.
- A Tagság oldal részletes kategóriakártyákat, az alkalmazható kategóriákhoz
  „Jelentkezem” gombot és előzetesen kitölthető jelentkezési űrlapot kapott.
- A Tiszteletbeli tagság nem kapott publikus jelentkezési lehetőséget, összhangban
  a teljes specifikációval.
- A fejléc asztali és mobil navigációjában megjelent a „Jelentkezem” művelet.
- A fejléc mobilon a hamburger menü mellett közvetlenül is megjeleníti a
  „Jelentkezem” műveletet; a fejlécsor 320 képpont szélességig sem törik.
- Az API-szerződés és az adatkezelési minta az előzetes jelentkezés céljára
  módosult.

### Ellenőrzés

- A változtatások ellenőrzése a build- és API-szerződés tesztekkel történik.

---

## 2026-09-20 – CSÖK bemutatkozó oldal

### Változások

- A felugró fejlesztési tájékoztató eltávolítva; az állapotot a navigáció fölötti
  fekete, fehér szövegű információs sáv jelzi.
- Elkészült a csökkentett funkcionalitású oldal külön specifikációja, benne az
  Aktualitások route-tal, Süti-tájékoztatóval, WCAG 2.2 AA belső céllal és a
  pontosított fejlesztés-alatti párbeszédablakkal.
- Elkészült a reszponzív, magyar nyelvű wireframe főoldal és az összes CSÖK
  aloldal, route-szegmensenként szerveroldali `layout.tsx` fájllal.
- Elkészült a mobilmenü, a minden teljes betöltéskor megjelenő fejlesztési
  tájékoztató, az állandó információs sáv és a jogi lábléc.
- Elkészült az egyszeri indulási értesítés és a kapcsolatfelvétel felülete,
  mezőszintű validációval, siker-, hiba- és korlátozási állapottal.
- Elkészült a két demó API route; ezek localhoston igazolják a szerződést, de
  e-mailt nem küldenek és éles adattárolást nem végeznek.
- Elkészült az env-függő `robots.txt`, a `sitemap.xml`, a 404 oldal és a semleges
  alkalmazásikon.

### Ellenőrzés

- `npm run typecheck` – sikeres.
- `npm run lint` – sikeres.
- `npm run test` – sikeres, 4 API-szerződés teszt.
- `npm run build` – sikeres, 13 statikus/publikus és 2 dinamikus API-végpont.
- Böngészőben ellenőrizve: nyitó párbeszédablak, belső navigáció, főoldal,
  értesítési sikerállapot és kapcsolatfelvételi mezőhibák.

### Élesítés előtti blokkolók

- Valódi kapcsolati e-mail és Facebook-hivatkozás.
- Végleges Impresszum és Adatkezelési tájékoztató.
- Valódi értesítési és kapcsolatfelvételi backend.
- `NEXT_PUBLIC_SITE_URL` és `ALLOW_INDEXING=true` csak a végleges domainen.

## 2026-09-20 – Projekt-előkészítés (fejlesztés még nem indult)

### Változások

- **Dokumentumrendezés.** A MAVET-mappa rendszerezve: `docs/01-specifikacio`,
  `docs/02-elfogadasi-kriteriumok`, `docs/03-tervezes`, `docs/04-forras-anyagok`,
  `docs/05-szerzodes-es-megbeszeles`, valamint `_archiv` a 2026.09.06-án leváltott
  munkaváltozatoknak. A rendezés nem törölt tartalmat; a fájlok másolás nélkül,
  mozgatással kerültek helyükre.
- **Irányadó forrás rögzítve** a `README.md`-ben: a 2026.09.12-i, ügyfélválaszokat
  tartalmazó szerkesztett specifikáció a legfrissebb meglévő anyag; a véglegesített
  (1. fázis + teljes) specifikáció még nem érkezett meg (D-010).
- **Technikai alap létrehozva:** Next.js 16.3.5 App Router, TypeScript, Tailwind CSS v4,
  shadcn (Base UI komponensek, `base-nova` stílus), `@/*` import alias, `src/` könyvtár
  nélkül. Telepítve: sonner, lucide-react, `cn`, `next-themes`, valamint a tesztkörnyezet
  (Vitest 5, jsdom, Testing Library).
- **shadcn alapkomponensek** előkészítve: alert, badge, button, card, checkbox, dialog,
  dropdown-menu, input, label, select, separator, sheet, skeleton, sonner, switch, textarea.
- **Döntési napló elindítva** (D-001 – D-014): prototípus jellege, fejlesztési határ,
  API-réteg, stack, route-szintű `layout.tsx` és szerveroldali renderelés, hitelesítés,
  fizetés, admin, arculat, kétfázisú scope, git- és dokumentációs rend.
- **Nem készült funkciófejlesztés:** egyetlen nyilvános aloldal vagy tagsági folyamat sem.

### Ismert korlátok

- Az 1. fázis és a teljes specifikáció még nem áll rendelkezésre, ezért a route-ok,
  az adatmodell és az API-végpontok tervezése nem indult el.
- A fejlesztői ellenőrző script (`scripts/`) még nem készült el; az első mérföldkőnél jön létre.

### Ellenőrzés

- `npm run typecheck` – sikeres. (A Next 16 generált route-típusai miatt a
  parancs `next typegen`-t futtat a `tsc` előtt; önmagában a `tsc --noEmit`
  elbukik egy friss klónon.)
- `npm run lint` – sikeres, nincs jelzés.
- `npm run test` – lefut, egyelőre nincs tesztfájl.
- `npm run build` – sikeres; 3 statikus oldal.
- `git diff --check` – tiszta.
- Fejlesztői szerver: HTTP 200, szerveroldali HTML ellenőrizve (lang="hu",
  egyetlen h1, main#tartalom, külső eredet nélkül).
