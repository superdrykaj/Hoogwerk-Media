import Link from "next/link";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const year = new Date().getFullYear();
  const nav = [
    { href: href("/", locale), label: t.nav.home },
    { href: href("/portfolio", locale), label: t.nav.portfolio },
    { href: href("/contact", locale), label: t.nav.contact },
  ];
  return (
    <footer className="mt-24 border-t border-ink-700/70 bg-ink-900">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {site.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist-500">
            {t.footer.note}
          </p>
          <p className="mt-4 text-sm text-mist-500">
            {t.footer.workArea}{" "}
            <span className="text-mist-300">{t.region.short}</span>
          </p>
        </div>

        <nav aria-label={t.nav.footerMenu}>
          <h2 className="text-sm font-semibold text-mist-100">{t.nav.menuHeading}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-mist-500 hover:text-mist-100">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={href("/privacy", locale)}
                className="text-mist-500 hover:text-mist-100"
              >
                {t.nav.privacy}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-mist-100">{t.nav.contactHeading}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="text-mist-500 hover:text-mist-100"
              >
                {site.email}
              </a>
            </li>
            {site.phone && (
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="text-mist-500 hover:text-mist-100"
                >
                  {site.phone}
                </a>
              </li>
            )}
            <li>
              <Link
                href={`${href("/", locale)}#boeken`}
                className="text-azure-300 hover:text-azure-400"
              >
                {t.nav.book}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-700/70">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-mist-600 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.rights(year)}</p>
          <Link href="/admin" className="hover:text-mist-300">
            {t.nav.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
