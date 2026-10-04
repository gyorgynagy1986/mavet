import type { DefaultSession } from "next-auth"
import type { UserRole } from "@/lib/models/user"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
  }
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: UserRole
    /** When the role was last re-read from the database (epoch ms). */
    roleCheckedAt?: number
  }
}
