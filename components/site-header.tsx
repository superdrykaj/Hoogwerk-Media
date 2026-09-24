"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";

import { Arrow } from "@/components/arrow";
import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { href, otherLocale, switchPath, type Locale } from "@/lib/locale";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const pathname = usePathname();
  const andereTaal = otherLocale(locale);
  const nav = [
    { href: href("/", locale), label: t.nav.home },
    { href: href("/portfolio", locale), label: t.nav.portfolio },
    { href: href("/contact", locale), label: t.nav.contact },
  ];
  const [open, setOpen] = useState(false);

  const subscribe = useCallback((notify: () => void) => {
    window.addEventListener("scroll", notify, { passive: true });
    return () => window.removeEventListener("scroll", notify);
  }, []);
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 12,
    () => false,
  );

  // Sluit het mobiele menu zodra de bezoeker naar een andere pagina gaat.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const home = href("/", locale);
  const bookingHref = pathname === home ? "#boeken" : `${home}#boeken`;

  return (
    <header
      className={`sticky top-0 z-(--z-header) transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/*
        Bovenaan de pagina staat de kop doorzichtig over de hero-video. Die
        video heeft een lichte lucht, en daar haalt zelfs witte tekst maar zo'n
        2:1 aan contrast — ruim onder wat leesbaar is. Deze sluier loopt van
        donker naar niets en zit alleen in beeld zolang er niet gescrold is;
        daarna neemt de achtergrond van de kop het over.
      */}
      {!scrolled && !open && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[9rem] bg-gradient-to-b from-ink-950/80 via-ink-950/45 to-transparent"
        />
      )}

      <div className="container-page relative flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          href={home}
          className="group flex items-center gap-2.5"
          aria-label={t.nav.homeAria}
        >
          <Mark />
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            {site.name}
          </span>
        </Link>

        <nav aria-label={t.nav.mainMenu} className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active =
              item.href === home
                ? pathname === home
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                /*
                  Alle links zijn even licht. Bovenaan de pagina staat de kop
                  doorzichtig over de hero-video, en een grijze link is daar
                  niet te lezen. De actieve pagina herken je aan de streep
                  eronder, niet aan een lichtere kleur.
                */
                className={`rounded-full px-4 py-2 text-sm font-medium text-mist-100 underline-offset-8 transition-colors ${
                  active
                    ? "underline decoration-2"
                    : "decoration-mist-500/0 hover:underline hover:decoration-mist-500/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <LanguageSwitch
            href={switchPath(pathname ?? "/", andereTaal)}
            label={t.taalknop}
            short={t.taalknopKort}
            lang={andereTaal}
          />
          <Link href={bookingHref} className="btn btn-primary ml-2">
            {t.nav.book}
            <Arrow />
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitch
            href={switchPath(pathname ?? "/", andereTaal)}
            label={t.taalknop}
            short={t.taalknopKort}
            lang={andereTaal}
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobiel-menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mist-500/45 text-mist-100"
          >
            <span className="sr-only">
              {open ? t.nav.menuClose : t.nav.menuOpen}
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {open ? (
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobiel-menu" className="border-t border-ink-700 bg-ink-950 md:hidden">
          <nav aria-label={t.nav.mobileMenu} className="container-page flex flex-col py-3">
            {nav.map((item) => {
              const active =
                item.href === home
                  ? pathname === home
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-2 py-3 text-base text-mist-100 underline-offset-8 hover:bg-ink-800 ${
                    active ? "underline decoration-2" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={bookingHref}
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-3"
            >
              {t.nav.book}
              <Arrow />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/** Knop naar dezelfde pagina in de andere taal. */
function LanguageSwitch({
  href: to,
  label,
  short,
  lang,
}: {
  href: string;
  label: string;
  short: string;
  lang: Locale;
}) {
  return (
    <Link
      href={to}
      hrefLang={lang}
      lang={lang}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-full border border-mist-500/45 px-2.5 py-1.5 text-xs font-semibold text-mist-100 transition-colors hover:border-haze-300/70 hover:text-haze-300"
    >
      <Globe />
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/** Wereldbol bij de taalknop. Neemt de kleur van de knop over. */
function Globe() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      {/* Evenaar en meridiaan: genoeg om een bol te suggereren op 13 pixels. */}
      <path d="M1.75 8h12.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.75c1.6 1.7 2.5 3.9 2.5 6.25S9.6 12.55 8 14.25C6.4 12.55 5.5 10.35 5.5 8S6.4 3.45 8 1.75Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Mark() {
  // Eigen logo zodra dat in content/site.ts is ingesteld.
  if (site.logo) {
    return (
      <Image
        src={site.logo.src}
        alt=""
        width={site.logo.width}
        height={site.logo.height}
        priority
        className="h-9 w-auto"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-500/40 text-mist-100"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </span>
  );
}
