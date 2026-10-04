/**
 * The system's automatic e-mails. Each entry is a template key with the
 * variables it supports and a default subject/body; admins can override the
 * subject and body on /admin/emailek (stored in `email_templates`).
 *
 * The body is HTML without the outer frame (see `wrapInMailLayout`). Variables
 * are written as `{{nev}}` and are HTML-escaped at render time.
 */

export interface TemplateVariableSpec {
  key: string
  description: string
  example: string
}

export interface EmailTemplateSpec {
  key: EmailTemplateKey
  name: string
  description: string
  /** Who receives it: shown on the list. */
  audience: "jelentkező" | "admin"
  variables: TemplateVariableSpec[]
  defaultSubject: string
  defaultHtml: string
}

export const emailTemplateKeys = [
  "jelentkezes_folytatas",
  "jelentkezes_emlekezteto",
  "jelentkezes_beerkezett",
  "jelentkezes_elfogadva",
  "jelentkezes_elfogadva_dijkoteles",
  "jelentkezes_elutasitva",
  "jelentkezes_elutasitva_erdemes",
  "admin_uj_jelentkezes",
  "jelszo_visszaallitas",
  "tagsag_megszunt",
] as const
export type EmailTemplateKey = (typeof emailTemplateKeys)[number]

const V = {
  nev: { key: "nev", description: "Teljes név titulussal", example: "Dr. Minta Jelentkező" },
  keresztnev: { key: "keresztnev", description: "Keresztnév", example: "Jelentkező" },
  vezeteknev: { key: "vezeteknev", description: "Vezetéknév", example: "Minta" },
  email: { key: "email", description: "A jelentkező e-mail-címe", example: "jelentkezo@example.hu" },
  kategoria: { key: "kategoria", description: "Választott tagsági kategória neve", example: "Rendes tag" },
  link: { key: "link", description: "A jelentkezés folytatásának / állapotának linkje", example: "https://videkegeszseg.hu/tagsag/jelentkezes/abc123" },
  linkLejarat: { key: "linkLejarat", description: "A link lejáratának dátuma", example: "2026. november 3." },
  bekuldesIdopont: { key: "bekuldesIdopont", description: "A véglegesítés időpontja", example: "2026. október 4. 14:05" },
  indoklas: { key: "indoklas", description: "Az elutasítás jelentkezőnek szánt indoklása (üres is lehet)", example: "A beküldött adatok alapján a kategória feltételei nem teljesülnek." },
  ujraJelentkezesLink: { key: "ujraJelentkezesLink", description: "Új jelentkezés indításának linkje", example: "https://videkegeszseg.hu/tagsag/jelentkezes" },
  adminLink: { key: "adminLink", description: "A jelentkezés admin oldali linkje", example: "https://videkegeszseg.hu/admin/jelentkezesek/665f..." },
  osszeg: { key: "osszeg", description: "Fizetendő első tagdíj", example: "10 000 Ft" },
  idoszak: { key: "idoszak", description: "A tagdíj által fedezett időszak", example: "2027. év" },
  hatarido: { key: "hatarido", description: "Az első tagdíj befizetési határideje", example: "2027. február 15." },
} satisfies Record<string, TemplateVariableSpec>

const signature = `<p style="margin:24px 0 0">Kollegiális üdvözlettel,<br>a MAVET Közössége</p>`
const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#0B2D5B;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px">${label}</a></p>`

