import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Geeft het opgevraagde pad door aan de server-componenten.
 *
 * De hoofdlayout moet weten of de bezoeker op de Nederlandse of de Engelse
 * versie zit, want daar hangt het lang-attribuut van <html> aan. Een layout
 * kan het pad niet zelf lezen, dus zetten we het hier in een header.
 *
 * Let op: in Next.js 16 heet dit bestand `proxy.ts`. De oude naam
 * `middleware.ts` is vervallen; de werking is verder hetzelfde.
 *
 * Er wordt niets omgeleid op basis van de browsertaal. Dat is met opzet:
 * bezoekers kiezen zelf met de knop in de kop, en een omleiding op
 * Accept-Language maakt gedeelde links onvoorspelbaar.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Alles behalve de statische bestanden en de afbeeldingsoptimalisatie.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|api/uploads/).*)"],
};
