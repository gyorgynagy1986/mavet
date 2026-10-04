import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

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

/** Csak világos téma; lásd a `globals.css` `color-scheme` megjegyzését. */
export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#0B2D5B",
};

const siteName = "Magyar Vidékegészségügyi Társaság"
const siteDescription =
  "A Magyar Vidékegészségügyi Társaság (MAVET) a vidéki közösségek egészségéért dolgozó szakemberek nyitott, interdiszciplináris fóruma. Helyszín. Közösség. Szemlélet."

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${siteName} (MAVET)`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    locale: "hu_HU",
    siteName,
    title: `${siteName} (MAVET)`,
    description: siteDescription,
  },
};

/**
 * Gyökér-elrendezés, szerveroldali komponens (D-005): <html>, <body>, betűk és
 * metaadatok. A publikus keret (sáv, fejléc, lábléc) az `app/(public)/layout.tsx`
 * route-csoportban van, így az admin felület és a rejtett belépő oldal saját
 * keretet kaphat ugyanazon a gyökéren belül.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hu" className={cn(sans.variable, display.variable, "h-full antialiased")}>
      <body className="flex min-h-full flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
