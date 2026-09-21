import { describe, expect, it } from "vitest"
import { POST as preliminaryMembership } from "@/app/api/preliminary-membership-applications/route"
import { POST as contact } from "@/app/api/contact-messages/route"

function request(path: string, body: unknown) {
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("CSÖK API contracts", () => {
  it("accepts a valid preliminary membership application", async () => {
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", { category: "rendes", title: "Dr.", lastName: "Teszt", firstName: "Elek", email: "teszt@example.hu", consent: true }))
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({ ok: true, mock: true })
  })

  it("rejects an incomplete preliminary membership application", async () => {
    const response = await preliminaryMembership(request("/api/preliminary-membership-applications", { category: "tiszteletbeli", lastName: "", email: "hibas", consent: false }))
    expect(response.status).toBe(400)
  })

  it("accepts a valid contact message", async () => {
    const response = await contact(request("/api/contact-messages", { name: "Teszt Elek", email: "teszt@example.hu", message: "Ez egy tesztüzenet.", consent: true }))
    expect(response.status).toBe(201)
  })

  it("rejects an incomplete contact message", async () => {
    const response = await contact(request("/api/contact-messages", { name: "", email: "", message: "", consent: false }))
    expect(response.status).toBe(400)
  })
})
