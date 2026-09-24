/**
 * De teksten van een dienst of project in de gevraagde taal.
 *
 * Staat los van lib/services.ts en lib/projects.ts, omdat die de database
 * openen en dus alleen op de server mogen draaien. De projectkaart in het
 * portfolio is een browsercomponent en heeft deze functies wél nodig.
 *
 * De regel is overal hetzelfde: is de Engelse tekst leeg, dan wordt de
 * Nederlandse getoond. Zo staat er nooit een gat op de Engelse site.
 */
import { pickText, type Locale } from "./locale";
import type { Project, Service } from "./types";

export function serviceText(
  service: Service,
  locale: Locale,
): { name: string; description: string; priceLabel: string } {
  return {
    name: pickText(locale, service.name, service.nameEn),
    description: pickText(locale, service.description, service.descriptionEn),
    priceLabel: pickText(locale, service.priceLabel, service.priceLabelEn),
  };
}

export function projectText(
  project: Project,
  locale: Locale,
): {
  title: string;
  location: string;
  summary: string;
  body: string;
  coverAlt: string;
} {
  return {
    title: pickText(locale, project.title, project.titleEn),
    location: pickText(locale, project.location, project.locationEn),
    summary: pickText(locale, project.summary, project.summaryEn),
    body: pickText(locale, project.body, project.bodyEn),
    coverAlt: pickText(locale, project.coverAlt, project.coverAltEn),
  };
}
