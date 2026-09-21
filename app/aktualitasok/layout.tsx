import type { Metadata } from "next"
export const metadata: Metadata = { title: "Aktualitások", description: "A MAVET hírei és eseményei." }
export default function NewsLayout({ children }: LayoutProps<"/aktualitasok">) { return children }
