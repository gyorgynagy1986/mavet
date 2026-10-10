import { PublicShell } from "@/components/public-shell"

/**
 * Layout of the public site (route group, no URL segment). Server component
 * (D-005). The root layout only provides <html>/<body>, fonts and metadata, so
 * the admin area and the login page can use a different frame.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>
}
