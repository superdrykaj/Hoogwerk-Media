import Image from "next/image";
import Link from "next/link";

import { BookingWidget } from "@/components/booking/booking-widget";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { copy, type Dictionary } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";
import { listProjects } from "@/lib/projects";
import { serviceText } from "@/lib/localised";
import { listServices } from "@/lib/services";

export function HomePage({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const services = listServices({ onlyActive: true });
  const projects = listProjects({
    onlyPublished: true,
    featuredFirst: true,
    limit: 3,
  });

  return (
    <>
      <Hero t={t} locale={locale} />
      <Services t={t} locale={locale} services={services} />
      <Work t={t} locale={locale} projects={projects} />
      <Process t={t} />
      <Booking t={t} locale={locale} services={services} />
      <About t={t} locale={locale} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Hero({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section className="relative isolate -mt-[4.5rem] flex min-h-[92svh] items-end overflow-hidden pt-[4.5rem]">
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/70 via-ink-950/40 to-ink-950"
      />

      <div className="container-page pb-20 pt-24 sm:pb-28">
        <p className="eyebrow fade">{t.meta.tagline}</p>
        <h1 className="display-1 rise mt-5 max-w-4xl text-balance">
          {t.home.heroTitle}
        </h1>
        <p className="lede rise mt-7 max-w-2xl" style={{ animationDelay: "120ms" }}>
          {t.home.heroIntro}
        </p>
        <div
          className="rise mt-10 flex flex-wrap gap-3"
          style={{ animationDelay: "220ms" }}
        >
          <a href="#boeken" className="btn btn-primary">
            {t.nav.book}
          </a>
          <Link href={href("/portfolio", locale)} className="btn btn-ghost">
            {t.home.heroWork}
          </Link>
        </div>
        <p
          className="rise mt-8 text-xs text-mist-600"
          style={{ animationDelay: "320ms" }}
        >
          {t.home.heroNote}
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Services({
  t,
  locale,
  services,
}: {
  t: Dictionary;
  locale: Locale;
  services: Awaited<ReturnType<typeof listServices>>;
}) {
  return (
    <section className="container-page py-24" aria-labelledby="diensten-titel">
      <Reveal>
        <p className="eyebrow">{t.home.servicesEyebrow}</p>
        <h2 id="diensten-titel" className="display-2 mt-4 max-w-2xl text-balance">
          {t.home.servicesTitle}
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-4">
        {t.home.highlights.map((item, index) => (
          <Reveal key={item.title} delay={index * 70}>
            <article className="h-full bg-ink-900 p-7">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-azure-600/15 text-sm font-semibold text-azure-300"
              >
                {index + 1}
              </span>
              <h3 className="display-3 mt-5 text-base">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-500">{item.body}</p>
            </article>
          </Reveal>
        ))}
      </div>

      {services.length > 0 && (
        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink-700 px-5 py-4 sm:px-7">
              <h3 className="display-3 text-base">{t.home.pricesTitle}</h3>
              <p className="text-xs text-mist-600">{t.home.pricesNote}</p>
            </div>

            <ul className="divide-y divide-ink-700">
              {services.map((service) => {
                const tekst = serviceText(service, locale);
                return (
                <li key={service.id} className="px-5 py-4 sm:px-7">
                  {/* Onder sm staat de prijs altijd op een eigen regel, zodat
                      de lijst niet per dienst anders afbreekt. */}
                  <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-x-6">
                    <p className="font-medium">
                      {tekst.name}
                      <span className="ml-2 text-sm font-normal text-mist-600">
                        {service.introOnly
                          ? t.home.introDuration(service.durationMinutes)
                          : t.home.duration(service.durationMinutes)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-azure-300 sm:mt-0 sm:shrink-0">
                      {tekst.priceLabel || t.home.priceOnRequest}
                    </p>
                  </div>
                  {tekst.description && (
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mist-500">
                      {tekst.description}
                    </p>
                  )}
                </li>
                );
              })}
            </ul>

            <div className="border-t border-ink-700 px-5 py-4 sm:px-7">
              <a
                href="#boeken"
                className="text-sm font-medium text-azure-300 hover:underline"
              >
                {t.home.chooseMoment}
              </a>
            </div>
          </div>
        </Reveal>
      )}
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
  projects: Awaited<ReturnType<typeof listProjects>>;
}) {
  return (
    <section className="border-y border-ink-700/70 bg-ink-900/40 py-24" aria-labelledby="werk-titel">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{t.home.workEyebrow}</p>
              <h2 id="werk-titel" className="display-2 mt-4 max-w-xl text-balance">
                {t.home.workTitle}
              </h2>
            </div>
            <Link href={href("/portfolio", locale)} className="btn btn-ghost">
              {t.home.workAll}
            </Link>
          </div>
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
    <section className="container-page py-24" aria-labelledby="werkwijze-titel">
      <Reveal>
        <p className="eyebrow">{t.home.processEyebrow}</p>
        <h2 id="werkwijze-titel" className="display-2 mt-4 max-w-2xl text-balance">
          {t.home.processTitle}
        </h2>
      </Reveal>

      <ol className="mt-14 grid gap-8 md:grid-cols-4">
        {t.home.process.map((step, index) => (
          <Reveal key={step.title} delay={index * 80}>
            <li className="relative pt-6">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-azure-500/70 to-transparent"
              />
              <span className="text-sm font-semibold tabular-nums text-azure-300">
                0{index + 1}
              </span>
              <h3 className="display-3 mt-3 text-base">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-500">{step.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
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
  services: Awaited<ReturnType<typeof listServices>>;
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
      className="scroll-mt-24 border-t border-ink-700/70 bg-ink-900/40 py-24"
      aria-labelledby="boeken-titel"
    >
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{t.home.bookingEyebrow}</p>
            <h2 id="boeken-titel" className="display-2 mt-4 text-balance">
              {t.home.bookingTitle}
            </h2>
            <p className="lede mt-5">{t.home.bookingDisclaimer}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mx-auto mt-12 max-w-4xl">
            <BookingWidget services={publicServices} locale={locale} />
          </div>
        </Reveal>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-mist-600">
          {t.home.timezoneNote} {t.home.timezoneAsk}{" "}
          <Link
            href={href("/contact", locale)}
            className="text-azure-300 hover:underline"
          >
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
    <section className="container-page py-24" aria-labelledby="over-titel">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink-700">
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
            <h2 id="over-titel" className="display-2 mt-4 text-balance">
              {t.home.aboutTitle}
            </h2>
            <div className="prose-body mt-6">
              {t.home.aboutBody(t.region.short, site.equipment).map((alinea) => (
                <p key={alinea.slice(0, 24)}>{alinea}</p>
              ))}
            </div>
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
