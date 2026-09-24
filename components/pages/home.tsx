import Image from "next/image";
import Link from "next/link";

import { BookingWidget } from "@/components/booking/booking-widget";
import { HeroVideo } from "@/components/hero-video";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { Showreel } from "@/components/showreel";
import { UnderConstruction } from "@/components/under-construction";
import { copy, type Dictionary } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";
import { serviceText } from "@/lib/localised";
import { listProjects } from "@/lib/projects";
import { listServices } from "@/lib/services";
import { siteIsOpen } from "@/lib/site-status";

export async function HomePage({ locale }: { locale: Locale }) {
  const t = copy(locale);

  // Zolang de site dicht is, is dit de hele website.
  if (!(await siteIsOpen())) return <UnderConstruction locale={locale} />;

  const services = listServices({ onlyActive: true });
  const projects = listProjects({
    onlyPublished: true,
    featuredFirst: true,
    limit: 3,
  });

  return (
    <>
      <Hero t={t} locale={locale} />
      <Services t={t} />
      <Work t={t} locale={locale} projects={projects} />
      <Process t={t} />
      <Pricing t={t} locale={locale} services={services} />
      <Faq t={t} />
      <Booking t={t} locale={locale} services={services} />
      <About t={t} locale={locale} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Hero({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section className="relative isolate -mt-[4.5rem] flex min-h-[92svh] items-end overflow-hidden pt-[4.5rem]">
      <HeroVideo alt={t.home.heroPosterAlt} />

      {/* Sluier over de video, zie .hero-scrim in globals.css. */}
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <div className="container-page pb-16 pt-24 sm:pb-24">
        <h1 className="display-1 rise max-w-4xl">{t.home.heroTitle}</h1>
        <p className="lede rise mt-6" style={{ animationDelay: "120ms" }}>
          {t.home.heroIntro}
        </p>

        <div
          className="rise mt-9 flex flex-wrap gap-3"
          style={{ animationDelay: "220ms" }}
        >
          <Link href={href("/contact", locale)} className="btn btn-primary">
            {t.home.heroCta}
          </Link>
          <Link href={href("/portfolio", locale)} className="btn btn-ghost">
            {t.home.heroWork}
          </Link>
        </div>

        {/* Harde feiten in plaats van een tweede alinea. */}
        <ul
          className="fade mt-10 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-mono)] text-xs text-mist-500"
          style={{ animationDelay: "380ms" }}
        >
          {t.home.heroFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Diensten als lijst, niet als vier gelijke kaartjes: zonder beeld per dienst
 * zijn kaarten lege dozen. Kop links, lijst rechts.
 */
function Services({ t }: { t: Dictionary }) {
  return (
    <section className="container-page section" aria-labelledby="diensten-titel">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">{t.home.servicesEyebrow}</p>
            <h2 id="diensten-titel" className="display-2 mt-4">
              {t.home.servicesTitle}
            </h2>
          </div>
        </Reveal>

        <div>
          {t.home.highlights.map((item, index) => (
            <Reveal key={item.title} delay={index * 70}>
              <article className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-ink-700 py-7 first:border-t-0 first:pt-0 sm:gap-x-8">
                <span
                  aria-hidden="true"
                  className="numeric pt-1 font-[family-name:var(--font-mono)] text-xs text-mist-600"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="display-3">{item.title}</h3>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-mist-500">
                    {item.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Work({
  t,
  locale,
  projects,
}: {
  t: Dictionary;
  locale: Locale;
  projects: ReturnType<typeof listProjects>;
}) {
  return (
    <section
      className="section border-y border-ink-700/60 bg-ink-900/40"
      aria-labelledby="werk-titel"
    >
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{t.home.workEyebrow}</p>
              <h2 id="werk-titel" className="display-2 mt-4 max-w-xl">
                {t.home.workTitle}
              </h2>
              <p className="lede mt-5">{t.home.workIntro}</p>
            </div>
            <Link href={href("/portfolio", locale)} className="btn btn-ghost">
              {t.home.workAll}
            </Link>
          </div>

          <Showreel t={t} />
        </Reveal>

        {projects.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-ink-600 px-6 py-16 text-center">
            <p className="text-mist-300">{t.home.workEmpty}</p>
            <p className="mt-2 text-sm text-mist-500">{t.home.workEmptyHint}</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 90}>
                <ProjectCard project={project} locale={locale} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Process({ t }: { t: Dictionary }) {
  return (
    <section className="container-page section" aria-labelledby="werkwijze-titel">
      <Reveal>
        <p className="eyebrow">{t.home.processEyebrow}</p>
        <h2 id="werkwijze-titel" className="display-2 mt-4 max-w-2xl">
          {t.home.processTitle}
        </h2>
      </Reveal>

      {/* Reveal staat binnen de <li>, niet eromheen: een <ol> mag alleen
          <li> als kind hebben, en Reveal rendert een <div>. */}
      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {t.home.process.map((step, index) => (
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
              <p className="mt-2 text-sm leading-relaxed text-mist-500">
                {step.body}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Tarieven met de inhoud ernaast. Een prijs zonder scope levert discussie op
 * bij de eerste factuur; daarom staat hier meteen wat er wel en niet in zit.
 */
function Pricing({
  t,
  locale,
  services,
}: {
  t: Dictionary;
  locale: Locale;
  services: ReturnType<typeof listServices>;
}) {
  if (services.length === 0) return null;

  return (
    <section
      id="tarieven"
      className="section scroll-mt-24 border-t border-ink-700/60 bg-ink-900/40"
      aria-labelledby="tarieven-titel"
    >
      <div className="container-page">
        <Reveal>
          <p className="eyebrow">{t.home.pricingEyebrow}</p>
          <h2 id="tarieven-titel" className="display-2 mt-4 max-w-2xl">
            {t.home.pricingTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <ul className="border-t border-ink-700">
              {services.map((service) => {
                const tekst = serviceText(service, locale);
                return (
                  <li
                    key={service.id}
                    className="grid gap-x-6 gap-y-1 border-b border-ink-700 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
                  >
                    <div>
                      <p className="font-medium">{tekst.name}</p>
                      {tekst.description && (
                        <p className="mt-1 max-w-prose text-sm leading-relaxed text-mist-500">
                          {tekst.description}
                        </p>
                      )}
                    </div>
                    <p className="numeric font-[family-name:var(--font-mono)] text-sm text-haze-300 sm:text-right">
                      {tekst.priceLabel || t.home.priceOnRequest}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-mist-600">{t.home.pricingNote}</p>
          </Reveal>

          <Reveal delay={100}>
            <div className="card p-6 sm:p-7">
              <h3 className="display-3">{t.home.includedTitle}</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-mist-300">
                {t.home.included.map((item) => (
                  <li key={item} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2">
                    <span aria-hidden="true" className="pt-2 text-haze-400">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1 5.2 3.6 8 9 1.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="display-3 mt-8">{t.home.excludedTitle}</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-mist-500">
                {t.home.excluded.map((item) => (
                  <li key={item} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2">
                    <span aria-hidden="true" className="pt-2.5 text-mist-600">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1.5 5h7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Vragen in twee kolommen, niet als uitklapmenu: alles staat er meteen, en wie
 * zich afvraagt of dit wel mag, hoeft niet te klikken om het antwoord te zien.
 */
function Faq({ t }: { t: Dictionary }) {
  return (
    <section className="container-page section" aria-labelledby="faq-titel">
      <Reveal>
        <p className="eyebrow">{t.home.faqEyebrow}</p>
        <h2 id="faq-titel" className="display-2 mt-4 max-w-2xl">
          {t.home.faqTitle}
        </h2>
      </Reveal>

      <dl className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
        {/* Eén <div> per vraag-en-antwoord, en niet dieper: een <dl> mag een
            <div> om elke groep hebben, maar geen <div> in een <div>. Reveal is
            die ene laag, dus de opmaak gaat mee in zijn className. */}
        {t.home.faq.map((item, index) => (
          <Reveal
            key={item.question}
            delay={(index % 2) * 70}
            className="border-t border-ink-700 pt-5"
          >
            <dt className="display-3">{item.question}</dt>
            <dd className="mt-2.5 max-w-prose text-sm leading-relaxed text-mist-500">
              {item.answer}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Booking({
  t,
  locale,
  services,
}: {
  t: Dictionary;
  locale: Locale;
  services: ReturnType<typeof listServices>;
}) {
  // Alleen wat de browser nodig heeft, en meteen in de juiste taal.
  const publicServices = services.map((s) => {
    const tekst = serviceText(s, locale);
    return {
      id: s.id,
      name: tekst.name,
      description: tekst.description,
      durationMinutes: s.durationMinutes,
      priceLabel: tekst.priceLabel,
      bookable: s.bookable,
      introOnly: s.introOnly,
    };
  });

  return (
    <section
      id="boeken"
      className="section scroll-mt-24 border-t border-ink-700/60 bg-ink-900/40"
      aria-labelledby="boeken-titel"
    >
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{t.home.bookingEyebrow}</p>
            <h2 id="boeken-titel" className="display-2 mt-4">
              {t.home.bookingTitle}
            </h2>
            <p className="lede mx-auto mt-5">{t.home.bookingDisclaimer}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mx-auto mt-12 max-w-4xl">
            <BookingWidget services={publicServices} locale={locale} />
          </div>
        </Reveal>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-mist-600">
          {t.home.timezoneNote} {t.home.timezoneAsk}{" "}
          <Link href={href("/contact", locale)} className="link-quiet">
            {t.home.timezoneLink}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function About({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section className="container-page section" aria-labelledby="over-titel">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-ink-700">
            <Image
              src="/images/about.jpg"
              alt={t.home.aboutImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div>
            <p className="eyebrow">{t.home.aboutEyebrow}</p>
            <h2 id="over-titel" className="display-2 mt-4">
              {t.home.aboutTitle}
            </h2>
            <div className="prose-body mt-6">
              {t.home.aboutBody(t.region.short, site.equipment).map((alinea) => (
                <p key={alinea.slice(0, 24)}>{alinea}</p>
              ))}
            </div>
            <p className="mt-5 max-w-prose text-sm leading-relaxed text-mist-600">
              {t.footer.complianceNote}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#boeken" className="btn btn-primary">
                {t.nav.book}
              </a>
              <Link href={href("/contact", locale)} className="btn btn-ghost">
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
