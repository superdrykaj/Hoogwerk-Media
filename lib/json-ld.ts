/**
 * ============================================================================
 *  GESTRUCTUREERDE GEGEVENS (schema.org, JSON-LD)
 * ============================================================================
 *  Alleen gegevens die al op de site staan of in content/site.ts zijn
 *  vastgelegd: bedrijfsnaam, adres van de website, logo, e-mailadres en
 *  werkgebied. Er is bewust geen straatadres, telefoonnummer, KvK-nummer of
 *  socialemediaprofiel opgenomen: die zijn nog niet ingevuld, en wat er niet
 *  is verzinnen we niet. Zodra `site.phone` of `site.instagram` zijn gevuld,
 *  komen ze hier vanzelf bij.
 *
 *  Het is een Organization en geen LocalBusiness: zonder publiek adres past
 *  LocalBusiness niet, want Google verlangt daarbij een adres. Het
 *  werkgebied staat in `areaServed`.
 *
 *  Pure functies zonder database, zodat een test ze kan controleren.
 * ============================================================================
 */
import { site } from "@/content/site";

import type { Locale } from "./locale";

type JsonLd = Record<string, unknown>;

/** Vaste sleutel van het bedrijf, zodat andere pagina's ernaar kunnen verwijzen. */
export function organizationId(origin: string): string {
  return `${origin}/#organization`;
}

function areaServed() {
  return site.workArea.map((plaats) => ({
    "@type": plaats.type,
    name: plaats.name,
  }));
}

export function organizationJsonLd(input: {
  origin: string;
  description: string;
  locale: Locale;
}): JsonLd {
  const { origin } = input;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(origin),
    name: site.name,
    url: `${origin}/`,
    description: input.description,
    // Het app-pictogram: een vierkant logo met eigen achtergrond, leesbaar op
    // wit. Het beeldmerk in de kop (logo-mark.png) is licht op doorzichtig,
    // bedoeld voor een donkere achtergrond.
    logo: {
      "@type": "ImageObject",
      url: `${origin}/icon.png`,
      width: 512,
      height: 512,
    },
    email: site.email,
    ...(site.phone ? { telephone: site.phone } : {}),
    areaServed: areaServed(),
    founder: { "@type": "Person", name: "Kai Koster" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: site.email,
      ...(site.phone ? { telephone: site.phone } : {}),
    },
    ...(site.instagram ? { sameAs: [site.instagram] } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceJsonLd(input: {
  origin: string;
  url: string;
  name: string;
  description: string;
  locale: Locale;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${input.url}#service`,
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: input.locale,
    provider: {
      "@type": "Organization",
      "@id": organizationId(input.origin),
      name: site.name,
      url: `${input.origin}/`,
    },
    areaServed: areaServed(),
  };
}

/**
 * Serialiseert voor in een <script>-tag. Een "<" in een tekst (bijvoorbeeld
 * "</script>") zou de tag voortijdig sluiten; als < blijft het gewone
 * JSON en leest elke parser het gelijk.
 */
export function jsonLdString(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
