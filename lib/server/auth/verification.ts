import { randomInt, timingSafeEqual } from "node:crypto"
import { requireRedis } from "@/lib/server/redis"

/**
 * One-time login codes for the admin area, stored in Redis.
 *
 * Flow: the login page requests a code for an e-mail address → a 6-digit code
 * is generated and mailed → the NextAuth credentials provider verifies it.
 * Limits: one code per minute per address, 20 codes per day per address,
 * 5 wrong attempts per code, 3 minutes validity. The daily counter survives a
 * successful login on purpose (otherwise it could be reset by logging in).
 */

const CODE_PREFIX = "mavet:auth:code:"
const COOLDOWN_PREFIX = "mavet:auth:cooldown:"
const DAILY_PREFIX = "mavet:auth:daily:"

export const CODE_TTL_SECONDS = 180
const COOLDOWN_SECONDS = 60
const DAILY_TTL_SECONDS = 86_400

export const MAX_ATTEMPTS = 5
const DAILY_CODE_LIMIT = 20

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isPlausibleEmail(email: string): boolean {
  return typeof email === "string" && email.length <= 254 && EMAIL_PATTERN.test(email)
}

export function isValidCodeFormat(code: unknown): code is string {
  return typeof code === "string" && /^\d{6}$/.test(code)
}

export interface VerificationData {
  code: string
  attempts: number
  createdAt: string
}

export type CreateCodeResult =
  | { ok: true; code: string }
  | { ok: false; reason: "cooldown" | "daily_limit"; waitSeconds?: number }

/** Generates and stores a new code; enforces the per-address cooldown and daily cap. */
export async function createVerificationCode(rawEmail: string): Promise<CreateCodeResult> {
  const redis = requireRedis()
  const email = normalizeEmail(rawEmail)

  const dailyCount = (await redis.get<number>(`${DAILY_PREFIX}${email}`)) ?? 0
  if (dailyCount >= DAILY_CODE_LIMIT) return { ok: false, reason: "daily_limit" }

  // SET NX: atomic — only the first request within the window gets through.
  const cooldownSet = await redis.set(`${COOLDOWN_PREFIX}${email}`, "1", { ex: COOLDOWN_SECONDS, nx: true })
  if (!cooldownSet) {
    const ttl = await redis.ttl(`${COOLDOWN_PREFIX}${email}`)
    return { ok: false, reason: "cooldown", waitSeconds: ttl > 0 ? ttl : COOLDOWN_SECONDS }
  }

  const code = randomInt(100_000, 1_000_000).toString()
  const data: VerificationData = { code, attempts: 0, createdAt: new Date().toISOString() }
  await redis.set(`${CODE_PREFIX}${email}`, data, { ex: CODE_TTL_SECONDS })

  if (dailyCount === 0) await redis.set(`${DAILY_PREFIX}${email}`, 1, { ex: DAILY_TTL_SECONDS })
  else await redis.incr(`${DAILY_PREFIX}${email}`)

  return { ok: true, code }
}

export async function getVerificationData(rawEmail: string): Promise<VerificationData | null> {
  return requireRedis().get<VerificationData>(`${CODE_PREFIX}${normalizeEmail(rawEmail)}`)
}

/** Removes the code and the cooldown (after success or lockout). The daily counter stays. */
export async function deleteVerificationCode(rawEmail: string): Promise<void> {
  const redis = requireRedis()
  const email = normalizeEmail(rawEmail)
  await Promise.all([redis.del(`${CODE_PREFIX}${email}`), redis.del(`${COOLDOWN_PREFIX}${email}`)])
}

export async function incrementAttempts(rawEmail: string, current: VerificationData): Promise<number> {
  const attempts = current.attempts + 1
  await requireRedis().set(`${CODE_PREFIX}${normalizeEmail(rawEmail)}`, { ...current, attempts }, { keepTtl: true })
  return attempts
}

export function hasExceededMaxAttempts(data: VerificationData): boolean {
  return data.attempts >= MAX_ATTEMPTS
}

/** Constant-time comparison of two 6-digit codes. */
export function secureCodeCompare(input: string, stored: string): boolean {
  const a = Buffer.from(input.padEnd(6, "0").slice(0, 6))
  const b = Buffer.from(stored.padEnd(6, "0").slice(0, 6))
  return timingSafeEqual(a, b)
}
