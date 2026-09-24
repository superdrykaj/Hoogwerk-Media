import Link from "next/link";

import { copy } from "@/content/copy";
import { href, type Locale } from "@/lib/locale";
import { isPreviewing } from "@/lib/site-status";

/**
 * Melding boven aan elke publieke pagina dat de inhoud fictief is.
 *
 * Zet DEMO_MODE="false" in je omgevingsvariabelen zodra je de voorbeelden hebt
 * vervangen door je eigen gegevens. De balk verdwijnt dan na een herstart.
 *
 * Kijk je zelf mee terwijl de site nog dicht is, dan blijft deze balk weg: de
 * voorvertoningsbalk zegt dan al dat er nog niemand meekijkt. Zodra de site
 * opengaat en er nog voorbeelden in staan, verschijnt hij alsnog — precies het
 * moment waarop je hem nodig hebt.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE !== "false";
}

export async function DemoBanner({ locale }: { locale: Locale }) {
  if (!isDemoMode()) return null;
  if (await isPreviewing()) return null;

  const t = copy(locale).demoBanner;

  return (
    <div className="border-b border-amber-400/25 bg-amber-400/8">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center font-[family-name:var(--font-mono)] text-xs leading-relaxed text-amber-200/90">
        <span>{t.short}</span>
        <Link href={href("/demo", locale)} className="link-quiet text-amber-200">
          {t.link}
        </Link>
      </p>
    </div>
  );
}
