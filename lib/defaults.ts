import type { BookingSettings, InvoiceSettings } from "./types";

/**
 * Standaard boekingsregels voor een nieuwe installatie.
 * Aan te passen in de beheeromgeving onder Instellingen.
 *
 * Staat los van lib/settings.ts, zodat lib/db.ts deze waarden kan gebruiken
 * bij de eerste start zonder een kringloop tussen die twee bestanden.
 */
export const DEFAULT_SETTINGS: BookingSettings = {
  /** Raster waarop tijdsloten beginnen, in minuten. */
  slotIntervalMinutes: 30,
  /** Standaard rusttijd tussen twee afspraken, in minuten. */
  defaultBufferMinutes: 30,
  /** Minimaal aantal uren tussen nu en de eerste boekbare afspraak. */
  minLeadHours: 24,
  /** Hoe ver vooruit bezoekers kunnen boeken, in dagen. */
  maxAdvanceDays: 60,
};

/**
 * Eigen bedrijfsgegevens voor op de factuur. Volledig fictief bij een verse
 * installatie — net als de rest van de voorbeeldgegevens in dit project. Vul
 * ze aan in Beheer → Instellingen zodra het KvK-nummer bekend is.
 */
export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  companyName: "Hoogbeeld Media",
  companyAddress: "Nog invullen",
  companyPostcode: "0000 AA",
  companyCity: "Nog invullen",
  companyKvk: "Nog niet ingevuld",
  companyVatNumber: "Nog niet ingevuld",
  companyIban: "Nog niet ingevuld",
  // Het standaard BTW-tarief in Nederland; van toepassing op foto- en
  // videodiensten. BTW wordt altijd verrekend, er is geen vrijstelling.
  vatRatePercent: 21,
};
