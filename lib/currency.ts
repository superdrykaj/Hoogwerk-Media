/**
 * Bedragen in centen ↔ tekst. Geen databasetoegang, dus dit mag ook in
 * clientcomponenten worden geïmporteerd (de opleveringspagina en het
 * factuurpaneel in de beheeromgeving tonen allebei bedragen).
 */
import { INTL_LOCALE, type Locale } from "./locale";

/** "1234" cent, "nl" → "€ 12,34". Voor in mails en op de opleveringspagina. */
export function formatAmountCents(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/**
 * "250,00" of "250.00" → 25000 cent. Accepteert zowel de Nederlandse komma
 * als de punt, want het invoerveld is een gewoon tekstveld. Null bij ongeldige
 * of negatieve invoer.
 */
export function parseAmountInput(value: string): number | null {
  const genormaliseerd = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(genormaliseerd)) return null;
  const bedrag = Number(genormaliseerd);
  if (!Number.isFinite(bedrag) || bedrag < 0) return null;
  return Math.round(bedrag * 100);
}

/**
 * Splitst een totaalbedrag (inclusief BTW — zo vult Kai het bedrag altijd in,
 * net als bij de dienstprijzen) terug naar het bedrag exclusief BTW en het
 * BTW-bedrag zelf, voor op de factuur. BTW wordt altijd verrekend; er is geen
 * vrijstelling.
 */
export function calculateVatBreakdown(
  totalCents: number,
  vatRatePercent: number,
): { subtotalCents: number; vatCents: number; totalCents: number } {
  const subtotalCents = Math.round(totalCents / (1 + vatRatePercent / 100));
  return { subtotalCents, vatCents: totalCents - subtotalCents, totalCents };
}
