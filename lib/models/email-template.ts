import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Editable e-mail templates. One document per `key`; the code-side registry
 * (`lib/server/email/registry.ts`) defines the keys, their variables and the
 * default subject/body. A document only exists once an admin saved the
 * template; until then the default is used. `html` is the body only: the
 * MAVET header/footer frame is added at render time so every mail looks alike.
 */
const emailTemplateSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 64 },
    subject: { type: String, required: true, maxlength: 300 },
    html: { type: String, required: true, maxlength: 100_000 },
    /** false → the system skips this mail (logged as "skipped"). */
    enabled: { type: Boolean, default: true },
    updatedByEmail: { type: String, default: null },
  },
  { timestamps: true, collection: "email_templates" },
)

emailTemplateSchema.index({ key: 1 }, { unique: true })

export type EmailTemplate = InferSchemaType<typeof emailTemplateSchema>
export type EmailTemplateDocument = EmailTemplate & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }

export const EmailTemplateModel: Model<EmailTemplate> =
  (mongoose.models.EmailTemplate as Model<EmailTemplate> | undefined) ??
  mongoose.model<EmailTemplate>("EmailTemplate", emailTemplateSchema)
