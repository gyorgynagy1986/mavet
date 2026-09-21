import type { Metadata } from "next"
export const metadata: Metadata = { title: "Tagság", description: "Tájékoztatás a MAVET tagsági lehetőségeiről." }
export default function MembershipLayout({ children }: LayoutProps<"/tagsag">) { return children }
