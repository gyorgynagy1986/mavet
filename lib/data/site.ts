export const navigation = [
  { href: "/a-tarsasagrol", label: "A Társaságról" },
  { href: "/tagsag", label: "Tagság" },
  { href: "/munkacsoportok", label: "Munkacsoportok" },
  { href: "/aktualitasok", label: "Aktualitások" },
  { href: "/kapcsolat", label: "Kapcsolat" },
] as const

export const workgroups = [
  "Telemedicina",
  "Mesterséges intelligencia",
  "Point of Care, kompetenciafejlesztés és hatáskörbővítés",
  "Ellátásszervezés és menedzsment",
  "Humánerőforrás-menedzsment és utánpótlás",
  "Longevity",
] as const

export const membershipCategories = [
  { id: "rendes", name: "Rendes tag", description: "Teljes jogú tagsági forma nagykorú természetes személyek számára, akik elfogadják a Társaság céljait és Alapszabályát.", highlights: ["Szavazati jog a Közgyűlésen", "Részvétel munkacsoportokban és bizottságokban", "Tagsági kedvezmények és szakmai szolgáltatások"], fee: "Évi 10 000 Ft orvos vagy gyógyszerész végzettséggel; egyébként 5 000 Ft.", canApply: true },
  { id: "ifjusagi", name: "Ifjúsági tag", description: "Teljes jogú tagsági forma a 35. életév betöltéséig jelentkező fiatal szakemberek számára.", highlights: ["Szavazati jog a Közgyűlésen", "Részvétel munkacsoportokban és bizottságokban", "Tagsági kedvezmények és szakmai szolgáltatások"], fee: "Évi 5 000 Ft.", canApply: true },
  { id: "hallgatoi", name: "Hallgatói tag", description: "Kapcsolódási lehetőség nagykorú, közép- vagy felsőoktatásban tanuló hallgatóknak.", highlights: ["Részvétel rendezvényeken", "Bekapcsolódás a munkacsoportokba", "Tanácskozási jog a Közgyűlésen"], fee: "Díjmentes.", canApply: true },
  { id: "erdemes", name: "Érdemes tag", description: "Az Érdemes tagságra önjelentkezés indítható; a kategóriába sorolásról az Elnökség dönt.", highlights: ["Az Elnökség vizsgálja a feltételeket", "A teljes folyamatban külön elbírálás szükséges"], fee: "Díjmentes.", canApply: true },
  { id: "tiszteletbeli", name: "Tiszteletbeli tag", description: "A Társaság által adományozható elismerés a vidékegészségügy fejlődéséhez kiemelkedően hozzájáruló személyeknek.", highlights: ["Nem indítható rá publikus önjelentkezés", "A tagságról az Elnökség dönt"], fee: "Díjmentes.", canApply: false },
  { id: "partolo", name: "Pártoló tag", description: "Kapcsolódási lehetőség természetes személyeknek, akik támogatni kívánják a Társaság célkitűzéseit.", highlights: ["Természetes személyek jelentkezhetnek", "A teljes folyamatban további adatok szükségesek"], fee: null, canApply: true },
] as const

export const preliminaryMembershipCategories = membershipCategories.filter((category) => category.canApply)

export const contact = {
  email: "kapcsolat@example.hu",
  facebook: "#",
} as const
