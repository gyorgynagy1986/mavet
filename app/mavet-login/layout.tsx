import type { Metadata } from "next"

/**
 * Hidden admin login. Not linked from the site, excluded from the sitemap and
 * marked noindex here as well (belt and braces: robots.txt also disallows it).
 * Server component, own frame: no public header, banner or footer.
 */
export const metadata: Metadata = {
  title: "Belépés",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen flex-1 flex-col">{children}</main>
}
