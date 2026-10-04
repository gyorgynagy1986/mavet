import { DevelopmentBanner } from "@/components/development-banner"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

/**
 * The public site frame: development banner, header, main landmark and footer.
 * Used by the `(public)` route group layout and by the root `not-found.tsx`
 * (unmatched URLs render under the root layout, outside every route group).
 * The admin area and the hidden login page have their own frame.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#tartalom"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Ugrás a tartalomra
      </a>
      <DevelopmentBanner />
      <SiteHeader />
      <main id="tartalom" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
