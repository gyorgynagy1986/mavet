import type { Metadata } from "next"

export const metadata: Metadata = { title: "Tagi névjegyzék", robots: { index: false, follow: false } }

export default function DirectoryLayout({ children }: LayoutProps<"/tagok">) {
  return children
}
