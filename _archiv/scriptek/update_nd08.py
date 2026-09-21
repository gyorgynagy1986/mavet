from copy import deepcopy
from docx import Document
from docx.oxml import OxmlElement

SOURCE = "MAVET - Funkcionális specifikáció.docx"
OUTPUT = "MAVET - Funkcionális specifikáció - 2026.09.12 - ND-08.docx"


def clear_paragraph(paragraph):
    paragraph._element.clear_content()


def insert_after(paragraph, text, style):
    new_p = OxmlElement("w:p")
    paragraph._p.addnext(new_p)
    new_paragraph = paragraph._parent.add_paragraph()
    new_paragraph._p.getparent().remove(new_paragraph._p)
    new_paragraph._p = new_p
    new_paragraph._element = new_p
    new_paragraph.style = style
    new_paragraph.add_run(text)
    return new_paragraph


doc = Document(SOURCE)
paragraphs = doc.paragraphs
anchor_index = next(
    index
    for index, paragraph in enumerate(paragraphs)
    if paragraph.text == "1.3. Hozzáférési szabályok"
)

# Keep the existing first paragraph under 1.3, then replace the old ND-08 text.
target = paragraphs[anchor_index + 3]
old_following = [paragraphs[anchor_index + offset] for offset in (4, 5)]

clear_paragraph(target)
target.style = "Heading 3"
target.add_run("Tagsági jelentkezés és tagsági státusz folyamata")

items = [
    "A látogató kiválasztja a kívánt tagsági kategóriát, kitölti a jelentkezési űrlapot, elfogadja a szükséges nyilatkozatokat, majd e-mailben megerősíti a jelentkezését.",
    "A megerősített jelentkező státusza tagjelölt. A tagjelölt a saját fiókjában követheti a jelentkezés állapotát, de még nem fér hozzá a tagi névjegyzékhez és a védett tagi tartalmakhoz.",
    "Az elnökség vagy az erre jogosult adminisztrátor elbírálja a jelentkezést. Elutasításkor a rendszer tájékoztató e-mailt küld; fizetési kötelezettség nem keletkezik. Elfogadáskor a rendszer a tagsági kategória és az adott időszak díjszabása alapján folytatja a folyamatot.",
    "Díjköteles tagság esetén az elfogadott tagjelölt fizetési felhívást kap, és a sikeres fizetés után válik aktív taggá.",
    "Díjmentes tagság vagy olyan időszak esetén, amikor az adott kategóriában nincs fizetési kötelezettség, az elfogadás közvetlenül aktív tagságot eredményez.",
    "Az aktív tag erről e-mailes értesítést kap, és hozzáférést kap az aktív tagsághoz kötött szolgáltatásokhoz.",
]

cursor = target
for number, item in enumerate(items, start=1):
    cursor = insert_after(cursor, f"{number}. {item}", "normal")

for paragraph in old_following:
    paragraph._element.getparent().remove(paragraph._element)

doc.save(OUTPUT)
