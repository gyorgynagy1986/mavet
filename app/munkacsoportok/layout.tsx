import type { Metadata } from "next"
export const metadata: Metadata = { title: "Munkacsoportok", description: "A MAVET szakmai munkacsoportjainak témái." }
export default function WorkgroupsLayout({ children }: LayoutProps<"/munkacsoportok">) { return children }
