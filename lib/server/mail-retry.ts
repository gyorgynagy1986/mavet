/**
 * Retry policy for outgoing e-mail (SendGrid). Transient failures (429, 5xx,
 * network errors) are retried with a short exponential back-off; permanent
 * ones (4xx: bad address, forbidden sender, malformed request) fail at once.
 * Kept free of the SendGrid import so it can be unit-tested.
 */

export const MAIL_RETRY_DELAYS_MS: readonly number[] = [1000, 3000]
export const MAIL_MAX_ATTEMPTS = MAIL_RETRY_DELAYS_MS.length + 1

/** Thrown by `sendMail` after the last attempt; carries what the log needs. */
export class MailSendError extends Error {
  readonly attempts: number
  readonly retryable: boolean
  readonly statusCode: number | null

  constructor(message: string, options: { attempts: number; retryable: boolean; statusCode: number | null; cause?: unknown }) {
    super(message, { cause: options.cause })
    this.name = "MailSendError"
    this.attempts = options.attempts
    this.retryable = options.retryable
    this.statusCode = options.statusCode
  }
}

/** HTTP status of a SendGrid client error, when it has one. */
export function mailErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null
  const e = error as { code?: unknown; response?: { statusCode?: unknown } }
  if (typeof e.code === "number") return e.code
  if (typeof e.response?.statusCode === "number") return e.response.statusCode
  return null
}

/** 429 and 5xx are retried; so is anything without an HTTP status (network, timeout). Other 4xx are not. */
export function isRetryableMailError(error: unknown): boolean {
  const status = mailErrorStatus(error)
  if (status === null) return true
  if (status === 429) return true
  return status >= 500
}

/** Readable message: the SendGrid body errors when present, otherwise the error's own message. */
export function mailErrorMessage(error: unknown): string {
  const e = error as { message?: unknown; response?: { body?: { errors?: { message?: unknown }[] } } } | null
  const details = e?.response?.body?.errors?.map((x) => (typeof x.message === "string" ? x.message : null)).filter(Boolean) ?? []
  const base = e && typeof e.message === "string" && e.message ? e.message : String(error)
  const status = mailErrorStatus(error)
  const head = status !== null ? `HTTP ${status}: ${base}` : base
  return details.length ? `${head} (${details.join("; ")})` : head
}

export interface RetryOptions {
  delaysMs?: readonly number[]
  sleep?: (ms: number) => Promise<void>
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Runs `attempt` until it succeeds or the policy gives up. Resolves with the
 * number of attempts made; rejects with a `MailSendError`.
 */
export async function withMailRetry(attempt: () => Promise<void>, options: RetryOptions = {}): Promise<{ attempts: number }> {
  const delays = options.delaysMs ?? MAIL_RETRY_DELAYS_MS
  const sleep = options.sleep ?? defaultSleep
  const maxAttempts = delays.length + 1
  for (let n = 1; ; n++) {
    try {
      await attempt()
      return { attempts: n }
    } catch (error) {
      const retryable = isRetryableMailError(error)
      if (!retryable || n >= maxAttempts) {
        throw new MailSendError(mailErrorMessage(error), { attempts: n, retryable, statusCode: mailErrorStatus(error), cause: error })
      }
      const delay = delays[n - 1]
      options.onRetry?.(error, n, delay)
      await sleep(delay)
    }
  }
}
