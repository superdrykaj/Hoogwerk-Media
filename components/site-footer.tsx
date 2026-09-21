import Link from "next/link";

import { site } from "@/content/site";

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

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { business } = site;
  const hasDetails = Boolean(
    business.kvk || business.vat || business.droneOperator || business.insurer,
  );

  return (
    <footer className="mt-24 border-t border-ink-700/60 bg-ink-900">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            {site.name}
          </p>
          <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-mist-600">
            {site.motto}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist-500">
            {site.footerNote}
          </p>
          <p className="mt-4 text-sm text-mist-500">
            Werkgebied: <span className="text-mist-300">{site.region}</span>
          </p>
        </div>

        <nav aria-label="Footermenu">
          <h2 className="text-sm font-medium text-mist-100">Menu</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-mist-500 hover:text-mist-100">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#tarieven" className="text-mist-500 hover:text-mist-100">
                Tarieven
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-mist-500 hover:text-mist-100">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-medium text-mist-100">Contact</h2>
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
                  WhatsApp
                </a>
              </li>
            )}
            {site.instagram && (
              <li>
                <a
                  href={site.instagram}
                  className="text-mist-500 hover:text-mist-100"
                >
                  Instagram
                </a>
              </li>
            )}
            <li>
              <Link href="/#boeken" className="link-quiet">
                Plan een afspraak
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
            <Detail label="KvK" value={business.kvk} />
            <Detail label="BTW" value={business.vat} />
            <Detail label="Exploitant" value={business.droneOperator} />
            <Detail label="Verzekerd bij" value={business.insurer} />
          </ul>
        </div>
      )}

      <div className="border-t border-ink-700/60">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-mist-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <Link href="/admin" className="hover:text-mist-300">
            Beheer
          </Link>
        </div>
      </div>
    </footer>
  );
}
