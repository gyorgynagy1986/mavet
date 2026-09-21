> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Fiók, regisztráció és belépés

**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Kapcsolódó részspecifikáció:** `MAVET - 2.1 Fiók és belépés funkcionális specifikáció.md`  
**Rendeltetés:** belső fejlesztési és tesztelési segédanyag; nem ügyfélnek szánt dokumentum.

## Elfogadási kritériumok

1. A látogató a tagsági kategória kiválasztása után egyetlen folyamatban megadja a fiókadatait és a választott kategóriához kötelező teljes jelentkezési adatokat; hiányos adatlapból nem jöhet létre tagsági jelentkezés.
2. A rendszer az e-mail-cím sikeres megerősítésével automatikusan hozza létre a tagjelölti állapotot; ehhez nincs külön jelentkezésbeküldő művelet. A félbehagyott vagy hiányos adatlap nem tagjelölti jelentkezés.
3. Már nyilvántartott e-mail-címre a rendszer nem hoz létre második fiókot, hanem bejelentkezési vagy jelszó-visszaállítási lehetőséget ad.
4. Az elfogadott díjmentes kategória jelentkezője fizetési lépés nélkül aktív taggá válik; az elfogadott tagdíjköteles kategória jelentkezője csak a fizetési felhívás teljesítése után válik aktív taggá. Az aktív tagságról szóló e-mail a saját profilra vezet.
5. Tagjelölti állapotban nem érhető el tagsági kedvezmény vagy egyéb tagi szolgáltatás.
6. A felhasználó érvényes e-mail-címmel és jelszóval be tud jelentkezni, kijelentkezés után pedig a tagi felületekhez ismét bejelentkezés szükséges.
7. A fiók e-mail-címe egyszer használható megerősítő hivatkozással megerősíthető.
8. A jelszó-visszaállítási kérés a fiók létezésétől függetlenül semleges visszajelzést ad; érvényes fiók esetén egyszer használható, lejáró hivatkozást küld.
9. A tagjelölt a létrejött tagsági jelentkezése állapotát és saját jelentkezési adatait, az aktív tag a saját profiladatait és tagsági állapotát tekintheti meg és szerkesztheti a jogosultsága szerint. Az aktív tag egy profilképet feltölthet, lecserélhet vagy eltávolíthat; más saját fájlt az induló rendszerben nem tölthet fel a profiljához.
10. Csak aktív tag állíthatja be adatmezőnként a publikus profilján megjelenő adatokat. A publikusan megjeleníthető mezők: név, portrékép, szakterület, munkahely, rövid szakmai bemutatkozás, szakmai érdeklődési területek és munkacsoport-tagság. A születési adatok, postai cím, telefonszám, e-mail-cím, tagsági azonosító és fizetési adatok nem tehetők publikussá.
11. Teljes publikus elrejtés esetén a tag sem a publikus névjegyzékben, sem közvetlen publikus profiloldalon, sem vezetőségi vagy bizottsági kártyán nem érhető el. A beállítás azonnal érvényesül és nem igényel jóváhagyást.
12. A publikus névjegyzék az induló változatban egyszerű lista, kereső és szűrő nélkül.
13. Tagjelölt és aktív tag a jelenlegi jelszava és külön megerősítés megadásával azonnal törölheti a fiókját és a tagságát. A rendszer eltávolítja a publikus profilt, megszünteti a belépési hozzáférést, visszaigazoló e-mailt küld, és a fiók nem állítható vissza.
14. A tag a saját fiókjában feliratkozhat az e-mail-listára vagy leiratkozhat róla; ez nem érinti a tagsági nyilvántartáshoz szükséges adatok kezelését.
15. A Saját fiókban külön elérési pont jelenhet meg a felhasználó saját konferencia-regisztrációihoz; a részleteket és a jogosultságot a külön konferenciamodul szabályai határozzák meg.
16. Hibás vagy hiányzó adatok esetén az űrlapok közérthető hibaüzenetet adnak, sikertelen mentés esetén pedig a kitöltött mezők értékei megmaradnak.
