import { Redis } from "@upstash/redis"

declare global {
  var __upstash_redis__: Redis | null | undefined
}

/**
 * Shared Upstash Redis (REST) client. Returns `null` when the credentials are
 * missing, so callers can decide between failing open (rate limits) and failing
 * closed (login codes, which cannot work without a store).
 */
export function getRedis(): Redis | null {
  if (global.__upstash_redis__ !== undefined) return global.__upstash_redis__
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  global.__upstash_redis__ = url && token ? new Redis({ url, token }) : null
  return global.__upstash_redis__
}

/** Like `getRedis`, but throws a clear error when Redis is not configured. */
export function requireRedis(): Redis {
  const redis = getRedis()
  if (!redis) {
    throw new Error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing — Redis is required for this feature")
  }
  return redis
}
