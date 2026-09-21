import { DemoBanner } from "@/components/demo-banner";
import { PreviewBar } from "@/components/preview-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteIsOpen } from "@/lib/site-status";

/** De publieke website: kop, inhoud en footer. */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Staat de site nog dicht, dan is er geen menu en geen footer: de enige
  // pagina die een bezoeker krijgt, is "binnenkort online".
  if (!(await siteIsOpen())) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col">
      <PreviewBar />
      <DemoBanner />
      <SiteHeader />
      <main id="hoofdinhoud" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
