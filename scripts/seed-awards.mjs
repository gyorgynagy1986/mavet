// Seeds the six award types of specification 4.4 (name, description, order) and the intro text of the
// Díjazottak page. Existing awards (matched by name) and an existing intro are left untouched, so it is
// safe to run more than once. Recipients are added by the admin.
//
//   npm run seed:awards

import mongoose from "mongoose"

const uri = process.env.MONGODB_URI || process.env.MONGO_URI
if (!uri) {
  console.error("✖ MONGODB_URI (vagy MONGO_URI) hiányzik.")
  process.exit(1)
}

const awards = [
  ["MAVET Díj", "A MAVET Díj azoknak az egészségügyi szakembereknek adományozható, akik az elmúlt években kiemelkedő szakmai teljesítményükkel, innovatív munkájukkal vagy a vidék egészségügyének fejlesztéséért végzett tevékenységükkel jelentős értéket teremtettek."],
  ["MAVET Közösségért Díj", "A MAVET Közösségért Díj azoknak az egészségügyi területen kívül tevékenykedő személyeknek vagy szervezeteknek adományozható, akik kiemelkedő szerepet vállalnak a közösségek egészségének fejlesztésében, az egészségmegőrzésben vagy a vidék egészségügyi életének támogatásában."],
  ["MAVET Ifjúsági Díj", "A MAVET Ifjúsági Díj a fiatal szakemberek és kutatók kiemelkedő teljesítményét ismeri el. Olyan, jellemzően 35 év alatti egészségügyi szakembereknek adományozható, akik az elmúlt években kiemelkedő szakmai teljesítményükkel, innovatív munkájukkal vagy a vidék egészségügyének fejlesztéséért végzett tevékenységükkel jelentős értéket teremtettek."],
  ["MAVET Életműdíj", "A MAVET Életműdíj a Társaság legmagasabb szakmai elismerése. Azoknak a szakembereknek adományozható, akik több évtizedes munkásságukkal maradandó hatást gyakoroltak a vidékegészségügy, az oktatás vagy a tudomány fejlődésére, és példát mutattak a következő generációk számára."],
  ["Kiemelkedő Tudományos Közlemény Díj", "Ez a díj annak a szerzőnek vagy szerzői közösségnek adományozható, aki az adott időszakban a vidékegészségügy vagy kapcsolódó tudományterületek témájában kiemelkedő tudományos közleményt publikált, amely hozzájárul a vidékegészségügy fejlődéséhez."],
  ["Örökös Tiszteletbeli Elnök", "Az Örökös Tiszteletbeli Elnök cím a Társaság legmagasabb szakmai és erkölcsi elismerése. Olyan személynek adományozható, aki meghatározó szerepet játszott a magyar falu- és vidékegészségügy mint tudományterület megszületésében és fejlődésében, valamint a Magyar Vidékegészségügyi Társaság létrejöttében, fejlődésében vagy hosszú távú működésében, és munkásságával maradandó értéket teremtett a közösség számára."],
]
const intro =
  "A Magyar Vidékegészségügyi Társaság díjaival azokat a szakembereket ismeri el, akik munkájukkal, példamutatásukkal vagy tudományos tevékenységükkel kiemelkedően hozzájárulnak a vidék egészségügyének fejlődéséhez. Ismerje meg díjazottjainkat és a Társaság elismeréseit!"

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  const db = mongoose.connection.db
  const col = db.collection("awards")
  let created = 0
  for (const [i, [name, description]] of awards.entries()) {
    const now = new Date()
    const res = await col.updateOne(
      { name },
      { $setOnInsert: { name, description, order: i + 1, hidden: false, entries: [], updatedByEmail: null, createdAt: now, updatedAt: now } },
      { upsert: true },
    )
    if (res.upsertedCount) created += 1
  }
  const texts = db.collection("site_texts")
  await texts.createIndex({ key: 1 }, { unique: true })
  const t = await texts.updateOne({ key: "dijazottak_bevezeto" }, { $setOnInsert: { key: "dijazottak_bevezeto", text: intro, updatedByEmail: null, createdAt: new Date(), updatedAt: new Date() } }, { upsert: true })
  console.log(`✔ Díjak: ${created} új, ${awards.length - created} már létezett. Bevezető: ${t.upsertedCount ? "felvéve" : "már létezett"}.`)
} catch (error) {
  console.error("✖ Hiba:", error)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
