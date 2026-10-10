import type { Metadata } from "next"

/** Member account area: never indexed (specification 12.3). */
export const metadata: Metadata = {
  title: "Saját fiók",
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
