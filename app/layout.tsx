import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { HTML_LANG, OG_LOCALE, localeFromPath, type Locale } from "@/lib/locale";
import { siteStatus } from "@/lib/site-status";
import { siteOrigin } from "@/lib/site-url";

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

/**
 * De taal van de huidige pagina. Het pad komt uit proxy.ts, omdat een layout
 * het zelf niet kan opvragen.
 */
async function currentLocale(): Promise<Locale> {
  const head = await headers();
  return localeFromPath(head.get("x-pathname") ?? "/");
}

// Als functie, niet als vaste waarde: SITE_STATUS wordt pas bij het draaien
// gelezen. Zo klopt de noindex-regel meteen na het omzetten van de schakelaar.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const t = copy(locale);

  return {
    metadataBase: new URL(await siteOrigin()),
    title: {
      default: `${t.meta.tagline} | ${site.name}`,
      template: `%s | ${site.name}`,
    },
    description: t.meta.description,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: site.name,
      title: `${t.meta.tagline} | ${site.name}`,
      description: t.meta.ogDescription,
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    // Zolang de site nog niet open is, wil je niet dat Google hem opneemt.
    // Een halve site in de zoekresultaten is lastiger weg te krijgen dan je denkt.
    robots:
      siteStatus() === "live"
        ? undefined
        : { index: false, follow: false, nocache: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await currentLocale();

  return (
    // De lettertypevariabelen staan op <html>, niet op <body>. Tailwind zet
    // --font-sans op :root, en dat is het html-element; verwijst die naar een
    // variabele die pas op body bestaat, dan is de waarde ongeldig en valt de
    // hele site terug op het lettertype van het besturingssysteem.
    <html
      lang={HTML_LANG[locale]}
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh">
        <a
          href="#hoofdinhoud"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-overlay) focus:rounded-full focus:bg-haze-300 focus:px-5 focus:py-2 focus:font-semibold focus:text-ink-950"
        >
          {copy(locale).nav.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
