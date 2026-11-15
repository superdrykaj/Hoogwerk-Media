import { calculateVatBreakdown } from "./currency";
import { addDays } from "./time";
import type { InvoiceSettings } from "./types";

/**
 * Regels voor een factuur die aan de eisen van de Belastingdienst voldoet.
 * Geen databasetoegang, zodat dit zonder server te testen is.
 *
 * Verplichte gegevens (artikel 35a Wet OB, zie Belastingdienst, "Factuureisen"):
 *  - datum van uitgifte en een uniek, doorlopend factuurnummer;
 *  - naam en adres van de leverancier, en bij btw-plicht het btw-identificatienummer;
 *  - naam en adres van de afnemer;
 *  - omschrijving van de geleverde dienst;
 *  - datum van levering of uitvoering (als die van de factuurdatum verschilt);
 *  - het bedrag exclusief btw, het btw-tarief en het btw-bedrag;
 *  - bij 0% of geen btw de reden daarvan (bijvoorbeeld de kleineondernemersregeling).
 * Daarnaast gebruikelijk en hier meegenomen: KvK-nummer, IBAN en betaaltermijn.
 */

/** Tekst die in nieuwe installaties als invulplek staat en nooit op een factuur hoort. */
const PLACEHOLDERS = [/nog invullen/i, /nog niet ingevuld/i, /^0000\s?AA$/i, /^xxx/i];

export function isPlaceholder(value: string): boolean {
  const v = value.trim();
  return v === "" || PLACEHOLDERS.some((re) => re.test(v));
}

/** "nl91 abna 0417 1643 00" → "NL91ABNA0417164300". */
export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** Controle volgens ISO 13616: landcode, lengte en modulo 97. */
export function isValidIban(value: string): boolean {
  const iban = normalizeIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  // Een Nederlandse IBAN is altijd 18 tekens: NL + 2 cijfers + 4 letters + 10 cijfers.
  if (iban.startsWith("NL") && !/^NL\d{2}[A-Z]{4}\d{10}$/.test(iban)) return false;
  const herschikt = iban.slice(4) + iban.slice(0, 4);
  let rest = 0;
  for (const teken of herschikt) {
    const waarde = teken >= "A" ? teken.charCodeAt(0) - 55 : Number(teken);
    rest = Number(String(rest) + String(waarde)) % 97;
  }
  return rest === 1;
}

/** "NL 8123.45.678 B01" → "NL812345678B01". */
export function normalizeVatId(value: string): string {
  return value.replace(/[\s.]+/g, "").toUpperCase();
}

/** Nederlands btw-identificatienummer: NL, negen cijfers, B, twee cijfers. */
export function isValidVatId(value: string): boolean {
  return /^NL\d{9}B\d{2}$/.test(normalizeVatId(value));
}

export function isValidKvk(value: string): boolean {
  return /^\d{8}$/.test(value.trim());
}

export function isValidDutchPostcode(value: string): boolean {
  return /^[1-9]\d{3}\s?[A-Za-z]{2}$/.test(value.trim());
}

/** "1234ab" → "1234 AB". */
export function formatPostcode(value: string): string {
  const v = value.trim().toUpperCase().replace(/\s+/g, "");
  return /^\d{4}[A-Z]{2}$/.test(v) ? `${v.slice(0, 4)} ${v.slice(4)}` : value.trim();
}

/** "NL91ABNA0417164300" → "NL91 ABNA 0417 1643 00", voor op de factuur. */
export function formatIban(value: string): string {
  return normalizeIban(value).replace(/(.{4})/g, "$1 ").trim();
}

/** Wat er in de bedrijfsgegevens ontbreekt of niet klopt, in gewone taal. Leeg = klaar. */
export function supplierProblems(s: InvoiceSettings): string[] {
  const out: string[] = [];
  if (isPlaceholder(s.companyName)) out.push("de bedrijfsnaam");
  if (isPlaceholder(s.companyAddress)) out.push("het adres");
  if (isPlaceholder(s.companyPostcode) || !isValidDutchPostcode(s.companyPostcode)) {
    out.push("een geldige postcode");
  }
  if (isPlaceholder(s.companyCity)) out.push("de plaats");
  if (!isValidKvk(s.companyKvk)) out.push("een KvK-nummer van 8 cijfers");
  if (isPlaceholder(s.companyIban) || !isValidIban(s.companyIban)) {
    out.push("een geldig IBAN");
  }
  // Met btw op de factuur hoort een btw-identificatienummer erbij. Bij 0%
  // (kleineondernemersregeling) is dat niet verplicht.
  if (s.vatRatePercent > 0 && (isPlaceholder(s.companyVatNumber) || !isValidVatId(s.companyVatNumber))) {
    out.push("een btw-identificatienummer (NL123456789B01)");
  }
  return out;
}

