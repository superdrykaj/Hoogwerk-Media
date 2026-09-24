import { isPreviewing } from "@/lib/site-status";

/**
 * Balk die alleen de beheerder ziet: de site staat voor bezoekers dicht,
 * maar jij kijkt naar de volledige versie.
 */
export async function PreviewBar() {
  if (!(await isPreviewing())) return null;

  return (
    <div className="border-b border-haze-500/25 bg-haze-600/10">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center font-[family-name:var(--font-mono)] text-xs text-haze-300">
        <span>Voorvertoning.</span>
        <span className="text-mist-500">
          Bezoekers zien alleen de pagina &ldquo;binnenkort online&rdquo;. Zet
          SITE_STATUS op &ldquo;live&rdquo; om de site te openen.
        </span>
      </p>
    </div>
  );
}
