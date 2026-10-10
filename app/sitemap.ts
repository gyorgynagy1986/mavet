import type { MetadataRoute } from "next";
import { POSTS_PATH } from "@/lib/posts";
import { listPublishedSlugs } from "@/lib/server/posts";

const routes = [
  "",
  "/a-tarsasagrol",
  "/tagsag",
  "/munkacsoportok",
  "/aktualitasok",
  "/szakmai-anyagok",
  "/kapcsolat",
  "/adatkezeles",
  "/impresszum",
  "/suti-tajekoztato",
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
  try {
    const posts = await listPublishedSlugs();
    pages.push(...posts.map((post) => ({ url: `${base}${POSTS_PATH}/${post.slug}`, lastModified: post.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })));
  } catch (error) {
    console.error("[sitemap] posts could not be loaded:", error);
  }
  return pages;
}
