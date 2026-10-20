import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Proof of the newsletter consent (12.1): when, with which privacy notice version, from where. The
 * subscriber list itself lives at the provider; this is our record of the declaration.
 */
const schema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    privacyNoticeVersion: { type: String, required: true, maxlength: 64 },
    consentedAt: { type: Date, required: true },
    ipHash: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 512 },
    /** What the provider answered: subscribed or already subscribed. */
    providerStatus: { type: String, default: null },
  },
  { timestamps: true, collection: "newsletter_consents" },
)
schema.index({ email: 1, consentedAt: -1 })

export type NewsletterConsent = InferSchemaType<typeof schema>
export const NewsletterConsentModel: Model<NewsletterConsent> =
  (mongoose.models.NewsletterConsent as Model<NewsletterConsent> | undefined) ?? mongoose.model<NewsletterConsent>("NewsletterConsent", schema)
