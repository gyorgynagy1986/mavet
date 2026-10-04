import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Who granted or revoked admin rights, and when. Written by the admin-management
 * API, read by the superadmin's log page. Separate from AuthLog (which is about
 * login attempts) because this one expresses an actor → target relation.
 * No TTL: a rights change must stay traceable.
 */
export const adminAuditActions = [
  "admin_create", // new user record with an admin role
  "admin_role_change", // role changed between non-USER roles, or USER promoted
  "admin_demote", // admin role revoked (role set to USER)
  "member_category_change", // membership category changed by an admin (7.3)
  "membership_revoke", // membership set to megszunt by an admin
  "membership_restore", // membership reactivated after a revocation
  "member_delete", // member account deleted by a superadmin
  "application_delete", // closed/rejected application deleted by a superadmin
] as const
export type AdminAuditAction = (typeof adminAuditActions)[number]

const changeSchema = new Schema(
  {
    field: { type: String, required: true },
    from: { type: String, default: null },
    to: { type: String, default: null },
  },
  { _id: false },
)

const adminAuditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorEmail: { type: String, default: null },
    actorName: { type: String, default: null },
    actorRole: { type: String, default: null },

    action: { type: String, enum: adminAuditActions, required: true },

    targetUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    targetEmail: { type: String, default: null },
    targetName: { type: String, default: null },

    changes: { type: [changeSchema], default: [] },
    summary: { type: String, default: null },

    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true, collection: "admin_audit_logs" },
)

adminAuditLogSchema.index({ createdAt: -1 })
adminAuditLogSchema.index({ targetUserId: 1, createdAt: -1 })

export type AdminAuditLog = InferSchemaType<typeof adminAuditLogSchema>
export type AdminAuditLogDocument = AdminAuditLog & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }

export const AdminAuditLogModel: Model<AdminAuditLog> =
  (mongoose.models.AdminAuditLog as Model<AdminAuditLog> | undefined) ??
  mongoose.model<AdminAuditLog>("AdminAuditLog", adminAuditLogSchema)
