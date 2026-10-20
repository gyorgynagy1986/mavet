import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/** Short editable texts of the site keyed by name (an intro paragraph, a notice); edited by the admin. */
const schema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, default: "" },
    updatedByEmail: { type: String, default: null },
  },
  { timestamps: true, collection: "site_texts" },
)
schema.index({ key: 1 }, { unique: true })

export type SiteText = InferSchemaType<typeof schema>
export const SiteTextModel: Model<SiteText> = (mongoose.models.SiteText as Model<SiteText> | undefined) ?? mongoose.model<SiteText>("SiteText", schema)
