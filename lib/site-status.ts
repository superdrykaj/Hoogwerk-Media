import "server-only";

import { notFound } from "next/navigation";

import { isSignedIn } from "./auth";

/**
 * ============================================================================
 *  STAAT VAN DE WEBSITE
 * ============================================================================
 *  De site staat standaard dicht. Bezoekers zien dan alleen de pagina
 *  "binnenkort online"; de rest van de site bestaat voor hen niet en
 *  zoekmachines wordt gevraagd niets te bewaren.
 *
 *  Ben je ingelogd via /admin, dan zie je de volledige site gewoon. Zo kun je
 *  alles rustig nakijken terwijl de deur voor de buitenwereld dicht blijft.
 *
 *  Opengaan doe je met één omgevingsvariabele:
 *
 *      SITE_STATUS="live"
 *
 *  In fly.toml staat die waarde onder [env]. Na `fly deploy` is de site open.
 * ============================================================================
 */

export type SiteStatus = "soon" | "live";

/** Wat er in de omgeving staat ingesteld. Alles behalve "live" telt als dicht. */
export function siteStatus(): SiteStatus {
  return process.env.SITE_STATUS === "live" ? "live" : "soon";
}

/**
 * Staat de volledige site open voor wie hem nu opvraagt?
 *
 * Let op: dit leest het sessiecookie en maakt de pagina dus per bezoeker
 * verschillend. Alle publieke pagina's staan daarom al op force-dynamic.
 */
export async function siteIsOpen(): Promise<boolean> {
  if (siteStatus() === "live") return true;
  return isSignedIn();
}

/**
 * True als de beheerder meekijkt terwijl de site voor bezoekers dicht is.
 * De site toont dan een balk, zodat je niet vergeet dat niemand anders dit ziet.
 */
export async function isPreviewing(): Promise<boolean> {
  return siteStatus() === "soon" && (await isSignedIn());
}

/**
 * Tweede slot op de deur, voor het geval proxy.ts een pad niet afvangt.
 *
 * Bewust `notFound()` en geen omleiding: een omleiding vanuit een pagina wordt
 * in deze versie van Next.js als meta-tag meegestuurd, samen met de volledige
 * pagina-inhoud. De bezoeker ziet dan de voorpagina, maar heeft alles al
 * binnen. Een 404 stuurt niets mee.
 *
 * Roep dit aan boven in elke publieke pagina behalve de voorpagina zelf.
 */
export async function requireOpenSite(): Promise<void> {
  if (!(await siteIsOpen())) notFound();
}
