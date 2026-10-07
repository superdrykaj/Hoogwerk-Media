/**
 * ============================================================================
 *  DIENSTPAGINA'S
 * ============================================================================
 *  Drie inhoudelijke pagina's naast de homepage: één per soort opdracht. Dit
 *  bestand zegt welke dat zijn, op welk adres ze staan, welke diensten uit de
 *  beheeromgeving erbij horen en welk portfoliowerk erbij getoond wordt. De
 *  teksten zelf staan in content/copy.nl.ts en content/copy.en.ts onder
 *  `servicePages`.
 *
 *  Het adres is per taal anders, omdat een Engelstalige zoeker een Engels
 *  adres verwacht. Het Nederlandse adres is de sleutel voor de rest van de
 *  code (zie lib/locale.ts: href, stripLocale en switchPath vertalen het).
 *
 *  Pure gegevens, zonder database: dit bestand wordt ook in de browser
 *  gebruikt, via lib/locale.ts.
 * ============================================================================
 */

export const SERVICE_PAGE_KEYS = ["vastgoed", "bedrijven", "bouw"] as const;
export type ServicePageKey = (typeof SERVICE_PAGE_KEYS)[number];

export type ServicePageConfig = {
  /** Nederlands adres, zonder taalvoorvoegsel. */
  nl: string;
  /** Engels adres, zonder het voorvoegsel /en. */
  en: string;
  /** Slugs van de diensten (beheeromgeving) die op deze pagina staan. */
  services: string[];
  /**
   * Slugs van portfolioprojecten die op deze pagina worden getoond. De eerste
   * levert ook het kopbeeld. Staat een project er niet (meer) of is het
   * ingetrokken, dan wordt het overgeslagen.
   */
  projects: string[];
  /** Project waarvan het kopbeeld komt; leeg = geen kopbeeld. */
  coverProject: string;
  /** Welke foto uit de galerij van dat project (0 = de eerste). */
  coverImage: number;
  /** Slug van de hoofddienst van de pagina. */
  serviceType: string;
};

export const SERVICE_PAGES: Record<ServicePageKey, ServicePageConfig> = {
  vastgoed: {
    nl: "/dronefotografie-vastgoed",
    en: "/real-estate-drone-photography",
    services: ["dronefotografie", "dronevideo"],
    projects: ["ijburg-vanuit-de-lucht"],
    coverProject: "ijburg-vanuit-de-lucht",
    coverImage: 0,
    serviceType: "dronefotografie",
  },
  bedrijven: {
    nl: "/dronevideo-bedrijven",
    en: "/business-drone-video",
    services: ["dronevideo", "bedrijfsfilm"],
    projects: [
      "de-zaan-in-wormerveer",
      "de-zaanse-schans-vanuit-de-lucht",
      "ijburg-vanuit-de-lucht",
    ],
    coverProject: "de-zaan-in-wormerveer",
    coverImage: 2,
    serviceType: "dronevideo",
  },
  bouw: {
    nl: "/bouwvoortgang-drone",
    en: "/construction-progress-drone",
    services: ["bouwvordering"],
    projects: ["ijburg-vanuit-de-lucht"],
    coverProject: "",
    coverImage: 0,
    serviceType: "bouwvordering",
  },
};

/** Het Nederlandse adres van een dienstpagina. */
export function servicePagePath(key: ServicePageKey): string {
  return SERVICE_PAGES[key].nl;
}

/** Zoekt de sleutel bij een Nederlands adres, of null. */
export function servicePageKeyForPath(path: string): ServicePageKey | null {
  return SERVICE_PAGE_KEYS.find((key) => SERVICE_PAGES[key].nl === path) ?? null;
}

/** Zoekt de sleutel bij een Engels adres (zonder /en), of null. */
export function servicePageKeyForEnglishPath(path: string): ServicePageKey | null {
  return SERVICE_PAGE_KEYS.find((key) => SERVICE_PAGES[key].en === path) ?? null;
}
