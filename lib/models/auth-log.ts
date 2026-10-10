import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Every admin login event, success and failure alike: code requested, code
 * sent, wrong code, rate limited, login succeeded. The admin area shows it so
 * the superadmin can see who tried to get in, from where, and whether it worked
 * (specification 12.2: abuse limiting and verifiable access control).
 *
 * The e-mail, IP and user agent are stored in clear: admin-only data about the
 * admins themselves, kept on legitimate interest. No TTL: an access question
 * may come up long after the fact.
 */
export const authChannels = ["admin-otp", "member-password"] as const
export type AuthChannel = (typeof authChannels)[number]

export const authEvents = [
  "CODE_REQUESTED",
  "CODE_SENT",
  "CODE_REQUEST_UNKNOWN_USER",
  "IP_RATE_LIMITED",
  "EMAIL_RATE_LIMITED",
  "INVALID_CODE_ATTEMPT",
  "INVALID_CODE_FORMAT",
  "CODE_EXPIRED",
  "BRUTE_FORCE_DETECTED",
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "USER_NOT_FOUND",
  "ACCOUNT_ACTIVATED",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_RESET_UNKNOWN_USER",
  "PASSWORD_RESET_DONE",
  "PASSWORD_CHANGED",
] as const
export type AuthEvent = (typeof authEvents)[number]

const authLogSchema = new Schema(
  {
    channel: { type: String, enum: authChannels, required: true },
    event: { type: String, required: true },
    level: { type: String, enum: ["info", "warn", "error"], default: "info" },
    success: { type: Boolean, default: false },

    email: { type: String, default: null, lowercase: true, trim: true },
    userId: { type: String, default: null },

    ip: { type: String, default: null },
    userAgent: { type: String, default: null },

    reason: { type: String, default: null },
    attempts: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "auth_logs" },
)

authLogSchema.index({ createdAt: -1 })
authLogSchema.index({ email: 1, createdAt: -1 })

export type AuthLog = InferSchemaType<typeof authLogSchema>
export type AuthLogDocument = AuthLog & { _id: mongoose.Types.ObjectId; createdAt: Date }

export const AuthLogModel: Model<AuthLog> =
  (mongoose.models.AuthLog as Model<AuthLog> | undefined) ?? mongoose.model<AuthLog>("AuthLog", authLogSchema)
