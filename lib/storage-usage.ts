import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { DATA_DIR, DB_PATH, UPLOAD_DIR } from "./db";
import { decideUpload, usagePercent, type UploadDecision } from "./storage-level";

/**
 * Meting van het datavolume (/data op Fly): totaal, gebruikt, vrij, en waar de
 * ruimte aan opgaat. Alles komt uit het bestandssysteem zelf (statfs en de
 * werkelijke bestandsgroottes). Lukt een meting niet, dan staat er een fout en
 * geen getal: er wordt niets geschat of ingevuld.
 *
 * Alleen lezen: er wordt niets verwijderd, verplaatst of vergroot.
 */

export type StoragePart = {
  key: string;
  label: string;
  /** Gemeten bytes; null als dit onderdeel niet te meten was. */
  bytes: number | null;
  /** Waar het onderdeel staat, relatief aan het datavolume of als pad. */
  where: string;
  /** Alleen een ondergrens: de meting is onderbroken (te veel bestanden of te lang). */
  partial?: boolean;
  /** Waarom er geen (volledig) getal is, in gewone taal. */
  error?: string;
  /** Opmerking bij een gemeten onderdeel. */
  note?: string;
};

export type StorageVolume = {
  /** Wat de server kan gebruiken: gebruikt + vrij (zoals `df`). */
  usableBytes: number;
  usedBytes: number;
  freeBytes: number;
  percent: number;
  /** Door het bestandssysteem gereserveerd, buiten bovenstaande getallen. */
  reservedBytes: number;
};

export type StorageReport = {
  measuredAt: number;
  dataDir: string;
  volume: StorageVolume | null;
  /** Waarom het volume niet gemeten kon worden. */
  volumeError?: string;
  /** Staat de gegevensmap op een eigen volume, of op de systeemschijf van de machine? Null: niet te bepalen. */
  separateVolume: boolean | null;
  parts: StoragePart[];
  /** Wat niet bij een onderdeel hoort; null als dat niet betrouwbaar te bepalen is. */
  other: { bytes: number | null; note: string };
};

type DirMeasure = { bytes: number; entries: number; partial: boolean; missing: boolean; error?: string };

/**
 * Schijfgebruik van een map, zoals `du`: de ruimte die bestanden echt innemen
 * (blokken), niet de schijnbare grootte; een sparse bestand telt dus niet te
 * groot. Volgt geen symbolische links.
 */
export async function measureDirectory(
  root: string,
  options: { skip?: string[]; maxEntries?: number; deadline?: number } = {},
): Promise<DirMeasure> {
  const maxEntries = options.maxEntries ?? 500_000;
  const deadline = options.deadline ?? Date.now() + 10_000;
  const skip = new Set((options.skip ?? []).map((p) => path.resolve(p)));
  const result: DirMeasure = { bytes: 0, entries: 0, partial: false, missing: false };

  try {
    const st = await fs.lstat(root);
    if (!st.isDirectory()) {
      result.bytes = diskBytes(st);
      result.entries = 1;
      return result;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { ...result, missing: true };
    return { ...result, partial: true, error: leesbareFout(error) };
  }

  const stack = [path.resolve(root)];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    let names: import("node:fs").Dirent[];
    try {
      names = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      result.partial = true;
      result.error ??= `${path.relative(root, dir) || "."}: ${leesbareFout(error)}`;
      continue;
    }
    for (const entry of names) {
      if (++result.entries > maxEntries || Date.now() > deadline) {
        result.partial = true;
        result.error ??= result.entries > maxEntries ? "te veel bestanden om te tellen" : "de meting duurde te lang";
        return result;
      }
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!skip.has(full)) stack.push(full);
        continue;
      }
      try {
        const st = await fs.lstat(full);
        result.bytes += diskBytes(st);
      } catch (error) {
        // Een bestand dat tijdens het tellen verdwijnt is geen fout; al het andere wel.
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          result.partial = true;
          result.error ??= `${path.relative(root, full)}: ${leesbareFout(error)}`;
        }
      }
    }
  }
  return result;
}

/** Werkelijk ingenomen ruimte: blokken, niet de schijnbare grootte. Een sparse bestand kan 0 blokken hebben. */
function diskBytes(st: { blocks?: number; size: number }): number {
  return typeof st.blocks === "number" ? st.blocks * 512 : st.size;
}

function leesbareFout(error: unknown): string {
  const code = (error as NodeJS.ErrnoException)?.code;
  const tekst = error instanceof Error ? error.message : String(error);
  return code ? `${code} (${tekst})` : tekst;
}

async function part(
  key: string,
  label: string,
  where: string,
  dir: string,
  options: Parameters<typeof measureDirectory>[1],
  note?: string,
): Promise<StoragePart> {
  const m = await measureDirectory(dir, options);
  if (m.missing) return { key, label, where, bytes: 0, note: note ?? "Deze map bestaat nog niet; er is niets opgeslagen." };
  if (m.error && m.partial && m.bytes === 0) return { key, label, where, bytes: null, error: m.error };
  return { key, label, where, bytes: m.bytes, partial: m.partial || undefined, error: m.partial ? m.error : undefined, note };
}

