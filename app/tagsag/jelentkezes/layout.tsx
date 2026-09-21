import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Előzetes tagsági jelentkezés",
  description: "Előzetes tagsági jelentkezés a MAVET-hez.",
}

export default function PreliminaryMembershipLayout({ children }: LayoutProps<"/tagsag/jelentkezes">) {
  return children
}
