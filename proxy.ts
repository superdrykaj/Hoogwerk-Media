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

function isAdmin(request: NextRequest): boolean {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return false;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return Boolean(token && verifySessionToken(token, secret));
}

/** Laat het verzoek door, met het pad erbij voor de hoofdlayout. */
function doorlaten(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest) {
  if (process.env.SITE_STATUS === "live") return doorlaten(request);

  const { pathname } = request.nextUrl;

  // De voorpagina toont zelf "binnenkort online"; de beheeromgeving en de
  // gezondheidscheck moeten altijd bereikbaar blijven. /en is de Engelse
  // voorpagina en hoort daar dus ook bij.
  if (
    pathname === "/" ||
    pathname === "/en" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/")
  ) {
    return doorlaten(request);
  }

  if (isAdmin(request)) return doorlaten(request);

  // Een Engelse bezoeker komt op de Engelse voorpagina terecht, niet op de
  // Nederlandse.
  const naar = pathname.startsWith("/en/") ? "/en" : "/";
  return NextResponse.redirect(new URL(naar, request.url));
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
