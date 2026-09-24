import Link from "next/link";

import { Arrow } from "@/components/arrow";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { copy } from "@/content/copy";
import { href, type Locale } from "@/lib/locale";
import { requireOpenSite } from "@/lib/site-status";
import { listProjects } from "@/lib/projects";

export async function PortfolioPage({ locale }: { locale: Locale }) {
  await requireOpenSite();

  const t = copy(locale);
  const projects = listProjects({ onlyPublished: true, featuredFirst: true });

  return (
    <div className="container-page py-20">
      <header className="max-w-3xl">
        <p className="eyebrow">{t.portfolio.eyebrow}</p>
        <h1 className="display-1 mt-4 text-balance">{t.portfolio.title}</h1>
        <p className="lede mt-6">{t.portfolio.intro(t.region.short)}</p>
        {/* Alleen tonen zolang er nog verzonnen projecten tussen staan.
            Zijn die allemaal vervangen, dan valt de melding vanzelf weg. */}
        {projects.some((project) => project.isExample) && (
          <p className="notice notice-info mt-8">
            {t.portfolio.noticeBefore}{" "}
            <strong>{t.portfolio.noticeStrong}</strong> {t.portfolio.noticeAfter}
          </p>
        )}
      </header>

      <div className="mt-14">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-600 px-6 py-20 text-center">
            <p className="text-mist-300">{t.portfolio.empty}</p>
            <Link href="/admin/projecten" className="btn btn-ghost mt-6">
              {t.portfolio.emptyAction}
            </Link>
          </div>
        ) : (
          <PortfolioGrid projects={projects} locale={locale} />
        )}
      </div>

      <section className="mt-24 rounded-2xl border border-ink-700 bg-ink-900 px-6 py-14 text-center sm:px-12">
        <h2 className="display-2 text-balance">{t.portfolio.ctaTitle}</h2>
        <p className="lede mx-auto mt-4 max-w-xl">{t.portfolio.ctaBody}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`${href("/", locale)}#boeken`} className="btn btn-primary">
            {t.nav.book}
            <Arrow />
          </Link>
          <Link href={href("/contact", locale)} className="btn btn-ghost">
            {t.portfolio.ctaAsk}
          </Link>
        </div>
      </section>
    </div>
  );
}
