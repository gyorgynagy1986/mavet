> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Aktualitások

## Funkcionális specifikáció

**Dokumentum állapota:** egyeztetés alatt  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Oldaltérkép-fejezet:** 1.2  
**A dokumentum célja:** a híreket és eseményeket közös, publikus listaoldalon megjelenítő aktualitások modul működése.

## Tartalom

1. Aktualitások listaoldal  
2. Aktualitáskártya  
3. Hír részletes oldal  
4. Esemény részletes oldal  
5. Tartalomkezelés és adminisztratív kezelhetőség  
6. Nyitott döntések  

---

## 1. Aktualitások listaoldal

Az aktualitások listaoldal egy közös, publikus felületen jeleníti meg a MAVET híreit és eseményeit. A látogató bejelentkezés nélkül eléri az oldalt.

A lista alapértelmezésben minden közzétett aktualitást megjelenít. A látogató a következő szűrőkkel válthat a tartalomtípusok között:

- **Összes**;
- **Hírek**;
- **Események**.

A rendszer a kiválasztott szűrőnek megfelelő aktualitásokat jeleníti meg. A hírek a megjelenési dátumuk, az események az eseménydátumuk szerint szerepelnek a listában.

Ha a kiválasztott szűrőhöz nem tartozik megjeleníthető tartalom, az oldal rövid, egyértelmű üres állapot üzenetet jelenít meg.

## 2. Aktualitáskártya

Az aktualitások listaoldal az elemeket kártyák formájában jeleníti meg. Egy aktualitáskártya a következő elemeket tartalmazza:

- opcionális borítókép;
- tartalomtípus-jelölő: **„Hír”** vagy **„Esemény”**;
- cím;
- rövid lead;
- hír esetén megjelenés dátuma;
- esemény esetén eseménydátum és – ha megadott – helyszín;
- részletes oldalra vezető hivatkozás.

A teljes kártya kattintható lehet. Hiányzó borítókép esetén a kártya kép nélkül is megjeleníthető.

## 3. Hír részletes oldal

A hír részletes oldala a kiválasztott hír teljes tartalmát jeleníti meg. Az oldal publikus, önálló URL-en elérhető és megosztható.

A hír cikkoldala a következő elemeket tartalmazza:

- cím;
- megjelenés dátuma;
- rövid lead;
- teljes cikk szövege;
- opcionális borítókép és a tartalomba illesztett képek;
- opcionális hivatkozások vagy csatolt dokumentumok;
- visszavezető hivatkozás az aktualitások listaoldalra.

## 4. Esemény részletes oldal

Az esemény részletes oldala a kiválasztott esemény teljes tájékoztatóját jeleníti meg. Az oldal publikus, önálló URL-en elérhető és megosztható.

Az esemény részletes oldala a következő elemeket tartalmazza:

- cím;
- esemény dátuma és időpontja, ha megadott;
- helyszín, ha megadott;
- rövid lead és teljes leírás;
- opcionális borítókép és a tartalomba illesztett képek;
- opcionális jelentkezési vagy további információt adó hivatkozás;
- visszavezető hivatkozás az aktualitások listaoldalra.

Nem elérhető vagy nem közzétett hír vagy esemény közvetlen megnyitásakor a rendszer nem jeleníti meg a tartalmat, hanem egyértelmű „Az aktualitás nem érhető el” üzenetet ad.

## 5. Tartalomkezelés és adminisztratív kezelhetőség

Az adminisztrátor új hírt vagy eseményt hozhat létre, meglévő aktualitást szerkeszthet, közzétehet vagy visszavonhat.

Minden aktualitásnál az adminisztrátor kezeli:

- tartalomtípust: hír vagy esemény;
- címet;
- leadet;
- teljes szöveget;
- borítóképet és további képeket;
- hivatkozásokat és csatolt dokumentumokat;
- közzétételi állapotot.

Eseménynél az adminisztrátor ezen felül kezeli az esemény dátumát, időpontját, helyszínét és az opcionális jelentkezési hivatkozást.

Csak közzétett aktualitás jelenhet meg a publikus aktualitások listaoldalon, a részletes oldalán és a főoldal aktualitásblokkjában.

## 6. Nyitott döntések

Jelenleg nincs nyitott döntés.
