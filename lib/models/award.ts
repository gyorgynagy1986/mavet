import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/** Award types with their recipients by year (specification 4.4). Recipients do not link to member accounts. */
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
    /** Hidden from the public page; the entries stay. */
    hidden: { type: Boolean, default: false },
    entries: [
      {
        _id: false,
        year: { type: Number, required: true },
        names: { type: [String], default: [] },
      },
    ],
    updatedByEmail: { type: String, default: null },
  },
  { timestamps: true, collection: "awards" },
)
schema.index({ order: 1, name: 1 })

export type Award = InferSchemaType<typeof schema>
export type AwardDocument = Award & { _id: mongoose.Types.ObjectId }
export const AwardModel: Model<Award> = (mongoose.models.Award as Model<Award> | undefined) ?? mongoose.model<Award>("Award", schema)
