"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";

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
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-ink-700/80 bg-ink-950/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          href={home}
          className="group flex items-center gap-2.5"
          aria-label={t.nav.homeAria}
        >
          <Mark />
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-mist-100"
                    : "text-mist-500 hover:text-mist-100"
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-600 text-mist-300"
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
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-mist-300 hover:bg-ink-800 hover:text-mist-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={bookingHref}
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-3"
            >
              {t.nav.book}
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
      className="rounded-full border border-ink-600 px-3 py-1.5 text-xs font-semibold text-mist-300 transition-colors hover:border-azure-500/60 hover:text-mist-100"
    >
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{label}</span>
    </Link>
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
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-azure-400 to-azure-600 shadow-[0_0_24px_-6px_var(--color-azure-500)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4.5 20 19H4L12 4.5Z"
          stroke="#04070d"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="14.5" r="1.9" fill="#04070d" />
      </svg>
    </span>
  );
}
