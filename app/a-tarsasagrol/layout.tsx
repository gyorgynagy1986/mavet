import type { Metadata } from "next"
export const metadata: Metadata = { title: "A Társaságról", description: "A MAVET küldetése, története és vezetőségének bemutatása." }
export default function AboutLayout({ children }: LayoutProps<"/a-tarsasagrol">) { return children }
