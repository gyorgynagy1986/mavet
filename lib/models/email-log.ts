import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Every templated e-mail the system tried to send: who, which template, with
 * what outcome. Shown on the admin "E-mailek → Napló" page so the operators can
 * see that a reminder or a decision mail really went out. No TTL.
 */
export const emailLogStatuses = ["sent", "failed", "skipped"] as const
export type EmailLogStatus = (typeof emailLogStatuses)[number]

const emailLogSchema = new Schema(
  {
    templateKey: { type: String, required: true, index: true },
    to: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true },
    status: { type: String, enum: emailLogStatuses, required: true },
    error: { type: String, default: null, maxlength: 1000 },
    /** "system" | "cron" | "admin:<email>" | "test:<email>" */
    triggeredBy: { type: String, default: "system" },
    /** Related records, when any. */
    applicationId: { type: Schema.Types.ObjectId, ref: "MembershipApplication", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "email_logs" },
)

emailLogSchema.index({ createdAt: -1 })
emailLogSchema.index({ applicationId: 1, createdAt: -1 })

export type EmailLog = InferSchemaType<typeof emailLogSchema>
export type EmailLogDocument = EmailLog & { _id: mongoose.Types.ObjectId; createdAt: Date }

export const EmailLogModel: Model<EmailLog> =
  (mongoose.models.EmailLog as Model<EmailLog> | undefined) ?? mongoose.model<EmailLog>("EmailLog", emailLogSchema)
