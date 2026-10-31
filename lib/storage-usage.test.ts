import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-opslag-"));
process.env.DATA_DIR = path.join(tmp, "data");
process.env.SEED_ON_EMPTY = "false";

type M = typeof import("./storage-usage");
let m: M;
beforeAll(async () => {
  m = await import("./storage-usage");
});
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

const MB = 1024 * 1024;
const schrijf = (p: string, bytes: number) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, Buffer.alloc(bytes, 7));
};

/** Een gegevensmap zoals op Fly, met van elk onderdeel een bekende hoeveelheid. */
function maakMap(naam: string) {
  const dir = path.join(tmp, naam);
  schrijf(path.join(dir, "deliveries", "a.bin"), 3 * MB);
  schrijf(path.join(dir, "deliveries", "nieuwe-map", "b.bin"), 1 * MB);
  schrijf(path.join(dir, "deliveries", "previews", "p.jpg"), 1 * MB);
  schrijf(path.join(dir, "invoices", "2026-0001.pdf"), 8 * 1024);
  schrijf(path.join(dir, "backups", "dagelijks", "x", "kai-aerials.db"), 2 * MB);
  schrijf(path.join(dir, "kai-aerials.db"), 4 * MB);
  schrijf(path.join(dir, "kai-aerials.db-wal"), 1 * MB);
  return dir;
}
const onderdeel = (r: Awaited<ReturnType<M["measureStorage"]>>, key: string) => r.parts.find((p) => p.key === key)!;
/** Bytes binnen een ruime marge: het bestandssysteem rondt af op blokken. */
const ongeveer = (waarde: number | null, verwacht: number) => {
  expect(waarde).not.toBeNull();
  expect(waarde!).toBeGreaterThanOrEqual(verwacht);
  expect(waarde!).toBeLessThan(verwacht + 128 * 1024);
};

describe("measureStorage", () => {
  it("splitst het gebruik uit in de onderdelen zonder iets dubbel te tellen", async () => {
    const dir = maakMap("a");
    const r = await m.measureStorage({ dataDir: dir, dbPath: path.join(dir, "kai-aerials.db"), uploadDir: path.join(dir, "uploads") });
    ongeveer(onderdeel(r, "deliveries").bytes, 4 * MB); // a.bin + b.bin, zonder previews
    ongeveer(onderdeel(r, "previews").bytes, 1 * MB);
    ongeveer(onderdeel(r, "invoices").bytes, 8 * 1024);
    ongeveer(onderdeel(r, "backups").bytes, 2 * MB);
    ongeveer(onderdeel(r, "database").bytes, 5 * MB); // db + wal
    expect(onderdeel(r, "uploads").bytes).toBe(0);
    expect(onderdeel(r, "uploads").note).toMatch(/bestaat nog niet/);
    expect(r.parts.every((p) => !p.error)).toBe(true);
  });

  it("meldt het echte volume: totaal = gebruikt + vrij, met een percentage", async () => {
    const dir = maakMap("b");
    const r = await m.measureStorage({ dataDir: dir, dbPath: path.join(dir, "kai-aerials.db"), uploadDir: path.join(dir, "uploads") });
    expect(r.volume).not.toBeNull();
    const v = r.volume!;
    expect(v.usableBytes).toBe(v.usedBytes + v.freeBytes);
    expect(v.percent).toBeGreaterThan(0);
    expect(v.percent).toBeLessThanOrEqual(100);
    expect(v.freeBytes).toBeGreaterThan(0);
    expect(r.volumeError).toBeUndefined();
  });

  it("rekent Overig alleen als alles volledig gemeten is, en nooit negatief", async () => {
    const dir = maakMap("c");
    const r = await m.measureStorage({ dataDir: dir, dbPath: path.join(dir, "kai-aerials.db"), uploadDir: path.join(dir, "uploads") });
    expect(r.other.bytes).not.toBeNull();
    expect(r.other.bytes!).toBeGreaterThanOrEqual(0);
  });

  it("toont een fout en géén getal als het volume niet te lezen is", async () => {
    const weg = path.join(tmp, "bestaat-niet", "data");
    const r = await m.measureStorage({ dataDir: weg, dbPath: path.join(weg, "kai-aerials.db"), uploadDir: path.join(weg, "uploads") });
    expect(r.volume).toBeNull();
    expect(r.volumeError).toMatch(/niet uit te lezen/);
    expect(r.other.bytes).toBeNull();
    // de database bestaat niet: dat is een fout, geen 0 byte
    expect(onderdeel(r, "database").bytes).toBeNull();
    expect(onderdeel(r, "database").error).toMatch(/niet gevonden/);
  });

  it("markeert een onderbroken meting als 'minstens' met de reden, en verzint geen Overig", async () => {
    const dir = maakMap("d");
    for (let i = 0; i < 12; i++) schrijf(path.join(dir, "deliveries", `f${i}.bin`), 4096);
    const r = await m.measureStorage({ dataDir: dir, dbPath: path.join(dir, "kai-aerials.db"), uploadDir: path.join(dir, "uploads"), maxEntries: 5 });
    const d = onderdeel(r, "deliveries");
    expect(d.partial).toBe(true);
    expect(d.error).toMatch(/te veel bestanden/);
    expect(r.other.bytes).toBeNull();
    expect(r.other.note).toMatch(/niet alle onderdelen/);
  });

  it("zegt dat de database buiten het datavolume niet meetelt", async () => {
    const dir = maakMap("e");
    const buiten = path.join(tmp, "elders", "kai-aerials.db");
    schrijf(buiten, 1 * MB);
    const r = await m.measureStorage({ dataDir: dir, dbPath: buiten, uploadDir: path.join(dir, "uploads") });
    expect(onderdeel(r, "database").note).toMatch(/buiten het datavolume/);
  });
});

