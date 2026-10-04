import type { Metadata } from "next"

export const metadata: Metadata = { title: "Bejelentkezés", description: "Bejelentkezés a MAVET tagi felületére." }

export default function MemberLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
