# Backend – API és adatmodell

**Állapot:** a CSÖK két publikus végpontja és az admin hitelesítés (D-017) él;
a tagsági rendszer további végpontjai körönként kerülnek ide.

## 1. Felelősség

A backend, a hitelesítés és az adminisztrációs felület ebben a projektben
készül (D-016). Ez a dokumentum a rendszer API-jainak, adatmodelljének és
környezeti változóinak nyilvántartása. Minden védett végpont szerveroldalon
ellenőrzi a jogosultságot (`requireAdmin` / `requireSuperAdmin`,
`lib/server/auth/session.ts`); a felületen elrejtett gomb nem védelem
(specifikáció 12.2).

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

## 3. Admin hitelesítés és adminkezelés (D-017)

### Folyamat

1. `/mavet-login` (rejtett, noindex): az admin megadja az e-mail-címét. A
   `requestLoginCode` server action (`app/mavet-login/actions.ts`) ismeretlen
   vagy nem admin címre is „siker” választ ad (kis véletlen késleltetéssel), így
   a felületről nem deríthető ki, ki admin. Admin címre 6 jegyű kód megy
   SendGriddel (`lib/server/auth/login-code-mail.ts`).
2. A kód Redisben él (`mavet:auth:code:<email>`, 3 perc). Címenként 1 kód /
   perc, 20 kód / nap; IP-nként 5 kérés / perc.
3. A kódot a NextAuth `admin-otp` credentials provider ellenőrzi
   (`lib/server/auth/auth-options.ts`): timing-safe összehasonlítás, 5 hibás
   próbálkozás után a kód törlődik, IP-nként 20 ellenőrzés / perc.
4. Siker: JWT session (7 nap). A tokenben lévő szerep percenként újraolvasódik
   az adatbázisból, így a visszavont jog legfeljebb 1 percen belül az API-kon
   is érvényesül. `lastLoginAt` frissül a `users` rekordon.
5. `proxy.ts`: az `/admin` útvonalakra token nélkül → `/mavet-login`, nem admin
   szereppel → `/`. Az `app/admin/layout.tsx` friss session-nel újra ellenőriz.

### Szerepek (`users.role`)

| Szerep | Jog |
| --- | --- |
| `SUPERADMIN` | Minden admin funkció + adminok felvétele, visszavonása, naplók. Csak a `npm run seed:superadmin` script vagy DB-szintű módosítás adja. |
| `ADMIN` | Az admin felület minden tartalmi funkciója (a következő körökben). |
| `USER` | Tagi fiók (későbbi kör); az admin felületet nem éri el. Jog visszavonása = átsorolás `USER`-re, nem törlés. |

A szervezeti tisztség (elnök, bizottsági tag) nem szerep, hanem tagsági adat
(specifikáció 1.2).

### Végpontok

- `GET /api/auth/*` és `POST /api/auth/*` – NextAuth (session, signin, signout, csrf).
- `GET /api/admin/users` – SUPERADMIN. Az admin szintű felhasználók listája
  (`{ data: AdminUserListItem[] }`).
- `POST /api/admin/users` – SUPERADMIN. Body: `{ email, name }`. Új cím → új
  `ADMIN` (`201`); meglévő `USER` → előléptetés (`200`, `promoted: true`);
  meglévő admin → `409`; hibás adat → `400`.
- `PATCH /api/admin/users/[id]` – SUPERADMIN. Body: `{ role: "ADMIN" | "USER" }`.
  Saját fiók → `400`; SUPERADMIN célpont → `403`; nincs ilyen → `404`.

Minden mutáció `admin_audit_logs` bejegyzést ír (ki, kin, mit, IP, user agent).

### Gyűjtemények

- `users` – `email` (egyedi), `name`, `role`, `lastLoginAt`, időbélyegek.
- `auth_logs` – minden belépési esemény (kódkérés, küldés, hibás kód, zárolás,
  siker) e-maillel, IP-vel, user agenttel. Nincs TTL.
- `admin_audit_logs` – jogosultság-változások actor → target viszonnyal. Nincs TTL.

### Környezeti változók

`NEXTAUTH_SECRET` (kötelező, `openssl rand -base64 32`), `NEXTAUTH_URL` (a
telepítés publikus origin-je), `SUPERADMIN_EMAIL` és `SUPERADMIN_NAME` (csak a
seed scripthez), `CRON_SECRET` (az ütemezett feladatokhoz; Vercel
automatikusan küldi), `NEXT_PUBLIC_SITE_URL` (a levelekben szereplő linkekhez). Redis nélkül a belépés nem működik (a kódoknak tároló kell); a
rate limit Redis-hiba esetén átenged (fail open), a kódellenőrzés nem.

