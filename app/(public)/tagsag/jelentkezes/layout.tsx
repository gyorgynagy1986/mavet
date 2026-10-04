import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tagsági jelentkezés",
  description: "Tagsági jelentkezés a Magyar Vidékegészségügyi Társaságba.",
}

export default function PreliminaryMembershipLayout({ children }: LayoutProps<"/tagsag/jelentkezes">) {
  return children
}
