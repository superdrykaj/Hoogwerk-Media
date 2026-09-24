/**
 * ============================================================================
 *  TALEN
 * ============================================================================
 *  De site staat in twee talen op het web:
 *
 *    Nederlands   /            /portfolio        /contact
 *    Engels       /en          /en/portfolio     /en/contact
 *
 *  Nederlands staat bewust zonder voorvoegsel, zodat bestaande links en
 *  zoekresultaten blijven werken. Er wordt niet automatisch omgeleid op de
 *  taal van de browser: de bezoeker kiest zelf met de knop in de kop, en
 *  zoekmachines krijgen via hreflang te horen welke pagina's bij elkaar horen.
 *
 *  Dit bestand draait zowel op de server als in de browser; gebruik hier geen
 *  database of node-modules.
 * ============================================================================
 */

export const LOCALES = ["nl", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "nl";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Taal van de knop waarmee je naar de andere versie gaat. */
export function otherLocale(locale: Locale): Locale {
  return locale === "nl" ? "en" : "nl";
}

/** Wat er in het lang-attribuut van <html> komt te staan. */
export const HTML_LANG: Record<Locale, string> = { nl: "nl", en: "en" };

/** Voor Open Graph. */
export const OG_LOCALE: Record<Locale, string> = { nl: "nl_NL", en: "en_GB" };

/**
 * Voor datums, tijden en getallen. Engels-Brits, omdat een Nederlandse
 * bezoeker die Engels leest een 24-uursklok en dag-voor-maand verwacht.
 */
export const INTL_LOCALE: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };

/**
 * Leest de taal uit een pad. Alles wat met /en begint is Engels, de rest is
 * Nederlands.
 */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "nl";
}

/**
 * Maakt van een Nederlands pad het pad in de gevraagde taal.
 * href("/portfolio", "en") → "/en/portfolio"
 * href("/portfolio", "nl") → "/portfolio"
 */
export function href(path: string, locale: Locale): string {
  if (locale === "nl") return path;
  if (path === "/") return "/en";
  return `/en${path}`;
}

/** Het deel van het pad zonder taalvoorvoegsel, dus altijd de NL-variant. */
export function stripLocale(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

/** Hetzelfde adres, maar dan in de andere taal. */
export function switchPath(pathname: string, to: Locale): string {
  return href(stripLocale(pathname), to);
}

/**
 * Kiest de vertaalde tekst, en valt terug op het Nederlands zolang de Engelse
 * versie leeg is. Zo staat er nooit een gat op de Engelse site: er staat dan
 * gewoon de Nederlandse tekst, tot die is ingevuld in de beheeromgeving.
 */
export function pickText(locale: Locale, nl: string, en: string): string {
  if (locale === "nl") return nl;
  return en.trim() === "" ? nl : en;
}
