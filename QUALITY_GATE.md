# Belső minőségi kapu

**Dátum:** 2026-09-21
**Állapot:** a CSÖK bemutatkozó oldal fejlesztési változata elkészült.

## Eredmény

A technikai alap és a CSÖK-specifikáció szerinti publikus bemutatkozó felület
elkészült és ellenőrzött. A teljes tagsági rendszer továbbra sem része ennek a
mérföldkőnek.

## Ténylegesen futtatott ellenőrzések

_Az eredmények a kör zárásakor kerülnek ide kitöltésre._

- `npm run typecheck` (`next typegen && tsc --noEmit`) – sikeres. Megjegyzés: a
  Next 16 route-típusai (`LayoutProps`, `PageProps`) generáltak, ezért a
  `tsc` önmagában nem elég; a `next typegen` fut előtte.
- `npm run lint` – sikeres, nincs jelzés.
- `npm run test` – sikeres; 4 API-szerződés teszt.
- `npm run build` – sikeres; 14 statikus oldal, 2 előre generált aktualitás-oldal
  és 3 dinamikus végpont (2 API-route és a jelentkezési oldal).
- `git diff --check` – tiszta.
- Fejlesztői szerver: `http://localhost:3000` → HTTP 200. A szerveroldali HTML
  ellenőrizve: `lang="hu"`, egyetlen `h1`, `main#tartalom` jelen van, külső
  eredetű erőforrás nincs (a betűtípus a build során kerül kiszolgálásra).
- Böngészős ellenőrzés – sikeres: popup, belső navigáció, főoldali értesítés és
  kapcsolatfelvételi validáció. A fejléc mobil változata 320, 360 és 414 képponton
  mérve: a „Jelentkezem” művelet a hamburger menü mellett jelenik meg, a sor nem
  csordul túl és nem fedi egymást (fejmagasság 32 képpont, 8 képpont térköz). A
  fejlesztői szerver a gép fájlfigyelő-korlátja
  miatt `EMFILE` hibát adott; a production build `npm run start` alatt stabilan
  fut és localhoston ellenőrizhető.

## Nyitott, kézi elfogadási lépések

- Valódi backend és végleges éles kapcsolati/jogi adatok bekötése.
- Teljes mobil- és WCAG 2.2 AA kézi audit az éles tartalom véglegesítése után.
