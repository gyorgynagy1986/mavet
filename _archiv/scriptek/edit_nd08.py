from copy import deepcopy
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


SOURCE = Path("/Users/szigethy.peter/Downloads/MAVET - Funkciona\u0301lis specifika\u0301cio\u0301 - 2026.09.12.docx")
OUTPUT = Path("/Users/szigethy.peter/Desktop/Dev/MAVET/MAVET - Funkciona\u0301lis specifika\u0301cio\u0301 - 2026.09.12 - szerkesztett.docx")
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def text_of(paragraph):
    return "".join(paragraph.itertext())


def plain_paragraph(source, text):
    paragraph = etree.Element(W + "p")
    properties = source.find(W + "pPr")
    if properties is not None:
        paragraph.append(deepcopy(properties))
    run = etree.SubElement(paragraph, W + "r")
    run_properties = etree.SubElement(run, W + "rPr")
    etree.SubElement(run_properties, W + "b", {W + "val": "0"})
    etree.SubElement(run_properties, W + "bCs", {W + "val": "0"})
    text_node = etree.SubElement(run, W + "t")
    text_node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    text_node.text = text
    return paragraph


def replace_one(root, old_text, replacements):
    matches = [p for p in root.iter(W + "p") if text_of(p) == old_text]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one paragraph match for {old_text[:60]!r}; got {len(matches)}")
    old = matches[0]
    parent = old.getparent()
    position = parent.index(old)
    for offset, replacement in enumerate(replacements):
        parent.insert(position + offset, plain_paragraph(old, replacement))
    parent.remove(old)


def replace_contains(root, unique_text, replacements):
    matches = [p for p in root.iter(W + "p") if unique_text in text_of(p)]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one paragraph containing {unique_text[:60]!r}; got {len(matches)}")
    old = matches[0]
    parent = old.getparent()
    position = parent.index(old)
    for offset, replacement in enumerate(replacements):
        parent.insert(position + offset, plain_paragraph(old, replacement))
    parent.remove(old)


def remove_one(root, old_text):
    matches = [p for p in root.iter(W + "p") if text_of(p) == old_text]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one paragraph removal for {old_text[:60]!r}; got {len(matches)}")
    matches[0].getparent().remove(matches[0])


with ZipFile(SOURCE) as source_zip:
    document_xml = source_zip.read("word/document.xml")
    root = etree.fromstring(document_xml)

    replace_one(
        root,
        "Ügyfél jóváhagyására váró javaslat – ND-08: a tagjelölti állapot nem ad hozzáférést a tagi dokumentumokhoz, névjegyzékhez vagy más tagi funkcióhoz. A jelen dokumentum ezt a működést írja le; ennek ügyféloldali elfogadása szükséges. Rendben. Itt válaszolok az email felvetésre a tagsággal kapcsolatban: egyetértek. A folyamat így: látogató - jelentkezik - tagjelölt - visszajelzést kap - döntünk, elfogadjuk - visszajelzést kap - fizet - teljes jogú tag.",
        [
            "A tagi dokumentumok, a tagi névjegyzék és minden egyéb tagi funkció kizárólag aktív tag számára érhető el.",
            "A látogató a teljes jelentkezési adatlap kitöltése és e-mail-címének megerősítése után tagjelölti állapotba kerül. Erről automatikus e-mailes visszaigazolást kap, tagi jogosultságot azonban még nem szerez. Az adminisztrátor a jelentkezést elfogadja vagy elutasítja. Elutasításkor a jelentkező e-mailes értesítést kap, tagi hozzáférése nem keletkezik.",
            "Díjköteles jelentkezés elfogadásakor a rendszer e-mailben fizetési felhívást küld. A befizetés SimplePayen vagy banki átutalással teljesíthető. Sikeres, ellenőrzött SimplePay-visszaigazolás esetén a rendszer automatikusan aktív taggá teszi a jelentkezőt. Banki átutalásnál az adminisztrátor rögzíti a befizetés beérkezését, majd aktívra állítja a tagságot. Mindkét esetben a rendszer automatikus e-mailes értesítést küld az aktív tagságról.",
        ],
    )

    replace_one(
        root,
        "Anyagonként két hozzáférési szint választható: „Publikus” és „Csak aktív tagoknak”. Minden aktív tag eléri az összes közzétett tagi anyagot. Tagjelölt, fizetésre váró, elutasított és lejárt tagságú felhasználó csak a publikus teljes tartalmakhoz fér hozzá, az ND-08 javaslat szerint.",
        [
            "Anyagonként két hozzáférési szint választható: „Publikus” és „Csak aktív tagoknak”. Minden aktív tag eléri az összes közzétett tagi anyagot. Tagjelölt, fizetésre váró, elutasított és lejárt tagságú felhasználó csak a publikus teljes tartalmakhoz fér hozzá.",
        ],
    )

    replace_one(
        root,
        "5. Az ND-08 javaslat elfogadásával minden nem aktív állapotban tiltott a tagi anyagok és a tagi névjegyzék hozzáférése.",
        [
            "5. Minden nem aktív állapotban tiltott a tagi anyagok és a tagi névjegyzék hozzáférése.",
        ],
    )

    remove_one(
        root,
        "ND-08 – Tagi hozzáférés kezdete. Elfogadható-e, hogy a tagjelölt még nem fér hozzá tagi dokumentumokhoz, a névjegyzékhez vagy más tagi funkcióhoz, és ezek kizárólag aktív tagsággal nyílnak meg? Ez eltér a korábbi, tagjelölti szolgáltatásokat és kedvezményeket említő elképzeléstől. Javaslat: aktív tagságig nincs tagi hozzáférés. Külön kedvezményfunkció nem készül. OK",
    )

    replace_contains(
        root,
        "Díjköteles, elfogadott jelentkezésnél a saját fiók megjeleníti a kategóriát",
        [
            "Díjköteles, elfogadott jelentkezésnél a saját fiók megjeleníti a kategóriát, a fizetendő összeget, a kapcsolódó időszakot, valamint a SimplePayes fizetés és a banki átutalás lehetőségét. Az e-mailes felhívás ugyanezen fiókbeli fizetési lehetőségek elérését biztosítja.",
        ],
    )

    replace_contains(
        root,
        "A felhasználó a SimplePay fizetési folyamatában",
        [
            "A felhasználó SimplePayen vagy banki átutalással teljesítheti a befizetést. SimplePay esetén a visszatérő oldal önmagában nem igazolja a fizetést: a rendszer a szolgáltató ellenőrzött sikeres visszaigazolása alapján automatikusan aktiválja a tagságot. Később érkező visszaigazolásnál a felület feldolgozás alatti állapotot mutat. Sikertelen vagy megszakított SimplePay-fizetés után a fiókból újra lehet próbálkozni.",
            "Banki átutalás esetén az adminisztrátor ellenőrzi a befizetés beérkezését, azt az adminisztrációs felületen rögzíti, majd aktívra állítja a jelentkező tagságát. A banki átutalás önmagában nem aktiválja automatikusan a tagságot. Az aktiválás után a rendszer e-mailes értesítést küld a jelentkezőnek.",
        ],
    )

    updated_document_xml = etree.tostring(root, encoding="UTF-8", xml_declaration=True, standalone=True)
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as output_zip:
        for item in source_zip.infolist():
            payload = updated_document_xml if item.filename == "word/document.xml" else source_zip.read(item.filename)
            output_zip.writestr(item, payload)

print(OUTPUT)
