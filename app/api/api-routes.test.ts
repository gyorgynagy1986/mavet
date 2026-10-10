import { beforeEach, describe, expect, it, vi } from "vitest"

const { dbConnect, create, findOne, contactCreate, contactUpdateOne, sendMail, rateLimit, sendContinueLink } = vi.hoisted(() => ({
  dbConnect: vi.fn<() => Promise<undefined>>(async () => undefined),
  create: vi.fn<(doc: Record<string, unknown>) => Promise<{ _id: string; email: string; createdAt: Date }>>(),
  findOne: vi.fn(),
  contactCreate: vi.fn<(doc: Record<string, unknown>) => Promise<{ _id: string; createdAt: Date }>>(),
  contactUpdateOne: vi.fn(() => ({ catch: () => undefined })),
  sendMail: vi.fn<(message: { to: string; subject: string; text: string }) => Promise<void>>(async () => undefined),
  rateLimit: vi.fn<() => Promise<{ allowed: boolean; retryAfterSeconds?: number }>>(async () => ({ allowed: true })),
  sendContinueLink: vi.fn<(app: { email: string }, kind: string, by: string) => Promise<{ status: "sent" }>>(async () => ({ status: "sent" })),
}))

vi.mock("@/lib/db-connect", () => ({ default: dbConnect, markPoolPoisoned: () => false }))
vi.mock("@/lib/models/membership-application", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/models/membership-application")>()
  return { ...original, MembershipApplicationModel: { create, findOne } }
})
vi.mock("@/lib/models/contact-message", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/models/contact-message")>()
  return { ...original, ContactMessageModel: { create: contactCreate, updateOne: contactUpdateOne } }
})
vi.mock("@/lib/server/mail", () => ({ sendMail, getNotificationRecipient: () => "iroda@example.hu" }))
vi.mock("@/lib/server/rate-limit", () => ({ rateLimit, getClientIp: () => "127.0.0.1", hashIp: () => "hash" }))
vi.mock("@/lib/server/applications", () => ({ sendContinueLink, ensureApplicationIndexes: async () => undefined }))

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

function leanQuery<T>(value: T) {
  return { select: () => ({ lean: async () => value }) }
}

describe("POST /api/preliminary-membership-applications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    create.mockResolvedValue({ _id: "abc", email: "teszt@example.hu", createdAt: new Date() })
  })

  it("saves a valid application as elozetes and sends the continuation link", async () => {
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({ ok: true, id: "abc" })
    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0][0]).toMatchObject({ email: "teszt@example.hu", status: "elozetes", consent: { accepted: true, privacyNoticeVersion: "csok-2026-09-21" } })
    expect(sendContinueLink).toHaveBeenCalledTimes(1)
    expect(sendContinueLink.mock.calls[0]).toEqual([expect.objectContaining({ email: "teszt@example.hu" }), "folytatas", "system"])
    expect(sendMail).not.toHaveBeenCalled()
  })

  it("rejects an incomplete application without touching the database", async () => {
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", { category: "tiszteletbeli", lastName: "", email: "hibas", consent: false }))
    expect(response.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it("acknowledges a duplicate open application and re-sends the link to an unfinished one", async () => {
    create.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: 11000 }))
    findOne.mockReturnValueOnce(leanQuery({ _id: "abc", email: "teszt@example.hu", title: "Dr.", lastName: "Teszt", firstName: "Elek", category: "rendes", status: "megerositett" }))
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ ok: true, duplicate: true })
    expect(sendContinueLink).toHaveBeenCalledTimes(1)
    expect(sendContinueLink.mock.calls[0][1]).toBe("folytatas")
  })

  it("does not re-send a link when the open application is already under review", async () => {
    create.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: 11000 }))
    findOne.mockReturnValueOnce(leanQuery({ _id: "abc", email: "teszt@example.hu", status: "bekuldott" }))
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(200)
    expect(sendContinueLink).not.toHaveBeenCalled()
  })

  it("does not re-send the link for a duplicate when the daily re-send limit is hit", async () => {
    create.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: 11000 }))
    rateLimit.mockResolvedValueOnce({ allowed: true }).mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 3600 })
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", validApplication))
    expect(response.status).toBe(200)
    expect(sendContinueLink).not.toHaveBeenCalled()
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

const validContact = { name: "Teszt Elek", email: "Teszt@Example.hu", message: "Ez egy tesztüzenet a Társaságnak.", consent: true, privacyNoticeVersion: "csok-2026-09-22" }

describe("POST /api/contact-messages", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    contactCreate.mockResolvedValue({ _id: "msg1", createdAt: new Date() })
  })

  it("saves a valid message and notifies the MAVET contact with reply-to set to the sender", async () => {
    const response = await contact(request("/api/contact-messages", validContact))
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({ ok: true, id: "msg1" })
    expect(contactCreate).toHaveBeenCalledTimes(1)
    expect(contactCreate.mock.calls[0][0]).toMatchObject({ name: "Teszt Elek", email: "teszt@example.hu", message: "Ez egy tesztüzenet a Társaságnak.", consent: { accepted: true, privacyNoticeVersion: "csok-2026-09-22" } })
    expect(sendMail).toHaveBeenCalledTimes(1)
    expect(sendMail.mock.calls[0][0]).toMatchObject({ to: "iroda@example.hu", replyTo: "teszt@example.hu" })
    expect(sendMail.mock.calls[0][0].text).toContain("Ez egy tesztüzenet a Társaságnak.")
    expect(contactUpdateOne).toHaveBeenCalledWith({ _id: "msg1" }, { $set: { "notifications.adminEmailSentAt": expect.any(Date) } })
  })

  it("still returns 201 when the notification e-mail fails, and records the error", async () => {
    sendMail.mockRejectedValueOnce(new Error("sendgrid down"))
    const response = await contact(request("/api/contact-messages", validContact))
    expect(response.status).toBe(201)
    expect(contactUpdateOne).toHaveBeenCalledWith({ _id: "msg1" }, { $set: { "notifications.lastError": "admin: sendgrid down" } })
  })

  it("rejects an incomplete contact message without touching the database", async () => {
    const response = await contact(request("/api/contact-messages", { name: "", email: "", message: "", consent: false }))
    expect(response.status).toBe(400)
    expect(contactCreate).not.toHaveBeenCalled()
    expect(sendMail).not.toHaveBeenCalled()
  })

  it("rejects a message that is too long", async () => {
    const response = await contact(request("/api/contact-messages", { ...validContact, message: "x".repeat(5001) }))
    expect(response.status).toBe(400)
    expect(contactCreate).not.toHaveBeenCalled()
  })

  it("returns 429 with Retry-After when rate limited", async () => {
    rateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 42 })
    const response = await contact(request("/api/contact-messages", validContact))
    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toBe("42")
    expect(contactCreate).not.toHaveBeenCalled()
  })

  it("returns 503 when the database is unavailable", async () => {
    dbConnect.mockRejectedValueOnce(new Error("down"))
    const response = await contact(request("/api/contact-messages", validContact))
    expect(response.status).toBe(503)
  })

  it("returns 500 when saving fails", async () => {
    contactCreate.mockRejectedValueOnce(new Error("write failed"))
    const response = await contact(request("/api/contact-messages", validContact))
    expect(response.status).toBe(500)
    expect(sendMail).not.toHaveBeenCalled()
  })
})
