import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { runApplicationReminders } from "@/lib/server/application-reminders"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Daily job (vercel.json): reminders for unfinished applications.
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel adds it automatically).
 */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get("authorization") ?? ""
  if (!secret) {
    console.error("[cron] CRON_SECRET missing — refusing to run")
    return false
  }
  const expected = Buffer.from(`Bearer ${secret}`)
  const given = Buffer.from(header)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const result = await runApplicationReminders()
  return NextResponse.json({ ok: result.errors.length === 0, ...result })
}
