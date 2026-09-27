/**
 * ============================================================================
 *  DE ZAANSE SCHANS ERBIJ
 * ============================================================================
 *  Het project staat in lib/example-data.ts, maar nieuwe voorbeeldgegevens
 *  worden alleen in een lege database gezet. Een site die al draait (zoals de
 *  testomgeving) krijgt het project dus niet vanzelf. Dit script regelt dat:
 *
 *    - Het project "de-zaanse-schans-vanuit-de-lucht" wordt toegevoegd, of
 *      bijgewerkt als het er al staat.
 *    - De drie galerijfoto's worden erbij gezet, op url als sleutel: staan ze
 *      er al, dan worden alleen bijschriften en volgorde bijgewerkt.
 *
 *  Let op de slug: dit project is op de testomgeving al eens rechtstreeks via
 *  de beheeromgeving aangemaakt, onder slug "de-zaanse-schans-vanuit-de-lucht".
 *  Dit script gebruikt bewust dezelfde slug en dezelfde tekst, zodat het op
 *  die database niets nieuws toevoegt (het matcht het bestaande project en
 *  ziet dat er niets afwijkt) in plaats van er een tweede, dubbele kaart bij
 *  te zetten. Op een omgeving waar dit project nog niet bestaat, maakt het
 *  script het gewoon aan.
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
  slug: "de-zaanse-schans-vanuit-de-lucht",
  title: "De Zaanse Schans vanuit de lucht",
  category: "natuur",
  location: "Zaanstad",
  summary:
    "Een weids dronebeeld van de molens, waterwegen en het dorp op de Zaanse Schans.",
  body:
    "Voor deze locatie-impressie legde ik de molens, waterwegen en karakteristieke houten huizen van de Zaanse Schans vast.\n\nDe montage beweegt van dichtbij langs de molens naar een breder overzicht van het dorp en het omliggende landschap.",
  cover_url: "/media/zaanse-schans-poster.webp",
  cover_alt:
    "Dronebeeld van een groene molen, water en houten huizen op de Zaanse Schans",
  title_en: "Zaanse Schans from Above",
  location_en: "Zaanstad",
  summary_en:
    "A sweeping aerial view of the windmills, waterways and village at Zaanse Schans.",
  body_en:
    "This location film captures the windmills, waterways and distinctive wooden houses of Zaanse Schans.\n\nThe edit moves from closer views of the mills to a wider view of the village and surrounding landscape.",
  cover_alt_en:
    "Aerial view of a green windmill, water and wooden houses at Zaanse Schans",
  video_url: "/media/zaanse-schans-dronevideo-v3.mp4",
  published: 1,
  featured: 1,
  sort_order: 3,
  is_example: 0,
};

const GALERIJ = [
  {
    url: "/media/zaanse-schans-01.webp",
    alt: "Molens en waterwegen op de Zaanse Schans vanuit de lucht",
    alt_en: "Aerial view of windmills and waterways at Zaanse Schans",
  },
  {
    url: "/media/zaanse-schans-02.webp",
    alt: "Uitzicht over het water en de molens van de Zaanse Schans",
    alt_en: "View across the water towards the windmills of Zaanse Schans",
  },
  {
    url: "/media/zaanse-schans-03.webp",
    alt: "Houten huizen en groen landschap rond de Zaanse Schans",
    alt_en: "Wooden houses and green landscape around Zaanse Schans",
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