describe("measureDirectory", () => {
  it("telt de echt ingenomen ruimte: een sparse bestand telt niet als zijn schijnbare grootte", async () => {
    const dir = path.join(tmp, "sparse");
    fs.mkdirSync(dir);
    const fd = fs.openSync(path.join(dir, "leeg.bin"), "w");
    fs.ftruncateSync(fd, 500 * MB);
    fs.closeSync(fd);
    const r = await m.measureDirectory(dir);
    expect(r.bytes).toBeLessThan(10 * MB);
  });

  it("volgt geen symbolische links (ook geen lus)", async () => {
    const dir = path.join(tmp, "links");
    schrijf(path.join(dir, "echt.bin"), 1 * MB);
    schrijf(path.join(tmp, "groot-buiten.bin"), 50 * MB);
    fs.symlinkSync(path.join(tmp, "groot-buiten.bin"), path.join(dir, "naar-buiten.bin"));
    fs.symlinkSync(dir, path.join(dir, "lus"));
    const r = await m.measureDirectory(dir);
    ongeveer(r.bytes, 1 * MB);
    expect(r.partial).toBe(false);
  });

  it("een map die niet bestaat is 'missing', geen fout en geen verzonnen getal", async () => {
    const r = await m.measureDirectory(path.join(tmp, "nooit"));
    expect(r).toMatchObject({ missing: true, bytes: 0, partial: false });
  });
});

describe("roomForUpload", () => {
  it("laat een klein bestand toe en weigert een bestand dat de reserve opeet", async () => {
    delete process.env.OPSLAG_RESERVE_MB;
    fs.mkdirSync(process.env.DATA_DIR!, { recursive: true });
    expect((await m.roomForUpload(1024)).ok).toBe(true);
    process.env.OPSLAG_RESERVE_MB = "999999999"; // reserve groter dan elk volume
    try {
      const r = await m.roomForUpload(1024);
      expect(r.ok).toBe(false);
    } finally {
      delete process.env.OPSLAG_RESERVE_MB;
    }
  });
});
