import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"
import { documentSources, materialAccess, materialKinds, materialStatuses, videoProviders } from "@/lib/materials"

/**
 * Professional materials and documents (specification 6): one record per material, a document (uploaded
 * file or external address) or an embedded video; public or members-only; hidden until published.
 */
const schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    categoryId: { type: Schema.Types.ObjectId, ref: "MaterialCategory", default: null, index: true },
    summary: { type: String, trim: true, default: "" },
    kind: { type: String, enum: materialKinds, default: "dokumentum" },
    access: { type: String, enum: materialAccess, default: "publikus" },
    status: { type: String, enum: materialStatuses, default: "rejtett" },
    author: { type: String, trim: true, default: "" },
    /** Shown date (YYYY-MM-DD, as typed); the list sorts by it, newest first. */
    publishedDate: { type: String, default: null },

    documentSource: { type: String, enum: documentSources, default: "fajl" },
    /** Uploaded file (Vercel Blob). Served through /szakmai-anyagok/<id>/megnyitas, which checks access. */
    file: {
      url: { type: String, default: null },
      pathname: { type: String, default: null },
      name: { type: String, default: null },
      size: { type: Number, default: null },
      contentType: { type: String, default: null },
    },
    externalUrl: { type: String, trim: true, default: "" },

    videoProvider: { type: String, enum: videoProviders, default: "youtube" },
    /** YouTube: the 11-character video id. Bunny: the library video id (playback not wired up yet). */
    videoId: { type: String, trim: true, default: "" },

    createdByEmail: { type: String, default: null },
    updatedByEmail: { type: String, default: null },
  },
  { timestamps: true, collection: "materials" },
)
schema.index({ status: 1, publishedDate: -1, _id: -1 })
schema.index({ title: "text" })

export type Material = InferSchemaType<typeof schema>
export type MaterialDocument = Material & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }
export const MaterialModel: Model<Material> = (mongoose.models.Material as Model<Material> | undefined) ?? mongoose.model<Material>("Material", schema)