export const EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplateSpec> = {
  jelentkezes_folytatas: {
    key: "jelentkezes_folytatas",
    name: "Jelentkezés folytatása (link)",
    description: "A rövid jelentkezési űrlap beküldése után megy ki. A link ellenőrzi az e-mail-címet, és a teljes adatlaphoz vezet.",
    audience: "jelentkező",
    variables: [V.nev, V.keresztnev, V.vezeteknev, V.kategoria, V.link, V.linkLejarat],
    defaultSubject: "Jelentkezés folytatása – Magyar Vidékegészségügyi Társaság",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Örömmel vettük a Magyar Vidékegészségügyi Társaságba történő jelentkezési szándékát ({{kategoria}}). A tagsági jelentkezés véglegesítéséhez kérjük, az alábbi gombra kattintva töltse ki a teljes adatlapot. A kitöltést megszakíthatja és később ugyanezzel a linkkel folytathatja.</p>
${button("{{link}}", "Jelentkezés folytatása")}
<p style="font-size:13px;color:#4F5F7A">A link {{linkLejarat}}-ig érvényes. Ha nem Ön kezdeményezte a jelentkezést, hagyja figyelmen kívül ezt a levelet.</p>
${signature}`,
  },
  jelentkezes_emlekezteto: {
    key: "jelentkezes_emlekezteto",
    name: "Emlékeztető félbehagyott jelentkezésre",
    description: "Automatikus emlékeztető (napi ütemezés), ha a jelentkező nem véglegesítette az adatlapot. Legfeljebb kétszer megy ki.",
    audience: "jelentkező",
    variables: [V.nev, V.keresztnev, V.kategoria, V.link, V.linkLejarat],
    defaultSubject: "Emlékeztető: befejezetlen tagsági jelentkezés – MAVET",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Korábban jelezte jelentkezési szándékát a Magyar Vidékegészségügyi Társaságba ({{kategoria}}), de a teljes adatlap még nem készült el. Az alábbi gombbal folytathatja ott, ahol abbahagyta.</p>
${button("{{link}}", "Jelentkezés folytatása")}
<p style="font-size:13px;color:#4F5F7A">A link {{linkLejarat}}-ig érvényes. Ha már nem kíván jelentkezni, nincs teendője.</p>
${signature}`,
  },
  jelentkezes_beerkezett: {
    key: "jelentkezes_beerkezett",
    name: "Jelentkezés beérkezett (elbírálás alatt)",
    description: "A teljes adatlap véglegesítése után megy ki.",
    audience: "jelentkező",
    variables: [V.nev, V.kategoria, V.link, V.bekuldesIdopont],
    defaultSubject: "Jelentkezés visszaigazolása – Magyar Vidékegészségügyi Társaság",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Köszönjük, jelentkezését ({{kategoria}}) {{bekuldesIdopont}}-kor rögzítettük. Ön jelenleg tagjelölt státuszban van; a végleges elbírálásról a Társaság dönt. Amint ez megtörtént, e-mailben tájékoztatjuk, addig nincs további teendője.</p>
<p>A jelentkezés állapotát bármikor megtekintheti az alábbi linken:</p>
${button("{{link}}", "Jelentkezés állapota")}
${signature}`,
  },
  jelentkezes_elfogadva: {
    key: "jelentkezes_elfogadva",
    name: "Jelentkezés elfogadva (díjmentes aktiválás)",
    description: "Elfogadás után, ha nincs fizetendő tagdíj (díjmentes kategória, vagy 2026-ban elfogadott díjköteles). A link a fiók aktiválásához (jelszó beállítása) vezet.",
    audience: "jelentkező",
    variables: [V.nev, V.kategoria, V.link, V.linkLejarat],
    defaultSubject: "Üdvözöljük a MAVET tagjai között!",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Örömmel értesítjük, hogy tagsági jelentkezését ({{kategoria}}) a Magyar Vidékegészségügyi Társaság elfogadta. Tagsága aktív; a tagi felület eléréséhez kérjük, az alábbi gombbal állítsa be jelszavát és aktiválja fiókját.</p>
${button("{{link}}", "Fiók aktiválása")}
<p style="font-size:13px;color:#4F5F7A">A link {{linkLejarat}}-ig érvényes. Lejárt link esetén a Társaság új linket tud küldeni.</p>
${signature}`,
  },
  jelentkezes_elfogadva_dijkoteles: {
    key: "jelentkezes_elfogadva_dijkoteles",
    name: "Jelentkezés elfogadva (tagdíj fizetendő)",
    description: "Elfogadás után díjköteles kategóriánál (2027-től): összeg, időszak, határidő és az aktiváló link. A tagság a befizetés igazolásával válik aktívvá.",
    audience: "jelentkező",
    variables: [V.nev, V.kategoria, V.osszeg, V.idoszak, V.hatarido, V.link, V.linkLejarat],
    defaultSubject: "Jelentkezését elfogadtuk – első tagdíj befizetése",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Örömmel értesítjük, hogy tagsági jelentkezését ({{kategoria}}) a Magyar Vidékegészségügyi Társaság elfogadta. A tagság aktiválásához az első tagdíj befizetése szükséges:</p>
<p><strong>Összeg:</strong> {{osszeg}}<br><strong>Időszak:</strong> {{idoszak}}<br><strong>Határidő:</strong> {{hatarido}}</p>
<p>Kérjük, először aktiválja fiókját az alábbi gombbal (jelszó beállítása); a fizetési lehetőségeket és a banki adatokat a fiókjában találja.</p>
${button("{{link}}", "Fiók aktiválása")}
<p style="font-size:13px;color:#4F5F7A">A link {{linkLejarat}}-ig érvényes. Ha a határidőig nem érkezik befizetés, emlékeztetőt küldünk; ennek elmaradása esetén a jelentkezési folyamat megszakad.</p>
${signature}`,
  },
  jelentkezes_elutasitva: {
    key: "jelentkezes_elutasitva",
    name: "Jelentkezés elutasítva",
    description: "Az admin elutasító döntése után megy ki. Az {{indoklas}} a döntésnél megadott, jelentkezőnek szánt szöveg.",
    audience: "jelentkező",
    variables: [V.nev, V.kategoria, V.indoklas, V.ujraJelentkezesLink],
    defaultSubject: "Tagsági jelentkezésének elbírálása – MAVET",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Köszönjük érdeklődését a Magyar Vidékegészségügyi Társaság iránt. Sajnálattal tájékoztatjuk, hogy tagsági jelentkezését ({{kategoria}}) a Társaság ezúttal nem fogadta el.</p>
<p>{{indoklas}}</p>
<p>Új jelentkezést bármikor indíthat ugyanazzal az e-mail-címmel:</p>
${button("{{ujraJelentkezesLink}}", "Új jelentkezés")}
${signature}`,
  },
  jelentkezes_elutasitva_erdemes: {
    key: "jelentkezes_elutasitva_erdemes",
    name: "Érdemes tagsági kérelem elutasítva",
    description: "Az Érdemes kategória elutasításakor megy ki az általános elutasító levél helyett (spec 7.4): jelzi, hogy Rendes tagságra új jelentkezés indítható.",
    audience: "jelentkező",
    variables: [V.nev, V.indoklas, V.ujraJelentkezesLink],
    defaultSubject: "Érdemes tagsági kérelmének elbírálása – MAVET",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Köszönjük érdeklődését a Magyar Vidékegészségügyi Társaság iránt. Az Elnökség az Érdemes tagsági kérelmét ezúttal nem fogadta el.</p>
<p>{{indoklas}}</p>
<p>Örömmel látjuk a Társaság tagjai között: Rendes tagságra ugyanazzal az e-mail-címmel új jelentkezést indíthat.</p>
${button("{{ujraJelentkezesLink}}?category=rendes", "Jelentkezés rendes tagságra")}
${signature}`,
  },
  admin_uj_jelentkezes: {
    key: "admin_uj_jelentkezes",
    name: "Admin: új elbírálandó jelentkezés",
    description: "A kijelölt adminisztrátori címre (MAIL_TO) megy ki, amikor egy jelentkező véglegesítette az adatlapját.",
    audience: "admin",
    variables: [V.nev, V.email, V.kategoria, V.bekuldesIdopont, V.adminLink],
    defaultSubject: "Új tagjelölt: {{nev}} ({{kategoria}})",
    defaultHtml: `<p>Új, elbírálandó tagsági jelentkezés érkezett.</p>
<p><strong>Név:</strong> {{nev}}<br><strong>E-mail:</strong> {{email}}<br><strong>Kategória:</strong> {{kategoria}}<br><strong>Időpont:</strong> {{bekuldesIdopont}}</p>
${button("{{adminLink}}", "Jelentkezés megnyitása az adminban")}`,
  },
  jelszo_visszaallitas: {
    key: "jelszo_visszaallitas",
    name: "Jelszó-visszaállítás",
    description: "Az elfelejtett jelszó kérésekor megy ki, ha a címhez aktivált tagi fiók tartozik. A link egyszer használható és 1 óráig érvényes (spec 13.4).",
    audience: "jelentkező",
    variables: [V.nev, V.link, V.linkLejarat],
    defaultSubject: "Jelszó-visszaállítás – MAVET",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Jelszó-visszaállítási kérés érkezett a MAVET tagi fiókjához. Új jelszót az alábbi gombbal állíthat be:</p>
${button("{{link}}", "Új jelszó beállítása")}
<p style="font-size:13px;color:#4F5F7A">A link {{linkLejarat}}-ig érvényes, és egyszer használható. Ha nem Ön kérte, hagyja figyelmen kívül ezt a levelet; jelszava nem változik.</p>
${signature}`,
  },
  tagsag_megszunt: {
    key: "tagsag_megszunt",
    name: "Tagság megszűnt (admin visszavonás)",
    description: "Akkor megy ki, ha az admin a tagság visszavonásakor bejelöli az értesítést. Az {{indoklas}} a megadott, tagnak szánt szöveg.",
    audience: "jelentkező",
    variables: [V.nev, V.kategoria, V.indoklas],
    defaultSubject: "Tagságának megszűnése – MAVET",
    defaultHtml: `<p>Tisztelt {{nev}}!</p>
<p>Tájékoztatjuk, hogy a Magyar Vidékegészségügyi Társaságban fennálló tagsága ({{kategoria}}) megszűnt.</p>
<p>{{indoklas}}</p>
<p>Fiókja megmarad, de a tagi felületek nem érhetők el. Kérdés esetén a weboldal Kapcsolat oldalán ír nekünk.</p>
${signature}`,
  },
}

export function isEmailTemplateKey(key: string): key is EmailTemplateKey {
  return (emailTemplateKeys as readonly string[]).includes(key)
}

/** Example variable values for the editor preview and test mails. */
export function exampleVars(spec: EmailTemplateSpec): Record<string, string> {
  return Object.fromEntries(spec.variables.map((v) => [v.key, v.example]))
}
