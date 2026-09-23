/**
 * Controller identity used by the privacy notice and the imprint.
 * Fields marked with `null` are not yet supplied by the client; the pages
 * render a visible placeholder for them until they are filled.
 */
export const dataController = {
  name: "Magyar Vidékegészségügyi Társaság",
  shortName: "MAVET",
  seat: null as string | null, // pl. "1234 Budapest, Példa utca 1."
  registrationCourt: null as string | null, // pl. "Fővárosi Törvényszék"
  registrationNumber: null as string | null, // pl. "01-02-0012345"
  taxNumber: null as string | null,
  representative: null as string | null, // pl. "Dr. Példa Péter elnök"
  email: "info@videkegeszseg.hu",
  privacyEmail: "info@videkegeszseg.hu",
  website: "https://videkegeszseg.hu",
  /** GDPR 37. cikk: egyesületnek főszabály szerint nem kötelező; ha kijelölnek, ide kerül. */
  dataProtectionOfficer: null as { name: string; email: string } | null,
} as const

export const privacyNoticeEffectiveDate = "2026. szeptember 22."

/** Retention periods. Proposed defaults, to be confirmed by the client before go-live. */
export const retention = {
  applicationPending: "a Közgyűlés döntéséig",
  applicationAccepted: "a tagsági jogviszony fennállása alatt a tagnyilvántartás részeként, majd a megszűnést követő 5 évig (Ptk. szerinti általános elévülési idő)",
  applicationRejectedOrWithdrawn: "a döntéstől, illetve a visszavonástól számított 1 évig, kizárólag a hozzájárulás megtörténtének igazolására",
  contactMessage: "a megkeresés lezárásától számított 1 évig",
  serverLogs: "legfeljebb 30 napig",
  rateLimit: "legfeljebb 10 percig",
  emailDeliveryLogs: "legfeljebb 30 napig a levélküldő szolgáltatónál",
} as const

export const processors = [
  {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, USA",
    role: "Tárhelyszolgáltatás, a weboldal futtatása és kiszolgálása",
    data: "Kiszolgálási naplók (IP-cím, időpont, lekért oldal, böngészőadatok); az űrlapok adatai a feldolgozás idejére áthaladnak a kiszolgálón.",
    location: "Az alkalmazás és az adatbázis-kapcsolat EU-régióban (Frankfurt) fut. A Vercel az EU–USA adatvédelmi keretrendszer (DPF) tanúsított résztvevője, az adatfeldolgozói szerződés az Európai Bizottság általános szerződési feltételeit tartalmazza.",
    link: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "MongoDB, Inc. (MongoDB Atlas)",
    address: "1633 Broadway, 38th Floor, New York, NY 10019, USA",
    role: "Adatbázis-szolgáltatás",
    data: "A jelentkezési űrlapon megadott adatok, a tagjelölti státusz, a hozzájárulás igazolása, az e-mail-kézbesítés könyvelése.",
    location: "Az adatbázis az EU-ban (Frankfurt, AWS eu-central-1) található. A MongoDB az EU–USA adatvédelmi keretrendszer tanúsított résztvevője, az adatfeldolgozói szerződés az általános szerződési feltételeket tartalmazza.",
    link: "https://www.mongodb.com/legal/privacy-policy",
  },
  {
    name: "Upstash, Inc.",
    address: "1450 Sutter St, San Francisco, CA 94109, USA",
    role: "Visszaélés elleni védelem (kérésszám-korlátozás)",
    data: "Az űrlapot beküldő IP-cím visszafejthetetlen lenyomata és a beküldések száma.",
    location: "EU-régió (Frankfurt). Az adatfeldolgozói szerződés az általános szerződési feltételeket tartalmazza.",
    link: "https://upstash.com/trust/privacy.pdf",
  },
  {
    name: "Twilio Inc. (SendGrid)",
    address: "101 Spear Street, 5th Floor, San Francisco, CA 94105, USA",
    role: "Tranzakciós e-mail-küldés (visszaigazolás, belső értesítés)",
    data: "A címzett e-mail-címe, az üzenet tárgya és tartalma, kézbesítési napló.",
    location: "Az adatok az USA-ban is feldolgozásra kerülhetnek. A Twilio az EU–USA adatvédelmi keretrendszer tanúsított résztvevője, az adatfeldolgozói szerződés az általános szerződési feltételeket tartalmazza.",
    link: "https://www.twilio.com/en-us/legal/privacy",
  },
] as const
