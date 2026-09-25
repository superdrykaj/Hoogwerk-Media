import "server-only";

import { notFound } from "next/navigation";

import { isSignedIn } from "./auth";
import { getDb } from "./db";
import { bepaalStatus, type SiteStatus } from "./site-status-rule";

export type { SiteStatus };

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
 *  Open- en dichtzetten doe je met de knop in Beheer → Instellingen. De stand
 *  staat in de database, zodat je er geen uitrol voor nodig hebt.
 *
 *  Staat er nog niets in de database — bij een verse installatie — dan geldt
 *  de omgevingsvariabele SITE_STATUS als beginstand. Die staat in fly.toml op
 *  "soon". Zodra je de knop één keer gebruikt, telt alleen de database nog.
 * ============================================================================
 */

/** Sleutel in de instellingentabel. */
const SLEUTEL = "siteStatus";

/**
 * De huidige stand. Alles behalve "live" telt als dicht.
 *
 * Bewust synchroon: better-sqlite3 leest zonder te wachten, en zo hoeven
 * robots.txt, de sitemap en de metadata niet te veranderen.
 */
export function siteStatus(): SiteStatus {
  const rij = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(SLEUTEL) as { value: string } | undefined;

  return bepaalStatus(rij?.value, process.env.SITE_STATUS);
}

/** Zet de site open of dicht. Wordt aangeroepen vanuit de beheeromgeving. */
export function setSiteStatus(status: SiteStatus): void {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(SLEUTEL, status);
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
