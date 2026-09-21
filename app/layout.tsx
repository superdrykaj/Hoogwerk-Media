import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { site } from "@/content/site";
import { siteStatus } from "@/lib/site-status";

import "./globals.css";

// Eén familie voor tekst en koppen: rustig, goed leesbaar op donker, en met
// cijfers die even breed zijn. Het monospace-zusje gebruiken we voor kleine
// labels en prijzen, zodat die zich vanzelf onderscheiden van de kop.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

const description =
  `Dronefoto's en korte films van vastgoed, bedrijfsterreinen en bouw in ` +
  `${site.region}. Levering binnen vijf werkdagen.`;

// Als functie, niet als vaste waarde: SITE_STATUS wordt pas bij het draaien
// gelezen. Zo klopt de noindex-regel meteen na het omzetten van de schakelaar.
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.tagline} | ${site.name}`,
      template: `%s | ${site.name}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "nl_NL",
      siteName: site.name,
      title: `${site.tagline} | ${site.name}`,
      description,
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    alternates: { canonical: "/" },
    // Zolang de site nog niet open is, wil je niet dat Google hem opneemt.
    // Een halve site in de zoekresultaten is lastiger weg te krijgen dan je denkt.
    robots:
      siteStatus() === "live"
        ? undefined
        : { index: false, follow: false, nocache: true },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // De lettertypevariabelen staan op <html>, niet op <body>. Tailwind zet
    // --font-sans op :root, en dat is het html-element; verwijst die naar een
    // variabele die pas op body bestaat, dan is de waarde ongeldig en valt de
    // hele site terug op het lettertype van het besturingssysteem.
    <html
      lang="nl"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh">
        <a
          href="#hoofdinhoud"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-overlay) focus:rounded-full focus:bg-haze-300 focus:px-5 focus:py-2 focus:font-semibold focus:text-ink-950"
        >
          Naar de hoofdinhoud
        </a>
        {children}
      </body>
    </html>
  );
}
