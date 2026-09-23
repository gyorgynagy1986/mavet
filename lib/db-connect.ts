// lib/db-connect.ts
// Production-ready MongoDB connection for Vercel Serverless/Fluid + Atlas Flex
//
// ✅ Connection pooling with global cache
// ✅ Race condition protection
// ✅ Optimized timeouts for serverless
// ✅ Health-gated reuse + self-heal
// ✅ Detailed error logging
//
// Lesson learned (2026-08-20 incident on another project): after a Fluid
// instance is frozen and resumed, the pool sockets can be dead while mongoose
// `readyState` stays stuck at 1. Never trust `readyState` alone: if the last
// proven-good operation is older than HEALTH_TTL_MS, ping before reuse, and if
// any pool failure is observed anywhere, mark the pool poisoned so the next
// dbConnect() forces a reconnect.

import mongoose, { type ConnectOptions } from "mongoose"

declare global {
  var __mongoose_conn__: Promise<typeof mongoose> | undefined
  var __listeners_wired__: boolean | undefined
  /** Timestamp (ms epoch) of the last proven-good pool operation. */
  var __db_last_ok__: number | undefined
  /** True once a pool failure was observed → next dbConnect reconnects. */
  var __db_poisoned__: boolean | undefined
  /** Deduplicates concurrent health probes. */
  var __db_health_probe__: Promise<boolean> | undefined
}

/** How long we trust the pool without a ping. */
const HEALTH_TTL_MS = 30_000
/** Upper bound of the ping. Well below waitQueueTimeoutMS so a dead pool fails fast. */
const PING_TIMEOUT_MS = 2_000
/** disconnect() itself can hang on a dead pool; move on after this. */
const DISCONNECT_TIMEOUT_MS = 3_000

const options: ConnectOptions = {
  // Under Fluid compute one instance serves several requests concurrently.
  maxPoolSize: 15,
  minPoolSize: 0,
  // Prune idle sockets before a freeze rather than reuse a dead one afterwards.
  maxIdleTimeMS: 15000,
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
  socketTimeoutMS: 30000,
  // CRITICAL under Fluid: the driver default is 0 = wait forever in the pool queue.
  waitQueueTimeoutMS: 10000,
  bufferCommands: false,
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || ""
  if (!uri) {
    throw new Error("❌ MongoDB URI not found. Set MONGODB_URI (or MONGO_URI) in the environment.")
  }
  return uri
}

// ── Pool failure detection ───────────────────────────────────────────────────

const POOL_FAILURE_NAMES = new Set([
  "MongoWaitQueueTimeoutError",
  "MongoNotConnectedError",
  "MongoPoolClearedError",
  "MongoTopologyClosedError",
  "MongoNetworkError",
  "MongoNetworkTimeoutError",
])

/** True when the error indicates a dead connection/pool (not a business error). */
export function isPoolFailure(e: unknown): boolean {
  if (!e || typeof e !== "object") return false
  const err = e as Error
  if (typeof err.name === "string" && POOL_FAILURE_NAMES.has(err.name)) return true
  const msg = typeof err.message === "string" ? err.message : ""
  return (
    msg.includes("Timed out while checking out a connection") ||
    msg.includes("Client must be connected before running operations")
  )
}

/**
 * Marks the connection dead when the given error is a pool failure.
 * Intentionally does not log (may be called from logging hooks).
 * @returns true when it really was a pool failure
 */
export function markPoolPoisoned(e: unknown): boolean {
  if (!isPoolFailure(e)) return false
  global.__db_poisoned__ = true
  global.__db_last_ok__ = undefined
  return true
}

export function isPoolPoisoned(): boolean {
  return global.__db_poisoned__ === true
}

function markOk(): void {
  global.__db_last_ok__ = Date.now()
  global.__db_poisoned__ = undefined
}

// ── Health probe ─────────────────────────────────────────────────────────────

/**
 * Single ping bounded by PING_TIMEOUT_MS.
 * On a dead pool the command keeps running until waitQueueTimeoutMS and then
 * rejects in the background; the .catch() is mandatory to avoid an unhandled rejection.
 */
