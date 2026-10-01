import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { migrate } from "./db";
import { EXAMPLE_SERVICES } from "./example-data";

const require = createRequire(import.meta.url);
const { bijwerken, NIEUW, VORIG } = require("../scripts/onderhoud/tarieven-2026-10.cjs");

/** Een database zoals de testomgeving die nu heeft: vorige diensten + een boeking. */
function bestaandeDatabase() {
  const db = new Database(":memory:");
  migrate(db);
  const insert = db.prepare(
    `INSERT INTO services (slug, name, description, duration_minutes, price_label, buffer_minutes, sort_order)
     VALUES (?, ?, ?, ?, ?, 15, ?)`,
  );
  let order = 1;
  for (const [slug, v] of Object.entries(VORIG) as [string, Record<string, string>][]) {
    insert.run(slug, v.name, v.description, 60, v.price_label, order++);
  }
  const serviceId = (db.prepare("SELECT id FROM services WHERE slug = 'bedrijfsfilm'").get() as { id: number }).id;
  db.prepare(
    `INSERT INTO bookings (reference, service_id, start_utc, end_utc, status, name, email, created_utc, updated_utc)
     VALUES ('HM-TEST', ?, 1000, 2000, 'confirmed', 'Test', 'test@example.nl', 500, 500)`,
  ).run(serviceId);
  return { db, serviceId };
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "tarieven-"));

describe("tarieven-2026-10", () => {
  it("gebruikt dezelfde teksten als de voorbeeldgegevens", () => {
    for (const service of EXAMPLE_SERVICES) {
      const nieuw = NIEUW[service.slug];
      expect(nieuw, service.slug).toBeDefined();
      for (const veld of Object.keys(nieuw)) {
        expect(service[veld as keyof typeof service], `${service.slug}.${veld}`).toBe(nieuw[veld]);
      }
    }
    expect(Object.keys(NIEUW).sort()).toEqual(EXAMPLE_SERVICES.map((s) => s.slug).sort());
  });

  it("werkt bestaande diensten bij en maakt eerst een back-up", () => {
    const { db } = bestaandeDatabase();
    const dir = tmp();
    const uitkomst = bijwerken(db, { backupDir: dir });
    expect(uitkomst.gewijzigd).toBe(6);
    expect(uitkomst.backup && fs.existsSync(uitkomst.backup)).toBe(true);

    // De back-up bevat nog de oude staat.
    const oud = new Database(uitkomst.backup, { readonly: true });
    expect((oud.prepare("SELECT name FROM services WHERE slug = 'bedrijfsfilm'").get() as { name: string }).name).toBe("Bedrijfsfilm");
    oud.close();

    const rij = db.prepare("SELECT name, price_label, name_en FROM services WHERE slug = 'bedrijfsfilm'").get() as Record<string, string>;
    expect(rij).toEqual({
      name: "Drone-sfeerfilm",
      price_label: "vanaf € 598,95 incl. btw · € 495 excl. btw",
      name_en: "Drone atmosphere film",
    });
  });

  it("laat sleutels, duur, boekingen en relaties ongemoeid", () => {
    const { db, serviceId } = bestaandeDatabase();
    bijwerken(db, { backupDir: tmp() });
    const rij = db.prepare("SELECT id, slug, duration_minutes, buffer_minutes FROM services WHERE slug = 'bedrijfsfilm'").get() as Record<string, unknown>;
    expect(rij).toEqual({ id: serviceId, slug: "bedrijfsfilm", duration_minutes: 60, buffer_minutes: 15 });
    const boeking = db.prepare("SELECT service_id, status FROM bookings WHERE reference = 'HM-TEST'").get();
    expect(boeking).toEqual({ service_id: serviceId, status: "confirmed" });
  });

  it("is herhaalbaar: een tweede run verandert niets en maakt geen back-up", () => {
    const { db } = bestaandeDatabase();
    bijwerken(db, { backupDir: tmp() });
    const dir = tmp();
    const tweede = bijwerken(db, { backupDir: dir });
    expect(tweede.gewijzigd).toBe(0);
    expect(tweede.backup).toBeNull();
    expect(fs.readdirSync(dir)).toHaveLength(0);
  });

  it("slaat een zelf aangepaste dienst over", () => {
    const { db } = bestaandeDatabase();
    db.prepare("UPDATE services SET price_label = 'vanaf € 500' WHERE slug = 'bedrijfsfilm'").run();
    const uitkomst = bijwerken(db, { backupDir: tmp() });
    expect(uitkomst.gewijzigd).toBe(5);
    expect(uitkomst.regels.join("\n")).toContain("bedrijfsfilm: zelf aangepast");
    expect((db.prepare("SELECT price_label FROM services WHERE slug = 'bedrijfsfilm'").get() as { price_label: string }).price_label).toBe("vanaf € 500");
  });

  it("schrijft niets bij een dry-run", () => {
    const { db } = bestaandeDatabase();
    const dir = tmp();
    const uitkomst = bijwerken(db, { backupDir: dir, dryRun: true });
    expect(uitkomst.gepland).toBe(6);
    expect(uitkomst.gewijzigd).toBe(0);
    expect(fs.readdirSync(dir)).toHaveLength(0);
    expect((db.prepare("SELECT name FROM services WHERE slug = 'bedrijfsfilm'").get() as { name: string }).name).toBe("Bedrijfsfilm");
  });

  it("past de btw-berekening: excl. × 1,21 = incl. voor alle vanafprijzen", () => {
    const paren: [number, string][] = [[195, "235,95"], [349, "422,29"], [495, "598,95"], [149, "180,29"], [65, "78,65"]];
    for (const [excl, incl] of paren) {
      expect(((excl * 121) / 100).toFixed(2).replace(".", ",")).toBe(incl);
    }
    expect(Math.round(13.5 * 121) / 100).toBe(16.34);
  });
});