## 4. Tagsági jelentkezés (D-018)

### Folyamat

1. `POST /api/preliminary-membership-applications` (változatlan kérés: `category`,
   `title`, `lastName`, `firstName`, `email`, `consent`, `privacyNoticeVersion`)
   → `membership_applications` rekord `elozetes` állapotban, `201`. A
   jelentkező a `jelentkezes_folytatas` sablonnal folytató linket kap
   (`/tagsag/jelentkezes/<token>`; a tokenből csak sha-256 hash tárolódik,
   30 napig érvényes, minden küldés újat generál). Nyitott jelentkezéssel
   rendelkező címre `200 { duplicate: true }`; ha az még nincs véglegesítve, a
   link újra kimegy (címenként napi 1×).
2. A link első megnyitása: `megerositett` + `emailVerifiedAt`. Az oldal a
   teljes adatlapot mutatja; `saveApplicationDraft` (server action, 60/10 perc/IP)
   bármikor ment, `finalizeApplication` validál (lib/validation/
   membership-application.ts), nyilatkozatokat rögzít, `bekuldott` + `submittedAt`,
   majd `jelentkezes_beerkezett` a jelentkezőnek és `admin_uj_jelentkezes` a
   `MAIL_TO` címre.
3. Admin (`/admin/jelentkezesek/[id]`, server actionök, admin session):
   `acceptApplication(id, category)` → `elfogadva`, `acceptedCategory`,
   `jelentkezes_elfogadva`; `rejectApplication(id, message)` → `elutasitva`,
   `decisionMessage`, `jelentkezes_elutasitva` vagy Érdemesnél
   `jelentkezes_elutasitva_erdemes`; `resendContinueLink`, `sendManualReminder`,
   `saveInternalNote`, `withdrawApplication` (→ `visszavont`, token törölve).
4. Elutasítás után a rövid űrlap új rekordot hoz létre (a részleges egyedi index
   csak a nyitott állapotokra vonatkozik).

### Emlékeztetők

`GET /api/cron/application-reminders` (`Authorization: Bearer CRON_SECRET`,
`vercel.json`: naponta 07:00 UTC). Félbehagyott (`elozetes`, `megerositett`)
jelentkezések: az utolsó aktivitás után 7 nappal az első, az első után 14
nappal a második emlékeztető, utána nincs több; a kézi emlékeztető is számít.
Minden futás `cron_runs` rekord (átnézett, küldött, hibák).

### E-mail-sablonok

Kulcsok és változók: `lib/server/email/registry.ts`. Az admin mentett
változata (`email_templates`) felülírja a kódbeli alapértelmezést; `enabled:
false` esetén a küldés kimarad (naplózva). Küldés: `sendTemplatedMail` →
`email_logs` (`sent` / `failed` / `skipped`, `triggeredBy`, `applicationId`).
A sablon csak a törzs; a keretet `wrapInMailLayout` adja.

### Gyűjtemények

- `membership_applications` – lásd a sémát; indexek: `email_open_unique`
  (részleges), `continueTokenHash`, `status + lastActivityAt`.
- `email_templates`, `email_logs`, `cron_runs`.

Migráció meglévő adatbázison: `npm run migrate:applications`.

## 5. Tagi fiók és aktiválás (D-019, D-020)

- Elfogadáskor (`acceptApplication`) a `createMemberFromApplication`
  létrehozza vagy frissíti a `users` rekordot (`role: USER`, profil a
  jelentkezésből, `membership.status: aktivalasra_var`), az
  `activationOutcome` az elfogadás dátuma alapján dönt: díjmentes vagy 2026-ig
  → `paidThroughYear`; díjköteles 2027-től → `membership.feeDue` (összeg, év,
  határidő = elfogadás + 30 nap). Levél: `jelentkezes_elfogadva` vagy
  `jelentkezes_elfogadva_dijkoteles`, benne a `/fiok/aktivalas/<token>` link
  (sha-256 hash a useren, 7 nap; `resendActivationLink` újat generál).
- Aktiválás (`activateAccount` server action): jelszó-szabály (D-020), bcrypt,
  `membership.status` → `aktiv` vagy `fizetesre_var`, `activatedAt`, token
  törlése, `ACCOUNT_ACTIVATED` az `auth_logs`-ban, majd automatikus belépés.