async function measureFiles(key: string, label: string, where: string, files: string[]): Promise<StoragePart> {
  let bytes = 0;
  let found = 0;
  for (const file of files) {
    try {
      const st = await fs.lstat(file);
      bytes += diskBytes(st);
      found++;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        return { key, label, where, bytes: null, error: `${path.basename(file)}: ${leesbareFout(error)}` };
      }
    }
  }
  if (found === 0) return { key, label, where, bytes: null, error: "Databasebestand niet gevonden op de verwachte plek." };
  return { key, label, where, bytes };
}

export async function measureStorage(
  options: { dataDir?: string; dbPath?: string; uploadDir?: string; maxEntries?: number; timeBudgetMs?: number } = {},
): Promise<StorageReport> {
  // Het datavolume ligt buiten de projectmap; de meting hoort niet de hele build mee te slepen.
  const dataDir = path.resolve(/*turbopackIgnore: true*/ options.dataDir ?? DATA_DIR);
  const dbPath = path.resolve(/*turbopackIgnore: true*/ options.dbPath ?? DB_PATH);
  const uploadDir = path.resolve(/*turbopackIgnore: true*/ options.uploadDir ?? UPLOAD_DIR);
  const budget = { maxEntries: options.maxEntries, deadline: Date.now() + (options.timeBudgetMs ?? 8_000) };
  const measuredAt = Date.now();

  // Het volume zelf.
  let volume: StorageVolume | null = null;
  let volumeError: string | undefined;
  let separateVolume: boolean | null = null;
  try {
    const s = await fs.statfs(dataDir);
    const used = (s.blocks - s.bfree) * s.bsize;
    const free = s.bavail * s.bsize;
    const usable = used + free;
    volume = {
      usableBytes: usable,
      usedBytes: used,
      freeBytes: free,
      percent: usagePercent(used, free),
      reservedBytes: Math.max(0, s.bfree * s.bsize - free),
    };
    try {
      const [a, b] = await Promise.all([fs.stat(/*turbopackIgnore: true*/ dataDir), fs.stat("/")]);
      separateVolume = a.dev !== b.dev;
    } catch {
      separateVolume = null;
    }
  } catch (error) {
    volumeError = `Het volume is niet uit te lezen: ${leesbareFout(error)}`;
  }

  const deliveries = path.join(dataDir, "deliveries");
  const previews = path.join(deliveries, "previews");
  const dbInside = dbPath.startsWith(dataDir + path.sep);

  const parts = await Promise.all([
    part("deliveries", "Opleverbestanden (originelen)", "deliveries/", deliveries, { ...budget, skip: [previews] }),
    part("previews", "Voorbeelden met watermerk", "deliveries/previews/", previews, budget),
    part("invoices", "Facturen (PDF)", "invoices/", path.join(dataDir, "invoices"), budget),
    measureFiles("database", "Database", path.relative(dataDir, dbPath) || dbPath, [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]).then(
      (p) => (dbInside ? p : { ...p, note: "De database staat buiten het datavolume en telt niet mee in het gebruik." }),
    ),
    part("backups", "Back-ups", "backups/", path.join(dataDir, "backups"), budget),
    part("uploads", "Website-uploads (projectfoto's en -video's)", "uploads/", uploadDir, budget),
  ]);

  // Wat er overblijft, alleen als alle onderdelen volledig zijn gemeten.
  const tellen = parts.filter((p) => p.key !== "database" || dbInside);
  const compleet = tellen.every((p) => p.bytes !== null && !p.partial);
  let other: StorageReport["other"];
  if (!volume) {
    other = { bytes: null, note: "Niet te bepalen: het volume zelf kon niet worden gemeten." };
  } else if (!compleet) {
    other = { bytes: null, note: "Niet te bepalen: niet alle onderdelen zijn volledig gemeten." };
  } else {
    const som = tellen.reduce((t, p) => t + (p.bytes ?? 0), 0);
    if (som > volume.usedBytes * 1.02 + 1_000_000) {
      other = { bytes: null, note: "Niet te bepalen: de onderdelen tellen meer op dan het volume als gebruikt meldt." };
    } else {
      other = {
        bytes: Math.max(0, volume.usedBytes - som),
        note: "Bestandssysteem, tijdelijke bestanden en alles wat niet hierboven staat.",
      };
    }
  }

  return { measuredAt, dataDir, volume, volumeError, separateVolume, parts, other };
}

/**
 * Past een upload van deze grootte nog op het volume, zonder onder de reserve
 * te komen? Kan het volume niet worden gemeten, dan wordt de upload niet
 * geblokkeerd (er is dan niets om op te beslissen) maar staat dat in het log.
 */
export async function roomForUpload(declaredBytes: number): Promise<UploadDecision> {
  try {
    const s = await fs.statfs(DATA_DIR);
    const free = s.bavail * s.bsize;
    const usable = (s.blocks - s.bfree) * s.bsize + free;
    const reserveMb = Number(process.env.OPSLAG_RESERVE_MB);
    const reserve = Number.isFinite(reserveMb) && reserveMb > 0 ? reserveMb * 1_000_000 : undefined;
    return decideUpload(free, usable, declaredBytes, reserve);
  } catch (error) {
    console.error(`[opslag] Vrije ruimte niet te meten bij een upload: ${leesbareFout(error)}`);
    return { ok: true };
  }
}
