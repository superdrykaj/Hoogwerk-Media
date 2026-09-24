import Link from "next/link";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";

/**
 * Regel met een bedrijfsgegeven. Is de waarde nog niet ingevuld, dan valt de
 * regel weg: liever niets dan een lege plek of een verzonnen nummer.
 */
function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <li className="flex gap-x-2">
      <span className="text-mist-600">{label}</span>
      <span className="numeric text-mist-300">{value}</span>
    </li>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const year = new Date().getFullYear();
  const { business } = site;
  const home = href("/", locale);
  const hasDetails = Boolean(
    business.kvk || business.vat || business.droneOperator || business.insurer,
  );
  const nav = [
    { href: home, label: t.nav.home },
    { href: href("/portfolio", locale), label: t.nav.portfolio },
    { href: href("/contact", locale), label: t.nav.contact },
  ];

  return (
    <footer className="mt-24 border-t border-ink-700/60 bg-ink-900">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            {site.name}
          </p>
          <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-mist-600">
            {t.motto}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist-500">
            {t.footer.note}
          </p>
          <p className="mt-4 text-sm text-mist-500">
            {t.footer.workArea}{" "}
            <span className="text-mist-300">{t.region.short}</span>
          </p>
        </div>

        <nav aria-label={t.nav.footerMenu}>
          <h2 className="text-sm font-medium text-mist-100">{t.nav.menuHeading}</h2>
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
                href={`${home}#tarieven`}
                className="text-mist-500 hover:text-mist-100"
              >
                {t.home.pricingEyebrow}
              </Link>
            </li>
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
          <h2 className="text-sm font-medium text-mist-100">{t.nav.contactHeading}</h2>
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
                  className="numeric text-mist-500 hover:text-mist-100"
                >
                  {site.phone}
                </a>
              </li>
            )}
            {site.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  className="text-mist-500 hover:text-mist-100"
                >
                  {t.footer.whatsapp}
                </a>
              </li>
            )}
            {site.instagram && (
              <li>
                <a
                  href={site.instagram}
                  className="text-mist-500 hover:text-mist-100"
                >
                  {t.footer.instagram}
                </a>
              </li>
            )}
            <li>
              <Link href={`${home}#boeken`} className="link-quiet">
                {t.nav.book}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bedrijfsgegevens. Verschijnt zodra er in content/site.ts iets is
          ingevuld; zolang alles leeg is, staat hier niets. */}
      {hasDetails && (
        <div className="border-t border-ink-700/60">
          <ul className="container-page flex flex-wrap gap-x-8 gap-y-2 py-5 font-[family-name:var(--font-mono)] text-xs">
            <Detail label={t.footer.kvk} value={business.kvk} />
            <Detail label={t.footer.vat} value={business.vat} />
            <Detail label={t.footer.operator} value={business.droneOperator} />
            <Detail label={t.footer.insurer} value={business.insurer} />
          </ul>
        </div>
      )}

      <div className="border-t border-ink-700/60">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-mist-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          {/* De beheeromgeving staat op disallow in robots.txt. Zonder
              nofollow lopen crawlers er toch op af en melden ze een
              geblokkeerde link. */}
          <Link href="/admin" rel="nofollow" className="hover:text-mist-300">
            {t.nav.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
