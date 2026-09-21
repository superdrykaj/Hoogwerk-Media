/**
 * ============================================================================
 *  EENMALIGE BIJWERKING: DIENSTEN EN TARIEVEN
 * ============================================================================
 *  De diensten staan in de database. Nieuwe voorbeeldgegevens worden alleen in
 *  een lege database gezet, dus een site die al draait houdt zonder dit script
 *  de oude namen en prijzen: fotografie vanaf € 149 en video vanaf € 249.
 *
 *  Dit script brengt die rijen op de nieuwe indeling:
 *
 *    - Fotografie en video krijgen hun nieuwe naam, omschrijving en tarief.
 *    - "Bedrijfsfilm" en "Bouwvordering" komen erbij als ze nog ontbreken.
 *    - Het voorbeeldproject over een festival gaat op non-actief, en het
 *      nieuwbouwproject verhuist naar de categorie bouwvordering. Evenementen
 *      staan niet meer op de site.
 *
 *  Een dienst wordt ALLEEN aangepast als naam, omschrijving én prijs nog exact
 *  de oude voorbeeldtekst zijn. Heb je zelf al iets gewijzigd, dan blijft die
 *  dienst staan en zegt het script dat erbij.
 *
 *  Lokaal draaien:
 *      node scripts/onderhoud/tarieven-2026.cjs
 *
 *  Op de server (Fly.io), nadat de nieuwe versie is uitgerold:
 *      fly ssh console -C "node scripts/onderhoud/tarieven-2026.cjs"
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

/** Bestaande diensten: waaraan we ze herkennen, en wat ze worden. */
const BIJWERKEN = [
  {
    slug: "dronefotografie",
    was: {
      name: "Dronefotografie",
      price_label: "Indicatie vanaf € 149",
    },
    wordt: {
      name: "Fotoreportage",
      description:
        "Eén object of terrein. Vijftien tot vijfentwintig bewerkte foto's, gebruiksrecht voor web en socials.",
      price_label: "vanaf € 195",
    },
  },
  {
    slug: "dronevideo",
    was: {
      name: "Dronevideo",
      price_label: "Indicatie vanaf € 249",
    },
    wordt: {
      name: "Foto en korte film",
      description:
        "Dezelfde reportage, plus een gemonteerde clip van dertig tot vijfenveertig seconden.",
      price_label: "vanaf € 349",
    },
  },
  {
    slug: "kennismaking",
    was: { name: "Kennismaking", price_label: "Gratis" },
    wordt: {
      description:
        "Kort videogesprek over je locatie en wat je nodig hebt. Vrijblijvend.",
    },
  },
  {
    slug: "project-op-maat",
    was: { name: "Project op maat", price_label: "Prijs in overleg" },
    wordt: { price_label: "In overleg", sort_order: 6 },
  },
];

/** Nieuwe diensten. Worden alleen toegevoegd als de sleutel nog niet bestaat. */
const TOEVOEGEN = [
  {
    slug: "bedrijfsfilm",
    name: "Bedrijfsfilm",
    description:
      "Sfeerfilm van zestig tot negentig seconden over je terrein of project. Muziek en voice-over in overleg.",
    duration_minutes: 120,
    price_label: "vanaf € 495",
    buffer_minutes: 60,
    bookable: 1,
    intro_only: 0,
    sort_order: 4,
    active: 1,
  },
  {
    slug: "bouwvordering",
    name: "Bouwvordering",
    description:
      "Vaste route en vaste hoogte, elke maand opnieuw. Vanaf vier bezoeken geldt een staffel.",
    duration_minutes: 45,
    price_label: "vanaf € 149 per bezoek",
    buffer_minutes: 30,
    bookable: 1,
    intro_only: 0,
    sort_order: 5,
    active: 1,
  },
];

const db = new Database(dbPath);
let gewijzigd = 0;
let overgeslagen = 0;
let toegevoegd = 0;

for (const dienst of BIJWERKEN) {
  const velden = Object.keys(dienst.wordt);
  const rij = db
    .prepare(
      `SELECT id, name, price_label, ${velden.join(", ")} FROM services WHERE slug = ?`,
    )
    .get(dienst.slug);

  if (!rij) {
    console.log(`- ${dienst.slug}: bestaat niet, overgeslagen.`);
    overgeslagen++;
    continue;
  }

  // Al in de nieuwe staat? Dan is er niets te doen. Dit maakt het script
  // herhaalbaar: een tweede keer draaien meldt eerlijk dat het al klaar is.
  if (velden.every((veld) => rij[veld] === dienst.wordt[veld])) {
    console.log(`- ${dienst.slug}: al bijgewerkt.`);
    overgeslagen++;
    continue;
  }

  const onveranderd =
    rij.name === dienst.was.name && rij.price_label === dienst.was.price_label;

  if (!onveranderd) {
    console.log(
      `- ${dienst.slug}: zelf aangepast ("${rij.name}", "${rij.price_label}"), blijft staan.`,
    );
    overgeslagen++;
    continue;
  }

  db.prepare(
    `UPDATE services SET ${velden.map((v) => `${v} = @${v}`).join(", ")} WHERE id = @id`,
  ).run({ ...dienst.wordt, id: rij.id });

  console.log(`- ${dienst.slug}: bijgewerkt (${velden.join(", ")}).`);
  gewijzigd++;
}

for (const dienst of TOEVOEGEN) {
  const bestaat = db
    .prepare("SELECT 1 FROM services WHERE slug = ?")
    .get(dienst.slug);

  if (bestaat) {
    console.log(`- ${dienst.slug}: bestaat al, overgeslagen.`);
    overgeslagen++;
    continue;
  }

  db.prepare(
    `INSERT INTO services
       (slug, name, description, duration_minutes, price_label, buffer_minutes,
        bookable, intro_only, sort_order, active)
     VALUES (@slug, @name, @description, @duration_minutes, @price_label,
             @buffer_minutes, @bookable, @intro_only, @sort_order, @active)`,
  ).run(dienst);

  console.log(`- ${dienst.slug}: toegevoegd.`);
  toegevoegd++;
}

// Het festivalproject: evenementen bieden we niet meer aan, dus haal het van
// de site af. Verwijderen doen we niet — dat is aan jou, via de beheeromgeving.
const festival = db
  .prepare("SELECT id, published FROM projects WHERE slug = ?")
  .get("zomerfestival-in-het-park");

if (festival && festival.published) {
  db.prepare("UPDATE projects SET published = 0 WHERE id = ?").run(festival.id);
  console.log("- zomerfestival-in-het-park: van de site gehaald.");
  gewijzigd++;
} else {
  console.log("- zomerfestival-in-het-park: niets te doen.");
}

// Het nieuwbouwproject hoort bij bouwvordering, niet bij vastgoed.
const nieuwbouw = db
  .prepare("SELECT id, category FROM projects WHERE slug = ?")
  .get("nieuwbouwwijk-in-aanbouw");

if (nieuwbouw && nieuwbouw.category === "vastgoed") {
  db.prepare("UPDATE projects SET category = 'bouw' WHERE id = ?").run(
    nieuwbouw.id,
  );
  console.log("- nieuwbouwwijk-in-aanbouw: categorie is nu bouwvordering.");
  gewijzigd++;
} else {
  console.log("- nieuwbouwwijk-in-aanbouw: niets te doen.");
}

db.close();

console.log(
  `\nKlaar. ${gewijzigd} bijgewerkt, ${toegevoegd} toegevoegd, ${overgeslagen} overgeslagen.`,
);
