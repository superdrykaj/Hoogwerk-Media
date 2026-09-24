/**
 * ============================================================================
 *  ECHTE PROJECTEN ERIN, HET VEENWEIDEPROJECT ERUIT
 * ============================================================================
 *  De projecten staan in de database. Nieuwe voorbeeldgegevens worden alleen
 *  in een lege database gezet, dus een site die al draait krijgt de twee echte
 *  projecten niet vanzelf. Dit script regelt dat:
 *
 *    - De Zaan in Wormerveer en Knooppunt Zaandam worden toegevoegd, of
 *      bijgewerkt als ze er al staan.
 *    - Het verzonnen project "veenweide-bij-zonsopkomst" verdwijnt, met zijn
 *      galerijbeelden erbij.
 *    - De overgebleven verzonnen projecten krijgen het voorbeeldlabel en
 *      worden niet meer uitgelicht, zodat de homepage de twee echte toont.
 *
 *  Andere projecten blijven ongemoeid. Wat jij zelf hebt aangemaakt, houdt
 *  is_example = 0 en verliest zijn uitgelicht-vinkje niet.
 *
 *  Lokaal draaien:
 *      node scripts/onderhoud/echte-projecten-2026.cjs
 *
 *  Op de server, nadat de nieuwe versie is uitgerold:
 *      fly ssh console -C "node scripts/onderhoud/echte-projecten-2026.cjs"
 *
 *  Het script is opnieuw te draaien: een tweede keer verandert er niets meer.
 * ============================================================================
 */
const path = require("node:path");
const Database = require("better-sqlite3");

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(dataDir, "kai-aerials.db");

const ECHT = [
  {
    slug: "de-zaan-in-wormerveer",
    title: "De Zaan in Wormerveer",
    category: "natuur",
    location: "Wormerveer",
    summary:
      "Een rustige drone-impressie van de Zaan, de karakteristieke bebouwing en het waterfront van Wormerveer.",
    body: "Voor deze locatie-impressie heb ik de Zaan en het waterfront van Wormerveer vanuit meerdere hoogtes en richtingen vastgelegd.\n\nDe rustige camerabewegingen laten het water, de bebouwing en de kade in samenhang zien. Vijf zorgvuldig gekozen dronepassages zijn samengebracht tot een compacte, filmische webvideo.",
    cover_url: "/media/wormerveer-de-zaan-poster.webp",
    cover_alt:
      "Dronebeeld van de Zaan en de bebouwing aan het waterfront in Wormerveer",
    title_en: "The River Zaan in Wormerveer",
    location_en: "Wormerveer",
    summary_en:
      "A calm aerial impression of the River Zaan, its distinctive waterfront buildings and the Wormerveer shoreline.",
    body_en:
      "For this location film, I captured the River Zaan and the Wormerveer waterfront from several heights and directions.\n\nThe calm camera movements show the relationship between the water, the buildings and the quay. Five carefully selected drone passes were combined into a concise, cinematic web video.",
    cover_alt_en:
      "Aerial view of the River Zaan and the waterfront buildings in Wormerveer",
    video_url: "/media/wormerveer-de-zaan-dronevideo.mp4",
    published: 1,
    featured: 1,
    sort_order: 1,
    is_example: 0,
  },
  {
    slug: "knooppunt-zaandam-bij-zonsondergang",
    title: "Knooppunt Zaandam bij zonsondergang",
    category: "bedrijven",
    location: "Zaandam",
    summary:
      "Een dynamische drone-impressie van de snelweg bij knooppunt Zaandam tijdens de avondspits.",
    body: "Rond zonsondergang heb ik de snelweg bij knooppunt Zaandam vanuit verschillende hoogtes en richtingen vastgelegd.\n\nDe combinatie van verkeer, infrastructuur, water en avondlucht laat de schaal en dynamiek van de locatie zien. De montage blijft rustig en professioneel, terwijl de beweging van het verkeer voor visuele energie zorgt.",
    cover_url: "/media/knooppunt-zaandam-poster.webp",
    cover_alt:
      "Dronebeeld van de snelweg bij knooppunt Zaandam tijdens zonsondergang",
    title_en: "Zaandam interchange at sunset",
    location_en: "Zaandam",
    summary_en:
      "A dynamic aerial impression of the motorway near Zaandam interchange during the evening rush hour.",
    body_en:
      "Around sunset, I filmed the motorway near Zaandam interchange from several heights and directions.\n\nThe combination of traffic, infrastructure, water and the evening sky shows the scale and movement of the location. The edit remains calm and professional, while the traffic adds visual energy.",
    cover_alt_en:
      "Aerial view of the motorway near Zaandam interchange at sunset",
    video_url: "/media/knooppunt-zaandam-dronevideo.mp4",
    published: 1,
    featured: 1,
    sort_order: 2,
    is_example: 0,
  },
];

