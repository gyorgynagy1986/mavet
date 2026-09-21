import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { DevelopmentBanner } from "@/components/development-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Arculati szövegbetű: Source Sans 3 (törzsszöveg, navigáció, gombok, H4–H6).
 * A címsorok (H1–H3) Palatino betűcsaládja rendszerbetű, a `globals.css`
 * `--font-display` vermében van megadva. A latin-ext részhalmaz a magyar
 * ékezetek miatt szükséges.
 */
const sans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MAVET",
    template: "%s | MAVET",
  },
  description:
    "A Magyar Vidékegészségügyi Társaság fejlesztés alatt álló bemutatkozó weboldala.",
};

/**
 * Gyökér-elrendezés, szerveroldali komponens (D-005). Ide kerül később a
 * fejléc, a lábléc és a globális keret. A lapok saját `layout.tsx`-e ezen
 * belül jelenik meg, és soha nem lehet kliensoldali komponens.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hu" className={cn(sans.variable, "h-full antialiased")}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a href="#tartalom" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-2 focus:ring-ring">Ugrás a tartalomra</a>
        <DevelopmentBanner />
        <SiteHeader />
        <main id="tartalom" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
