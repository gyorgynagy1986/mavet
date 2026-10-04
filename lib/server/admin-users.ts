import mongoose from "mongoose"
import dbConnect from "@/lib/db-connect"
import { UserModel, adminRoles, type UserRole } from "@/lib/models/user"

export interface AdminUserListItem {
  id: string
  name: string
  email: string
  role: UserRole
  lastLoginAt: string | null
  createdAt: string
}

interface UserLean {
  _id: mongoose.Types.ObjectId
  name?: string
  email?: string
  role?: UserRole
  lastLoginAt?: Date | null
  createdAt?: Date
}

function toItem(d: UserLean): AdminUserListItem {
  return {
    id: d._id.toString(),
    name: d.name ?? "",
    email: d.email ?? "",
    role: d.role ?? "USER",
    lastLoginAt: d.lastLoginAt ? d.lastLoginAt.toISOString() : null,
    createdAt: d.createdAt ? d.createdAt.toISOString() : new Date(0).toISOString(),
  }
}

/** All admin-level users, superadmins first, then by name. */
export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  await dbConnect()
  const docs = await UserModel.find({ role: { $in: adminRoles } })
    .select({ name: 1, email: 1, role: 1, lastLoginAt: 1, createdAt: 1 })
    .sort({ role: -1, name: 1 })
    .lean<UserLean[]>()
  return docs.map(toItem)
}

export { toItem as adminUserToItem, type UserLean as AdminUserLean }
