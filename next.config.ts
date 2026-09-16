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
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Native module: mag niet door de bundler worden meegenomen.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