/** De verzonnen projecten uit de voorbeeldgegevens. */
const VOORBEELDEN = [
  "herenhuis-aan-de-zaan",
  "nieuwbouwwijk-in-aanbouw",
  "bedrijventerrein-achtersluispolder",
  "productielocatie-in-bedrijf",
];

const WEG = "veenweide-bij-zonsopkomst";

const db = new Database(dbPath);

// De kolom komt normaal uit de migratie bij het opstarten. Draait dit script
// vóór de eerste start van de nieuwe versie, dan zetten we hem hier alsnog.
const kolommen = db.prepare("PRAGMA table_info(projects)").all();
if (!kolommen.some((k) => k.name === "is_example")) {
  db.exec("ALTER TABLE projects ADD COLUMN is_example INTEGER NOT NULL DEFAULT 0");
  console.log("- kolom is_example toegevoegd");
}

const velden = Object.keys(ECHT[0]).filter((k) => k !== "slug");
let toegevoegd = 0;
let bijgewerkt = 0;
let ongemoeid = 0;

for (const project of ECHT) {
  const bestaand = db
    .prepare("SELECT * FROM projects WHERE slug = ?")
    .get(project.slug);

  if (!bestaand) {
    const kolomlijst = ["slug", ...velden, "created_utc"];
    db.prepare(
      `INSERT INTO projects (${kolomlijst.join(", ")})
       VALUES (${kolomlijst.map((k) => `@${k}`).join(", ")})`,
    ).run({ ...project, created_utc: Date.now() });
    console.log(`- ${project.slug}: toegevoegd`);
    toegevoegd++;
    continue;
  }

  const afwijkend = velden.filter((k) => bestaand[k] !== project[k]);
  if (afwijkend.length === 0) {
    console.log(`- ${project.slug}: al bijgewerkt`);
    ongemoeid++;
    continue;
  }

  db.prepare(
    `UPDATE projects SET ${afwijkend.map((k) => `${k} = @${k}`).join(", ")} WHERE slug = @slug`,
  ).run(project);
  console.log(`- ${project.slug}: bijgewerkt (${afwijkend.join(", ")})`);
  bijgewerkt++;
}

// Het veenweideproject en zijn galerijbeelden.
const veenweide = db.prepare("SELECT id FROM projects WHERE slug = ?").get(WEG);
if (veenweide) {
  const beelden = db
    .prepare("DELETE FROM project_images WHERE project_id = ?")
    .run(veenweide.id).changes;
  db.prepare("DELETE FROM projects WHERE id = ?").run(veenweide.id);
  console.log(`- ${WEG}: verwijderd, met ${beelden} galerijbeeld(en)`);
  bijgewerkt++;
} else {
  console.log(`- ${WEG}: bestond niet meer`);
}

// De overgebleven verzonnen projecten: label erop, en niet meer uitlichten.
for (const slug of VOORBEELDEN) {
  const rij = db
    .prepare("SELECT id, is_example, featured FROM projects WHERE slug = ?")
    .get(slug);
  if (!rij) continue;
  if (rij.is_example === 1 && rij.featured === 0) continue;

  db.prepare("UPDATE projects SET is_example = 1, featured = 0 WHERE id = ?").run(
    rij.id,
  );
  console.log(`- ${slug}: voorbeeldlabel erop, niet meer uitgelicht`);
  bijgewerkt++;
}

db.close();
console.log(
  `\nKlaar: ${toegevoegd} toegevoegd, ${bijgewerkt} bijgewerkt, ${ongemoeid} al in orde (${dbPath}).`,
);
