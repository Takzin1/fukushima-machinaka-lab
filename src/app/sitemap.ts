import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/challenges", "/privacy", "/terms"].map((path) => ({ url: `${publicEnv.siteUrl}${path}`, lastModified: new Date(), changeFrequency: path === "/challenges" ? "weekly" : "monthly" }));
}
