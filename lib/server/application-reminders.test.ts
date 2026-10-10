import { describe, expect, it } from "vitest"
import { isReminderDue, MAX_REMINDERS } from "./application-reminders"

const day = 24 * 60 * 60 * 1000
const now = new Date("2026-10-30T07:00:00Z")
const base = { status: "megerositett" as const, createdAt: new Date(now.getTime() - 40 * day), reminders: [] as { sentAt: Date; kind: "auto" | "manual" }[] }

describe("application reminder schedule", () => {
  it("first reminder 7 days after the last activity", () => {
    expect(isReminderDue({ ...base, lastActivityAt: new Date(now.getTime() - 6 * day) }, now)).toBe(false)
    expect(isReminderDue({ ...base, lastActivityAt: new Date(now.getTime() - 7 * day) }, now)).toBe(true)
  })

  it("second reminder 14 days after the first, manual ones count too", () => {
    const first = [{ sentAt: new Date(now.getTime() - 13 * day), kind: "manual" as const }]
    expect(isReminderDue({ ...base, lastActivityAt: base.createdAt, reminders: first }, now)).toBe(false)
    const firstOlder = [{ sentAt: new Date(now.getTime() - 14 * day), kind: "auto" as const }]
    expect(isReminderDue({ ...base, lastActivityAt: base.createdAt, reminders: firstOlder }, now)).toBe(true)
  })

  it("stops after the maximum and ignores finished applications", () => {
    const maxed = Array.from({ length: MAX_REMINDERS }, (_, i) => ({ sentAt: new Date(now.getTime() - (30 - i) * day), kind: "auto" as const }))
    expect(isReminderDue({ ...base, lastActivityAt: base.createdAt, reminders: maxed }, now)).toBe(false)
    expect(isReminderDue({ ...base, status: "bekuldott", lastActivityAt: base.createdAt }, now)).toBe(false)
  })
})