export type CustomerDetails = {
  name: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  /** Alleen bij zakelijke klanten, bijvoorbeeld voor verlegging binnen de EU. */
  vatId: string;
};

/** Wat er in de klantgegevens ontbreekt. Leeg = klaar. */
export function customerProblems(c: CustomerDetails): string[] {
  const out: string[] = [];
  if (!c.name.trim()) out.push("de naam van de klant");
  if (!c.address.trim()) out.push("het adres van de klant");
  if (!c.postcode.trim()) out.push("de postcode van de klant");
  if (!c.city.trim()) out.push("de plaats van de klant");
  if (!c.country.trim()) out.push("het land van de klant");
  return out;
}

export const DEFAULT_PAYMENT_TERM_DAYS = 14;

/** Is dit een bestaande kalenderdatum in de vorm JJJJ-MM-DD? */
export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export const KOR_NOTE =
  "Op deze factuur is geen btw berekend: de kleineondernemersregeling (KOR) is van toepassing.";

/**
 * De vastgelegde factuur. Wordt bij het uitgeven in de database bewaard en
 * daarna nooit meer aangepast; het PDF wordt hieruit opgebouwd.
 */
export type InvoiceSnapshot = {
  version: 1;
  /** Factuur van vóór de invoering van deze vastlegging; klantadres ontbreekt dan. */
  legacy: boolean;
  number: string;
  /** JJJJ-MM-DD, Europe/Amsterdam. */
  invoiceDate: string;
  deliveryDate: string;
  dueDate: string;
  paymentTermDays: number;
  bookingReference: string;
  supplier: {
    name: string;
    address: string;
    postcode: string;
    city: string;
    kvk: string;
    vatId: string;
    iban: string;
    email: string;
  };
  customer: CustomerDetails;
  description: string;
  /** Bedragen in centen. */
  subtotalCents: number;
  vatRatePercent: number;
  vatCents: number;
  totalCents: number;
  /** Uitleg bij 0% btw; leeg bij een gewone factuur. */
  vatNote: string;
};

export function buildSnapshot(input: {
  legacy?: boolean;
  number: string;
  invoiceDate: string;
  deliveryDate: string;
  paymentTermDays: number;
  bookingReference: string;
  supplier: InvoiceSettings;
  supplierEmail: string;
  customer: CustomerDetails;
  description: string;
  totalCents: number;
}): InvoiceSnapshot {
  const { subtotalCents, vatCents } = calculateVatBreakdown(
    input.totalCents,
    input.supplier.vatRatePercent,
  );
  return {
    version: 1,
    legacy: input.legacy ?? false,
    number: input.number,
    invoiceDate: input.invoiceDate,
    deliveryDate: input.deliveryDate,
    dueDate: addDays(input.invoiceDate, input.paymentTermDays),
    paymentTermDays: input.paymentTermDays,
    bookingReference: input.bookingReference,
    supplier: {
      name: input.supplier.companyName.trim(),
      address: input.supplier.companyAddress.trim(),
      postcode: formatPostcode(input.supplier.companyPostcode),
      city: input.supplier.companyCity.trim(),
      kvk: input.supplier.companyKvk.trim(),
      vatId: input.supplier.vatRatePercent > 0 ? normalizeVatId(input.supplier.companyVatNumber) : "",
      iban: normalizeIban(input.supplier.companyIban),
      email: input.supplierEmail,
    },
    customer: {
      name: input.customer.name.trim(),
      address: input.customer.address.trim(),
      postcode: input.customer.postcode.trim(),
      city: input.customer.city.trim(),
      country: input.customer.country.trim(),
      vatId: input.customer.vatId.trim() ? normalizeVatId(input.customer.vatId) : "",
    },
    description: input.description.trim(),
    subtotalCents,
    vatRatePercent: input.supplier.vatRatePercent,
    vatCents,
    totalCents: input.totalCents,
    vatNote: input.supplier.vatRatePercent > 0 ? "" : KOR_NOTE,
  };
}
