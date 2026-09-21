# Fejlesztési keret

A projekt technikai és munkamódszerbeli kerete. A döntések a
`DONTESI_NAPLO.md`-ban követhetők; ütközés esetén a döntési napló az irányadó.

## 1. A munka célja és határa

Működő, végigkattintható **front-end wireframe** készül (D-001), magas
kódminőségben. A vizuális arculat és a backend egy másik fejlesztő feladata; a
front-end adja át a szerkezetet, az állapotokat, az adatmodellt és az
API-szerződést (D-002, D-003). A kliens a wireframe-et látja, és szükség esetén
módosítást kér; a specifikációhoz a lehető legközelebb maradunk.

## 2. Stack

- Next.js App Router, a legújabb verzió (jelenleg 16.3.5), TypeScript.
- Tailwind CSS v4, shadcn komponensek Base UI primitívekkel (`base-nova` stílus).
- Nincs `src/` könyvtár; import alias `@/*`.
- Teszt: Vitest + Testing Library (jsdom).
- Nincs valódi hitelesítés, fizetés vagy külső szolgáltatás (D-006, D-007).

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

- `lib/data/*` – mintaadatok, ez a későbbi backend cseréjének egyetlen pontja.
- `app/api/*` – route handlerek; ők adják a valódi HTTP-végpontokat.
- `lib/api/*` – típusos kliens, amit a felület használ.
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

- **A véglegesített specifikációk (1. fázis és teljes) még nem érkeztek meg**
  (D-010). Amíg nincs meg mindkettő, nem indul funkciófejlesztés.
- A meglévő forrásanyagok között évhelyőrzők és hiányzó nevek vannak; ezek nem
  tölthetők fel valós adatként (D-014).
- Nyitott ügyfélkérdések: a specifikáció 13. fejezete és
  `docs/03-tervezes/MAVET - Belső fejlesztői kérdések.md`.
