# Döntési napló

A projekt során meghozott döntések és a tudatosan későbbre halasztott kérdések
nyilvántartása. Cél, hogy a front-end, a vizuális kör és a backend átadás
ugyanazokból a döntésekből induljon ki. **Az elfogadott döntések a
specifikációval szemben is irányadók** – eltérés esetén a döntési napló nyer.

**Utolsó frissítés:** 2026-09-21 – D-015 rögzítve.

## Állapotjelölések

- **Elfogadva** – a további munkában ez az érvényes döntés.
- **Később eldöntendő** – szándékosan nyitva hagyott kérdés.

| Azonosító | Dátum | Téma | Döntés | Állapot | Következmény / teendő |
| --- | --- | --- | --- | --- | --- |
| D-001 | 2026-09-20 | A „wireframe” jelentése | A wireframe egy működő, shadcn-alapú, végigkattintható front-end prototípust jelent, nem statikus drótvázat. | Elfogadva | A képernyők és interakciók közvetlenül kódban készülnek, arculat nélkül. |
| D-002 | 2026-09-20 | Fejlesztési határ | A front-end (működő wireframe) elkészítése a mi feladatunk. A vizuális arculat és a backend egy másik fejlesztő feladata, aki a kész front-endre épít. | Elfogadva | A front-end az átadási pont; a szerkezet, az állapotok és az adatok legyenek teljesek és dokumentáltak. |
| D-003 | 2026-09-20 | Backend kapcsolódás | A felület valódi HTTP API-rétegen keresztül éri el az adatokat: típusos kliens + Next route handlerek, mintaadattal. A backend fejlesztő a handlerek belsejét cseréli. | Elfogadva | A `BACKEND_HANDOVER.md` a szerződés; a felület kódja a backend cseréjekor nem változik. |
| D-004 | 2026-09-20 | Technológiai stack | Next.js App Router (legújabb verzió), TypeScript, Tailwind CSS v4, shadcn komponensek. Nincs `src/` könyvtár, `@/*` alias. | Elfogadva | Kötelező ügyfélkövetelmény; a stack a projekt indulásakor rögzítve. |
| D-005 | 2026-09-20 | Route-szintű elrendezés és renderelés | Minden aloldalhoz saját `layout.tsx` készül, szerveroldali komponensként. A `page.tsx` szemantikus HTML és – ahol lehet – szerveroldali. Interaktív részek külön kliens komponensekbe kerülnek. | Elfogadva | `layout.tsx` soha nem `"use client"`. Az interaktivitás komponens-szintű, nem lapszintű. |
| D-006 | 2026-09-20 | Hitelesítés | A prototípus nem használ valódi hitelesítést: minta-munkamenet böngészőtárban, demó fiókokkal és állapotgalériával. | Elfogadva | Nincs valódi jelszó, token vagy külső szolgáltatás a prototípusban. |
| D-007 | 2026-09-20 | Fizetés | A prototípus szimulált SimplePay-folyamatot mutat (siker, megszakítás, késői visszaigazolás). Az aktiválás kizárólag ellenőrzött sikeres visszaigazolásból történhet. | Elfogadva | Nincs fizetési kulcs vagy valódi tranzakció; a szabály a demóban is érvényes. |
| D-008 | 2026-09-20 | Adminisztrációs felület | Admin felület nem készül; azt a backend fejlesztő tervezi. | Elfogadva | A tagsági és tartalmi állapotok a fejlesztői állapotgalériából állíthatók a demóhoz. |
| D-009 | 2026-09-20 | Arculat hiánya | Nincs logó, márkabetűtípus és szín; a prototípus semleges, szürkeárnyalatos wireframe-palettát használ. Az arculati kör később, a másik fejlesztővel készül. | Elfogadva | Semleges paletta és semleges betűtípus; a végleges arculat nem része ennek a körnek. |
| D-010 | 2026-09-20 | Kétfázisú scope | Két specifikáció létezik: 1. fázis (szűkített funkciókészlet, korábbi bemutatóhoz) és a teljes projekt. A pontos scope-ok még nem érkeztek meg. | Később eldöntendő | Amíg a két specifikáció nincs meg, funkciófejlesztés nem indul; addig csak a projekt kerete és a technikai alap készül. |
| D-011 | 2026-09-20 | Git-munkarend | Mérföldkövenként helyi commit készül; push és Vercel-telepítés csak kifejezett jelzésre. | Elfogadva | A commit szerző e-mail-címe `szigethy.peter@acg.hu` (a Vercel csak hitelesített címet fogad el). |
| D-012 | 2026-09-20 | Dokumentáció | A projekt dokumentumai magyarul, a kód és a technikai megjegyzések angolul készülnek. A változásnapló és a backend handover élő Markdown dokumentum. | Elfogadva | Minden mérföldkőnél `CHANGELOG.md` frissítés. |
| D-013 | 2026-09-20 | Mérföldkő-ellenőrzés | Minden mérföldkő zárása: `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build`, verziózott böngészős ellenőrző script, valamint CHANGELOG-bejegyzés. | Elfogadva | Az ellenőrzés eredménye a `QUALITY_GATE.md`-ben dokumentálva. |
| D-014 | 2026-09-20 | Mintaadatok | A prototípus kizárólag szándékosan létrehozott mintaadatokkal működik; a forrásanyagok évhelyőrzői és hiányzó nevei nem tölthetők fel valós adatként. | Elfogadva | Az ügyfélforrásokból származó hiányos tartalom jelölt minta vagy üres állapot formájában jelenik meg. |
| D-015 | 2026-09-21 | Arculat bevezetése | Az ügyfél arculatterve (színpaletta v1.0, tipográfiai hierarchia, V embléma) megérkezett; az arculati kör a front-enden belül készül, elsőként a főoldalon. A D-009 semleges palettája ezzel megszűnik. | Elfogadva | Márkatokenek a `globals.css`-ben, embléma a `lib/brand/emblem.ts`-ben; a végleges vektoros logócsomag érkezésekor az embléma cserélendő. |
