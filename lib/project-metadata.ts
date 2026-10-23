import "server-only";

import type { Metadata } from "next";

import { copy } from "@/content/copy";
import { site } from "@/content/site";

import { OG_LOCALE, type Locale } from "./locale";
import { projectMeta, projectText } from "./localised";
import { pageAlternates } from "./page-meta";
import { getProjectBySlug } from "./projects";

/**
 * Metadata van een projectpagina, voor beide talen.
 *
 * Titel en omschrijving komen uit de velden "Zoekmachines" in de
 * beheeromgeving, en vallen anders terug op de gewone titel en korte
 * beschrijving. Open Graph wordt hier volledig opgegeven: een `openGraph` op
 * paginaniveau vervangt dat van de hoofdlayout in zijn geheel, dus zonder
 * deze regels verdwijnen sitenaam, taal en type bij een gedeelde link.
 */
export async function projectMetadata(
  slug: string,
  locale: Locale,
): Promise<Metadata> {
  const t = copy(locale);
  const project = getProjectBySlug(slug);
  if (!project || !project.published) {
    return { title: t.project.notFound };
  }

  const tekst = projectText(project, locale);
  const meta = projectMeta(project, locale);
  const description =
    meta.description ||
    t.project.metaDescription(tekst.location || t.region.short);
  const afbeeldingen = project.coverUrl
    ? [{ url: project.coverUrl, alt: tekst.coverAlt || t.project.coverAlt(tekst.title) }]
    : undefined;

  return {
    title: meta.title,
    description,
    alternates: pageAlternates(`/portfolio/${project.slug}`, locale),
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: site.name,
      title: `${meta.title} | ${site.name}`,
      description,
      images: afbeeldingen,
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} | ${site.name}`,
      description,
      images: project.coverUrl ? [project.coverUrl] : undefined,
    },
  };
}
