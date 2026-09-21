> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – oldaltérkép

**Állapot:** előkészítés alatt  
**Cél:** a rendszer teljes navigációs és hozzáférési struktúrájának rögzítése. Az itt szereplő oldalak részletes funkcionális leírása a `MAVET - Funkcionális specifikáció.md` dokumentumban készül el.

## Jelölések

- **✅ Kidolgozott specifikáció** – az oldal vagy funkció részletes működési leírása már elkészült. A jelölés nem fejlesztési készültséget és nem minden kapcsolódó üzleti döntés lezárását jelenti.
- **Publikus** – bejelentkezés nélkül elérhető.
- **Tagjelölt** – teljesen kitöltött, e-mailben megerősített regisztrációval létrejött, folyamatban lévő tagsági jelentkezéssel és fiókkal rendelkező felhasználó.
- **Aktív tag** – elfogadott tagsággal rendelkező felhasználó; tagdíjköteles kategóriában az aktív státuszhoz a tagdíj beérkezése is szükséges. A részletes hozzáférést a tagsági kategória szabályozza.
- **Admin** – adminisztrációs jogosultsággal rendelkező felhasználó.
- **Szervező** – konferencia-szervezői jogosultsággal rendelkező felhasználó.

## 1. Publikus oldalstruktúra

```text
✅ Főoldal                                                     [Publikus]
│
├── A Társaságról                                               [Publikus]
│   ├── Küldetés és jövőkép                                    [Belső hivatkozás]
│   ├── Történet                                                [Belső hivatkozás]
│   ├── Vezetőség és bizottságok                               [Belső hivatkozás]
│   │   └── Tagi profil                                         [Publikus, tagi láthatósági beállítás szerint]
│   └── Alapszabály és hivatalos dokumentumok                  [Belső hivatkozás]
│
├── Tagság                                                      [Publikus]
│   ├── Miért érdemes csatlakozni?                             [Publikus]
│   ├── Tagsági kategóriák                                     [Publikus]
│   ├── Tagdíjak                                                [Publikus]
│   ├── Tagfelvételi folyamat                                  [Publikus]
│   ├── Gyakran ismételt kérdések                              [Publikus]
│   ├── Tagsági jelentkezés és fióklétrehozás                   [Publikus]
│   └── Bejelentkezés                                           [Publikus]
│
├── Tagi névjegyzék                                             [Publikus]
│   └── Tagi profil                                             [Publikus, tagi láthatósági beállítás szerint]
│
├── Díjazottak és elismerések                                  [Publikus]
│   ├── Díjtípusok                                              [Publikus]
│   ├── Éves díjazotti archívum                                [Publikus]
│   └── Díjazotti részletes oldal                              [Publikus]
│
├── Támogatók és együttműködő partnerek                        [Publikus]
│   └── Partner részletes oldal / külső hivatkozás             [Publikus]
│
├── Munkacsoportok és projektek                                [Publikus]
│   ├── Munkacsoport részletes oldal                           [Publikus]
│   └── Projekt részletes oldal                                [Publikus]
│
├── ✅ Aktualitások                                             [Publikus]
│   ├── ✅ Összes / Hírek / Események szűrő                     [Publikus]
│   ├── ✅ Hír részletes oldal                                 [Publikus]
│   └── ✅ Esemény részletes oldal                             [Publikus]
│
├── Szakmai anyagok                                            [Publikus / vegyes hozzáférés]
│   ├── Szakmai ajánlások                                      [Publikus / Aktív tag – tartalom szerint]
│   ├── Előadások                                               [Publikus / Aktív tag – tartalom szerint]
│   ├── Publikációk                                             [Publikus / Aktív tag – tartalom szerint]
│   ├── Videók                                                  [Publikus / Aktív tag – tartalom szerint]
│   ├── Betegedukációs anyagok                                 [Publikus / Aktív tag – tartalom szerint]
│   └── Letölthető dokumentumok                                [Publikus / Aktív tag – tartalom szerint]
│
├── Konferencia                                                 [Publikus]
│   ├── Konferencia főoldal                                    [Publikus]
│   ├── Meghívó                                                 [Publikus]
│   ├── Fontos dátumok                                         [Publikus]
│   ├── Helyszín                                                [Publikus]
│   ├── Gyakran ismételt kérdések                              [Publikus]
│   └── Konferencia-regisztráció                               [Tagjelölt / Aktív tag – döntés szükséges]
│
└── ✅ Kapcsolat                                                [Publikus]
    ├── Kapcsolatfelvételi űrlap                               [Publikus]
    ├── Közösségi média hivatkozások                           [Publikus]
    ├── Impresszum                                              [Publikus]
    ├── Adatkezelési tájékoztató                               [Publikus]
    └── Süti-tájékoztató                                       [Publikus]
```

