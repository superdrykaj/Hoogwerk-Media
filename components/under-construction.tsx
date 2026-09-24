import Image from "next/image";
import Link from "next/link";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { href, otherLocale, type Locale } from "@/lib/locale";

/**
 * De enige pagina die bezoekers zien zolang SITE_STATUS niet op "live" staat.
 *
 * Bewust leeg: naam, beeldmerk en één zin. Er valt nog niets te beloven, dus
 * belooft deze pagina niets. Zie lib/site-status.ts voor het opengaan.
 */
export function UnderConstruction({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const andere = otherLocale(locale);

  return (
    <main
      id="hoofdinhoud"
      className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
    >
      {/* Zacht licht achter het beeldmerk. Geen foto: er staat nog geen eigen
          werk online en een voorbeeldfoto zou dat verhullen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.09] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-haze-300) 0%, transparent 68%)",
        }}
      />

      {site.logo && (
        <Image
          src={site.logo.src}
          alt=""
          width={site.logo.width}
          height={site.logo.height}
          priority
          className="fade h-20 w-auto sm:h-24"
        />
      )}

      <h1 className="rise mt-10 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
        {site.name}
      </h1>

      <p
        className="rise mt-5 max-w-md text-balance text-base leading-relaxed text-mist-500"
        style={{ animationDelay: "120ms" }}
      >
        {t.soonLine}
      </p>

      {/* Ook dichte deuren hebben twee talen. */}
      <Link
        href={href("/", andere)}
        hrefLang={andere}
        lang={andere}
        className="fade mt-10 rounded-full border border-ink-600 px-3 py-1.5 text-xs font-semibold text-mist-500 transition-colors hover:border-haze-400/60 hover:text-mist-100"
        style={{ animationDelay: "240ms" }}
      >
        <span aria-hidden="true">{t.taalknopKort}</span>
        <span className="sr-only">{t.taalknop}</span>
      </Link>
    </main>
  );
}
