import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.ALLOW_INDEXING === "true";
  return indexable
    ? {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
