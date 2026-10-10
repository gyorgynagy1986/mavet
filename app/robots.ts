import type { MetadataRoute } from "next";
import { ADMIN_HOME_PATH, LOGIN_PATH, MEMBER_ACCOUNT_PATH } from "@/lib/auth-paths";

/** Never indexable, whatever the environment: admin area, hidden login, API. */
const privatePaths = [`${ADMIN_HOME_PATH}/`, ADMIN_HOME_PATH, LOGIN_PATH, `${MEMBER_ACCOUNT_PATH}/`, MEMBER_ACCOUNT_PATH, "/tagsag/jelentkezes/", "/jelszo-visszaallitas/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.ALLOW_INDEXING === "true";
  return indexable
    ? {
        rules: { userAgent: "*", allow: "/", disallow: privatePaths },
        sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