- Belépés: NextAuth `member-password` provider (`/belepes`); session
  `user.role = USER`. `/fiok` szerveroldalon ellenőrzi a sessiont, admin
  szerepet az adminba irányít.
- Jelszó-visszaállítás: `requestPasswordReset` (semleges válasz) →
  `sendPasswordResetMail` (`passwordResetTokenHash`, 1 óra) → `resetPassword`
  a `/jelszo-visszaallitas/<token>` oldalon; belépve `changePassword`.
- A fejléc fiókmenüje a `/api/auth/session` végpontból olvassa a sessiont a
  kliensen.
- Admin tagkezelés (`/admin/tagok/[id]`, server actionök): `changeMemberCategory`,
  `revokeMembership` (→ `megszunt`, `revokedAt/ByEmail/Reason`, opcionális
  `tagsag_megszunt` levél), `restoreMembership`, `deleteMember` (SUPERADMIN;
  `users` törlés + `membership_applications` anonimizálás). Mind
  `admin_audit_logs` bejegyzéssel.
- Profil (`/fiok/profil`, server actionök): `updateProfile` (9.2 mezők),
  `updateVisibility` (`visibility.enabled` + mezőnkénti flagek, 9.3),
  `uploadProfilePhoto` / `removeProfilePhoto` (sharp → WebP 512 px → Vercel
  Blob `profil/<userId>/<ts>.webp`, `BLOB_READ_WRITE_TOKEN`). Saját fióktörlés:
  `deleteOwnAccount` (jelszó + megerősítés; `users` törlés, jelentkezések
  anonimizálva, `fiok_torolve` levél). Admin: `updateMemberOffice`
  (`office`, `boardMember`). A névjegyzék és a publikus elnökségi kártyák a
  `visibility.enabled` + `membership.status = aktiv` (+ `boardMember`) szűrésre
  épülnek majd.
- Fizetés, megújítás, lejáratás: következő körök.

## 6. Elvárt adatok és állapotok

_A további területek (fizetés, tagi névjegyzék, profil, tartalom, szakmai
anyagok, konferencia) adatköre a következő körökben kerül ide._

## 7. Nyitott döntések, amelyek a backendet érintik

A projekt-specifikáció nyitott `ND-xx` kérdései közül az alábbiak befolyásolják a
backend működését: ND-01 (első tagdíj elmaradása), ND-17 (számla és díjbekérő),
ND-30 (munkacsoport-csatlakozás kezelése), ND-33 (díjak és éves időszak),
ND-37 (fájlok, formátumok, videóbeágyazás), ND-38 (megújítási értesítés),
ND-44 (hírlevélküldés). Ezek lezárása nélkül az érintett funkció nem
tekinthető véglegesnek.

## 8. Technikai környezet

- Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn komponensek (D-004).
- Nincs `src/` könyvtár, az import alias `@/*`.
- Minden aloldal saját `layout.tsx`-szel rendelkezik, szerveroldali
  komponensként; a `page.tsx` szemantikus HTML és szerveroldali, az interaktív
  részek külön kliens komponensekben élnek (D-005).
- MongoDB Atlas (Mongoose), Upstash Redis, SendGrid, NextAuth v4 (D-016, D-017).
  Fizetési integráció (SimplePay) még nincs (D-007 szerint csak ellenőrzött
  visszaigazolás aktiválhat).

## Aktualitások (hírek és események)

- Gyűjtemény: `posts` (`lib/models/post.ts`); indexek: egyedi `slug`,
  `type + status + publishedAt`, `type + status + endsAt + startsAt`.
- Szabályok adatbázis nélkül: `lib/posts.ts` (validáció, magyar idő → UTC,
  `eventWindow`, `eventPhase`, `toPostView`, `composeHomePreview`).
  Lekérdezések: `lib/server/posts.ts`. Admin műveletek (server actionök):
  `app/admin/aktualitasok/actions.ts` (`savePost`, `setPostFeatured`,
  `deletePost`, `uploadPostImage`, `removePostImage`).
- Az esemény `startsAt` / `endsAt` mezője minden mentéskor a beírt magyar
  dátumból és időből számolódik; az „aktuális vagy korábbi” besorolás ezekből
  jön lekérdezéskor, ütemezett feladat nincs hozzá.
- Statikus oldalak érvénytelenítése: `revalidatePosts(slug)` a
  `lib/server/revalidate-public.ts`-ben; minden új, bejegyzést módosító
  műveletnek hívnia kell.
- Képek: `lib/server/post-image.ts`, Blob mappa `aktualitasok/<postId>/`.
- Első feltöltés: `npm run seed:news`.

