/**
 * ============================================================================
 *  DE ZAANSE SCHANS ERBIJ
 * ============================================================================
 *  Het project staat in lib/example-data.ts, maar nieuwe voorbeeldgegevens
 *  worden alleen in een lege database gezet. Een site die al draait (zoals de
 *  testomgeving) krijgt het project dus niet vanzelf. Dit script regelt dat:
 *
 *    - Het project "zaanse-schans" wordt toegevoegd, of bijgewerkt als het er
 *      al staat.
 *    - De drie galerijfoto's worden erbij gezet, op url als sleutel: staan ze
 *      er al, dan worden alleen bijschriften en volgorde bijgewerkt.
 *
 *  Andere projecten blijven ongemoeid.
 *
 *  Controleert eerst of de mediabestanden er echt staan in public/media.
 *  Ontbreekt er een, dan wordt dat onderdeel overgeslagen: liever een
 *  ontbrekend project dan een kapotte pagina.
 *
 *  Lokaal draaien:
 *      node scripts/onderhoud/zaanse-schans-2026.cjs
 *
 *  Op de server, nadat de nieuwe versie is uitgerold:
 *      fly ssh console -C "node scripts/onderhoud/zaanse-schans-2026.cjs"
 *
 *  Het script is opnieuw te draaien: een tweede keer verandert er niets meer.
 * ============================================================================
 */
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(dataDir, "kai-aerials.db");

/** De bestanden staan in public/, naast de serverbundel. */
const publicDir = path.join(process.cwd(), "public");

const PROJECT = {
  slug: "zaanse-schans",
  title: "De Zaanse Schans",
  category: "natuur",
  location: "Zaanse Schans, Zaandijk",
  summary:
    "Een drone-impressie van de molens, de Zaan en de karakteristieke groene huizen van de Zaanse Schans.",
  body:
    "Bij de Zaanse Schans heb ik de molens langs de Zaan vanuit de lucht vastgelegd, met de karakteristieke groene huisjes en de bezoekers op de paden erlangs.\n\nDe opnames wisselen tussen een overzicht van de hele rij molens over het water en een lagere passage rond de bebouwing van het openluchtmuseum. Zo komen zowel de schaal van de locatie als de details van de molens en de huizen in beeld.\n\nDe losse dronepassages zijn samengevoegd tot een compacte videopresentatie.",
  cover_url: "/media/zaanse-schans-poster.webp",
  cover_alt: "Dronebeeld van de molens langs de Zaan bij de Zaanse Schans",
  title_en: "The Zaanse Schans",
  location_en: "Zaanse Schans, Zaandijk",
  summary_en:
    "An aerial impression of the windmills, the River Zaan and the characteristic green houses of the Zaanse Schans.",
  body_en:
    "At the Zaanse Schans I filmed the windmills along the River Zaan from the air, along with the characteristic green houses and the visitors on the paths alongside them.\n\nThe footage alternates between an overview of the full row of windmills across the water and a lower pass around the open-air museum's buildings, showing both the scale of the location and the detail of the mills and houses.\n\nThe individual drone passes were combined into a compact video presentation.",
  cover_alt_en:
    "Aerial view of the windmills along the River Zaan at the Zaanse Schans",
  video_url: "/media/zaanse-schans-dronevideo-v3.mp4",
  published: 1,
  featured: 1,
  sort_order: 3,
  is_example: 0,
};

const GALERIJ = [
  {
    url: "/media/zaanse-schans-01.webp",
    alt: "Rij molens langs de Zaan bij de Zaanse Schans, met een molen op de voorgrond",
    alt_en:
      "Row of windmills along the River Zaan at the Zaanse Schans, with a windmill in the foreground",
  },
  {
    url: "/media/zaanse-schans-02.webp",
    alt: "Overzicht van de molens en het water bij de Zaanse Schans",
    alt_en: "Overview of the windmills and the water at the Zaanse Schans",
  },
  {
    url: "/media/zaanse-schans-03.webp",
    alt: "De groene houten huizen en tuinen van het openluchtmuseum bij de Zaanse Schans",
    alt_en:
      "The green wooden houses and gardens of the open-air museum at the Zaanse Schans",
  },
];

const db = new Database(dbPath);

