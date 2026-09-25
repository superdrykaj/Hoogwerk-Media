// Let op: dit bestand draait alleen op de server (leest de database).
import { getDb } from "./db";
import { DEFAULT_INVOICE_SETTINGS, DEFAULT_SETTINGS } from "./defaults";
import type { BookingSettings, InvoiceSettings } from "./types";

export { DEFAULT_INVOICE_SETTINGS, DEFAULT_SETTINGS };

export function getSettings(): BookingSettings {
  const rows = getDb()
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const num = (key: keyof BookingSettings) => {
    const raw = map.get(key);
    const parsed = raw === undefined ? NaN : Number(raw);
    return Number.isFinite(parsed) ? parsed : DEFAULT_SETTINGS[key];
  };
  return {
    slotIntervalMinutes: num("slotIntervalMinutes"),
    defaultBufferMinutes: num("defaultBufferMinutes"),
    minLeadHours: num("minLeadHours"),
    maxAdvanceDays: num("maxAdvanceDays"),
  };
}

export function saveSettings(next: BookingSettings): void {
  const stmt = getDb().prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  const write = getDb().transaction((values: BookingSettings) => {
    for (const [key, value] of Object.entries(values)) {
      stmt.run(key, String(value));
    }
  });
  write(next);
}

export function getInvoiceSettings(): InvoiceSettings {
  const rows = getDb()
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const str = (key: keyof InvoiceSettings) => map.get(key) ?? DEFAULT_INVOICE_SETTINGS[key];
  const rate = Number(map.get("vatRatePercent"));
  return {
    companyName: String(str("companyName")),
    companyAddress: String(str("companyAddress")),
    companyPostcode: String(str("companyPostcode")),
    companyCity: String(str("companyCity")),
    companyKvk: String(str("companyKvk")),
    companyVatNumber: String(str("companyVatNumber")),
    companyIban: String(str("companyIban")),
    vatRatePercent: Number.isFinite(rate) ? rate : DEFAULT_INVOICE_SETTINGS.vatRatePercent,
  };
}

export function saveInvoiceSettings(next: InvoiceSettings): void {
  const stmt = getDb().prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  const write = getDb().transaction((values: InvoiceSettings) => {
    for (const [key, value] of Object.entries(values)) {
      stmt.run(key, String(value));
    }
  });
  write(next);
}
