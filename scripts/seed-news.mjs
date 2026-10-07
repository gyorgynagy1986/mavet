// One-off: moves the first two news items (until now hard-coded in the site) into the `posts`
// collection, published, with their original dates. Existing slugs are left untouched, so it is
// safe to run more than once.
//
//   npm run seed:news

import mongoose from "mongoose"

const uri = process.env.MONGODB_URI || process.env.MONGO_URI
if (!uri) {
  console.error("✖ MONGODB_URI (vagy MONGO_URI) hiányzik.")
  process.exit(1)
}

const items = [
  {
    "slug": "uj-fejezet-kezdodik-a-tarsasag-eleteben",
    "title": "Új fejezet kezdődik a Társaság életében",
    "date": "2026-07-29",
    "excerpt": "A Társaság megújulásának első fontos állomása: vezetőváltás, új név és az interdiszciplináris szakmai együttműködés megerősítése.",
    "body": "Július 29-én online közgyűlést tartott a Magyar Faluegészségügyi Tudományos Társaság, amely mérföldkőnek számít a szervezet életében. A közgyűlésen Dr. Simek Ágnes, a Társaság alapító elnöke leköszönt tisztségéről, a tagság pedig Dr. Mohos Andrást választotta meg a Társaság új elnökének.\n\nA közgyűlés nyitott és konstruktív légkörben zajlott. A régi és az újonnan csatlakozó tagok közösen tekintették át a Társaság elmúlt időszakának eredményeit, és megvitatták a következő évek legfontosabb célkitűzéseit.\n\nA résztvevők egyetértettek abban, hogy a vidéki egészségügy előtt álló kihívásokra csak széles körű szakmai együttműködéssel lehet érdemi választ adni. Ennek megfelelően a jövőben kiemelt szerepet kap az interdiszciplináris szemlélet, a különböző egészségügyi szakterületek közötti együttműködés, valamint a tematikus munkacsoportok létrehozása.\n\nA vezetőváltás egyben megújulási folyamat kezdetét is jelenti. Ennek szellemében a közgyűlésen bemutatták a Társaság új nevét: Magyar Vidékegészségügyi Társaság. A MAVET célja, hogy a korábbi értékeket megőrizve, modern, nyitott és aktív szakmai közösségként járuljon hozzá a magyar vidék egészségének fejlesztéséhez, valamint a vidéki egészségügy tudományos és szakmai megerősítéséhez.\n\nKöszönjük Dr. Simek Ágnes több évtizedes elkötelezett munkáját, amellyel megteremtette és hosszú éveken át vezette a Társaságot, valamint minden résztvevő aktív közreműködését és jövő iránti elkötelezettségét.\n\nA következő hetekben további tájékoztatást adunk a megújuló Társaság céljairól, munkacsoportjairól, valamint a csatlakozási és együttműködési lehetőségekről."
  },
  {
    "slug": "megalakult-a-mavet-uj-vezetese",
    "title": "Megalakult a MAVET új vezetése, elfogadták az új alapszabályt",
    "date": "2026-09-02",
    "excerpt": "A szeptemberi közgyűlésen a Társaság új néven, megújult működési renddel és új testületekkel kezdte meg következő időszakát.",
    "body": "2026. szeptember 2-án személyes közgyűlést tartott a Társaság az algyői Kastélykert Fogadóban, amely újabb fontos mérföldkövet jelentett a szervezet megújulásának folyamatában.\n\nA közgyűlés egyik legfontosabb napirendi pontja a Társaság új alapszabályának elfogadása volt. A tagság egyhangú döntésével életbe lépett a megújult működési rend, és ettől a naptól kezdve a szervezet hivatalosan is Magyar Vidékegészségügyi Társaság, MAVET néven folytatja tevékenységét.\n\nA közgyűlésen megválasztották az új Elnökséget, valamint a Felügyelő Bizottság és az Etikai Bizottság tagjait. Emellett megalakultak a Társaság első tematikus munkacsoportjai, amelyek az interdiszciplináris szakmai együttműködés új fórumait jelentik. Céljuk, hogy különböző szakterületek szakembereit összefogva dolgozzanak a vidéki egészségügy aktuális kihívásain és jövőbeli fejlesztési lehetőségein.\n\nA hivatalos napirendet követően élénk szakmai párbeszéd bontakozott ki a Társaság stratégiai céljairól, tervezett programjairól és hosszú távú elképzeléseiről. A résztvevők számos olyan javaslatot fogalmaztak meg, amelyek hozzájárulnak a szakmai munka megerősítéséhez és a közösség további építéséhez.\n\nA közgyűlést követően a tagok kötetlen, barátságos hangulatú közös vacsorán folytatták a beszélgetést. Az este lehetőséget adott a személyes kapcsolatok erősítésére, az új tagok megismerésére és a jövőbeni együttműködések megalapozására.\n\nA szeptemberi közgyűlés döntései új korszakot nyitottak a Magyar Vidékegészségügyi Társaság életében. A megújult szervezet országos szakmai közösségként, interdiszciplináris együttműködésre építve kíván hozzájárulni a magyar vidék egészségének fejlesztéséhez, valamint a vidéki egészségügy tudományos és szakmai megerősítéséhez."
  }
]

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  const col = mongoose.connection.db.collection("posts")
  await col.createIndex({ slug: 1 }, { unique: true })
  for (const item of items) {
    const now = new Date()
    const res = await col.updateOne(
      { slug: item.slug },
      {
        $setOnInsert: {
          type: "hir",
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          body: item.body,
          status: "kozzetett",
          // Noon in Hungary on the original day (both dates are in summer time).
          publishedAt: new Date(`${item.date}T10:00:00.000Z`),
          featured: false,
          image: { url: null, pathname: null },
          createdByEmail: "seed",
          updatedByEmail: "seed",
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    )
    console.log(res.upsertedCount ? `✔ Felvéve: ${item.title}` : `• Már létezik: ${item.slug}`)
  }
  console.log("✔ Kész.")
} catch (error) {
  console.error("✖", error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await mongoose.disconnect().catch(() => {})
}
