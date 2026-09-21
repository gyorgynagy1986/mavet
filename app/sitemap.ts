import type { MetadataRoute } from "next"
const routes = ["", "/a-tarsasagrol", "/tagsag", "/munkacsoportok", "/aktualitasok", "/szakmai-anyagok", "/kapcsolat", "/adatkezeles", "/impresszum", "/suti-tajekoztato"]
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "monthly", priority: route === "" ? 1 : 0.7 })) }
