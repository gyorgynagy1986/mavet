import dbConnect from "@/lib/db-connect"
import { CronRunModel } from "@/lib/models/cron-run"
import { MembershipApplicationModel, unfinishedApplicationStatuses, type MembershipApplicationDocument } from "@/lib/models/membership-application"
import { sendContinueLink } from "@/lib/server/applications"

export const REMINDER_JOB = "application-reminders"

/**
 * Reminder schedule for unfinished applications (D-018): the first reminder
 * 7 days after the last activity, the second 14 days after the first, then
 * nothing more. Manual reminders count towards the maximum.
 */
export const REMINDER_DELAYS_DAYS = [7, 14] as const
export const MAX_REMINDERS = REMINDER_DELAYS_DAYS.length

const DAY_MS = 24 * 60 * 60 * 1000

export interface ReminderRunResult {
  processed: number
  sent: number
  errors: string[]
}

export interface ReminderCandidate {
  status: string
  lastActivityAt?: Date | null
  createdAt: Date
  reminders?: readonly { sentAt: Date; kind: "auto" | "manual" }[] | null
}

/** Which applications are due for a reminder at `now`. Exported for tests. */
export function isReminderDue(app: ReminderCandidate, now: Date): boolean {
  if (!(unfinishedApplicationStatuses as readonly string[]).includes(app.status)) return false
  const reminders = app.reminders ?? []
  if (reminders.length >= MAX_REMINDERS) return false
  const delayDays = REMINDER_DELAYS_DAYS[reminders.length]
  const last = reminders.length > 0 ? reminders[reminders.length - 1].sentAt : (app.lastActivityAt ?? app.createdAt)
  return now.getTime() - last.getTime() >= delayDays * DAY_MS
}

export async function runApplicationReminders(now = new Date()): Promise<ReminderRunResult> {
  await dbConnect()
  const run = await CronRunModel.create({ job: REMINDER_JOB, startedAt: now })
  const result: ReminderRunResult = { processed: 0, sent: 0, errors: [] }

  try {
    const candidates = await MembershipApplicationModel.find({
      status: { $in: [...unfinishedApplicationStatuses] },
      [`reminders.${MAX_REMINDERS - 1}`]: { $exists: false },
    })
      .select({ email: 1, title: 1, lastName: 1, firstName: 1, category: 1, status: 1, lastActivityAt: 1, reminders: 1, createdAt: 1 })
      .limit(500)
      .lean<MembershipApplicationDocument[]>()

    for (const app of candidates) {
      result.processed += 1
      if (!isReminderDue(app, now)) continue
      try {
        const mail = await sendContinueLink(app, "emlekezteto", "cron")
        if (mail.status === "sent") {
          await MembershipApplicationModel.updateOne({ _id: app._id }, { $push: { reminders: { sentAt: now, kind: "auto" } } })
          result.sent += 1
        } else if (mail.status === "failed") {
          result.errors.push(`${app.email}: ${mail.error}`)
        }
      } catch (error) {
        result.errors.push(`${app.email}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    await CronRunModel.updateOne(
      { _id: run._id },
      { $set: { finishedAt: new Date(), ok: result.errors.length === 0, processed: result.processed, sent: result.sent, issues: result.errors.slice(0, 50), summary: `${result.sent} emlékeztető, ${result.processed} átnézett jelentkezés` } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    result.errors.push(message)
    await CronRunModel.updateOne({ _id: run._id }, { $set: { finishedAt: new Date(), ok: false, issues: [message], summary: "A futás megszakadt" } }).catch(() => {})
  }
  return result
}
