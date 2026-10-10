// One-off migration for the two-step application flow (D-018):
//   - status "tagjelolt" (old preliminary applications) → "elozetes"
//   - the old unique index on `email` is replaced by a partial unique index that
//     only covers OPEN applications, so rejected applicants can apply again.
//
//   npm run migrate:applications
//
// Idempotent: safe to run more than once.

import mongoose from "mongoose"

const uri = process.env.MONGODB_URI || process.env.MONGO_URI
if (!uri) {
  console.error("✖ MONGODB_URI (vagy MONGO_URI) hiányzik.")
  process.exit(1)
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  const col = mongoose.connection.db.collection("membership_applications")

  const res = await col.updateMany(
    { status: "tagjelolt" },
    { $set: { status: "elozetes" }, $currentDate: { lastActivityAt: true } },
  )
  console.log(`✔ ${res.modifiedCount} jelentkezés átsorolva: tagjelolt → elozetes`)

  const indexes = await col.indexes()
  const old = indexes.find((i) => i.name === "email_1" && i.unique)
  if (old) {
    await col.dropIndex("email_1")
    console.log("✔ Régi egyedi email index eldobva (email_1)")
  }
  if (!indexes.some((i) => i.name === "email_open_unique")) {
    await col.createIndex(
      { email: 1 },
      { unique: true, name: "email_open_unique", partialFilterExpression: { status: { $in: ["elozetes", "megerositett", "bekuldott"] } } },
    )
    console.log("✔ Részleges egyedi index létrehozva (email_open_unique)")
  } else {
    console.log("• email_open_unique index már létezik")
  }
  await col.updateMany({ lastActivityAt: { $exists: false } }, [{ $set: { lastActivityAt: "$createdAt" } }])
  console.log("✔ Kész.")
} catch (error) {
  console.error("✖", error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await mongoose.disconnect().catch(() => {})
}
