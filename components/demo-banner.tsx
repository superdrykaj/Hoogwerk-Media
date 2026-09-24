import Link from "next/link";

import { copy } from "@/content/copy";
import { href, type Locale } from "@/lib/locale";

/**
 * Melding boven aan elke publieke pagina dat de inhoud fictief is.
 *
 * Zet DEMO_MODE="false" in je omgevingsvariabelen zodra je de voorbeelden hebt
 * vervangen door je eigen gegevens. De balk verdwijnt dan na een herstart.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE !== "false";
}

export function DemoBanner({ locale }: { locale: Locale }) {
  const t = copy(locale).demoBanner;
  if (!isDemoMode()) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-xs leading-relaxed text-amber-200">
        <span
          aria-hidden="true"
          className="inline-flex items-center rounded-full border border-amber-500/40 px-2 py-0.5 font-semibold uppercase tracking-wider"
        >
          {t.label}
        </span>
        <span>
          {t.text} <strong className="font-semibold">{t.emphasis}</strong>.
        </span>
        <Link
          href={href("/demo", locale)}
          className="underline underline-offset-2 hover:text-amber-100"
        >
          {t.link}
        </Link>
      </p>
    </div>
  );
}
