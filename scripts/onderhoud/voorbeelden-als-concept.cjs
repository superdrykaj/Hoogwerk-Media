/**
 * ============================================================================
 *  VOORBEELDPROJECTEN ALS CONCEPT
 * ============================================================================
 *  De verzonnen projecten stonden gepubliceerd. Ze zijn nuttig als sjabloon,
 *  maar op de site horen ze niet: een bezoeker ziet dan opdrachten die niet
 *  bestaan. Dit script zet alles met het voorbeeldlabel (is_example = 1) op
 *  concept, zodat het alleen nog in de beheeromgeving staat.
 *
 *  Wat er NIET gebeurt:
 *    - Echt werk (is_example = 0) blijft staan zoals het staat. De twee echte
 *      projecten worden nooit door dit script offline gehaald.
 *    - Er wordt niets verwijderd. Wil je een voorbeeld toch op de site, dan
 *      zet je het in de beheeromgeving weer op gepubliceerd.
 *
 *  Nieuwe databases hebben dit niet nodig: daar komen de voorbeelden al als
 *  concept binnen (zie lib/example-data.ts). Dit script is voor de site die
 *  al draait.
 *
 *  Lokaal draaien:
 *      node scripts/onderhoud/voorbeelden-als-concept.cjs
 *
 *  Op de server, nadat de nieuwe versie is uitgerold:
 *      fly ssh console -C "node scripts/onderhoud/voorbeelden-als-concept.cjs"
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

const db = new Database(dbPath);

const kolommen = db.prepare("PRAGMA table_info(projects)").all();
if (!kolommen.some((k) => k.name === "is_example")) {
  console.error(
    "De kolom is_example bestaat nog niet. Draai eerst de nieuwe versie van\n" +
      "de site, of het script echte-projecten-2026.cjs, en probeer het daarna\n" +
      "opnieuw.",
  );
  db.close();
  process.exit(1);
}

const voorbeelden = db
  .prepare("SELECT id, slug, published FROM projects WHERE is_example = 1")
  .all();

if (voorbeelden.length === 0) {
  console.log("Er staan geen voorbeeldprojecten in de database.");
}

let gewijzigd = 0;
const zetOpConcept = db.prepare(
  "UPDATE projects SET published = 0, featured = 0 WHERE id = ?",
);

for (const project of voorbeelden) {
  if (project.published === 0) {
    console.log(`- ${project.slug}: stond al op concept`);
    continue;
  }
  zetOpConcept.run(project.id);
  console.log(`- ${project.slug}: op concept gezet`);
  gewijzigd++;
}

// Ter controle: wat staat er nu nog op de site?
const online = db
  .prepare(
    "SELECT slug FROM projects WHERE published = 1 ORDER BY sort_order, id",
  )
  .all();

db.close();

console.log(`\nKlaar: ${gewijzigd} project(en) op concept gezet (${dbPath}).`);
console.log(
  online.length === 0
    ? "Let op: er staat nu geen enkel project op de site."
    : `Op de site staan nu: ${online.map((p) => p.slug).join(", ")}.`,
);
