import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
