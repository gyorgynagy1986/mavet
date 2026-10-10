import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"
import type { Types } from "mongoose"
import dbConnect from "@/lib/db-connect"
import { activationOutcome, formatHuf, FIRST_FEE_DAYS } from "@/lib/data/membership-fees"
import { ACTIVATION_TOKEN_DAYS, PASSWORD_RESET_MINUTES, UserModel, type UserDocument } from "@/lib/models/user"
import type { MembershipApplicationCategory, MembershipApplicationDocument } from "@/lib/models/membership-application"
import { categoryName, formatDate, formatDateTime, fullName, hashToken, siteUrl } from "@/lib/server/applications"
import { sendTemplatedMail, type SendTemplatedResult } from "@/lib/server/email/send"

const DAY_MS = 24 * 60 * 60 * 1000

export function activationUrl(rawToken: string): string {
  return siteUrl(`/fiok/aktivalas/${rawToken}`)
}

export async function issueActivationToken(userId: Types.ObjectId | string): Promise<{ raw: string; expiresAt: Date }> {
  const raw = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_DAYS * DAY_MS)
  await dbConnect()
  await UserModel.updateOne({ _id: userId }, { $set: { activationTokenHash: hashToken(raw), activationTokenExpiresAt: expiresAt } })
  return { raw, expiresAt }
}

export async function findByActivationToken(raw: string): Promise<UserDocument | null> {
  if (!raw || raw.length < 20 || raw.length > 128) return null
  await dbConnect()
  const user = await UserModel.findOne({ activationTokenHash: hashToken(raw) }).lean<UserDocument | null>()
  if (!user || !user.activationTokenExpiresAt || user.activationTokenExpiresAt.getTime() < Date.now()) return null
  return user
}

/**
 * Acceptance (specification 7.3): creates the member account from the
 * application (or attaches the membership to an existing account with the same
 * e-mail), decides the fee outcome from the acceptance date, and returns the
 * user. The account has no password yet: the activation link sets it.
 */
export async function createMemberFromApplication(
  app: MembershipApplicationDocument,
  acceptedCategory: MembershipApplicationCategory,
  acceptedAt: Date,
): Promise<UserDocument> {
  await dbConnect()
  const outcome = activationOutcome(acceptedCategory, app.medicalDegree, acceptedAt)
  const membership = {
    status: "aktivalasra_var" as const,
    category: acceptedCategory,
    medicalDegree: acceptedCategory === "rendes" ? (app.medicalDegree ?? false) : undefined,
    applicationId: app._id,
    acceptedAt,
    activatedAt: null,
    paidThroughYear: outcome.active ? outcome.paidThroughYear : null,
    feeDue: outcome.active
      ? null
      : { amount: outcome.amountDue, forYear: outcome.dueForYear, dueAt: new Date(acceptedAt.getTime() + FIRST_FEE_DAYS * DAY_MS), reminderSentAt: null },
    expiredAt: null,
  }
  const profile = {
    name: [app.lastName, app.firstName].filter(Boolean).join(" "),
    title: app.title ?? "",
    lastName: app.lastName,
    firstName: app.firstName,
    birthDate: app.birthDate,
    address: app.address,
    phone: app.phone,
    specialty: app.specialty,
    workplace: app.noWorkplace ? "" : app.workplace,
  }

  const user = await UserModel.findOneAndUpdate(
    { email: app.email },
    { $set: { ...profile, membership }, $setOnInsert: { email: app.email, role: "USER" } },
    { upsert: true, new: true },
  ).lean<UserDocument>()
  return user
}

