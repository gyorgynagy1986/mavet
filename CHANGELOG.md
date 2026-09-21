# Változásnapló

A projekt változásnaplója (D-012). Bejegyzések dátuma szerint, csökkenő sorrendben.

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
