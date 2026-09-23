import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

export const membershipApplicationCategories = ["rendes", "hallgatoi", "ifjusagi", "erdemes", "partolo"] as const
export type MembershipApplicationCategory = (typeof membershipApplicationCategories)[number]

export const membershipApplicationTitles = ["", "Dr.", "Prof."] as const
export type MembershipApplicationTitle = (typeof membershipApplicationTitles)[number]

/**
 * Lifecycle of a preliminary application. A submitted application is a
 * "candidate" (tagjelölt); the general assembly decides on admission.
 */
export const membershipApplicationStatuses = ["tagjelolt", "elfogadva", "elutasitva", "visszavonva"] as const
export type MembershipApplicationStatus = (typeof membershipApplicationStatuses)[number]

const membershipApplicationSchema = new Schema(
  {
    category: { type: String, enum: membershipApplicationCategories, required: true },
    title: { type: String, enum: membershipApplicationTitles, default: "" },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },

    status: { type: String, enum: membershipApplicationStatuses, default: "tagjelolt", index: true },

    /** Proof of consent (GDPR art. 7): what was accepted, when and from where. */
    consent: {
      accepted: { type: Boolean, required: true },
      acceptedAt: { type: Date, required: true },
      privacyNoticeVersion: { type: String, required: true, maxlength: 64 },
      /** SHA-256 of the client IP; the raw IP is never stored. */
      ipHash: { type: String, maxlength: 64 },
      userAgent: { type: String, maxlength: 512 },
    },

    /** Delivery bookkeeping for the two e-mails. */
    notifications: {
      applicantEmailSentAt: { type: Date },
      adminEmailSentAt: { type: Date },
      lastError: { type: String, maxlength: 512 },
    },
  },
  { timestamps: true, collection: "membership_applications" },
)

// One active application per e-mail address (case-insensitive because of `lowercase: true`).
membershipApplicationSchema.index({ email: 1 }, { unique: true })
membershipApplicationSchema.index({ createdAt: -1 })

export type MembershipApplication = InferSchemaType<typeof membershipApplicationSchema>

export const MembershipApplicationModel: Model<MembershipApplication> =
  (mongoose.models.MembershipApplication as Model<MembershipApplication> | undefined) ??
  mongoose.model<MembershipApplication>("MembershipApplication", membershipApplicationSchema)
