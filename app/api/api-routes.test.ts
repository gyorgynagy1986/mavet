import { beforeEach, describe, expect, it, vi } from "vitest"

const { dbConnect, create, updateOne, sendMail, rateLimit } = vi.hoisted(() => ({
  dbConnect: vi.fn<() => Promise<undefined>>(async () => undefined),
  create: vi.fn<(doc: Record<string, unknown>) => Promise<{ _id: string; email: string; createdAt: Date }>>(),
  updateOne: vi.fn(() => ({ catch: () => undefined })),
  sendMail: vi.fn<(message: { to: string; subject: string; text: string }) => Promise<void>>(async () => undefined),
  rateLimit: vi.fn<() => Promise<{ allowed: boolean; retryAfterSeconds?: number }>>(async () => ({ allowed: true })),
}))

vi.mock("@/lib/db-connect", () => ({ default: dbConnect, markPoolPoisoned: () => false }))
vi.mock("@/lib/models/membership-application", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/models/membership-application")>()
  return { ...original, MembershipApplicationModel: { create, updateOne } }
})
vi.mock("@/lib/server/mail", () => ({ sendMail, getNotificationRecipient: () => "iroda@example.hu" }))
vi.mock("@/lib/server/rate-limit", () => ({ rateLimit, getClientIp: () => "127.0.0.1", hashIp: () => "hash" }))

import { POST as preliminaryMembership } from "@/app/api/preliminary-membership-applications/route"
import { POST as contact } from "@/app/api/contact-messages/route"

function request(path: string, body: unknown) {
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validApplication = { category: "rendes", title: "Dr.", lastName: "Teszt", firstName: "Elek", email: "Teszt@Example.hu", consent: true, privacyNoticeVersion: "csok-2026-09-21" }

describe("POST /api/preliminary-membership-applications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    create.mockResolvedValue({ _id: "abc", email: "teszt@example.hu", createdAt: new Date() })
  })

  it("saves a valid application and sends both e-mails", async () => {
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({ ok: true, id: "abc" })
    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0][0]).toMatchObject({ email: "teszt@example.hu", status: "tagjelolt", consent: { accepted: true, privacyNoticeVersion: "csok-2026-09-21" } })
    expect(sendMail).toHaveBeenCalledTimes(2)
    expect(sendMail.mock.calls[0][0]).toMatchObject({ to: "teszt@example.hu" })
    expect(sendMail.mock.calls[0][0].text).toContain("Tisztelt Jelentkező!")
    expect(sendMail.mock.calls[1][0]).toMatchObject({ to: "iroda@example.hu" })
  })

  it("rejects an incomplete application without touching the database", async () => {
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", { category: "tiszteletbeli", lastName: "", email: "hibas", consent: false }))
    expect(response.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it("acknowledges a duplicate e-mail, re-sends only the applicant confirmation", async () => {
    create.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: 11000 }))
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ ok: true, duplicate: true })
    expect(sendMail).toHaveBeenCalledTimes(1)
    expect(sendMail.mock.calls[0][0]).toMatchObject({ to: "teszt@example.hu" })
  })

  it("does not re-send the confirmation for a duplicate when the daily re-send limit is hit", async () => {
    create.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: 11000 }))
    rateLimit.mockResolvedValueOnce({ allowed: true }).mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 3600 })
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(200)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it("returns 429 with Retry-After when rate limited", async () => {
    rateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 42 })
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toBe("42")
  })

  it("returns 503 when the database is unavailable", async () => {
    dbConnect.mockRejectedValueOnce(new Error("down"))
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(503)
  })
})

describe("POST /api/contact-messages", () => {
  it("accepts a valid contact message", async () => {
    const response = await contact(request("/api/contact-messages", { name: "Teszt Elek", email: "teszt@example.hu", message: "Ez egy tesztüzenet.", consent: true }))
    expect(response.status).toBe(201)
  })

  it("rejects an incomplete contact message", async () => {
    const response = await contact(request("/api/contact-messages", { name: "", email: "", message: "", consent: false }))
    expect(response.status).toBe(400)
  })
})
