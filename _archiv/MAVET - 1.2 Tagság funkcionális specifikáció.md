> **Leváltott munkaváltozat – 2026.09.06.** Az aktuális, egységes működési leírás a `MAVET - Funkcionális specifikáció.md` 0.2 változata. A döntések és nyitott ügyfélkérdések annak 13. fejezetében szerepelnek. Az alábbi korábbi szöveg történeti háttér; eltérő szabályai nem alkalmazhatók fejlesztési követelményként.

# MAVET – Tagság

## Funkcionális specifikáció

**Dokumentum állapota:** egyeztetés alatt  
**Verzió:** 0.1  
**Utolsó frissítés:** 2026.09.06.  
**Oldaltérkép-fejezet:** 1.2  
**A dokumentum célja:** a MAVET tagsági lehetőségeit, kategóriáit, tagdíjait és a tagfelvétel rövid menetét bemutató publikus oldal.  
**Oldaltípus:** publikus, szerkeszthető tartalmi oldal

## Tartalom

1. Az oldal szerepe
2. Oldalszakaszok és tartalom
   2.1. Miért érdemes csatlakozni?
   2.2. Tagsági kategóriák
   2.3. Tagdíjak
   2.4. Tagfelvételi folyamat
3. Adminisztratív kezelés
4. Nyitott tartalmi döntések

## 1. Az oldal szerepe

A Tagság oldal röviden bemutatja a MAVET-hez való csatlakozás értékét, a tagsági kategóriákat, a tagdíjakat és a tagfelvétel menetét. Az oldal bejelentkezés nélkül megnyitható.

Az oldal nem tartalmaz külön jelentkezési űrlapot, tagi munkafolyamatot vagy FAQ-modult. A jelentkezés a közös tagsági jelentkezési és fiók létrehozási folyamatra vezet.

A vezetőség és a bizottságok bemutatása nem ennek az oldalnak a része; az az **A Társaságról** oldal megfelelő szakaszában jelenik meg.

## 2. Oldalszakaszok és tartalom

### 2.1. Miért érdemes csatlakozni?

Az oldal elején rövid bemutató és csatlakozási felhívás jelenik meg. A MAVET-anyagokból átvehető fő szövegek:

> „Sok szeretettel várunk mindenkit, a Magyar Vidékegészségügyi Társaság (MAVET) tagjai között, aki”

> „A MAVET tagság nem pusztán egy adminisztratív lépés.”

Az előnyöket a forrásanyag az alábbi rövid címekkel sorolja:

> „Interdiszciplináris szakmai közösség”  
> „Nyitott, barátságos légkör”  
> „Konferenciák, rendezvények”  
> „Szakmai tartalmak”  
> „Esély a jövő alakítására”

A szakasz elsődleges cselekvése a tagsági jelentkezés indítása.

### 2.2. Tagsági kategóriák

A kategóriák kártyás vagy hasonlóan áttekinthető tartalmi blokkokban jelennek meg. A forrásban szereplő kategóriacímek:

> „Rendes tag”  
> „Hallgatói tag”  
> „Ifjúsági tag”  
> „Érdemes tag”  
> „Tiszteletbeli tag”  
> „Pártoló tag”

Az egyes kártyák rövid leírást, fő jogosultságokat és a tagdíjra vonatkozó információt tartalmaznak. A részletes szöveg a `mavetanyagokmd/Tagsági kategóriák.md` forrásanyagából vehető át, a jelenlegi döntési naplóval és tagsági életciklus-specifikációval összhangban.

Az érdemes és tiszteletbeli tagságnál a forrásban szereplő „Jelentkezem” felirat nem jeleníthető meg automatikusan: ezek publikus létrejöttének módja még az ND-06 döntés tárgya. A szervezeti vagy vállalati pártoló tagság külön adatmodellt igényel, ezért nem része ennek az oldalnak a természetes személyekre vonatkozó jelentkezési útja.

### 2.3. Tagdíjak

A szakasz kategóriánként megjeleníti, hogy a tagság díjköteles vagy díjmentes, valamint a jóváhagyott tagdíjösszeget és az érvényességi időszakot, ha ezek az ügyfél által véglegesítve vannak.

A forrásanyagban több kategória konkrét összege üresen maradt, ezért a rendszer nem jelenít meg kitalált összeget. A tagdíjfizetés technikai folyamata a tagsági életciklus-specifikációban szerepel; innen a jelentkező a megfelelő folyamatra navigálhat.

### 2.4. Tagfelvételi folyamat

A Tagság oldal csak rövid, közérthető összefoglalót jelenít meg:

1. a látogató kiválasztja a tagsági kategóriát;
2. egyetlen folyamatban kitölti a tagsági jelentkezési és fiókadatokat;
3. az e-mail-cím megerősítése automatikusan létrehozza a tagsági jelentkezést és a tagjelölti állapotot;
4. elfogadás után a díjmentes kategória aktívvá válik, a díjköteles kategória pedig a Stripe-fizetés sikeres visszaigazolása után aktiválódik.

Az összefoglaló végén a „Jelentkezés indítása” hivatkozás a közös tagsági jelentkezési és fiók létrehozási folyamatra vezet. Külön „Jelentkezés beküldése” művelet nincs.

## 3. Adminisztratív kezelés

Az adminisztrátor szerkesztheti az oldal szövegeit, a kategóriák leírásait, a jóváhagyott tagdíj-információkat és a jelentkezésre vezető hivatkozásokat. Az oldalhoz nem tartozik külön felhasználói adatbekérés vagy adminisztratív elbírálási folyamat.

## 4. Nyitott tartalmi döntések

- A publikus oldalon megjelenő kategóriák végleges köre és az egyes kategóriákhoz tartozó jelentkezési CTA.
- A kategóriánkénti tagdíjösszeg és érvényességi időszak.
- A forrásanyag teljes kategórialeírásainak végleges, ügyfél által jóváhagyott szövegváltozata.
