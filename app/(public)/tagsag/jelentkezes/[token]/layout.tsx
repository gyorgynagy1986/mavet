import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tagsági jelentkezés folytatása",
  robots: { index: false, follow: false },
}

export default function ContinueApplicationLayout({ children }: { children: React.ReactNode }) {
  return children
}