/** The acceptance mail: fee-free (or waived) vs. fee-paying variant, both with the activation link. */
export async function sendAcceptanceMail(user: UserDocument, app: MembershipApplicationDocument, triggeredBy: string): Promise<SendTemplatedResult> {
  const { raw, expiresAt } = await issueActivationToken(user._id)
  const category = user.membership?.category ?? app.category
  const common = {
    nev: fullName(app),
    kategoria: categoryName(category),
    link: activationUrl(raw),
    linkLejarat: formatDate(expiresAt),
  }
  const feeDue = user.membership?.feeDue
  if (feeDue?.amount) {
    return sendTemplatedMail({
      key: "jelentkezes_elfogadva_dijkoteles",
      to: user.email,
      triggeredBy,
      applicationId: app._id,
      userId: user._id,
      vars: { ...common, osszeg: formatHuf(feeDue.amount), idoszak: `${feeDue.forYear}. év`, hatarido: feeDue.dueAt ? formatDate(feeDue.dueAt) : "" },
    })
  }
  return sendTemplatedMail({ key: "jelentkezes_elfogadva", to: user.email, triggeredBy, applicationId: app._id, userId: user._id, vars: common })
}

/** Sets the password and moves the membership to its post-activation state. */
export async function activateMember(user: UserDocument, password: string, now = new Date()): Promise<"aktiv" | "fizetesre_var"> {
  const passwordHash = await bcrypt.hash(password, 12)
  const next = user.membership?.feeDue?.amount ? "fizetesre_var" : "aktiv"
  await dbConnect()
  await UserModel.updateOne(
    { _id: user._id, "membership.status": "aktivalasra_var" },
    {
      $set: { passwordHash, activationTokenHash: null, activationTokenExpiresAt: null, "membership.status": next, "membership.activatedAt": now, lastLoginAt: now },
    },
  )
  return next
}

export async function verifyPassword(password: string, passwordHash: string | null | undefined): Promise<boolean> {
  // Constant-time-ish: compare against a dummy hash when the account has none.
  const hash = passwordHash ?? "$2a$12$CwTycUXWue0Thq9StjUM0uJ8gD5p1e3Lw2Yl8Vv0z7Zk0kq1C6bIu"
  const ok = await bcrypt.compare(password, hash)
  return ok && Boolean(passwordHash)
}

// ---- password reset (specification 9.1, 13.4) ----

export function passwordResetUrl(rawToken: string): string {
  return siteUrl(`/jelszo-visszaallitas/${rawToken}`)
}

/** Issues a reset link for an activated member; returns false when the address has no such account. */
export async function sendPasswordResetMail(email: string, triggeredBy = "system"): Promise<"sent" | "no_account" | "failed"> {
  await dbConnect()
  const user = await UserModel.findOne({ email, role: "USER", passwordHash: { $ne: null } })
    .select({ email: 1, title: 1, lastName: 1, firstName: 1, name: 1 })
    .lean<UserDocument | null>()
  if (!user) return "no_account"

  const raw = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000)
  await UserModel.updateOne({ _id: user._id }, { $set: { passwordResetTokenHash: hashToken(raw), passwordResetExpiresAt: expiresAt } })

  const result = await sendTemplatedMail({
    key: "jelszo_visszaallitas",
    to: user.email,
    triggeredBy,
    userId: user._id,
    vars: {
      nev: [user.title, user.lastName, user.firstName].filter(Boolean).join(" ") || user.name,
      link: passwordResetUrl(raw),
      linkLejarat: formatDateTime(expiresAt),
    },
  })
  return result.status === "sent" ? "sent" : "failed"
}

export async function findByPasswordResetToken(raw: string): Promise<UserDocument | null> {
  if (!raw || raw.length < 20 || raw.length > 128) return null
  await dbConnect()
  const user = await UserModel.findOne({ passwordResetTokenHash: hashToken(raw) }).lean<UserDocument | null>()
  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() < Date.now()) return null
  return user
}

/** Sets a new password and invalidates every outstanding reset link. */
export async function setPassword(userId: Types.ObjectId | string, password: string): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 12)
  await dbConnect()
  await UserModel.updateOne({ _id: userId }, { $set: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null } })
}
