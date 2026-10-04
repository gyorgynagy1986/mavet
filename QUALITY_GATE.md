# Belső minőségi kapu

**Dátum:** 2026-10-04 (4. kör)
**Állapot:** elbírálás vége: tagi fiók elfogadáskor, aktiválás, tagi belépés
(D-019, D-020) elkészült; a 2. kör (D-018) ellenőrzései is itt.

## Ténylegesen futtatott ellenőrzések

- `npm run typecheck` – sikeres.
- `npm run lint` – sikeres, nincs jelzés.
- `npm run test` – 50 teszt sikeres (9 fájl): API-szerződés (13), e-mail-
  validáció (4), belépési kód (5), session guard (4), sablon-renderer (7),
  adatlap-validáció (6), emlékeztető-ütemezés (3), tagdíj-szabályok (5),
  jelszó (2). A felhő-munkaterületen
  futtatva; a lokális környezet lassúsága miatt ott túllépte az időkorlátot.
- `npm run build` – sikeres (webpack, offline font-mock). Új útvonalak:
  `/tagsag/jelentkezes/[token]`, `/admin/jelentkezesek`,
  `/admin/jelentkezesek/[id]`, `/admin/emailek`, `/admin/emailek/[key]`,
  `/admin/emailek/naplo`, `/api/cron/application-reminders`,
  `/fiok/aktivalas/[token]`, `/belepes`, `/fiok`, `/elfelejtett-jelszo`,
  `/jelszo-visszaallitas/[token]`.

## Nem ellenőrzött, kézi lépések

- Végigjátszás valódi Mongo + Redis + SendGrid mellett: rövid űrlap → folytató
  levél → adatlap mentése és véglegesítése → admin értesítés → elfogadás /
  elutasítás → aktiváló levél → jelszó → `/fiok` → levelek és naplók. (A felhő-munkaterületről a MongoDB-letöltést
  a hálózati szabály tiltja, ezért DB-s futtatás nem történt.)
- `npm run migrate:applications` az éles adatbázison a telepítés előtt.
- `CRON_SECRET` beállítása Vercelen, majd a cron első futásának ellenőrzése az
  E-mail naplóban.
- Admin oldalak vizuális ellenőrzése bejelentkezve.