## 2. Bejelentkezéshez kapcsolódó oldalak

```text
✅ Fiók                                                         [Tagjelölt vagy aktív tag]
│
├── ✅ Tagsági jelentkezés és fióklétrehozás                    [Publikus]
├── ✅ E-mail-cím megerősítése                                  [Regisztráló]
├── ✅ Bejelentkezés                                            [Publikus]
├── ✅ Elfelejtett jelszó                                       [Publikus]
├── ✅ Jelszó-visszaállítás                                     [Meghívó / visszaállító hivatkozás birtokosa]
└── ✅ Saját fiók                                               [Tagjelölt / Aktív tag]
    ├── ✅ Saját profil                                         [Aktív tag]
    ├── ✅ Személyes és szakmai adatok, profilkép szerkesztése  [Aktív tag]
    ├── ✅ Adatvédelmi és láthatósági beállítások               [Aktív tag]
    ├── ✅ Jelszó módosítása                                    [Tagjelölt / Aktív tag]
    └── ✅ Fiók és tagság törlése                               [Tagjelölt / Aktív tag]
```

## 3. Tagsági folyamat és tagi felület

```text
Tagsági jelentkezés és fióklétrehozás                           [Publikus → Tagjelölt]
│
├── Tagsági kategória választása                               [Publikus]
├── Természetes személy tag jelentkezési adatlapja             [Publikus]
├── Szervezeti/vállalati pártoló tag jelentkezési adatlapja    [Publikus]
├── Szükséges dokumentumok, profil- és fiókadatok              [Publikus]
├── E-mail-cím megerősítése és automatikus jelentkezés          [Publikus → Tagjelölt]
├── Tagjelölti állapot áttekintése                             [Tagjelölt]
├── Döntésről szóló visszajelzés                               [Tagjelölt]
└── Tagdíjfizetési felhívás                                    [Elfogadott, tagdíjköteles tagjelölt]

Tagi felület                                                   [Aktív tag]
│
├── Tagi kezdőlap                                              [Aktív tag]
├── Saját tagsági állapot és tagdíjak                          [Aktív tag]
├── Belső dokumentumtár                                        [Aktív tag]
├── Jogosultságos szakmai anyagok                              [Aktív tag]
├── Munkacsoporthoz csatlakozás                                [Aktív tag – minden tagsági kategória]
├── Konferencia-regisztrációim                                 [Aktív tag]
└── Kijelentkezés                                              [Aktív tag]
```

## 4. Konferencia-regisztrációs folyamat oldalai

