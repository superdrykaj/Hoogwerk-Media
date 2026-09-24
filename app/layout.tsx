import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { headers } from "next/headers";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { HTML_LANG, OG_LOCALE, localeFromPath, type Locale } from "@/lib/locale";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const t = copy(locale);

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — ${t.meta.tagline}`,
      template: `%s — ${site.name}`,
    },
    description: t.meta.description,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: site.name,
      title: `${site.name} — ${t.meta.tagline}`,
      description: t.meta.ogDescription,
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await currentLocale();

  return (
    <html lang={HTML_LANG[locale]} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${sora.variable} min-h-dvh`}>
        <a
          href="#hoofdinhoud"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-azure-500 focus:px-5 focus:py-2 focus:font-semibold focus:text-ink-950"
        >
          {copy(locale).nav.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
