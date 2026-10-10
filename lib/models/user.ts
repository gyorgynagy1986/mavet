import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"
import { membershipApplicationCategories, membershipApplicationTitles } from "@/lib/models/membership-application"

/**
 * Account roles.
 *
 * - SUPERADMIN: manages the other admins (create, change role, revoke). Set by
 *   the seed script (`npm run seed:superadmin`) or at database level; the UI
 *   never grants it, so a compromised admin cannot mint more superadmins.
 * - ADMIN: full access to the admin area; cannot manage admins.
 * - USER: a member account, created when an application is accepted.
 *
 * Organisational offices (president, committee member) are membership data,
 * not roles: the specification (1.2) separates office from admin rights.
 */
export const userRoles = ["SUPERADMIN", "ADMIN", "USER"] as const
export type UserRole = (typeof userRoles)[number]

export const adminRoles: readonly UserRole[] = ["SUPERADMIN", "ADMIN"]

export function isAdminRole(role: string | null | undefined): role is "SUPERADMIN" | "ADMIN" {
  return role === "SUPERADMIN" || role === "ADMIN"
}

export function isSuperAdminRole(role: string | null | undefined): role is "SUPERADMIN" {
  return role === "SUPERADMIN"
}

/**
 * Membership lifecycle (specification 1.2):
 *   aktivalasra_var   accepted, the activation link is out, no password yet
 *   fizetesre_var     activated, first fee due (fee-paying category, from 2027)
 *   aktiv             full member rights
 *   lejart            fee not settled by 31 January → expired on 1 February (8.2)
 *   megszunt          account/membership deleted or closed by the admin
 */
export const membershipStatuses = ["aktivalasra_var", "fizetesre_var", "aktiv", "lejart", "megszunt"] as const
export type MembershipStatus = (typeof membershipStatuses)[number]

/** How long the activation link stays valid; the admin can re-send it. */
export const ACTIVATION_TOKEN_DAYS = 7
/** Password reset link validity (specification 13.4). */
export const PASSWORD_RESET_MINUTES = 60

const userSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, enum: userRoles, default: "USER", index: true },

    /** bcrypt hash; null until the member activates the account. Admins log in with a code. */
    passwordHash: { type: String, default: null },

    /** One-time activation link (sha-256 of the raw token). */
    activationTokenHash: { type: String, default: null },
    activationTokenExpiresAt: { type: Date, default: null },

    /** One-time password reset link (sha-256 of the raw token, 1 hour, specification 13.4). */
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },

    // ---- profile (copied from the accepted application; editable later, 9.2) ----
    title: { type: String, enum: membershipApplicationTitles, default: "" },
    lastName: { type: String, trim: true, maxlength: 100 },
    firstName: { type: String, trim: true, maxlength: 100 },
    birthDate: { type: Date },
    address: {
      postalCode: { type: String, trim: true, maxlength: 16 },
      city: { type: String, trim: true, maxlength: 100 },
      street: { type: String, trim: true, maxlength: 200 },
      country: { type: String, trim: true, maxlength: 100 },
    },
    phone: { type: String, trim: true, maxlength: 40 },
    specialty: { type: String, trim: true, maxlength: 200 },
    workplace: { type: String, trim: true, maxlength: 200 },
    birthPlace: { type: String, trim: true, maxlength: 120 },
    /** Short introduction, max 500 characters (9.2). */
    bio: { type: String, trim: true, maxlength: 500 },
    interests: { type: [String], default: [] },
    /** Workgroup ids the member marked in their profile (4.3: self-managed). */
    workgroups: { type: [String], default: [] },
    /** Organisational office (elnök, bizottsági tag…), set by the admin only (9.2). */
    office: { type: String, trim: true, maxlength: 120, default: null },
    /** Member may appear on the public board/committee page (admin-set, 4.1). */
    boardMember: { type: Boolean, default: false },
    /**
     * Readable address of the public board profile (`/a-tarsasagrol/vezetoseg/<slug>`). Set once, when the
     * member first becomes a board member, and never rewritten on a name change, so shared links keep working.
     * No default: the unique index is sparse, so the field must be absent until a slug exists.
     */
    slug: { type: String, trim: true, lowercase: true, maxlength: 80 },

    photo: {
      url: { type: String, default: null },
      pathname: { type: String, default: null },
      updatedAt: { type: Date, default: null },
    },

    /**
     * Visibility (9.3): `enabled` is the single master switch (default off).
     * The field flags decide which optional data accompanies the name.
     */
    visibility: {
      enabled: { type: Boolean, default: false },
      photo: { type: Boolean, default: true },
      specialty: { type: Boolean, default: true },
      workplace: { type: Boolean, default: true },
      bio: { type: Boolean, default: true },
      interests: { type: Boolean, default: true },
      workgroups: { type: Boolean, default: true },
    },

    membership: {
      status: { type: String, enum: membershipStatuses },
      category: { type: String, enum: membershipApplicationCategories },
      /** Rendes tag: medical/pharmacist degree decides the fee. */
      medicalDegree: { type: Boolean },
      applicationId: { type: Schema.Types.ObjectId, ref: "MembershipApplication" },
      acceptedAt: { type: Date },
      activatedAt: { type: Date },
      /** Last calendar year the membership is valid for (paid or waived). */
      paidThroughYear: { type: Number },
      /** First fee: amount, the year it covers and the deadline (8.1). */
      feeDue: {
        amount: { type: Number },
        forYear: { type: Number },
        dueAt: { type: Date },
        reminderSentAt: { type: Date },
      },
      expiredAt: { type: Date },
      /** Revocation bookkeeping (megszunt). */
      revokedAt: { type: Date },
      revokedByEmail: { type: String },
      revokeReason: { type: String, maxlength: 2000 },
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true, collection: "users" },
)

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ activationTokenHash: 1 }, { sparse: true })
userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true })
userSchema.index({ slug: 1 }, { unique: true, sparse: true })
userSchema.index({ "membership.status": 1 })
userSchema.index({ "visibility.enabled": 1, lastName: 1, firstName: 1 })

export type User = InferSchemaType<typeof userSchema>
export type UserDocument = User & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User> | undefined) ?? mongoose.model<User>("User", userSchema)
