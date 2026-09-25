import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ============================================================================
 *  DE DEUR VAN DE WEBSITE
 * ============================================================================
 *  Twee taken.
 *
 *  Het fly.dev-adres stuurt door naar het eigen domein; dat kan hier, omdat
 *  het alleen naar de host van het verzoek hoeft te kijken.
 *
 *  Daarnaast geeft dit bestand het opgevraagde pad door aan de pagina's. De
 *  hoofdlayout moet weten of de bezoeker op de Nederlandse of de Engelse
 *  versie zit, want daar hangt het lang-attribuut van <html> aan, en een
 *  layout kan het pad niet zelf opvragen.
 *
 *  Let op: in Next.js 16 heet dit bestand `proxy.ts`. De oude naam
 *  `middleware.ts` is vervallen; de werking is verder hetzelfde.
 * ============================================================================
 */

/** Laat het verzoek door, met het pad erbij voor de hoofdlayout. */
function doorlaten(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

/**
 * Elke Fly-app is óók bereikbaar op <appnaam>.fly.dev. Dat adres kun je niet
 * weghalen, maar je kunt bezoekers wel doorsturen naar je eigen domein.
 *
 * Dat is niet alleen netter: twee adressen die dezelfde pagina's serveren
 * betekent voor Google dubbele inhoud, en dan moet hij raden welke de echte is.
 * Een blijvende omleiding (301) maakt dat eenduidig.
 *
 * Twee uitzonderingen, allebei expres:
 *  - /api/ blijft staan, want daar zit de gezondheidscheck van Fly op.
 *  - /admin blijft staan, zodat je er altijd nog bij kunt als er iets mis is
 *    met je domein of het certificaat.
 *
 * Werkt alleen als NEXT_PUBLIC_SITE_URL op je eigen domein staat. Staat hij er
 * niet, of wijst hij zelf naar fly.dev, dan gebeurt er niets.
 */
function naarEigenDomein(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host") ?? "";
  if (!host.endsWith(".fly.dev")) return null;

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) return null;

  const eigen = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!eigen) return null;

  let doel: URL;
  try {
    doel = new URL(eigen);
  } catch {
    return null;
  }
  if (doel.hostname.endsWith(".fly.dev")) return null;

  doel.pathname = pathname;
  doel.search = request.nextUrl.search;
  return NextResponse.redirect(doel, 301);
}

export function proxy(request: NextRequest) {
  const omleiding = naarEigenDomein(request);
  if (omleiding) return omleiding;

  /**
   * Hier stond ook de afscherming van een dichte site. Die is verhuisd naar de
   * pagina's zelf, omdat de stand nu in de database staat en een proxy die niet
   * kan lezen: hij draait buiten de applicatie en heeft geen toegang tot de
   * native databasemodule.
   *
   * Dat is geen gat. Elke publieke pagina roept requireOpenSite() aan en geeft
   * een 404 als de site dicht is — zonder iets van de inhoud mee te sturen. De
   * voorpagina toont dan "binnenkort online". Zie lib/site-status.ts.
   */
  return doorlaten(request);
}

export const config = {
  /**
   * Alles behalve de bestanden die de browser nodig heeft om de voorpagina te
   * tonen: de Next.js-bundel, de afbeeldingen, het logo en de pictogrammen.
   * robots.txt mag er ook door, anders kan een zoekmachine niet lezen dat hij
   * moet wegblijven.
   */
  matcher: [
    "/((?!_next/|images/|logo-|icon.png|apple-icon.png|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
