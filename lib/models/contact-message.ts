import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

export const CONTACT_NAME_MAX = 100
export const CONTACT_MESSAGE_MAX = 5000

/**
 * A message sent through the public contact form. Stored so that an e-mail
 * delivery failure does not lose the enquiry; the internal notification is
 * tracked on the record.
 */
const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: CONTACT_NAME_MAX },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    message: { type: String, required: true, trim: true, maxlength: CONTACT_MESSAGE_MAX },

    /** Proof of consent (GDPR art. 7): what was accepted, when and from where. */
    consent: {
      accepted: { type: Boolean, required: true },
      acceptedAt: { type: Date, required: true },
      privacyNoticeVersion: { type: String, required: true, maxlength: 64 },
      /** SHA-256 of the client IP; the raw IP is never stored. */
      ipHash: { type: String, maxlength: 64 },
      userAgent: { type: String, maxlength: 512 },
    },

    /** Delivery bookkeeping for the internal notification. */
    notifications: {
      adminEmailSentAt: { type: Date },
      lastError: { type: String, maxlength: 512 },
    },
  },
  { timestamps: true, collection: "contact_messages" },
)

contactMessageSchema.index({ createdAt: -1 })
contactMessageSchema.index({ email: 1, createdAt: -1 })

export type ContactMessage = InferSchemaType<typeof contactMessageSchema>

export const ContactMessageModel: Model<ContactMessage> =
  (mongoose.models.ContactMessage as Model<ContactMessage> | undefined) ??
  mongoose.model<ContactMessage>("ContactMessage", contactMessageSchema)
