import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import localFont from "next/font/local";
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

/**
 * Címbetű: a kézikönyv Palatino Linotype-ot ír elő, ami nem szolgálható ki
 * webről. Helyette a TeX Gyre Pagella (a Palatino ingyenes, GUST-licencű
 * klónja) van beágyazva, így a címsorok minden eszközön egyformák. A
 * `globals.css` `--font-display` verme ezt használja, Palatino tartalékkal.
 */
const display = localFont({
  src: [
    { path: "./fonts/pagella/pagella-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/pagella/pagella-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/pagella/pagella-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/pagella/pagella-bolditalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-pagella",
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
    <html lang="hu" className={cn(sans.variable, display.variable, "h-full antialiased")}>
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
