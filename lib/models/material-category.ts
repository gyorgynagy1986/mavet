import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/** Categories of the professional materials (6.1): a filter only, edited by the admin. */
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 60 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "material_categories" },
)
schema.index({ slug: 1 }, { unique: true })
schema.index({ order: 1, name: 1 })

export type MaterialCategory = InferSchemaType<typeof schema>
export type MaterialCategoryDocument = MaterialCategory & { _id: mongoose.Types.ObjectId }
export const MaterialCategoryModel: Model<MaterialCategory> =
  (mongoose.models.MaterialCategory as Model<MaterialCategory> | undefined) ?? mongoose.model<MaterialCategory>("MaterialCategory", schema)
