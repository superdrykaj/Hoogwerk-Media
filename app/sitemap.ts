import type { MetadataRoute } from "next";

import { href } from "@/lib/locale";
import { listProjects } from "@/lib/projects";
import { siteStatus } from "@/lib/site-status";
import { siteOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Dichte site: geen sitemap. Zie lib/site-status.ts.
  if (siteStatus() !== "live") return [];

  const base = await siteOrigin();
  const projects = listProjects({ onlyPublished: true });

  /** Elke pagina staat er in beide talen in, met een verwijzing naar elkaar. */
  function beideTalen(
    path: string,
    changeFrequency: "weekly" | "monthly",
    priority: number,
    lastModified?: Date,
  ): MetadataRoute.Sitemap {
    const languages = { nl: `${base}${path}`, en: `${base}${href(path, "en")}` };
    return [
      {
        url: languages.nl,
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages },
      },
      {
        url: languages.en,
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages },
      },
    ];
  }

  return [
    ...beideTalen("/", "weekly", 1),
    ...beideTalen("/portfolio", "weekly", 0.8),
    ...beideTalen("/contact", "monthly", 0.6),
    ...projects.flatMap((project) =>
      beideTalen(
        `/portfolio/${project.slug}`,
        "monthly",
        0.7,
        new Date(project.createdUtc),
      ),
    ),
  ];
}
