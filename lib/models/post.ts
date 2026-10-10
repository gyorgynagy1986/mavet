import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"
import { postStatuses, postTypes } from "@/lib/posts"

/**
 * News and events (specification 5) in one collection: both have a title, a summary, an article and an
 * optional image, share the address space under /aktualitasok and the home page preview.
 */
const postSchema = new Schema(
  {
    type: { type: String, enum: postTypes, required: true },
    /** Fixed when the post is created, so shared links survive a title change. */
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 90 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    excerpt: { type: String, trim: true, default: "" },
    /** Plain text, paragraphs separated by an empty line. */
    body: { type: String, default: "" },

    status: { type: String, enum: postStatuses, default: "piszkozat" },
    /** News: the date shown on the card and the sort key. Set at the first publication unless given. */
    publishedAt: { type: Date, default: null },
    /** At most one post is featured on the home page (3.2). */
    featured: { type: Boolean, default: false },

    image: {
      url: { type: String, default: null },
      pathname: { type: String, default: null },
    },

    // ---- events: what the admin typed (Hungarian local date and time) ----
    startDate: { type: String, default: null },
    startTime: { type: String, default: null },
    endDate: { type: String, default: null },
    endTime: { type: String, default: null },
    /** Derived from the four fields above on every save; used for ordering and "current or past" (5.2). */
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    location: { type: String, trim: true, default: "" },
    linkUrl: { type: String, trim: true, default: "" },
    linkLabel: { type: String, trim: true, default: "" },

    createdByEmail: { type: String, default: null },
    updatedByEmail: { type: String, default: null },
  },
  { timestamps: true, collection: "posts" },
)

postSchema.index({ slug: 1 }, { unique: true })
postSchema.index({ type: 1, status: 1, publishedAt: -1, _id: -1 })
postSchema.index({ type: 1, status: 1, endsAt: 1, startsAt: 1 })

export type Post = InferSchemaType<typeof postSchema>
export type PostDocument = Post & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }

export const PostModel: Model<Post> = (mongoose.models.Post as Model<Post> | undefined) ?? mongoose.model<Post>("Post", postSchema)
