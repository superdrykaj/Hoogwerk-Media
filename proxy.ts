import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

/**
 * ============================================================================
 *  DE DEUR VAN DE WEBSITE
 * ============================================================================
 *  Zolang SITE_STATUS niet op "live" staat, krijgt een bezoeker alleen de
 *  voorpagina te zien. Alle andere pagina's sturen we terug naar de voorpagina
 *  voordat er ook maar iets van wordt opgebouwd.
 *
 *  Dat laatste is de reden dat dit hier staat en niet in de pagina's zelf: een
 *  `redirect()` in een pagina wordt in deze versie van Next.js als meta-tag in
 *  de HTML gezet. De bezoeker gaat dan wel naar de voorpagina, maar heeft de
 *  hele pagina al binnengekregen. Hier grijpen we in vóór het renderen, dus
 *  gaat er niets de deur uit.
 *
 *  Ben je ingelogd als beheerder, dan ga je gewoon overal doorheen.
 *  Zie lib/site-status.ts voor de rest van de schakelaar.
 * ============================================================================
 */

function isAdmin(request: NextRequest): boolean {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return false;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return Boolean(token && verifySessionToken(token, secret));
}

export function proxy(request: NextRequest) {
  if (process.env.SITE_STATUS === "live") return NextResponse.next();

  const { pathname } = request.nextUrl;

  // De voorpagina toont zelf "binnenkort online"; de beheeromgeving en de
  // gezondheidscheck moeten altijd bereikbaar blijven.
  if (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  if (isAdmin(request)) return NextResponse.next();

  return NextResponse.redirect(new URL("/", request.url));
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