// De kolom komt normaal uit de migratie bij het opstarten. Draait dit script
// vóór de eerste start van de nieuwe versie, dan zetten we hem hier alsnog.
const projectKolommen = db.prepare("PRAGMA table_info(projects)").all();
if (!projectKolommen.some((k) => k.name === "is_example")) {
  db.exec("ALTER TABLE projects ADD COLUMN is_example INTEGER NOT NULL DEFAULT 0");
  console.log("- kolom is_example toegevoegd");
}
const beeldKolommen = db.prepare("PRAGMA table_info(project_images)").all();
if (!beeldKolommen.some((k) => k.name === "alt_en")) {
  db.exec("ALTER TABLE project_images ADD COLUMN alt_en TEXT NOT NULL DEFAULT ''");
  console.log("- kolom alt_en toegevoegd");
}

let toegevoegd = 0;
let bijgewerkt = 0;
let ongemoeid = 0;
let ontbreekt = 0;

// Controleer eerst of de video en het omslagbeeld er echt staan.
for (const url of [PROJECT.cover_url, PROJECT.video_url]) {
  const bestand = path.join(publicDir, url.replace(/^\//, ""));
  if (!fs.existsSync(bestand)) {
    console.log(`- ${url}: bestand ontbreekt, project wordt overgeslagen`);
    ontbreekt++;
  }
}

if (ontbreekt === 0) {
  const bestaand = db
    .prepare("SELECT * FROM projects WHERE slug = ?")
    .get(PROJECT.slug);

  let projectId;
  if (!bestaand) {
    const velden = Object.keys(PROJECT);
    projectId = Number(
      db
        .prepare(
          `INSERT INTO projects (${velden.join(", ")}, created_utc)
           VALUES (${velden.map((k) => `@${k}`).join(", ")}, @created_utc)`,
        )
        .run({ ...PROJECT, created_utc: Date.now() }).lastInsertRowid,
    );
    console.log(`- ${PROJECT.slug}: toegevoegd`);
    toegevoegd++;
  } else {
    projectId = bestaand.id;
    const afwijkend = Object.keys(PROJECT).filter(
      (k) => k !== "slug" && bestaand[k] !== PROJECT[k],
    );
    if (afwijkend.length === 0) {
      console.log(`- ${PROJECT.slug}: al bijgewerkt`);
      ongemoeid++;
    } else {
      db.prepare(
        `UPDATE projects SET ${afwijkend.map((k) => `${k} = @${k}`).join(", ")} WHERE slug = @slug`,
      ).run(PROJECT);
      console.log(`- ${PROJECT.slug}: bijgewerkt (${afwijkend.join(", ")})`);
      bijgewerkt++;
    }
  }

  GALERIJ.forEach((beeld, index) => {
    const bestand = path.join(publicDir, beeld.url.replace(/^\//, ""));
    if (!fs.existsSync(bestand)) {
      console.log(`- ${beeld.url}: bestand ontbreekt, overgeslagen`);
      ontbreekt++;
      return;
    }

    const bestaandBeeld = db
      .prepare("SELECT * FROM project_images WHERE project_id = ? AND url = ?")
      .get(projectId, beeld.url);

    if (!bestaandBeeld) {
      db.prepare(
        `INSERT INTO project_images (project_id, url, alt, alt_en, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(projectId, beeld.url, beeld.alt, beeld.alt_en, index);
      console.log(`- ${beeld.url}: toegevoegd`);
      toegevoegd++;
      return;
    }

    const afwijkend =
      bestaandBeeld.alt !== beeld.alt ||
      (bestaandBeeld.alt_en ?? "") !== beeld.alt_en ||
      bestaandBeeld.sort_order !== index;

    if (!afwijkend) {
      ongemoeid++;
      return;
    }

    db.prepare(
      "UPDATE project_images SET alt = ?, alt_en = ?, sort_order = ? WHERE id = ?",
    ).run(beeld.alt, beeld.alt_en, index, bestaandBeeld.id);
    console.log(`- ${beeld.url}: bijschriften bijgewerkt`);
    bijgewerkt++;
  });
}

db.close();

const staart = ontbreekt
  ? `\nLet op: ${ontbreekt} bestand(en) ontbreken in public/media. Zet ze erbij en draai dit script opnieuw.`
  : "";
console.log(
  `\nKlaar: ${toegevoegd} toegevoegd, ${bijgewerkt} bijgewerkt, ${ongemoeid} al in orde (${dbPath}).${staart}`,
);
