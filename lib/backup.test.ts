import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

import Database from "better-sqlite3";
import { afterAll, describe, expect, it } from "vitest";

import { migrate } from "./db";

const require = createRequire(import.meta.url);
const backup = require("../scripts/onderhoud/back-up.cjs") as {
  maakBackup: (o: { dir: string; nu?: Date }) => Promise<string>;
  controleer: (map: string) => Promise<{ ok: boolean; problemen: string[]; samenvatting: Record<string, number> }>;
  lijst: (dir: string) => string[];
  BEWAAR_AANTAL: number;
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-backup-"));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

import crypto from "node:crypto";
const sha = (b: Buffer | string) => crypto.createHash("sha256").update(b).digest("hex");

/** Een databasemap met één uitgegeven factuur en zijn PDF, zoals productie. */
function maakGegevens(naam: string) {
  const dir = path.join(tmp, naam);
  fs.mkdirSync(path.join(dir, "invoices"), { recursive: true });
  const db = new Database(path.join(dir, "kai-aerials.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  db.prepare(`INSERT INTO services (slug, name, duration_minutes) VALUES ('foto', 'Foto', 60)`).run();
  db.prepare(
    `INSERT INTO bookings (reference, service_id, start_utc, end_utc, status, name, email, created_utc, updated_utc)
     VALUES ('HM-B1', 1, 0, 1, 'confirmed', 'Klant', 'k@example.test', 0, 0)`,
  ).run();
  const pdf = Buffer.from("%PDF-1.3 voorbeeldfactuur");
  fs.writeFileSync(path.join(dir, "invoices", "2026-0001.pdf"), pdf);
  db.prepare(
    `INSERT INTO invoices (booking_id, token, amount_cents, status, invoice_number, issued_utc, invoice_date, snapshot_json, pdf_filename, pdf_sha256, created_utc, updated_utc)
     VALUES (1, 'tok', 25000, 'sent', '2026-0001', 1, '2026-10-24', '{"x":1}', '2026-0001.pdf', ?, 0, 0)`,
  ).run(sha(pdf));
  return { dir, db, pdf };
}

describe("back-up en herstelcontrole", () => {
  it("maakt een volledige back-up terwijl de database in gebruik is", async () => {
    const { dir, db } = maakGegevens("a");
    db.prepare("UPDATE bookings SET name = 'Wijziging in WAL' WHERE id = 1").run(); // staat nog in het WAL-bestand
    const doel = await backup.maakBackup({ dir, nu: new Date("2026-10-25T01:00:00Z") });
    expect(path.basename(doel)).toBe("2026-10-25T0200");
    const r = await backup.controleer(doel);
    expect(r.problemen).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.samenvatting).toMatchObject({ boekingen: 1, uitgegeven: 1, pdfControleOk: 1 });
    // De back-up bevat ook wat nog in het WAL stond.
    const kopie = new Database(path.join(doel, "kai-aerials.db"), { readonly: true });
    expect((kopie.prepare("SELECT name FROM bookings").get() as { name: string }).name).toBe("Wijziging in WAL");
    kopie.close();
    db.close();
  });

  it("herstel: een back-up is zonder meer te openen als nieuwe gegevensmap", async () => {
    const { dir, db, pdf } = maakGegevens("b");
    const doel = await backup.maakBackup({ dir });
    db.close();
    const herstel = path.join(tmp, "herstel");
    fs.mkdirSync(herstel);
    fs.copyFileSync(path.join(doel, "kai-aerials.db"), path.join(herstel, "kai-aerials.db"));
    fs.cpSync(path.join(doel, "invoices"), path.join(herstel, "invoices"), { recursive: true });
    const hersteld = new Database(path.join(herstel, "kai-aerials.db"));
    migrate(hersteld); // de app doet dit bij elke start; mag niets stuk maken
    expect(hersteld.prepare("SELECT invoice_number FROM invoices").get()).toEqual({ invoice_number: "2026-0001" });
    expect(Buffer.compare(fs.readFileSync(path.join(herstel, "invoices", "2026-0001.pdf")), pdf)).toBe(0);
    hersteld.close();
  });

  it("ziet een ontbrekend of aangepast factuur-PDF", async () => {
    const { dir, db } = maakGegevens("c");
    const doel = await backup.maakBackup({ dir });
    db.close();
    fs.writeFileSync(path.join(doel, "invoices", "2026-0001.pdf"), "aangepast");
    expect((await backup.controleer(doel)).problemen.join()).toMatch(/wijkt af/);
    fs.rmSync(path.join(doel, "invoices", "2026-0001.pdf"));
    expect((await backup.controleer(doel)).problemen.join()).toMatch(/ontbreekt/);
  });

  it("ziet een beschadigde of ontbrekende database", async () => {
    const { dir, db } = maakGegevens("d");
    const doel = await backup.maakBackup({ dir });
    db.close();
    const bestand = path.join(doel, "kai-aerials.db");
    const bytes = fs.readFileSync(bestand);
    fs.writeFileSync(bestand, Buffer.concat([bytes.subarray(0, 4096), Buffer.alloc(4096, 0xff), bytes.subarray(8192)]));
    const r = await backup.controleer(doel).catch(() => ({ ok: false, problemen: ["niet te openen"] }));
    expect(r.ok).toBe(false);
    fs.rmSync(bestand);
    expect((await backup.controleer(doel)).ok).toBe(false);
  });

  it("bewaart de nieuwste 14 en ruimt oudere op; raakt andere bestanden niet aan", async () => {
    const { dir, db } = maakGegevens("e");
    fs.writeFileSync(path.join(dir, "backups-eigen-bestand.txt"), "blijft");
    fs.mkdirSync(path.join(dir, "backups"), { recursive: true });
    fs.writeFileSync(path.join(dir, "backups", "kai-aerials-voor-bijwerken.db"), "eenmalig"); // van een onderhoudsscript
    for (let i = 0; i < 17; i++) {
      await backup.maakBackup({ dir, nu: new Date(Date.UTC(2026, 0, 1 + i, 1, 0)) });
    }
    db.close();
    const over = backup.lijst(dir);
    expect(over).toHaveLength(backup.BEWAAR_AANTAL);
    expect(over[0]).toBe("2026-01-04T0200");
    expect(over.at(-1)).toBe("2026-01-17T0200");
    expect(fs.existsSync(path.join(dir, "backups-eigen-bestand.txt"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "backups", "kai-aerials-voor-bijwerken.db"))).toBe(true);
  });

  it("maakt nooit twee back-ups met dezelfde naam en laat geen half-af mapje achter", async () => {
    const { dir, db } = maakGegevens("f");
    const nu = new Date("2026-05-01T10:00:00Z");
    await backup.maakBackup({ dir, nu });
    await expect(backup.maakBackup({ dir, nu })).rejects.toThrow(/bestaat al/);
    db.close();
    expect(fs.readdirSync(path.join(dir, "backups", "dagelijks")).filter((n) => n.endsWith(".bezig"))).toEqual([]);
  });
});

import { backupNodig } from "./backup-planner";

describe("planning van de dagelijkse back-up", () => {
  const nu = (iso: string) => new Date(iso); // UTC; Amsterdam is +2 (zomertijd) of +1
  it("wacht tot 03:00 Amsterdamse tijd", () => {
    expect(backupNodig(nu("2026-10-25T00:30:00Z"), [])).toBe(false); // 02:30 CEST? (25 okt: wintertijd om 03:00 → 02:30)
    expect(backupNodig(nu("2026-07-10T00:30:00Z"), [])).toBe(false); // 02:30 CEST
    expect(backupNodig(nu("2026-07-10T01:05:00Z"), [])).toBe(true); // 03:05 CEST
    expect(backupNodig(nu("2026-01-10T02:05:00Z"), [])).toBe(true); // 03:05 CET
  });
  it("maakt er niet nog een als er vandaag al een is, wel als de laatste van gisteren is", () => {
    expect(backupNodig(nu("2026-07-10T12:00:00Z"), ["2026-07-10T0300"])).toBe(false);
    expect(backupNodig(nu("2026-07-10T12:00:00Z"), ["2026-07-09T0300"])).toBe(true);
  });
  it("haalt een gemiste back-up later op de dag in", () => {
    expect(backupNodig(nu("2026-07-10T20:00:00Z"), ["2026-07-09T0300"])).toBe(true);
  });
  it("gebruikt de datum van Amsterdam, niet die van UTC", () => {
    // 23:30 UTC op 9 juli is 01:30 op 10 juli in Amsterdam: nog te vroeg, en de back-up van 10 juli telt voor 10 juli.
    expect(backupNodig(nu("2026-07-09T23:30:00Z"), [])).toBe(false);
    expect(backupNodig(nu("2026-07-10T11:30:00Z"), ["2026-07-10T0300"])).toBe(false);
  });
});
