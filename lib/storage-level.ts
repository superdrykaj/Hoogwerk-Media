/**
 * Regels rond de opslag op het datavolume. Geen bestandssysteem, geen server:
 * alleen rekenen, zodat de drempels en de uploadcontrole zonder omgeving te
 * testen zijn.
 */

/** Vanaf dit percentage waarschuwt het overzicht. */
export const WARN_PERCENT = 80;
/** Vanaf dit percentage is het dringend. */
export const URGENT_PERCENT = 90;

export type StorageLevel = "ok" | "warn" | "urgent";

export function usageLevel(percent: number): StorageLevel {
  if (percent >= URGENT_PERCENT) return "urgent";
  if (percent >= WARN_PERCENT) return "warn";
  return "ok";
}

/** Gebruik als percentage van wat de server kan gebruiken (gebruikt + vrij, zoals `df`). */
export function usagePercent(usedBytes: number, freeBytes: number): number {
  const total = usedBytes + freeBytes;
  if (total <= 0) return 0;
  return (usedBytes / total) * 100;
}

/** "1,5 GB", "320 MB", "12 kB". Decimale eenheden, net als Fly en `df -H`. */
export function formatBytes(bytes: number): string {
  const units = ["B", "kB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;
  while (value >= 1000 && i < units.length - 1) {
    value /= 1000;
    i++;
  }
  const digits = i === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toLocaleString("nl-NL", { maximumFractionDigits: digits, minimumFractionDigits: 0 })} ${units[i]}`;
}

/**
 * Ruimte die vrij moet blijven voor de database, de back-ups en de
 * factuur-PDF's. Vol is voor een SQLite-database gevaarlijker dan voor een
 * map met video's: schrijven mislukt dan ook voor boekingen en facturen.
 * Standaard 10% van het volume, minimaal 64 MB.
 */
export function defaultReserveBytes(totalBytes: number): number {
  return Math.max(64 * 1000 * 1000, Math.round(totalBytes * 0.1));
}

export type UploadDecision = { ok: true } | { ok: false; message: string };

/**
 * Past een upload nog, zonder onder de reserve te komen? `declaredBytes` is de
 * grootte die de browser meestuurt; ontbreekt die (0), dan kan alleen worden
 * gecontroleerd of er überhaupt nog ruimte boven de reserve is.
 */
export function decideUpload(
  freeBytes: number,
  totalBytes: number,
  declaredBytes: number,
  reserveBytes: number = defaultReserveBytes(totalBytes),
): UploadDecision {
  const beschikbaar = freeBytes - reserveBytes;
  if (declaredBytes > 0 ? declaredBytes <= beschikbaar : beschikbaar > 0) return { ok: true };
  return {
    ok: false,
    message:
      `Te weinig ruimte op het datavolume: ${formatBytes(Math.max(0, freeBytes))} vrij, ` +
      (declaredBytes > 0 ? `dit bestand is ${formatBytes(declaredBytes)} en ` : "") +
      `${formatBytes(reserveBytes)} blijft gereserveerd voor de database en facturen. ` +
      "Verwijder oude opleverbestanden of vergroot het volume; er is niets geüpload.",
  };
}
