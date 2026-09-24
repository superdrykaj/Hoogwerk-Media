import "server-only";

import { headers } from "next/headers";

import { site } from "@/content/site";

/**
 * ============================================================================
 *  HET PUBLIEKE ADRES VAN DE SITE
 * ============================================================================
 *  Hiermee worden de canonieke links, de hreflang-verwijzingen, het deelbeeld
 *  en de sitemap opgebouwd. Staat hier het verkeerde adres, dan vertelt de site
 *  aan Google dat de echte versie van elke pagina ergens anders staat.
 *
 *  Eerst NEXT_PUBLIC_SITE_URL. Dat is de enige waarde die niet van de bezoeker
 *  komt en dus de enige die je echt kunt vertrouwen; hij staat in fly.toml.
 *
 *  Ontbreekt die, dan leiden we het adres af uit het verzoek zelf. Dat is een
 *  vangnet: eerder viel de site in dat geval terug op "http://localhost:3000",
 *  en dan wijzen alle canonieke links en hreflang-verwijzingen naar een adres
 *  dat voor de buitenwereld niet bestaat.
 * ============================================================================
 */
export async function siteOrigin(): Promise<string> {
  const ingesteld = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (ingesteld) return ingesteld.replace(/\/+$/, "");

  const kop = await headers();
  const host = kop.get("host") ?? kop.get("x-forwarded-host");
  if (host) {
    const protocol =
      kop.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${protocol}://${host}`;
  }

  return site.url.replace(/\/+$/, "");
}
