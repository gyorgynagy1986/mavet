import type { Metadata } from "next"

/** Design variant of the home page; kept out of search indexes while it is under review. */
export const metadata: Metadata = {
  title: "Főoldal – 2. változat",
  description: "A MAVET főoldalának második látványterve: fotós hero és képes pillérkártyák.",
  robots: { index: false, follow: false },
}

export default function HomeV2Layout({ children }: LayoutProps<"/fooldalv2">) {
  return children
}
