import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/** One record per scheduled job run, so the admin can see the job is alive and what it did. */
const cronRunSchema = new Schema(
  {
    job: { type: String, required: true, index: true },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, default: null },
    ok: { type: Boolean, default: false },
    processed: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    /** Per-item failure messages ("errors" is a reserved Mongoose path). */
    issues: { type: [String], default: [] },
    summary: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "cron_runs" },
)

cronRunSchema.index({ createdAt: -1 })

export type CronRun = InferSchemaType<typeof cronRunSchema>
export type CronRunDocument = CronRun & { _id: mongoose.Types.ObjectId; createdAt: Date }

export const CronRunModel: Model<CronRun> =
  (mongoose.models.CronRun as Model<CronRun> | undefined) ?? mongoose.model<CronRun>("CronRun", cronRunSchema)
