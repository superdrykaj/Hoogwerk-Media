import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { migrate } from "./db";
import { EXAMPLE_PROJECTS } from "./example-data";

const require = createRequire(import.meta.url);
const { bijwerken, NIEUW, VORIG, KOLOMMEN, nieuweTekst } = require("../scripts/onderhoud/seo-projecten-2026-10.cjs");

const SLUGS = Object.keys(NIEUW);
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "seo-"));

/** Een database zoals die nu draait: de echte projecten met de oude teksten. */
function bestaandeDatabase({ metaKolommen = true } = {}) {
  const db = new Database(":memory:");
  migrate(db);
  if (!metaKolommen) for (const kolom of KOLOMMEN) db.exec(`ALTER TABLE projects DROP COLUMN ${kolom}`);
  const insert = db.prepare(
    `INSERT INTO projects (slug, title, category, body, body_en, published, created_utc)
     VALUES (?, ?, 'natuur', ?, ?, 1, 1)`,
  );
  for (const slug of SLUGS) insert.run(slug, slug, VORIG[slug].body, VORIG[slug].body_en);
  return db;
}

describe("seo-projecten-2026-10", () => {
  it("gebruikt dezelfde teksten als de voorbeeldgegevens", () => {
    for (const slug of SLUGS) {
      const project = EXAMPLE_PROJECTS.find((p) => p.slug === slug);
      expect(project, slug).toBeDefined();
      for (const veld of KOLOMMEN) {
        expect(project?.[veld as keyof typeof project], `${slug}.${veld}`).toBe(NIEUW[slug][veld]);
      }
      expect(project?.body, `${slug}.body`).toBe(nieuweTekst(slug, "nl"));
      expect(project?.body_en, `${slug}.body_en`).toBe(nieuweTekst(slug, "en"));
    }
  });

  it("houdt titels en omschrijvingen binnen de lengtes voor zoekresultaten", () => {
    for (const slug of SLUGS) {
      // De sitenaam komt er automatisch achter (" | Hoogbeeld Media", 18 tekens).
      expect(NIEUW[slug].meta_title.length + 18, `${slug} nl`).toBeLessThanOrEqual(65);
      expect(NIEUW[slug].meta_title_en.length + 18, `${slug} en`).toBeLessThanOrEqual(65);
      for (const veld of ["meta_description", "meta_description_en"]) {
        expect(NIEUW[slug][veld].length, `${slug}.${veld}`).toBeLessThanOrEqual(155);
        expect(NIEUW[slug][veld].length, `${slug}.${veld}`).toBeGreaterThan(80);
      }
    }
    const titels = SLUGS.flatMap((s) => [NIEUW[s].meta_title, NIEUW[s].meta_title_en]);
    expect(new Set(titels).size).toBe(titels.length);
  });

  it("noemt filmlengtes die kloppen met de bestanden", () => {
    // De lengtes zijn gemeten aan de bestanden in public/media (ffprobe):
    // 28,0 s, 33,0 s en 20,8 s. Hier controleren we alleen dat de bestanden
    // er nog zijn, want een ander bestand betekent een andere lengte.
    for (const slug of SLUGS) {
      const project = EXAMPLE_PROJECTS.find((p) => p.slug === slug)!;
      expect(fs.existsSync(path.join(process.cwd(), "public", project.video_url))).toBe(true);
    }
    expect(NIEUW["de-zaan-in-wormerveer"].toevoeging).toContain("28 seconden");
    expect(NIEUW["ijburg-vanuit-de-lucht"].toevoeging).toContain("33 seconden");
    expect(NIEUW["de-zaanse-schans-vanuit-de-lucht"].toevoeging).toContain("ruim 20 seconden");
  });

  it("past een bestaande database aan, met back-up, en doet het één keer", () => {
    const db = bestaandeDatabase();
    const backupDir = tmp();
    const eerste = bijwerken(db, { backupDir });
    expect(eerste.gewijzigd).toBe(SLUGS.length);
    expect(eerste.backup).not.toBeNull();
    expect(fs.existsSync(eerste.backup)).toBe(true);

    for (const slug of SLUGS) {
      const rij = db.prepare("SELECT * FROM projects WHERE slug = ?").get(slug) as Record<string, string>;
      expect(rij.meta_title).toBe(NIEUW[slug].meta_title);
      expect(rij.meta_description_en).toBe(NIEUW[slug].meta_description_en);
      expect(rij.body).toBe(nieuweTekst(slug, "nl"));
      expect(rij.body_en).toBe(nieuweTekst(slug, "en"));
    }

    const tweede = bijwerken(db, { backupDir: tmp() });
    expect(tweede.gewijzigd).toBe(0);
    expect(tweede.backup).toBeNull();
    db.close();
  });

  it("laat een zelf aangepaste tekst of zoektitel staan", () => {
    const db = bestaandeDatabase();
    db.prepare("UPDATE projects SET body = 'Mijn eigen tekst', meta_title = 'Eigen titel' WHERE slug = ?").run(SLUGS[0]);
    const uitkomst = bijwerken(db, { backupDir: tmp() });
    const rij = db.prepare("SELECT * FROM projects WHERE slug = ?").get(SLUGS[0]) as Record<string, string>;
    expect(rij.body).toBe("Mijn eigen tekst");
    expect(rij.meta_title).toBe("Eigen titel");
    // De rest van dat project is wél bijgewerkt.
    expect(rij.meta_title_en).toBe(NIEUW[SLUGS[0]].meta_title_en);
    expect(uitkomst.regels.join("\n")).toContain("blijft staan");
    db.close();
  });

  it("voegt ontbrekende kolommen zelf toe en schrijft niets bij een dry-run", () => {
    const droog = bestaandeDatabase({ metaKolommen: false });
    const voor = droog.prepare("SELECT body FROM projects WHERE slug = ?").get(SLUGS[0]);
    const uitkomst = bijwerken(droog, { backupDir: tmp(), dryRun: true });
    expect(uitkomst.gepland).toBe(SLUGS.length);
    expect(uitkomst.backup).toBeNull();
    expect(droog.prepare("SELECT body FROM projects WHERE slug = ?").get(SLUGS[0])).toEqual(voor);
    expect((droog.prepare("PRAGMA table_info(projects)").all() as { name: string }[]).map((k) => k.name)).not.toContain("meta_title");

    const echt = bestaandeDatabase({ metaKolommen: false });
    expect(bijwerken(echt, { backupDir: tmp() }).gewijzigd).toBe(SLUGS.length);
    expect((echt.prepare("SELECT meta_title FROM projects WHERE slug = ?").get(SLUGS[0]) as { meta_title: string }).meta_title).toBe(NIEUW[SLUGS[0]].meta_title);
    droog.close();
    echt.close();
  });

  it("slaat projecten over die er niet zijn", () => {
    const db = new Database(":memory:");
    migrate(db);
    const uitkomst = bijwerken(db, { backupDir: tmp() });
    expect(uitkomst.gewijzigd).toBe(0);
    expect(uitkomst.regels.join("\n")).toContain("bestaat niet");
    db.close();
  });
});
