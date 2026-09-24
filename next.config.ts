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
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Native module: mag niet door de bundler worden meegenomen.
  serverExternalPackages: ["better-sqlite3"],

  async headers() {
    return [
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
