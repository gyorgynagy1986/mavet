import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/** Partners and supporters (3.1 / 3.4): name, normalised logo, website; featured ones appear on the home page. */
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    websiteUrl: { type: String, trim: true, default: "" },
    logo: {
      url: { type: String, default: null },
      pathname: { type: String, default: null },
    },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    updatedByEmail: { type: String, default: null },
  },
  { timestamps: true, collection: "partners" },
)
schema.index({ published: 1, featured: 1, order: 1 })

export type Partner = InferSchemaType<typeof schema>
export type PartnerDocument = Partner & { _id: mongoose.Types.ObjectId }
export const PartnerModel: Model<Partner> = (mongoose.models.Partner as Model<Partner> | undefined) ?? mongoose.model<Partner>("Partner", schema)
