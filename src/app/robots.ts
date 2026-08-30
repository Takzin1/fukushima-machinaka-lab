import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/owner/", "/student/"] }, sitemap: `${publicEnv.siteUrl}/sitemap.xml` };
}