async function pingOnce(): Promise<boolean> {
  const db = mongoose.connection.db
  if (!db) return false

  let timer: ReturnType<typeof setTimeout> | undefined
  const command = db.admin().command({ ping: 1 })
  command.catch(() => {})

  try {
    await Promise.race([
      command,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("ping timeout")), PING_TIMEOUT_MS)
      }),
    ])
    return true
  } catch {
    return false
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function checkHealth(): Promise<boolean> {
  if (global.__db_health_probe__) return global.__db_health_probe__

  const probe = pingOnce()
    .then((alive) => {
      if (alive) markOk()
      return alive
    })
    .finally(() => {
      global.__db_health_probe__ = undefined
    })

  global.__db_health_probe__ = probe
  return probe
}

/** Forced teardown. disconnect() itself may hang, so it runs with a time limit. */
async function hardReset(): Promise<void> {
  global.__mongoose_conn__ = undefined
  global.__db_last_ok__ = undefined
  global.__db_poisoned__ = undefined
  global.__db_health_probe__ = undefined

  await Promise.race([
    mongoose.disconnect().catch(() => {}),
    new Promise<void>((resolve) => {
      setTimeout(resolve, DISCONNECT_TIMEOUT_MS)
    }),
  ])
}

function wireListeners(): void {
  if (global.__listeners_wired__) return
  global.__listeners_wired__ = true

  mongoose.connection.on("connected", () => {
    console.log("✅ [db] MongoDB connected")
  })

  mongoose.connection.on("error", (err) => {
    const e = err as Error & { code?: unknown; codeName?: unknown }
    console.error("❌ [db] MongoDB connection error:", {
      message: e.message,
      name: e.name,
      code: e.code,
      codeName: e.codeName,
    })
    if (mongoose.connection.readyState === 0) {
      global.__mongoose_conn__ = undefined
      global.__db_last_ok__ = undefined
    }
  })

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ [db] MongoDB disconnected")
    global.__mongoose_conn__ = undefined
    global.__db_last_ok__ = undefined
  })

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 [db] MongoDB reconnected")
    markOk()
  })

  mongoose.connection.on("close", () => {
    console.log("🔒 [db] MongoDB connection closed")
    global.__mongoose_conn__ = undefined
    global.__db_last_ok__ = undefined
  })
}

function logConnectionError(err: Error): void {
  const mongoErr = err as Error & { code?: unknown; codeName?: unknown }
  const errorInfo: Record<string, unknown> = { message: err.message, name: err.name }
  if (mongoErr.code) errorInfo.code = mongoErr.code
  if (mongoErr.codeName) errorInfo.codeName = mongoErr.codeName

  if (err.name === "MongoServerSelectionError") {
    errorInfo.hint = "Atlas cluster might be paused or network issue"
  } else if (err.name === "MongoNetworkError") {
    errorInfo.hint = "Network connectivity issue"
  } else if (err.name === "MongoTimeoutError") {
    errorInfo.hint = "Operation timed out"
  } else if (mongoErr.code === 8000) {
    errorInfo.hint = "Authentication failed - check credentials"
  }

  console.error("❌ [db] Connection failed:", errorInfo)
}

/**
 * Get the MongoDB connection with caching, health gating and race protection.
 */
export default async function dbConnect(): Promise<typeof mongoose> {
  wireListeners()

  if (mongoose.connection.readyState === 1) {
    if (global.__db_poisoned__) {
      console.warn("☠️ [db] pool marked dead — forced reconnect")
      await hardReset()
    } else if (Date.now() - (global.__db_last_ok__ ?? 0) < HEALTH_TTL_MS) {
      return mongoose
    } else if (await checkHealth()) {
      return mongoose
    } else {
      console.warn("💔 [db] cached connection not responding — reconnecting")
      await hardReset()
    }
  }

  if (global.__mongoose_conn__) {
    return global.__mongoose_conn__
  }

  const uri = getMongoUri()
  console.log("🔌 [db] Creating new connection...")
  const startTime = Date.now()

  global.__mongoose_conn__ = mongoose
    .connect(uri, options)
    .then((m) => {
      console.log(`✅ [db] Connected in ${Date.now() - startTime}ms`)
      markOk()
      return m
    })
    .catch((err: Error) => {
      console.error(`❌ [db] Failed after ${Date.now() - startTime}ms`)
      logConnectionError(err)
      global.__mongoose_conn__ = undefined
      throw err
    })

  return global.__mongoose_conn__
}
