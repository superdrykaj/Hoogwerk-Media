/**
 * ============================================================================
 *  EENMALIGE OPSCHONING: VOORBEELDPROJECTEN NAAR NOORD-HOLLAND
 * ============================================================================
 *  De voorbeeldprojecten zijn bij de allereerste start in de database gezet,
 *  toen het werkgebied nog Utrecht was. Die rijen veranderen niet vanzelf mee
 *  met de code: nieuwe voorbeeldgegevens worden alleen in een lege database
 *  gezet, zodat je eigen werk nooit wordt overschreven.
 *
 *  Dit script werkt die rijen alsnog bij, maar ALLEEN als ze nog exact de
 *  oorspronkelijke voorbeeldtekst bevatten. Heb je een project zelf al
 *  aangepast, dan blijft het ongemoeid en zegt het script dat erbij.
 *
 *  Hetzelfde script vult ook de Engelse voorbeeldteksten aan, voor de tweetalige
 *  versie van de site: alleen waar het Engelse veld nog leeg is.
 *
 *  Lokaal draaien:
 *      node scripts/onderhoud/werkgebied-noord-holland.cjs
 *
 *  Op de server (Fly.io), nadat de nieuwe versie is uitgerold:
 *      fly ssh console -C "node scripts/onderhoud/werkgebied-noord-holland.cjs"
 *
 *  Het script is opnieuw te draaien: een tweede keer verandert er niets meer.
 *  Bewust géén onderdeel van het opstarten, zodat er nooit ongevraagd in je
 *  eigen gegevens wordt geschreven.
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

/** Per project: waaraan we het herkennen, en wat het wordt. */
const PROJECTEN = [
  {
    slug: "herenhuis-aan-de-vecht",
    was: { title: "Herenhuis aan de Vecht", location: "Maarssen (voorbeeld)" },
    wordt: {
      slug: "herenhuis-aan-de-zaan",
      title: "Herenhuis aan de Zaan",
      location: "Zaandam (voorbeeld)",
    },
  },
  {
    slug: "nieuwbouwwijk-in-aanbouw",
    was: { title: "Nieuwbouwwijk in aanbouw", location: "Houten (voorbeeld)" },
    wordt: { location: "Purmerend (voorbeeld)" },
  },
  {
    slug: "bedrijventerrein-lage-weide",
    was: {
      title: "Bedrijventerrein Lage Weide",
      location: "Utrecht (voorbeeld)",
    },
    wordt: {
      slug: "bedrijventerrein-achtersluispolder",
      title: "Bedrijventerrein Achtersluispolder",
      location: "Zaandam (voorbeeld)",
    },
  },
  {
    slug: "productielocatie-in-bedrijf",
    was: {
      title: "Productielocatie in bedrijf",
      location: "Nieuwegein (voorbeeld)",
    },
    wordt: { location: "Wormerveer (voorbeeld)" },
  },
  {
    slug: "zomerfestival-in-het-park",
    was: {
      title: "Zomerfestival in het park",
      location: "Utrecht (voorbeeld)",
    },
    wordt: { location: "Zaandam (voorbeeld)" },
  },
  {
    slug: "uiterwaarden-bij-zonsopkomst",
    was: {
      title: "Uiterwaarden bij zonsopkomst",
      location: "Kromme Rijngebied (voorbeeld)",
    },
    wordt: {
      slug: "veenweide-bij-zonsopkomst",
      title: "Veenweidegebied bij zonsopkomst",
      location: "Wormer- en Jisperveld (voorbeeld)",
      summary:
        "Vrij werk: een reeks landschapsbeelden van het veenweidegebied in de vroege ochtend.",
      cover_alt:
        "Voorbeeldbeeld: luchtfoto van veenweidegebied in de ochtendmist",
    },
  },
];

/** De omschrijving van "Project op maat" noemt nu de extra vragen. */
const DIENST = {
  slug: "project-op-maat",
  was: "Meerdere locaties, meerdere dagen of een combinatie van foto en video. We beginnen met een kennismaking.",
  wordt:
    "Meerdere locaties, meerdere dagen of een combinatie van foto en video. Je plant een kennismaking; in het formulier vraag ik alvast naar de locaties en de gewenste periode.",
};

/** Engelse voorbeeldteksten, één op één uit lib/example-data.ts. */
const ENGELS = require("./engelse-voorbeeldteksten.json");

const db = new Database(dbPath);
let gewijzigd = 0;
let overgeslagen = 0;

