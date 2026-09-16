import type { BookingSettings } from "./types";

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
