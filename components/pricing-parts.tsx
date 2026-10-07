import type { Dictionary } from "@/content/copy";

/**
 * Onderdelen van het tarievenoverzicht, gedeeld door de homepage en de
 * dienstpagina's. De prijzen zelf komen uit `home.packagePricing` en uit de
 * diensten in de beheeromgeving; hier staat alleen hoe ze eruitzien.
 */

type Tier = { prefix: string; amount: string; unit?: string; excl: string };

/** De prijsregel(s) van één dienst: bedrag incl. btw, met excl. btw eronder. */
export function PriceTiers({ tiers, inclVat }: { tiers: Tier[]; inclVat: string }) {
  return (
    <div className="space-y-3">
      {tiers.map((tier) => (
        <div key={tier.prefix}>
          <p className="numeric text-xl font-semibold leading-tight text-mist-100">
            <span className="mr-1.5 text-sm font-normal text-mist-500">{tier.prefix}</span>
            {tier.amount}
            <span className="ml-1.5 text-sm font-normal text-mist-300">
              {inclVat}
              {tier.unit && ` ${tier.unit}`}
            </span>
          </p>
          <p className="mt-1 text-sm text-mist-300">{tier.excl}</p>
        </div>
      ))}
    </div>
  );
}

/** Het kaartje met wat er altijd bij zit en welke extra kosten er kunnen zijn. */
export function PricingTerms({ t }: { t: Dictionary }) {
  return (
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
          <li key={item.text} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2">
            <span aria-hidden="true" className="pt-2.5 text-mist-600">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              {item.text}
              {item.sub && <span className="mt-0.5 block text-xs text-mist-500">{item.sub}</span>}
              {item.details && (
                <details className="group mt-1.5 text-xs">
                  <summary className="inline-flex w-fit cursor-pointer list-none items-center gap-1 text-haze-300 underline decoration-haze-300/40 underline-offset-4 hover:decoration-haze-300 [&::-webkit-details-marker]:hidden">
                    {item.detailsLabel}
                    <svg
                      aria-hidden="true"
                      width="8"
                      height="8"
                      viewBox="0 0 10 10"
                      fill="none"
                      className="transition-transform group-open:rotate-180"
                    >
                      <path
                        d="m1.5 3.5 3.5 3.5 3.5-3.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <p className="mt-1.5 leading-relaxed text-mist-300">{item.details}</p>
                </details>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
