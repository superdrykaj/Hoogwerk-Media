import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { migrate } from "./db";
import { EXAMPLE_PROJECTS, installExampleData } from "./example-data";

/** De twee projecten die de homepage moet uitlichten, in deze volgorde. */
const ECHT = ["de-zaan-in-wormerveer", "knooppunt-zaandam-bij-zonsondergang"];

function verseDatabase() {
  const db = new Database(":memory:");
  migrate(db);
  return db;
}

describe("voorbeeldstatus", () => {
  it("merkt precies twee projecten aan als echt werk", () => {
    const echt = EXAMPLE_PROJECTS.filter((p) => p.is_example === 0);
    expect(echt.map((p) => p.slug)).toEqual(ECHT);
  });

  it("merkt alle overige projecten aan als voorbeeld", () => {
    const rest = EXAMPLE_PROJECTS.filter((p) => !ECHT.includes(p.slug));
    expect(rest.length).toBeGreaterThan(0);
    for (const project of rest) expect(project.is_example).toBe(1);
  });

  it("licht geen enkel voorbeeldproject uit", () => {
    for (const project of EXAMPLE_PROJECTS) {
      if (project.is_example === 1) expect(project.featured).toBe(0);
    }
  });

  it("bevat het verwijderde veenweideproject niet meer", () => {
    const slugs = EXAMPLE_PROJECTS.map((p) => p.slug);
    expect(slugs).not.toContain("veenweide-bij-zonsopkomst");
  });

  it("gebruikt voor elk project een unieke sleutel", () => {
    const slugs = EXAMPLE_PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("media van de echte projecten", () => {
  const echt = EXAMPLE_PROJECTS.filter((p) => p.is_example === 0);

  it("verwijst naar bestanden die echt bestaan", () => {
    for (const project of echt) {
      for (const url of [project.cover_url, project.video_url]) {
        expect(url, `${project.slug} heeft geen media-adres`).toMatch(/^\/media\//);
        const bestand = path.join(process.cwd(), "public", url);
        expect(fs.existsSync(bestand), `ontbreekt: ${url}`).toBe(true);
      }
    }
  });

  it("heeft alt-teksten in beide talen", () => {
    for (const project of echt) {
      expect(project.cover_alt.length).toBeGreaterThan(10);
      expect(project.cover_alt_en.length).toBeGreaterThan(10);
      expect(project.title_en.length).toBeGreaterThan(0);
      expect(project.summary_en.length).toBeGreaterThan(0);
      expect(project.body_en.length).toBeGreaterThan(0);
    }
  });
});

describe("database-upgrade", () => {
  it("voegt is_example toe aan een tabel die de kolom nog niet heeft", () => {
    const db = new Database(":memory:");
    // Zoals de tabel eruitzag vóór deze versie.
    db.exec(`
      CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        created_utc INTEGER NOT NULL
      );
    `);
    db.prepare(
      "INSERT INTO projects (slug, title, category, created_utc) VALUES (?, ?, ?, ?)",
    ).run("eigen-werk", "Eigen werk", "natuur", Date.now());

    migrate(db);

    const kolommen = (db.prepare("PRAGMA table_info(projects)").all() as {
      name: string;
    }[]).map((k) => k.name);
    expect(kolommen).toContain("is_example");

    // Standaard 0: een project dat er al stond, is geen voorbeeld. Anders zou
    // eigen werk na een upgrade ineens het label "voorbeeldproject" krijgen.
    const rij = db
      .prepare("SELECT is_example FROM projects WHERE slug = ?")
      .get("eigen-werk") as { is_example: number };
    expect(rij.is_example).toBe(0);
    db.close();
  });
});

describe("projectselectie voor de homepage", () => {
  /** Dezelfde voorwaarden en volgorde als listProjects({onlyFeatured}). */
  const UITGELICHT = `SELECT slug FROM projects WHERE published = 1 AND featured = 1
                      ORDER BY featured DESC, sort_order, id DESC`;

  it("licht precies de twee echte projecten uit, in volgorde", () => {
    const db = verseDatabase();
    installExampleData(db);
    const rijen = db.prepare(UITGELICHT).all() as { slug: string }[];
    expect(rijen.map((r) => r.slug)).toEqual(ECHT);
    db.close();
  });

  it("zet de voorbeeldprojecten wel in het volledige portfolio", () => {
    const db = verseDatabase();
    installExampleData(db);
    const alle = db
      .prepare("SELECT slug, is_example FROM projects WHERE published = 1")
      .all() as { slug: string; is_example: number }[];
    expect(alle.length).toBeGreaterThan(ECHT.length);
    expect(alle.filter((r) => r.is_example === 1).length).toBeGreaterThan(0);
    db.close();
  });

  it("levert bij een tweede installatie geen dubbele projecten op", () => {
    const db = verseDatabase();
    installExampleData(db);
    const eerste = installExampleData(db);
    expect(eerste.projects).toBe(0);

    const aantal = db
      .prepare("SELECT COUNT(*) AS n FROM projects")
      .get() as { n: number };
    expect(aantal.n).toBe(EXAMPLE_PROJECTS.length);
    db.close();
  });
});
