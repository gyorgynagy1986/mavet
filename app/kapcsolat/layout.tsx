import type { Metadata } from "next"
export const metadata: Metadata = { title: "Kapcsolat", description: "Kapcsolatfelvétel a Magyar Vidékegészségügyi Társasággal." }
export default function ContactLayout({ children }: LayoutProps<"/kapcsolat">) { return children }
