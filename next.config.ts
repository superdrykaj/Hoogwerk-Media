import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Zelfstandige serverbundel, zodat het Docker-image klein blijft.
  output: "standalone",
  // De database en de uploads horen op de gekoppelde schijf, nooit in de
  // serverbundel. Zonder deze regel zou een lokale data/-map meegebakken
  // worden, met klantgegevens en al.
  outputFileTracingExcludes: {
    "/*": ["data/**/*", "public/images/**/*.tar.gz"],
  },
  images: {
    // Placeholder-beelden worden lokaal geserveerd; uploads gaan via /api/uploads.
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/api/uploads/**" },
      // Logovarianten in de wortel van public/, zoals /logo-mark.png.
      { pathname: "/logo-*" },
      // Posterbeelden bij de projecten. Het bestand op schijf blijft zoals het
      // is; Next levert er alleen een kleinere uitsnede van voor de kaartjes,
      // die maar een paar honderd pixels breed zijn.
      { pathname: "/media/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Native module: mag niet door de bundler worden meegenomen.
  serverExternalPackages: ["better-sqlite3"],

  async headers() {
    const ontwikkeling = process.env.NODE_ENV !== "production";

    /**
     * Wat de pagina mag laden. Alles komt van onszelf: de lettertypen worden
     * door Next meegebakken, de video's staan in public/media en er zit geen
     * enkele externe dienst in de site.
     *
     * Eerlijk over de zwakke plek: `unsafe-inline` bij scripts is nodig omdat
     * Next zijn opstartcode in de HTML zet. Strenger kan met een nonce per
     * verzoek, maar dat kost het vooraf opbouwen van pagina's. Wat hier staat,
     * houdt wél alle scripts van buiten tegen, en dat is waar het om gaat.
     */
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${ontwikkeling ? " 'unsafe-eval'" : ""}`,
      // Tailwind zet opmaak in style-attributen; die tellen als inline.
      "style-src 'self' 'unsafe-inline'",
      // data: voor de ruis over de achtergrond, blob: voor beeldvoorbeelden
      // in de beheeromgeving.
      "img-src 'self' data: blob:",
      "media-src 'self'",
      "font-src 'self'",
      `connect-src 'self'${ontwikkeling ? " ws: wss:" : ""}`,
      // De projectpagina ondersteunt een YouTube- of Vimeo-link als video.
      "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:pad*",
        headers: [
          // Alleen via HTTPS, ook bij een eerste bezoek na het intypen van het
          // adres zonder https:// ervoor. Twee jaar, inclusief subdomeinen.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          // De browser mag het bestandstype niet zelf gaan raden.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Niet in een frame op andermans site te zetten.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Bij een klik naar buiten gaat alleen het domein mee, niet het
          // volledige pad, en bij een stap terug naar http helemaal niets.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        // De video's en het posterbeeld in public/media. Zonder deze regel
        // stuurt Next "max-age=0" mee en vraagt de browser bij elk bezoek
        // opnieuw of het bestand nog klopt. Dat kost per pagina een extra
        // rondje naar de server, voor bestanden die nooit veranderen.
        //
        // Geen "immutable": de bestandsnamen bevatten geen versie, dus als je
        // een video vervangt moet die verandering er binnen afzienbare tijd
        // doorheen komen. Een week is daarvoor kort genoeg en scheelt de
        // terugkerende bezoeker toch al het wachten.
        source: "/media/:bestand*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;
