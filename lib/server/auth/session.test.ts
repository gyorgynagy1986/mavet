import { beforeEach, describe, expect, it, vi } from "vitest"

const getServerSession = vi.fn()
vi.mock("next-auth", () => ({ getServerSession: (...args: unknown[]) => getServerSession(...args) }))
vi.mock("@/lib/server/auth/auth-options", () => ({ authOptions: {} }))

import type { Session } from "next-auth"
import type { UserRole } from "@/lib/models/user"
import { isAdmin, isSuperAdmin, requireAdmin, requireSuperAdmin } from "./session"

function session(role: UserRole): Session {
  return { user: { id: "1", role, email: "a@b.hu", name: "A" }, expires: "" }
}

describe("admin session guards", () => {
  beforeEach(() => getServerSession.mockReset())

  it("classifies roles", () => {
    expect(isAdmin(session("ADMIN"))).toBe(true)
    expect(isAdmin(session("SUPERADMIN"))).toBe(true)
    expect(isAdmin(session("USER"))).toBe(false)
    expect(isAdmin(null)).toBe(false)
    expect(isSuperAdmin(session("ADMIN"))).toBe(false)
    expect(isSuperAdmin(session("SUPERADMIN"))).toBe(true)
  })

  it("requireAdmin: 401 without session, 403 for a member, passes an admin", async () => {
    getServerSession.mockResolvedValueOnce(null)
    expect((await requireAdmin()).error?.status).toBe(401)

    getServerSession.mockResolvedValueOnce(session("USER"))
    expect((await requireAdmin()).error?.status).toBe(403)

    getServerSession.mockResolvedValueOnce(session("ADMIN"))
    const ok = await requireAdmin()
    expect(ok.error).toBeUndefined()
    expect(ok.session?.user.role).toBe("ADMIN")
  })

  it("requireSuperAdmin: 403 for a plain admin, passes a superadmin", async () => {
    getServerSession.mockResolvedValueOnce(session("ADMIN"))
    expect((await requireSuperAdmin()).error?.status).toBe(403)

    getServerSession.mockResolvedValueOnce(session("SUPERADMIN"))
    expect((await requireSuperAdmin()).error).toBeUndefined()
  })

  it("fails closed when the session lookup throws", async () => {
    getServerSession.mockRejectedValueOnce(new Error("boom"))
    expect((await requireAdmin()).error?.status).toBe(401)
  })
})
