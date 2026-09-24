import type { MetadataRoute } from "next";

import { site } from "@/content/site";
import { siteStatus } from "@/lib/site-status";

// Per verzoek renderen, niet vooraf: de publieke URL komt uit een
// omgevingsvariabele en is tijdens de build nog niet bekend. Zonder dit
// zouden de canonical-link en het deelbeeld naar localhost blijven wijzen.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");

  // Zolang de site dicht is: niets laten indexeren. Een pagina die eenmaal in
  // Google staat, krijg je er niet in één dag weer uit.
  if (siteStatus() !== "live") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
