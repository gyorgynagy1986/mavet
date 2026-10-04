import type { Session } from "next-auth"
import type { Types } from "mongoose"
import dbConnect from "@/lib/db-connect"
import { AdminAuditLogModel, type AdminAuditAction } from "@/lib/models/admin-audit-log"

export interface AdminAuditChange {
  field: string
  from: string | null
  to: string | null
}

export interface AdminAuditActor {
  actorUserId: string | null
  actorEmail: string | null
  actorName: string | null
  actorRole: string | null
}

export function actorFromSession(session: Session | null): AdminAuditActor {
  return {
    actorUserId: session?.user?.id ?? null,
    actorEmail: session?.user?.email ?? null,
    actorName: session?.user?.name ?? null,
    actorRole: session?.user?.role ?? null,
  }
}

export function requestMeta(request: Request): { ip: string | null; userAgent: string | null } {
  return {
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: request.headers.get("user-agent"),
  }
}

interface LogInput extends AdminAuditActor {
  action: AdminAuditAction
  targetUserId?: Types.ObjectId | string | null
  targetEmail?: string | null
  targetName?: string | null
  changes?: AdminAuditChange[]
  summary?: string | null
  ip?: string | null
  userAgent?: string | null
}

/** Never throws: a failed audit write must not fail the operation itself, but it is logged loudly. */
export async function logAdminAudit(entry: LogInput): Promise<void> {
  try {
    await dbConnect()
    await AdminAuditLogModel.create({
      actorUserId: entry.actorUserId ?? null,
      actorEmail: entry.actorEmail ?? null,
      actorName: entry.actorName ?? null,
      actorRole: entry.actorRole ?? null,
      action: entry.action,
      targetUserId: entry.targetUserId ?? null,
      targetEmail: entry.targetEmail ?? null,
      targetName: entry.targetName ?? null,
      changes: entry.changes ?? [],
      summary: entry.summary ?? null,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
    })
  } catch (error) {
    console.error("[admin-audit] write failed:", error)
  }
}
