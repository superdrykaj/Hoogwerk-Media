import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { migrate } from "./db";
import { copy } from "@/content/copy";
import { EXAMPLE_SERVICES } from "./example-data";

const require = createRequire(import.meta.url);
const { bijwerken, NIEUW, VORIG, DUUR, TOEVOEGEN } = require("../scripts/onderhoud/tarieven-2026-10.cjs");

/** Kiest uit een veld met één of meer oude teksten; staat 0 = oudste, 1 = tussenstaat. */
const kies = (waarde: string | string[], staat: number) => {
  const lijst = ([] as string[]).concat(waarde);
  return lijst[Math.min(staat, lijst.length - 1)];
};

/**
 * Een database zoals die nu draait, plus een boeking. Staat 1 is de testomgeving
 * (tussenstaat), staat 0 de allereerste voorbeeldstaat zoals productie die heeft.
 */
function bestaandeDatabase(staat = 1) {
  const db = new Database(":memory:");
  migrate(db);
  const insert = db.prepare(
    `INSERT INTO services (slug, name, description, duration_minutes, price_label, buffer_minutes, sort_order)
     VALUES (?, ?, ?, ?, ?, 15, ?)`,
  );
  let order = 1;
  for (const [slug, v] of Object.entries(VORIG) as [string, Record<string, string | string[]>][]) {
    insert.run(slug, kies(v.name, staat), kies(v.description, staat), slug === "bedrijfsfilm" ? DUUR.bedrijfsfilm.van : 60, kies(v.price_label, staat), order++);
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
    // Ook de duur van de sfeerfilm moet in beide bronnen gelijk zijn.
    const film = EXAMPLE_SERVICES.find((s) => s.slug === "bedrijfsfilm");
    expect(film?.duration_minutes).toBe(DUUR.bedrijfsfilm.naar);
    expect(Object.keys(NIEUW).sort()).toEqual(EXAMPLE_SERVICES.map((s) => s.slug).sort());
  });

  it("heeft prijslabels die dezelfde bedragen noemen als de homepage", () => {
    for (const locale of ["nl", "en"] as const) {
      const pricing = copy(locale).home.packagePricing;
      for (const [slug, tiers] of Object.entries(pricing)) {
        const label = NIEUW[slug][locale === "nl" ? "price_label" : "price_label_en"] as string;
        for (const tier of tiers) {
          expect(label, `${locale} ${slug}`).toContain(tier.amount);
          expect(label, `${locale} ${slug}`).toContain(tier.excl.replace(" excl. btw", "").replace(" excl. VAT", ""));
        }
      }
    }
  });

  it("houdt elk prijslabel binnen de 80 tekens van het beheerformulier", () => {
    for (const [slug, nieuw] of Object.entries(NIEUW) as [string, Record<string, string>][]) {
      expect(nieuw.price_label.length, `${slug} nl`).toBeLessThanOrEqual(80);
      expect(nieuw.price_label_en.length, `${slug} en`).toBeLessThanOrEqual(80);
    }
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
    // Sleutel en buffer blijven; alleen de duur van de sfeerfilm gaat naar 90.
    expect(rij).toEqual({ id: serviceId, slug: "bedrijfsfilm", duration_minutes: 90, buffer_minutes: 15 });
    const foto = db.prepare("SELECT duration_minutes FROM services WHERE slug = 'dronefotografie'").get();
    expect(foto).toEqual({ duration_minutes: 60 });
    const boeking = db.prepare("SELECT service_id, status FROM bookings WHERE reference = 'HM-TEST'").get();
    expect(boeking).toEqual({ service_id: serviceId, status: "confirmed" });
  });

  it("werkt Bouwvordering bij onder de oude naam én onder Bouwvoortgang", () => {
    for (const oudeNaam of ["Bouwvordering", "Bouwvoortgang"]) {
      const { db } = bestaandeDatabase();
      db.prepare("UPDATE services SET name = ? WHERE slug = 'bouwvordering'").run(oudeNaam);
      const uitkomst = bijwerken(db, { backupDir: tmp() });
      expect(uitkomst.gewijzigd, oudeNaam).toBe(6);
      const rij = db.prepare("SELECT name, description FROM services WHERE slug = 'bouwvordering'").get() as Record<string, string>;
      expect(rij.name).toBe("Bouwvoortgang");
      expect(rij.description).not.toContain("staffel");
    }
  });

  it("zet alleen een duur van 120 op 90 en laat een eigen duur staan", () => {
    const { db } = bestaandeDatabase();
    db.prepare("UPDATE services SET duration_minutes = 100 WHERE slug = 'bedrijfsfilm'").run();
    const uitkomst = bijwerken(db, { backupDir: tmp() });
    expect(uitkomst.duurGewijzigd).toBe(0);
    expect(uitkomst.regels.join("\n")).toContain("bedrijfsfilm: duur is 100 minuten (zelf aangepast)");
    expect((db.prepare("SELECT duration_minutes FROM services WHERE slug = 'bedrijfsfilm'").get() as { duration_minutes: number }).duration_minutes).toBe(100);
  });

  it("werkt de allereerste voorbeeldstaat bij en voegt ontbrekende diensten toe (productie)", () => {
    const { db } = bestaandeDatabase(0);
    // Productie heeft Bedrijfsfilm en Bouwvoortgang nog niet.
    db.prepare("DELETE FROM bookings").run();
    db.prepare("DELETE FROM services WHERE slug IN ('bedrijfsfilm', 'bouwvordering')").run();
    db.prepare("UPDATE services SET sort_order = 5 WHERE slug = 'project-op-maat'").run();

    const dir = tmp();
    const droog = bijwerken(db, { backupDir: dir, dryRun: true });
    expect(droog.gepland).toBe(4);
    expect(droog.toevoegGepland).toBe(2);
    expect(fs.readdirSync(dir)).toHaveLength(0);

    const uitkomst = bijwerken(db, { backupDir: dir });
    expect(uitkomst.gewijzigd).toBe(4);
    expect(uitkomst.toegevoegd).toBe(2);
    expect(uitkomst.backup && fs.existsSync(uitkomst.backup)).toBe(true);

    // Bestaande diensten: precies de velden die het script beheert. Duur en
    // buffer van die diensten blijven zoals ze waren.
    for (const service of EXAMPLE_SERVICES) {
      const rij = db.prepare("SELECT * FROM services WHERE slug = ?").get(service.slug) as Record<string, unknown>;
      expect(rij, service.slug).toBeDefined();
      const toegevoegd = service.slug in TOEVOEGEN;
      const velden = toegevoegd ? Object.keys(service) : Object.keys(NIEUW[service.slug]);
      for (const veld of velden) {
        expect(rij[veld], `${service.slug}.${veld}`).toBe(service[veld as keyof typeof service]);
      }
    }
    // Project op maat schuift naar plek 6, zoals in de voorbeeldgegevens.
    expect((db.prepare("SELECT sort_order FROM services WHERE slug = 'project-op-maat'").get() as { sort_order: number }).sort_order).toBe(6);

    // Tweede run: niets meer te doen, geen nieuwe back-up.
    const dir2 = tmp();
    const tweede = bijwerken(db, { backupDir: dir2 });
    expect(tweede.gewijzigd + tweede.toegevoegd + tweede.duurGewijzigd).toBe(0);
    expect(fs.readdirSync(dir2)).toHaveLength(0);
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
