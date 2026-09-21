# MAVET egységes elfogadási kritériumok

**Verzió:** 0.3 | **Dátum:** 2026.09.06.

Belső ellenőrzési segédlet. Az egységes specifikáció 12.4. fejezetének másolata; eltérés esetén az egységes specifikáció az irányadó. A nyitott döntések nem tekinthetők lezárt követelménynek.

A megvalósítás ellenőrzése az alábbi fő folyamatokra terjed ki. Az ND-azonosítóval jelzett részek csak az érintett döntés lezárása után véglegesíthetők.

1. Hiányos vagy nem megerősített első regisztráció nem hoz létre tagjelölti jelentkezést; teljes regisztráció megerősítése igen.
2. A jelentkező nem szerkesztheti a beadott adatlapját. Az admin elfogadhatja vagy elutasíthatja azt.
3. Elutasítás után ugyanazon fiókból új jelentkezés indítható, a korábbi döntés felülírása nélkül.
4. Díjmentes elfogadás aktivál; díjköteles elfogadás csak fizetési felhívást eredményez. Díjköteles kategóriában az aktiválás csak ellenőrzött sikeres SimplePay-fizetés után történik.
5. Az ND-08 javaslat elfogadásával minden nem aktív állapotban tiltott a tagi anyagok és a tagi névjegyzék hozzáférése.
6. Minden aktív tag azonos jogosultsággal éri el a közzétett tagi anyagokat és a látható tagok teljes névjegyzékét.
7. A megújítási felhívás a rögzített időpontban elkészül; nemfizetéskor a tagság lejár, a saját fiók és profil megmarad.
8. Lejárt tagság új befizetéssel, új elbírálás nélkül helyreállítható. Ismételt fizetési visszaigazolás nem hosszabbít kétszer.
9. A megjelenést kikapcsoló vezető neve, kártyája és profilja sem publikus oldalon, sem a tagi listában vagy keresőben nem érhető el. Általános tag engedélyezett profilja csak aktív tagoknak olvasható.
10. A tag saját tisztségét, kategóriáját és munkacsoport-tagságát nem szerkesztheti.
11. Az Aktualitások oldalon az aktuális események megelőzik a híreket; a befejezett esemény a korábbiak közé kerül, részletes oldala megmarad.
12. A főoldali előnézet legfeljebb hat, ismétlés nélküli kártyából áll; egy kézi kiemelés mellett a többi hely automatikus, oldalirányú lapozás nélkül.
13. A szakmai anyag elrejthető és ismét közzétehető. Cím alapján kereshető és kategória szerint szűrhető; a dokumentum új böngészőfülön nyílik meg, a videó a listában ágyazható be, külön részletező oldal nélkül. A saját tárolású tagi fájl közvetlen címről sem olvasható jogosultság nélkül.
14. A névkeresés a teljes látható taglistán működik. Lapozás közben a feltételek megmaradnak, feltételváltás az első oldalra visz.
15. A hírlevél-feliratkozás fiók nélkül működik, nem duplikál címet, a leiratkozás pedig bejelentkezés nélkül is elérhető és nem tiltja le a működéshez szükséges fiókleveleket.
16. A fióktörlés külön megerősítést igényel, megszünteti a hozzáférést és a profilmegjelenést, és nem tévesztendő össze a tagság lejáratával.
