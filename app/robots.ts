import type { MetadataRoute } from "next";

import { site } from "@/content/site";

// Per verzoek renderen, niet vooraf: de publieke URL komt uit een
// omgevingsvariabele en is tijdens de build nog niet bekend. Zonder dit
// zouden de canonical-link en het deelbeeld naar localhost blijven wijzen.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
