import type { Metadata } from "next";
import Link from "next/link";

import { copy } from "@/content/copy";

// Een foutpagina hoort niet in de zoekresultaten. Next genereert deze route
// altijd vooraf, dus het deelbeeld erop valt terug op het adres van tijdens
// de build. Met noindex maakt dat niet uit: de pagina wordt niet gedeeld of
// geïndexeerd.
export const metadata: Metadata = {
  title: "Pagina niet gevonden / Page not found",
  robots: { index: false, follow: true },
};

/**
 * Deze pagina verschijnt ook op adressen die in geen van beide talen bestaan,
 * en die hebben dus geen taal. Daarom staat hier allebei de talen onder
 * elkaar in plaats van een gok.
 */
export default function NotFound() {
  const nl = copy("nl").notFound;
  const en = copy("en").notFound;

  return (
    <div className="container-page flex min-h-[60svh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-1 mt-4">{nl.title}</h1>
      <p className="lede mt-5 max-w-md">{nl.body}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          {nl.home}
        </Link>
        <Link href="/portfolio" className="btn btn-ghost">
          {nl.portfolio}
        </Link>
      </div>

      <hr className="mt-14 w-16 border-ink-700" />

      <div lang="en" className="mt-10">
        <h2 className="display-3">{en.title}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-mist-500">
          {en.body}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/en" className="btn btn-ghost">
            {en.home}
          </Link>
          <Link href="/en/portfolio" className="btn btn-quiet">
            {en.portfolio}
          </Link>
        </div>
      </div>
    </div>
  );
}
