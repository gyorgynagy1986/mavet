import type { Metadata } from "next"
export const metadata: Metadata = { title: "Szakmai anyagok", description: "A MAVET szakmai anyagai hamarosan." }
export default function ResourcesLayout({ children }: LayoutProps<"/szakmai-anyagok">) { return children }
