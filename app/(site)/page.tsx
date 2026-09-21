import Image from "next/image";
import Link from "next/link";

import { BookingWidget } from "@/components/booking/booking-widget";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { UnderConstruction } from "@/components/under-construction";
import { site } from "@/content/site";
import { listProjects } from "@/lib/projects";
import { listServices } from "@/lib/services";
import { siteIsOpen } from "@/lib/site-status";

// De boekingsmodule toont actuele beschikbaarheid, dus niets vooraf cachen.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Zolang de site dicht is, is dit de hele website.
  if (!(await siteIsOpen())) return <UnderConstruction />;

  const services = listServices({ onlyActive: true });
  const projects = listProjects({
    onlyPublished: true,
    featuredFirst: true,
    limit: 3,
  });

  return (
    <>
      <Hero />
      <Services />
      <Work projects={projects} />
      <Process />
      <Pricing services={services} />
      <Faq />
      <Booking services={services} />
      <About />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Hero() {
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
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/75 via-ink-950/35 to-ink-950"
      />

      <div className="container-page pb-16 pt-24 sm:pb-24">
        <h1 className="display-1 rise max-w-4xl">{site.heroTitle}</h1>
        <p className="lede rise mt-6" style={{ animationDelay: "120ms" }}>
          {site.heroIntro}
        </p>

        <div
          className="rise mt-9 flex flex-wrap gap-3"
          style={{ animationDelay: "220ms" }}
        >
          <a href="#boeken" className="btn btn-primary">
            Plan een afspraak
          </a>
          <Link href="/portfolio" className="btn btn-ghost">
            Bekijk het werk
          </Link>
        </div>

        {/* Harde feiten in plaats van een tweede alinea. */}
        <ul
          className="fade mt-10 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-mono)] text-xs text-mist-500"
          style={{ animationDelay: "380ms" }}
        >
          {site.heroFacts.map((fact) => (
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
function Services() {
  return (
    <section className="container-page section" aria-labelledby="diensten-titel">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Wat ik doe</p>
            <h2 id="diensten-titel" className="display-2 mt-4">
              Beeld dat op de grond niet past.
            </h2>
          </div>
        </Reveal>

        <div>
          {site.serviceHighlights.map((item, index) => (
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

function Work({ projects }: { projects: ReturnType<typeof listProjects> }) {
  return (
    <section
      className="section border-y border-ink-700/60 bg-ink-900/40"
      aria-labelledby="werk-titel"
    >
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Werk</p>
              <h2 id="werk-titel" className="display-2 mt-4 max-w-xl">
                Een selectie.
              </h2>
            </div>
            <Link href="/portfolio" className="btn btn-ghost">
              Alles bekijken
            </Link>
          </div>
        </Reveal>

        {projects.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-ink-600 px-6 py-16 text-center">
            <p className="text-mist-300">De eerste cases staan er binnenkort.</p>
            <p className="mt-2 text-sm text-mist-500">
              Projecten voeg je toe via de beheeromgeving.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 90}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Process() {
  return (
    <section className="container-page section" aria-labelledby="werkwijze-titel">
      <Reveal>
        <p className="eyebrow">Werkwijze</p>
        <h2 id="werkwijze-titel" className="display-2 mt-4 max-w-2xl">
          Van gesprek tot bestand.
        </h2>
      </Reveal>

      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {site.process.map((step, index) => (
          <Reveal key={step.title} delay={index * 80}>
            <li className="relative pt-6">
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
            </li>
          </Reveal>
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
function Pricing({ services }: { services: ReturnType<typeof listServices> }) {
  if (services.length === 0) return null;

  return (
    <section
      id="tarieven"
      className="section scroll-mt-24 border-t border-ink-700/60 bg-ink-900/40"
      aria-labelledby="tarieven-titel"
    >
      <div className="container-page">
        <Reveal>
          <p className="eyebrow">Tarieven</p>
          <h2 id="tarieven-titel" className="display-2 mt-4 max-w-2xl">
            Indicaties, met de inhoud erbij.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <ul className="border-t border-ink-700">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="grid gap-x-6 gap-y-1 border-b border-ink-700 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
                >
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="mt-1 max-w-prose text-sm leading-relaxed text-mist-500">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <p className="numeric font-[family-name:var(--font-mono)] text-sm text-haze-300 sm:text-right">
                    {service.priceLabel || "In overleg"}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-mist-600">
              Prijzen zijn indicaties, exclusief btw. Wat je precies nodig hebt,
              spreken we vooraf af.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="card p-6 sm:p-7">
              <h3 className="display-3">Wat je krijgt</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-mist-300">
                {site.included.map((item) => (
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

              <h3 className="display-3 mt-8">Apart afgerekend</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-mist-500">
                {site.excluded.map((item) => (
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
function Faq() {
  return (
    <section className="container-page section" aria-labelledby="faq-titel">
      <Reveal>
        <p className="eyebrow">Vragen</p>
        <h2 id="faq-titel" className="display-2 mt-4 max-w-2xl">
          Wat mag wel, en wat niet.
        </h2>
      </Reveal>

      <dl className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
        {site.faq.map((item, index) => (
          <Reveal key={item.question} delay={(index % 2) * 70}>
            <div className="border-t border-ink-700 pt-5">
              <dt className="display-3">{item.question}</dt>
              <dd className="mt-2.5 max-w-prose text-sm leading-relaxed text-mist-500">
                {item.answer}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Booking({ services }: { services: ReturnType<typeof listServices> }) {
  const publicServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    priceLabel: s.priceLabel,
    bookable: s.bookable,
    introOnly: s.introOnly,
  }));

  return (
    <section
      id="boeken"
      className="section scroll-mt-24 border-t border-ink-700/60 bg-ink-900/40"
      aria-labelledby="boeken-titel"
    >
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Plan een afspraak</p>
            <h2 id="boeken-titel" className="display-2 mt-4">
              Kies een moment.
            </h2>
            <p className="lede mx-auto mt-5">{site.bookingDisclaimer}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mx-auto mt-12 max-w-4xl">
            <BookingWidget services={publicServices} />
          </div>
        </Reveal>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-mist-600">
          Alle tijden in de Nederlandse tijdzone. Liever eerst overleggen?{" "}
          <Link href="/contact" className="link-quiet">
            Stuur een bericht
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function About() {
  return (
    <section className="container-page section" aria-labelledby="over-titel">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-ink-700">
            <Image
              src="/images/about.jpg"
              alt="Dronevlucht boven het Noord-Hollandse landschap"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div>
            <p className="eyebrow">Over mij</p>
            <h2 id="over-titel" className="display-2 mt-4">
              Eén aanspreekpunt.
            </h2>
            <div className="prose-body mt-6">
              <p>
                Ik ben Kai, zelfstandig dronepiloot in {site.region}. Geen
                tussenpersonen: ik plan, ik vlieg en ik lever op.
              </p>
              <p>
                Ik vlieg met een {site.equipment} — compact genoeg voor krappe
                locaties, met een sensor die ook in de schemering scherp blijft.
              </p>
            </div>
            <p className="mt-5 max-w-prose text-sm leading-relaxed text-mist-600">
              {site.business.complianceNote}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#boeken" className="btn btn-primary">
                Plan een afspraak
              </a>
              <Link href="/contact" className="btn btn-ghost">
                Neem contact op
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
