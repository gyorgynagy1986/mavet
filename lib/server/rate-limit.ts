import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createHash } from "node:crypto"

declare global {
  var __ratelimits__: Map<string, Ratelimit> | undefined
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds?: number }

/** Client IP from the Vercel / proxy headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

/** Stable, non-reversible identifier for an IP (stored instead of the raw address). */
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex")
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

/**
 * Sliding-window limiter, one instance per `name`, cached across warm invocations.
 * When Upstash is not configured (local dev without keys) the limiter is skipped
 * with a single warning so the form keeps working.
 */
export async function rateLimit(
  name: string,
  identifier: string,
  limit: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`⚠️ [ratelimit] UPSTASH_REDIS_REST_URL/TOKEN missing — "${name}" is NOT rate limited`)
    }
    return { allowed: true }
  }

  global.__ratelimits__ ??= new Map()
  let limiter = global.__ratelimits__.get(name)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `mavet:rl:${name}`,
      analytics: false,
    })
    global.__ratelimits__.set(name, limiter)
  }

  try {
    const result = await limiter.limit(identifier)
    if (result.success) return { allowed: true }
    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    return { allowed: false, retryAfterSeconds }
  } catch (error) {
    // Redis outage must not take the form down: fail open, but log it.
    console.error("❌ [ratelimit] Upstash error, failing open:", error)
    return { allowed: true }
  }
}
