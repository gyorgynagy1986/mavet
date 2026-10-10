import { describe, expect, it, vi } from "vitest"
import { isRetryableMailError, MailSendError, mailErrorMessage, withMailRetry } from "./mail-retry"

const noSleep = () => Promise.resolve()
const httpError = (code: number, messages: string[] = []) =>
  Object.assign(new Error(`Request failed with status ${code}`), { code, response: { statusCode: code, body: { errors: messages.map((message) => ({ message })) } } })

describe("mail retry policy", () => {
  it("classifies errors", () => {
    expect(isRetryableMailError(httpError(429))).toBe(true)
    expect(isRetryableMailError(httpError(500))).toBe(true)
    expect(isRetryableMailError(httpError(503))).toBe(true)
    expect(isRetryableMailError(new Error("ECONNRESET"))).toBe(true)
    expect(isRetryableMailError(httpError(400))).toBe(false)
    expect(isRetryableMailError(httpError(401))).toBe(false)
    expect(isRetryableMailError(httpError(403))).toBe(false)
  })

  it("succeeds first time without waiting", async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(noSleep)
    const attempt = vi.fn(() => Promise.resolve())
    await expect(withMailRetry(attempt, { sleep })).resolves.toEqual({ attempts: 1 })
    expect(sleep).not.toHaveBeenCalled()
  })

  it("retries transient errors with the configured delays", async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(noSleep)
    const attempt = vi.fn().mockRejectedValueOnce(httpError(503)).mockRejectedValueOnce(httpError(429)).mockResolvedValueOnce(undefined)
    await expect(withMailRetry(attempt, { sleep })).resolves.toEqual({ attempts: 3 })
    expect(attempt).toHaveBeenCalledTimes(3)
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([1000, 3000])
  })

  it("gives up after the last attempt and reports the count", async () => {
    const attempt = vi.fn().mockRejectedValue(httpError(500, ["upstream down"]))
    const error = await withMailRetry(attempt, { sleep: noSleep }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(MailSendError)
    const e = error as MailSendError
    expect(e.attempts).toBe(3)
    expect(e.retryable).toBe(true)
    expect(e.statusCode).toBe(500)
    expect(e.message).toContain("HTTP 500")
    expect(e.message).toContain("upstream down")
    expect(attempt).toHaveBeenCalledTimes(3)
  })

  it("fails at once on a permanent 4xx", async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(noSleep)
    const attempt = vi.fn().mockRejectedValue(httpError(400, ["The from address does not match a verified Sender Identity"]))
    const error = await withMailRetry(attempt, { sleep }).catch((e: unknown) => e as MailSendError)
    expect(error).toBeInstanceOf(MailSendError)
    expect((error as MailSendError).attempts).toBe(1)
    expect((error as MailSendError).retryable).toBe(false)
    expect(sleep).not.toHaveBeenCalled()
  })

  it("formats network errors without a status", () => {
    expect(mailErrorMessage(new Error("getaddrinfo ENOTFOUND api.sendgrid.com"))).toBe("getaddrinfo ENOTFOUND api.sendgrid.com")
  })
})
