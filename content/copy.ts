/**
 * De teksten van de website, per taal.
 *
 *   copy("nl").home.heroTitle
 *   copy("en").home.heroTitle
 *
 * De Nederlandse versie is leidend: het type komt daarvandaan, dus een
 * vergeten Engelse tekst is een typefout en geen lege pagina.
 */
import type { Locale } from "@/lib/locale";

import { en } from "./copy.en";
import { nl, type Dictionary } from "./copy.nl";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { nl, en };

export function copy(locale: Locale): Dictionary {
  return dictionaries[locale];
}
