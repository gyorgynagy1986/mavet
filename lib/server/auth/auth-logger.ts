import { createHash } from "node:crypto"
import dbConnect from "@/lib/db-connect"
import { AuthLogModel, type AuthChannel, type AuthEvent } from "@/lib/models/auth-log"

type LogLevel = "info" | "warn" | "error"

interface AuthLogData {
  ip?: string
  email?: string
  userId?: string
  attempts?: number
  reason?: string
  userAgent?: string | null
}

const SUCCESS_EVENTS: ReadonlySet<AuthEvent> = new Set(["CODE_SENT", "LOGIN_SUCCESS", "ACCOUNT_ACTIVATED", "PASSWORD_RESET_DONE", "PASSWORD_CHANGED"])

/** Short, non-reversible e-mail identifier for the console log (GDPR-friendly). */
export function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 12)
}

async function persist(level: LogLevel, event: AuthEvent, data: AuthLogData, channel: AuthChannel): Promise<void> {
  try {
    await dbConnect()
    await AuthLogModel.create({
      channel,
      event,
      level,
      success: SUCCESS_EVENTS.has(event),
      email: data.email ?? null,
      userId: data.userId ?? null,
      ip: data.ip ?? null,
      userAgent: data.userAgent ? data.userAgent.slice(0, 300) : null,
      reason: data.reason ?? null,
      attempts: typeof data.attempts === "number" ? data.attempts : null,
    })
  } catch (error) {
    // Logging must never break the login flow.
    console.error("[auth-log] persist failed:", error)
  }
}

function log(level: LogLevel, event: AuthEvent, data: AuthLogData, channel: AuthChannel): void {
  const { email, ip, userId, attempts, reason } = data
  const entry = {
    level,
    event,
    service: "auth",
    channel,
    ...(email ? { emailHash: hashEmail(email) } : {}),
    ...(ip ? { ip } : {}),
    ...(userId ? { userId } : {}),
    ...(typeof attempts === "number" ? { attempts } : {}),
    ...(reason ? { reason } : {}),
    timestamp: new Date().toISOString(),
  }
  const line = JSON.stringify(entry)
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.info(line)

  // Best effort, fire and forget. On Vercel the DB write finishes within the
  // request because the credentials provider awaits the DB anyway.
  void persist(level, event, data, channel)
}

/**
 * Channel-bound logger: console (hashed e-mail) + `auth_logs` collection
 * (clear e-mail, admin-only). Pass the user agent when a request is at hand.
 */
export function createAuthLogger(channel: AuthChannel, userAgent?: string | null) {
  const ua = { userAgent }
  return {
    codeRequested: (ip: string, email: string) => log("info", "CODE_REQUESTED", { ip, email, ...ua }, channel),
    codeSent: (ip: string, email: string, userId: string) => log("info", "CODE_SENT", { ip, email, userId, ...ua }, channel),
    codeRequestUnknownUser: (ip: string, email: string) => log("warn", "CODE_REQUEST_UNKNOWN_USER", { ip, email, ...ua }, channel),
    ipRateLimited: (ip: string, email?: string) => log("warn", "IP_RATE_LIMITED", { ip, email, ...ua }, channel),
    emailRateLimited: (ip: string, email: string, reason: string) => log("warn", "EMAIL_RATE_LIMITED", { ip, email, reason, ...ua }, channel),
    invalidCodeFormat: (ip: string, email: string) => log("warn", "INVALID_CODE_FORMAT", { ip, email, ...ua }, channel),
    invalidCodeAttempt: (ip: string, email: string, attempts: number) => log("warn", "INVALID_CODE_ATTEMPT", { ip, email, attempts, ...ua }, channel),
    codeExpired: (ip: string, email: string) => log("warn", "CODE_EXPIRED", { ip, email, ...ua }, channel),
    bruteForceDetected: (ip: string, email: string) => log("error", "BRUTE_FORCE_DETECTED", { ip, email, ...ua }, channel),
    loginSuccess: (ip: string, email: string, userId: string) => log("info", "LOGIN_SUCCESS", { ip, email, userId, ...ua }, channel),
    loginFailed: (ip: string, email: string, reason: string) => log("warn", "LOGIN_FAILED", { ip, email, reason, ...ua }, channel),
    userNotFound: (ip: string, email: string) => log("warn", "USER_NOT_FOUND", { ip, email, ...ua }, channel),
    accountActivated: (ip: string, email: string, userId: string) => log("info", "ACCOUNT_ACTIVATED", { ip, email, userId, ...ua }, channel),
    passwordResetRequested: (ip: string, email: string, userId: string) => log("info", "PASSWORD_RESET_REQUESTED", { ip, email, userId, ...ua }, channel),
    passwordResetUnknownUser: (ip: string, email: string) => log("warn", "PASSWORD_RESET_UNKNOWN_USER", { ip, email, ...ua }, channel),
    passwordResetDone: (ip: string, email: string, userId: string) => log("info", "PASSWORD_RESET_DONE", { ip, email, userId, ...ua }, channel),
    passwordChanged: (ip: string, email: string, userId: string) => log("info", "PASSWORD_CHANGED", { ip, email, userId, ...ua }, channel),
  }
}

export type AuthLogger = ReturnType<typeof createAuthLogger>