for (const project of PROJECTEN) {
  const nieuweSlug = project.wordt.slug ?? project.slug;
  const rij = db
    .prepare("SELECT id, title, location FROM projects WHERE slug = ?")
    .get(project.slug);

  if (!rij) {
    const al = db
      .prepare("SELECT 1 FROM projects WHERE slug = ?")
      .get(nieuweSlug);
    console.log(
      al
        ? `- ${nieuweSlug}: al bijgewerkt`
        : `- ${project.slug}: niet gevonden (verwijderd?)`,
    );
    continue;
  }
  if (
    rij.title === (project.wordt.title ?? project.was.title) &&
    rij.location === project.wordt.location
  ) {
    console.log(`- ${project.slug}: al bijgewerkt`);
    continue;
  }
  if (rij.title !== project.was.title || rij.location !== project.was.location) {
    console.log(`- ${project.slug}: zelf aangepast, blijft zoals het is`);
    overgeslagen++;
    continue;
  }

  const velden = Object.keys(project.wordt);
  const zetten = velden.map((veld) => `${veld} = ?`).join(", ");
  const waarden = velden.map((veld) => project.wordt[veld]);
  db.prepare(`UPDATE projects SET ${zetten} WHERE id = ?`).run(...waarden, rij.id);
  console.log(`- ${project.slug}: bijgewerkt naar ${project.wordt.location}`);
  gewijzigd++;
}

const dienst = db
  .prepare("SELECT id, description FROM services WHERE slug = ?")
  .get(DIENST.slug);
if (dienst && dienst.description === DIENST.was) {
  db.prepare("UPDATE services SET description = ? WHERE id = ?").run(
    DIENST.wordt,
    dienst.id,
  );
  console.log("- dienst project-op-maat: omschrijving bijgewerkt");
  gewijzigd++;
} else if (dienst && dienst.description === DIENST.wordt) {
  console.log("- dienst project-op-maat: al bijgewerkt");
} else if (dienst) {
  console.log("- dienst project-op-maat: zelf aangepast, blijft zoals het is");
  overgeslagen++;
}

/* -------------------------------------------------------------------------- */
/* Engelse teksten aanvullen                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Vult lege Engelse velden. Staat er al iets, dan blijft dat staan: dat heb je
 * dan zelf in de beheeromgeving ingevuld.
 */
function vulEngels(tabel, sleutel, velden) {
  const rij = db
    .prepare(`SELECT * FROM ${tabel} WHERE slug = ?`)
    .get(sleutel);
  if (!rij) return 0;

  const teVullen = Object.entries(velden).filter(
    ([kolom]) => !String(rij[kolom] ?? "").trim(),
  );
  if (teVullen.length === 0) return 0;

  const zetten = teVullen.map(([kolom]) => `${kolom} = ?`).join(", ");
  const waarden = teVullen.map(([, waarde]) => waarde);
  db.prepare(`UPDATE ${tabel} SET ${zetten} WHERE id = ?`).run(...waarden, rij.id);
  console.log(`- ${sleutel}: ${teVullen.length} Engels veld(en) ingevuld`);
  return 1;
}

console.log("");
let engels = 0;
for (const [slug, velden] of Object.entries(ENGELS.services)) {
  engels += vulEngels("services", slug, velden);
}
for (const [slug, velden] of Object.entries(ENGELS.projects)) {
  engels += vulEngels("projects", slug, velden);
}

/**
 * De alt-teksten van de galerijbeelden. Die staan niet in `projects` maar in
 * `project_images`, en die tabel heeft geen slug: we zoeken ze op via het
 * project en de bestandsnaam. Zonder Engelse alt-tekst krijgt een
 * schermlezer op de Engelse site de Nederlandse omschrijving te horen.
 */
for (const [slug, beelden] of Object.entries(ENGELS.images ?? {})) {
  const project = db
    .prepare("SELECT id FROM projects WHERE slug = ?")
    .get(slug);
  if (!project) continue;

  for (const [url, altEn] of Object.entries(beelden)) {
    const rij = db
      .prepare(
        "SELECT id, alt_en FROM project_images WHERE project_id = ? AND url = ?",
      )
      .get(project.id, url);
    if (!rij || String(rij.alt_en ?? "").trim()) continue;

    db.prepare("UPDATE project_images SET alt_en = ? WHERE id = ?").run(
      altEn,
      rij.id,
    );
    console.log(`- ${slug} ${url}: Engelse alt-tekst ingevuld`);
    engels += 1;
  }
}
if (engels === 0) console.log("- Engelse teksten: niets aan te vullen");

db.close();
console.log(
  `\nKlaar: ${gewijzigd} bijgewerkt, ${engels} vertaald, ${overgeslagen} met rust gelaten (${dbPath}).`,
);
