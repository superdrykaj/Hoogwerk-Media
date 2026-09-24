import { PreviewBar } from "@/components/preview-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/locale";
import { siteIsOpen } from "@/lib/site-status";

/** De publieke website: kop, inhoud en footer, in één taal. */
export async function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Staat de site nog dicht, dan is er geen menu en geen footer: de enige
  // pagina die een bezoeker krijgt, is "binnenkort online".
  if (!(await siteIsOpen())) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col">
      <PreviewBar />
      <SiteHeader locale={locale} />
      <main id="hoofdinhoud" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
