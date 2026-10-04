# Fejlesztési keret

A projekt technikai és munkamódszerbeli kerete. A döntések a
`DONTESI_NAPLO.md`-ban követhetők; ütközés esetén a döntési napló az irányadó.

## 1. A munka célja és határa

A teljes weboldal és tagsági rendszer ebben a projektben készül: front-end,
arculat, backend, hitelesítés és adminisztrációs felület egy kézben (D-016,
amely a korábbi D-002/D-008 „másik fejlesztő” határt felülírta). A CSÖK
bemutatkozó oldal 2026 szeptemberében elkészült; a tagsági rendszer
fejlesztése az admin hitelesítéssel indult (D-017). A specifikációhoz a lehető
legközelebb maradunk; eltérésnél a döntési napló az irányadó.

## 2. Stack

- Next.js App Router, a legújabb verzió (jelenleg 16.3.5), TypeScript.
- Tailwind CSS v4, shadcn komponensek Base UI primitívekkel (`base-nova` stílus).
- Nincs `src/` könyvtár; import alias `@/*`.
- Teszt: Vitest + Testing Library (jsdom).
- Backend: Mongoose (MongoDB Atlas), Upstash Redis (rate limit, belépési kódok),
  SendGrid (tranzakciós e-mail), NextAuth v4 (admin hitelesítés, D-017).

## 3. Kőbe vésett renderelési szabályok (D-005)

1. **Minden aloldalhoz saját `layout.tsx`.** Egy route szegmens sem maradhat
   elrendezés nélkül.
2. **A `layout.tsx` mindig szerveroldali komponens.** Soha nem kerül bele
   `"use client"` – ott nem lehet eseménykezelő, állapot vagy hook.
3. **A `page.tsx` szemantikus HTML, és ahol csak lehet, szerveroldali.**
   Címszerkezet, listák, űrlap-elemek valódi szemantikával.
4. **Az interaktivitás komponens-szintű.** Ami kliensoldali viselkedést igényel
   (űrlap, szűrő, lapozás, lenyíló, fül), az külön, `"use client"` fájlba kerül,
   és a szerveroldali lap csak összeállítja őket.
5. **Adatelérés a szerveren.** Az oldalak és az elrendezések szerveroldalon
   kérik le az adatot; a böngésző csak a szükséges adatot kapja meg.

## 4. Adat- és API-réteg

- `lib/data/*` – statikus tartalom (navigáció, kategóriák, induló hírek).
- `lib/models/*` – Mongoose sémák (`users`, `membership_applications`,
  `contact_messages`, `auth_logs`, `admin_audit_logs`).
- `lib/server/*` – szerveroldali segédek: adatbázis, levél, rate limit, Redis,
  hitelesítés (`lib/server/auth/*`).
- `app/api/*` – route handlerek; minden védett végpont `requireAdmin` /
  `requireSuperAdmin` ellenőrzéssel indul. Server action csak ott, ahol a
  hívó kizárólag a saját oldal (pl. belépési kód kérése).
- Route-csoportok: `app/(public)` a publikus oldalak (közös fejléc, lábléc),
  `app/admin` az adminisztráció, `app/mavet-login` a rejtett belépő oldal; a
  gyökér `layout.tsx` csak a `<html>`/`<body>` keretet és a betűket adja.
- A végpontok és a válaszformátumok a `BACKEND_HANDOVER.md`-ben dokumentáltak.

## 5. Munkarend

- A felhasználó adja a következő kör (chunk) briefjét; addig nincs fejlesztés.
- Egy kör: megépítés → ellenőrzés (normál, üres, hiba, mobil állapot) →
  `CHANGELOG.md` → helyi commit.
- Push és Vercel-telepítés csak kifejezett jelzésre (D-011).
- Az elkészült lapok listája és az állapotok térképe `docs/`-ben vezetve.

## 6. Mérföldkő-ellenőrzés (D-013)

Minden kör zárásakor:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run test`
4. `npm run build`
5. verziózott böngészős ellenőrző script (`scripts/`)
6. `CHANGELOG.md` bejegyzés, az eredmény `QUALITY_GATE.md`-ben

## 7. Nyitott keretfeltételek

- A teljes specifikáció v0.4 (2026.09.14) és a CSÖK v0.3 a `specification/`
  mappában; a konferenciamodul és a 13. fejezet nyitott paraméterei (jelszó-
  követelmény, fájlkorlátok) még rögzítendők.
- A meglévő forrásanyagok között évhelyőrzők és hiányzó nevek vannak; ezek nem
  tölthetők fel valós adatként (D-014).
- Nyitott ügyfélkérdések: a specifikáció 13. fejezete és
  `docs/03-tervezes/MAVET - Belső fejlesztői kérdések.md`.