```text
Konferencia-regisztráció                                      [A végleges belépési jogosultság döntést igényel]
│
├── Belépési / azonosítási pont                                [Tagjelölt / Aktív tag – döntés szükséges]
├── Résztvevői adatok                                          [Tagjelölt / Aktív tag]
├── Költségviselői és számlázási adatok                        [Tagjelölt / Aktív tag]
├── Regisztrációs díj és választott tételek                    [Tagjelölt / Aktív tag]
├── Rendelés-összesítő                                         [Tagjelölt / Aktív tag]
├── Átutalásos fizetés                                         [Tagjelölt / Aktív tag]
├── Sikeres / függő / sikertelen fizetési állapot              [Tagjelölt / Aktív tag]
├── Regisztrációs visszaigazolás                               [Tagjelölt / Aktív tag]
└── Saját konferencia-regisztráció részletei                   [Tagjelölt / Aktív tag]

Absztraktbeküldés                                              [A jogosultság döntést igényel]
│
├── Absztraktbeküldő űrlap                                     [Jogosult felhasználó]
├── Beküldés visszaigazolása                                   [Jogosult felhasználó]
└── Saját beadott absztraktok                                  [Jogosult felhasználó]
```

## 5. Adminisztrációs felület

```text
Adminisztráció                                                 [Admin]
│
├── Vezérlőpult                                                [Admin]
├── Tagok                                                      [Admin]
│   ├── Taglista, keresés és szűrés                            [Admin]
│   ├── Tag részletes adatlap                                  [Admin]
│   ├── Tagjelölti kérelmek                                    [Admin / kijelölt döntéshozó]
│   ├── Tagsági döntés                                         [Admin / kijelölt döntéshozó]
│   ├── Tagsági kategóriák és státuszok                        [Admin]
│   └── Export                                                  [Admin]
│
├── Tartalom                                                   [Admin]
│   ├── Oldalszövegek és blokkok                               [Admin]
│   ├── Hírek                                                   [Admin]
│   ├── Események                                               [Admin]
│   ├── Munkacsoportok és projektek                            [Admin]
│   ├── Szakmai anyagok és letöltések                          [Admin]
│   ├── Díjazottak                                              [Admin]
│   └── Partnerek                                               [Admin]
│
├── Kommunikáció                                               [Admin]
│   ├── Hírlevél-feliratkozók                                  [Admin]
│   ├── E-mail-sablonok                                        [Admin]
│   └── E-mail-küldési előzmények                              [Admin]
│
├── Tagdíjak és fizetések                                      [Admin]
│   ├── Díjkategóriák                                          [Admin]
│   ├── Fizetési státuszok                                     [Admin]
│   ├── Bizonylatok                                            [Admin]
│   └── Visszatérítések                                        [Admin – végleges szabály szerint]
│
├── Konferenciák                                               [Admin / Szervező]
│   ├── Konferencia alapadatai és információs oldalak          [Admin / Szervező]
│   ├── Regisztrációk és résztvevők                            [Admin / Szervező]
│   ├── Fizetési státuszok                                     [Admin / Szervező]
│   ├── Manuális regisztráció                                  [Admin / Szervező]
│   ├── Absztraktok                                            [Admin / Szervező]
│   ├── Absztraktfüzet PDF-generálása                          [Admin / Szervező]
│   └── Export                                                  [Admin / Szervező]
│
└── Rendszer                                                   [Admin]
    ├── Felhasználók és adminjogosultságok                     [Admin]
    ├── Alapbeállítások                                        [Admin]
    └── Napló és adminisztratív előzmények                     [Admin]
```

## 6. Oldaltérképen nyitott döntések

1. A konferencia-regisztráció elérhető-e nem tag, de regisztrált felhasználónak is?
2. Az absztraktbeküldés mely felhasználói kör számára érhető el?
3. Mely szakmai anyagok maradnak publikusak, és melyek igényelnek aktív tagsági hozzáférést?
4. Véglegesen kizárható-e minden tagsági kedvezmény és egyéb tagi szolgáltatás a tagjelölti állapotból? Jelenlegi munkairány: igen.
5. Mely adminfeladatok igényelnek külön döntéshozói vagy szervezői jogosultságot?
6. A konferencián belüli jegytípusok és kiegészítő tételek a jelenlegi scope részei-e?
7. Az érdemes és tiszteletbeli tagság adományozással, jelöléssel vagy önálló jelentkezéssel jön-e létre?
