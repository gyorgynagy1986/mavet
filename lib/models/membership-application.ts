import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

export const membershipApplicationCategories = ["rendes", "hallgatoi", "ifjusagi", "erdemes", "partolo"] as const
export type MembershipApplicationCategory = (typeof membershipApplicationCategories)[number]

export const membershipApplicationTitles = ["", "Dr.", "Prof."] as const
export type MembershipApplicationTitle = (typeof membershipApplicationTitles)[number]

/**
 * Lifecycle of an application (D-018):
 *
 *   elozetes      short form submitted, e-mail not yet verified
 *   megerositett  the applicant opened the continuation link (e-mail verified),
 *                 the full form is still incomplete
 *   bekuldott     full form finalized → under review (specification: tagjelölt)
 *   elfogadva     accepted by an admin
 *   elutasitva    rejected by an admin; a new application may be started
 *   visszavont    withdrawn / closed without decision (admin)
 *
 * Open states (one per e-mail address at a time): elozetes, megerositett, bekuldott.
 */
export const membershipApplicationStatuses = ["elozetes", "megerositett", "bekuldott", "elfogadva", "elutasitva", "visszavont"] as const
export type MembershipApplicationStatus = (typeof membershipApplicationStatuses)[number]

export const openApplicationStatuses: readonly MembershipApplicationStatus[] = ["elozetes", "megerositett", "bekuldott"]
export const unfinishedApplicationStatuses: readonly MembershipApplicationStatus[] = ["elozetes", "megerositett"]

/** How long a continuation link stays valid; renewed on every (re)send. */
export const CONTINUE_TOKEN_DAYS = 30

const membershipApplicationSchema = new Schema(
  {
    // ---- short form (step 1) ----
    category: { type: String, enum: membershipApplicationCategories, required: true },
    title: { type: String, enum: membershipApplicationTitles, default: "" },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },

    status: { type: String, enum: membershipApplicationStatuses, default: "elozetes", index: true },

    // ---- continuation link (sha-256 of the raw token; the raw token is only in the e-mail) ----
    continueTokenHash: { type: String, default: null },
    continueTokenExpiresAt: { type: Date, default: null },
    emailVerifiedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now },

    // ---- full form (step 2, specification 7.1) ----
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
    /** "I have no permanent workplace" (any category except student, where the field is optional). */
    noWorkplace: { type: Boolean, default: false },
    /** Rendes tag only: medical or pharmacist degree → 10 000 Ft, otherwise 5 000 Ft. */
    medicalDegree: { type: Boolean },

    /** Proof of consent (GDPR art. 7) given on the short form. */
    consent: {
      accepted: { type: Boolean, required: true },
      acceptedAt: { type: Date, required: true },
      privacyNoticeVersion: { type: String, required: true, maxlength: 64 },
      ipHash: { type: String, maxlength: 64 },
      userAgent: { type: String, maxlength: 512 },
    },
    /** Declarations made at finalization: statutes + privacy notice (full form version). */
    declarations: {
      statutesAcceptedAt: { type: Date },
      privacyAcceptedAt: { type: Date },
      privacyNoticeVersion: { type: String, maxlength: 64 },
      ipHash: { type: String, maxlength: 64 },
    },

    // ---- timeline ----
    submittedAt: { type: Date, default: null },
    decidedAt: { type: Date, default: null },
    decidedByEmail: { type: String, default: null },
    /** Category the admin assigned at acceptance (may differ from the requested one). */
    acceptedCategory: { type: String, enum: membershipApplicationCategories },
    /** Text sent to the applicant with a rejection (optional). */
    decisionMessage: { type: String, maxlength: 2000, default: null },
    /** Internal admin notes, never shown to the applicant. */
    internalNote: { type: String, maxlength: 4000, default: null },

    reminders: {
      type: [
        new Schema(
          {
            sentAt: { type: Date, required: true },
            kind: { type: String, enum: ["auto", "manual"], required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    /** Legacy delivery bookkeeping (pre-template mails); new mails go to `email_logs`. */
    notifications: {
      applicantEmailSentAt: { type: Date },
      adminEmailSentAt: { type: Date },
      lastError: { type: String, maxlength: 512 },
    },
  },
  { timestamps: true, collection: "membership_applications" },
)

// One OPEN application per e-mail address; decided ones may pile up (re-application after rejection).
membershipApplicationSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { status: { $in: [...openApplicationStatuses] } }, name: "email_open_unique" },
)
membershipApplicationSchema.index({ continueTokenHash: 1 }, { sparse: true })
membershipApplicationSchema.index({ status: 1, lastActivityAt: 1 })
membershipApplicationSchema.index({ createdAt: -1 })

export type MembershipApplication = InferSchemaType<typeof membershipApplicationSchema>
export type MembershipApplicationDocument = MembershipApplication & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const MembershipApplicationModel: Model<MembershipApplication> =
  (mongoose.models.MembershipApplication as Model<MembershipApplication> | undefined) ??
  mongoose.model<MembershipApplication>("MembershipApplication", membershipApplicationSchema)
