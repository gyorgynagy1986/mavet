// Creates (or promotes) the first SUPERADMIN. Idempotent: running it again for
// the same address only updates the name and role.
//
//   npm run seed:superadmin
//
// Reads SUPERADMIN_EMAIL and SUPERADMIN_NAME, plus MONGODB_URI (or MONGO_URI),
// from .env.local via Node's --env-file (see package.json). The SUPERADMIN role
// is granted only here or at database level, never from the admin UI.

import mongoose from "mongoose"

const uri = process.env.MONGODB_URI || process.env.MONGO_URI
const email = (process.env.SUPERADMIN_EMAIL || "").trim().toLowerCase()
const name = (process.env.SUPERADMIN_NAME || "").trim()

if (!uri) fail("MONGODB_URI (vagy MONGO_URI) hiányzik.")
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("SUPERADMIN_EMAIL hiányzik vagy érvénytelen.")
if (!name) fail("SUPERADMIN_NAME hiányzik.")

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["SUPERADMIN", "ADMIN", "USER"], default: "USER" },
    lastLoginAt: Date,
  },
  { timestamps: true, collection: "users" },
)
userSchema.index({ email: 1 }, { unique: true })
const User = mongoose.models.User || mongoose.model("User", userSchema)

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  const before = await User.findOne({ email }).lean()
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, role: "SUPERADMIN" }, $setOnInsert: { email } },
    { upsert: true, new: true },
  ).lean()
  console.log(before ? `✔ ${email} frissítve: ${before.role ?? "USER"} → SUPERADMIN (${user.name})` : `✔ ${email} létrehozva SUPERADMIN szereppel (${user.name})`)
  console.log("  Belépés: /mavet-login, az e-mailben kapott kóddal.")
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
} finally {
  await mongoose.disconnect().catch(() => {})
}

function fail(message) {
  console.error(`✖ ${message}`)
  process.exit(1)
}
