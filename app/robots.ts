import type { MetadataRoute } from "next";

import { siteStatus } from "@/lib/site-status";
import { siteOrigin } from "@/lib/site-url";

// Per verzoek renderen, niet vooraf: de publieke URL komt uit een
// omgevingsvariabele en is tijdens de build nog niet bekend. Zonder dit
// zouden de canonical-link en het deelbeeld naar localhost blijven wijzen.
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await siteOrigin();

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
