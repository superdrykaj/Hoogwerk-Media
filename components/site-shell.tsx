import { DemoBanner } from "@/components/demo-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { copy } from "@/content/copy";
import type { Locale } from "@/lib/locale";

/** De publieke website: kop, inhoud en footer, in één taal. */
export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner locale={locale} />
      <SiteHeader locale={locale} />
      <main id="hoofdinhoud" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}

/** Voor de skip-link in de hoofdlayout. */
export function skipLabel(locale: Locale): string {
  return copy(locale).nav.skipToContent;
}
