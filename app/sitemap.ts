import type { MetadataRoute } from "next";

import { site } from "@/content/site";
import { href } from "@/lib/locale";
import { listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
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
