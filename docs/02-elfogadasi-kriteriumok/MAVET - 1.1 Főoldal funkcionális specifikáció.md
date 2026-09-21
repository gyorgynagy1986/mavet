> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Főoldal

**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Kapcsolódó részspecifikáció:** `MAVET - 1.1 Főoldal funkcionális specifikáció.md`  
**Rendeltetés:** belső fejlesztési és tesztelési segédanyag; nem ügyfélnek szánt dokumentum.

## Elfogadási kritériumok

1. A publikus látogató a főoldal megnyitásakor látja a hero képet, a rövid főüzenetet, a legfeljebb kétmondatos leadet és a tagsági jelentkezés CTA-ját.
2. A hero CTA a tagsági jelentkezést indító oldalra vezet.
3. A látogató a rövid A Társaságról blokk gombjával eléri a részletes bemutatkozó oldalt.
4. A rendszer a kiemelt aktualitást hírként vagy eseményként, vizuálisan megkülönböztetett kártyán jeleníti meg.
5. Minden aktualitáskártyán látható a tartalom típusa, címe, dátuma és részletes oldalra vezető hivatkozása; eseménynél a helyszín is látható, ha megadott.
6. Az aktualitások blokkjában összesen legfeljebb hat kártya jelenik meg: kiemelt kártya esetén egy kiemelt és legfeljebb öt normál kártya, kiemelt kártya nélkül legfeljebb hat normál kártya.
7. Mobilon az aktualitáskártyák egy oszlopban, egymás alatt jelennek meg; oldalirányú lapozó kártyasor nem jelenik meg.
8. A munkacsoportok és projektek publikus előnézetként jelennek meg, de a főoldalról nem indítható közvetlen munkacsoport-csatlakozás.
9. A hírlevél-feliratkozás hibás vagy hiányzó e-mail-cím, illetve elfogadatlan adatkezelési nyilatkozat esetén inline hibaüzenetet ad.
10. Sikeres hírlevél-feliratkozás esetén a feliratkozás azonnal végleges, a látogató helyben egyértelmű visszajelzést kap, és nincs megerősítő e-mailes lépés.
11. A partneri sáv csak akkor jelenik meg, ha legalább egy partnernév vagy partnerlogó megjeleníthető; a partnerhez külső hivatkozás opcionálisan rendelhető, és új böngészőlapon nyílik meg.
12. A főoldal tartalma mobil és asztali nézetben is használható, átfedő vagy levágott interaktív elem nélkül.
