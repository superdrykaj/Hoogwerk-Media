import Image from "next/image";
import Link from "next/link";

import { Arrow } from "@/components/arrow";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PriceTiers, PricingTerms } from "@/components/pricing-parts";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { copy } from "@/content/copy";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/json-ld";
import { href, pickText, type Locale } from "@/lib/locale";
import { serviceText } from "@/lib/localised";
import {
  getProjectBySlug,
  listProjectImages,
  onlyExistingImages,
} from "@/lib/projects";
import { listServices } from "@/lib/services";
import {
  SERVICE_PAGES,
  SERVICE_PAGE_KEYS,
  type ServicePageKey,
} from "@/lib/service-pages";
import { requireOpenSite } from "@/lib/site-status";
import { siteOrigin } from "@/lib/site-url";

/**
 * Een inhoudelijke dienstpagina. De teksten staan in content/copy.*.ts onder
 * `servicePages`, de koppelingen met diensten en projecten in
 * lib/service-pages.ts. Prijzen, inbegrepen en extra kosten komen uit dezelfde
 * bron als op de homepage.
 */
export async function ServicePage({
  pageKey,
  locale,
}: {
  pageKey: ServicePageKey;
  locale: Locale;
}) {
  await requireOpenSite();

  const t = copy(locale);
  const ui = t.servicePageUi;
  const page = t.servicePages[pageKey];
  const config = SERVICE_PAGES[pageKey];
  const home = href("/", locale);

  // Diensten in de volgorde van de configuratie; een dienst die in de
  // beheeromgeving is uitgezet, verdwijnt vanzelf van de pagina.
  const actief = listServices({ onlyActive: true });
  const services = config.services
    .map((slug) => actief.find((service) => service.slug === slug))
    .filter((service) => service !== undefined);

  const projects = config.projects.flatMap((slug) => {
    const project = getProjectBySlug(slug);
    return project && project.published ? [project] : [];
  });

  // Kopbeeld: een foto uit de galerij van het gekozen project, zodat het niet
  // hetzelfde beeld is als de projectkaart verderop.
  const coverProject = config.coverProject
    ? getProjectBySlug(config.coverProject)
    : null;
  const coverImage =
    coverProject && coverProject.published
      ? onlyExistingImages(listProjectImages(coverProject.id))[config.coverImage]
      : undefined;

  const origin = await siteOrigin();
  const url = `${origin}${href(config.nl, locale)}`;

  const related = SERVICE_PAGE_KEYS.filter((key) => key !== pageKey);

  return (
    <article>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: ui.startLabel, url: `${origin}${home === "/" ? "/" : home}` },
          { name: page.breadcrumb, url },
        ])}
      />
      <JsonLd
        data={serviceJsonLd({
          origin,
          url,
          name: page.h1,
          description: page.metaDescription,
          locale,
        })}
      />

      {/* Kop ------------------------------------------------------------- */}
      <header className="relative isolate -mt-[4.5rem] flex min-h-[56svh] items-end overflow-hidden pt-[4.5rem]">
        {coverImage && (
          <Image
            src={coverImage.url}
            alt={pickText(locale, coverImage.alt, coverImage.altEn)}
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/80 via-ink-950/55 to-ink-950"
        />
        <div className="container-page pb-12 pt-28">
          <nav aria-label={ui.breadcrumbLabel} className="mb-6 text-sm text-mist-500">
            <Link href={home} className="hover:text-mist-100">
              {ui.startLabel}
            </Link>
            <span aria-hidden="true" className="mx-2 text-ink-600">/</span>
            <span aria-current="page" className="text-mist-300">
              {page.breadcrumb}
            </span>
          </nav>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 className="display-1 mt-4 max-w-4xl text-[clamp(2.1rem,6.2vw,4.4rem)]">
            {page.h1}
          </h1>
          <p className="lede mt-6">{page.lede}</p>
        </div>
      </header>

      <div className="container-page">
        {/* Inleiding en contact ---------------------------------------- */}
        <div className="grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="prose-body">
            {page.intro.map((alinea) => (
              <p key={alinea.slice(0, 24)}>{alinea}</p>
            ))}
          </div>
          <aside className="h-fit rounded-2xl border border-ink-700 bg-ink-900 p-6">
            <p className="display-3 text-base">{ui.asideTitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-mist-500">{ui.asideBody}</p>
            <Link href={`${home}#boeken`} className="btn btn-primary mt-6 w-full">
              {t.nav.book}
              <Arrow />
            </Link>
            <Link href={href("/contact", locale)} className="btn btn-quiet mt-3 w-full">
              {ui.asideAsk}
            </Link>
          </aside>
        </div>

        {/* Voor wie -------------------------------------------------------- */}
        <section aria-labelledby="doelgroep-titel" className="border-t border-ink-700 py-16">
          <Reveal>
            <p className="eyebrow">{ui.audienceEyebrow}</p>
            <h2 id="doelgroep-titel" className="display-2 mt-4 max-w-2xl">
              {page.audienceTitle}
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {page.audience.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 70} className="card h-full p-6">
                  <h3 className="display-3">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist-500">{item.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Aanbod met prijzen --------------------------------------------- */}
        {services.length > 0 && (
          <section aria-labelledby="aanbod-titel" className="border-t border-ink-700 py-16">
            <Reveal>
              <p className="eyebrow">{ui.offerEyebrow}</p>
              <h2 id="aanbod-titel" className="display-2 mt-4 max-w-2xl">
                {page.offerTitle}
              </h2>
              <p className="lede mt-5">{page.offerIntro}</p>
            </Reveal>
            <Reveal className="mt-10">
              <ul className="border-t border-ink-700">
                {services.map((service) => {
                  const tekst = serviceText(service, locale);
                  const pricing = t.home.packagePricing[service.slug];
                  return (
                    <li
                      key={service.id}
                      className="grid gap-x-6 gap-y-2 border-b border-ink-700 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
                    >
                      <div>
                        <h3 className="display-3">{tekst.name}</h3>
                        {tekst.description && (
                          <p className="mt-2 max-w-prose whitespace-pre-line text-sm leading-relaxed text-mist-500">
                            {tekst.description}
                          </p>
                        )}
                      </div>
                      <div className="sm:text-right">
                        {pricing ? (
                          <PriceTiers tiers={pricing} inclVat={t.home.priceInclVat} />
                        ) : (
                          <p className="numeric text-xl font-semibold leading-tight text-mist-100">
                            {tekst.priceLabel || t.home.priceOnRequest}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </section>
        )}

        {/* Werkwijze ------------------------------------------------------- */}
        <section aria-labelledby="werkwijze-titel" className="border-t border-ink-700 py-16">
          <Reveal>
            <p className="eyebrow">{ui.processEyebrow}</p>
            <h2 id="werkwijze-titel" className="display-2 mt-4 max-w-2xl">
              {page.processTitle}
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {page.process.map((step, index) => (
              <li key={step.title} className="relative">
                <Reveal delay={index * 80} className="pt-6">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-haze-400/60 to-transparent"
                  />
                  <span className="numeric font-[family-name:var(--font-mono)] text-xs text-haze-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-3 mt-3">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-500">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Oplevering en vliegen ------------------------------------------ */}
        <div className="grid gap-14 border-t border-ink-700 py-16 lg:grid-cols-2 lg:gap-20">
          <section aria-labelledby="oplevering-titel">
            <Reveal>
              <p className="eyebrow">{ui.deliveryEyebrow}</p>
              <h2 id="oplevering-titel" className="display-2 mt-4">
                {page.deliveryTitle}
              </h2>
              <div className="prose-body mt-6">
                {page.delivery.map((alinea) => (
                  <p key={alinea.slice(0, 24)}>{alinea}</p>
                ))}
              </div>
            </Reveal>
          </section>
          <section aria-labelledby="vliegen-titel">
            <Reveal delay={80}>
              <p className="eyebrow">{ui.limitsEyebrow}</p>
              <h2 id="vliegen-titel" className="display-2 mt-4">
                {page.limitsTitle}
              </h2>
              <div className="prose-body mt-6">
                <p>
                  {t.footer.workArea} {t.region.detail}
                </p>
                {page.limits.map((alinea) => (
                  <p key={alinea.slice(0, 24)}>{alinea}</p>
                ))}
              </div>
            </Reveal>
          </section>
        </div>

        {/* Portfolio ------------------------------------------------------- */}
        {projects.length > 0 && (
          <section aria-labelledby="portfolio-titel" className="border-t border-ink-700 py-16">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">{ui.workEyebrow}</p>
                  <h2 id="portfolio-titel" className="display-2 mt-4 max-w-2xl">
                    {page.workTitle}
                  </h2>
                  <p className="lede mt-5">{page.workIntro}</p>
                </div>
                <Link href={href("/portfolio", locale)} className="btn btn-ghost">
                  {ui.workAll}
                </Link>
              </div>
              <p className="mt-5 text-sm text-mist-500">{page.workNote}</p>
            </Reveal>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <li key={project.id}>
                  <Reveal delay={index * 90} className="h-full">
                    <ProjectCard project={project} locale={locale} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tarieven en voorwaarden ---------------------------------------- */}
        <section aria-labelledby="voorwaarden-titel" className="border-t border-ink-700 py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
            <Reveal>
              <p className="eyebrow">{ui.termsEyebrow}</p>
              <h2 id="voorwaarden-titel" className="display-2 mt-4">
                {page.termsTitle}
              </h2>
              <p className="lede mt-5">{t.home.pricingIntro}</p>
              <Link href={`${home}#tarieven`} className="link-quiet mt-6 inline-block text-sm">
                {ui.allRates}
                <span aria-hidden="true"> →</span>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <PricingTerms t={t} />
            </Reveal>
          </div>
        </section>

        {/* Vragen ---------------------------------------------------------- */}
        <section aria-labelledby="vragen-titel" className="border-t border-ink-700 py-16">
          <Reveal>
            <p className="eyebrow">{ui.faqEyebrow}</p>
            <h2 id="vragen-titel" className="display-2 mt-4 max-w-3xl">
              {page.faqTitle}
            </h2>
          </Reveal>
          <FaqList items={page.faq} />
        </section>

        {/* Andere diensten ------------------------------------------------- */}
        <section aria-labelledby="andere-titel" className="border-t border-ink-700 py-16">
          <h2 id="andere-titel" className="display-3">
            {ui.relatedTitle}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map((key) => (
              <li key={key}>
                <Link
                  href={href(SERVICE_PAGES[key].nl, locale)}
                  className="group block h-full rounded-xl border border-ink-700 bg-ink-900 p-5 transition-colors hover:border-haze-500/60"
                >
                  <span className="block text-base font-semibold group-hover:text-haze-300">
                    {t.servicePages[key].h1}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-mist-500">
                    {t.servicePages[key].teaser}
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-haze-300">
                    {ui.moreAbout}
                    <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Afsluiting ------------------------------------------------------ */}
        <section
          aria-labelledby="afsluiting-titel"
          className="mb-8 rounded-2xl border border-ink-700 bg-ink-900 px-6 py-12 text-center sm:px-10"
        >
          <h2 id="afsluiting-titel" className="display-2 mx-auto max-w-2xl">
            {page.ctaTitle}
          </h2>
          <p className="lede mx-auto mt-5">{page.ctaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`${home}#boeken`} className="btn btn-primary">
              {t.nav.book}
              <Arrow />
            </Link>
            <Link href={href("/contact", locale)} className="btn btn-ghost">
              {t.nav.contact}
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
