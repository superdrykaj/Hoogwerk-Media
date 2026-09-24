/**
 * Metadata die voor beide talen hetzelfde werkt.
 *
 * `canonical` wijst naar de pagina zelf, en `languages` vertelt zoekmachines
 * welke Nederlandse en Engelse pagina bij elkaar horen (hreflang). Zonder dat
 * laatste ziet Google twee losse pagina's die op elkaar lijken.
 */
import { href, type Locale } from "./locale";

export function pageAlternates(path: string, locale: Locale) {
  return {
    canonical: href(path, locale),
    languages: {
      nl: path,
      en: href(path, "en"),
      // Zonder taalvoorkeur komt de bezoeker op de Nederlandse versie uit.
      "x-default": path,
    },
  };
}
