/**
 * ============================================================================
 *  EENMALIGE BIJWERKING: PAKKETTEN EN TARIEVEN (OKTOBER 2026)
 * ============================================================================
 *  De diensten staan in de database. Nieuwe voorbeeldgegevens komen alleen in
 *  een lege database, dus een site die al draait houdt zonder dit script de
 *  oude namen, omschrijvingen en prijslabels.
 *
 *  Dit script zet de zes diensten op de nieuwe pakketindeling:
 *
 *    - Prijslabels tonen de prijs incl. btw met de prijs excl. btw erbij.
 *    - "Fotoreportage" heet nu "Dronefotoreportage" en "Bedrijfsfilm" heet
 *      nu "Drone-sfeerfilm". De sleutels (slug) blijven gelijk, dus boekingen
 *      en verwijzingen blijven kloppen.
 *    - Omschrijvingen zijn compacter, met per pakket wat erbij zit.
 *    - Bouwvoortgang noemt eerste bezoek en vervolgbezoek; de staffelkorting
 *      vanaf vier bezoeken is vervallen.
 *    - "Project op maat" staat op "Op aanvraag".
 *
 *  Alleen deze velden van deze zes diensten worden geraakt: naam,
 *  omschrijving, prijslabel en de Engelse varianten. Duur, buffer, volgorde,
 *  boekbaarheid en alle boekingen blijven onaangetast.
 *
 *  Veiligheid:
 *    - Vóór de eerste wijziging komt er een back-up van de hele database in
 *      <DATA_DIR>/backups/ (via VACUUM INTO, dus ook consistent met WAL).
 *    - Een dienst wordt ALLEEN aangepast als naam, omschrijving én prijslabel
 *      nog exact de vorige voorbeeldtekst zijn. Heb je zelf iets gewijzigd,
 *      dan blijft die dienst staan en zegt het script dat erbij.
 *    - Opnieuw draaien verandert niets meer en maakt dan ook geen back-up.
 *    - Alle wijzigingen gaan in één transactie: alles of niets.
 *
 *  Gebruik:
 *      node scripts/onderhoud/tarieven-2026-10.cjs --dry-run   (alleen tonen)
 *      node scripts/onderhoud/tarieven-2026-10.cjs
 *
 *  Op de TESTOMGEVING (Fly-app hoogbeeld-media-test):
 *      fly ssh console --app hoogbeeld-media-test \
 *        -C "node scripts/onderhoud/tarieven-2026-10.cjs"
 *
 *  Bewust géén onderdeel van het opstarten, zodat er nooit ongevraagd in je
 *  eigen gegevens wordt geschreven.
 * ============================================================================
 */
const fs = require("node:fs");
const path = require("node:path");

/** Wat een dienst vóór deze update was (de vorige voorbeeldtekst). */
const VORIG = {
  kennismaking: {
    name: "Kennismaking",
    description:
      "Kort videogesprek over je locatie en wat je nodig hebt. Vrijblijvend.",
    price_label: "Gratis",
  },
  dronefotografie: {
    name: "Fotoreportage",
    description:
      "Eén object of terrein. Vijftien tot vijfentwintig bewerkte foto's, gebruiksrecht voor web en socials.",
    price_label: "vanaf € 195",
  },
  dronevideo: {
    name: "Foto en korte film",
    description:
      "Dezelfde reportage, plus een gemonteerde clip van dertig tot vijfenveertig seconden.",
    price_label: "vanaf € 349",
  },
  bedrijfsfilm: {
    name: "Bedrijfsfilm",
    description:
      "Sfeerfilm van zestig tot negentig seconden over je terrein of project. Muziek en voice-over in overleg.",
    price_label: "vanaf € 495",
  },
  bouwvordering: {
    name: "Bouwvoortgang",
    description:
      "Vaste route en vaste hoogte, elke maand opnieuw. Vanaf vier bezoeken geldt een staffel.",
    price_label: "vanaf € 149 per bezoek",
  },
  "project-op-maat": {
    name: "Project op maat",
    description:
      "Meerdere locaties of meerdere dagen. Je plant een kennismaking; in het formulier vraag ik alvast naar de locaties en de periode.",
    price_label: "In overleg",
  },
};

/**
 * De nieuwe staat. Moet gelijk blijven aan EXAMPLE_SERVICES in
 * lib/example-data.ts; lib/tarieven-2026-10.test.ts bewaakt dat.
 */
const NIEUW = {
  kennismaking: {
    name: "Kennismaking",
    description:
      "Vrijblijvend videogesprek van maximaal 20 minuten over locatie en wensen.",
    price_label: "Gratis",
    name_en: "Intro call",
    description_en:
      "A no-obligation video call of up to 20 minutes about the location and your wishes.",
    price_label_en: "Free",
  },
  dronefotografie: {
    name: "Dronefotoreportage",
    description:
      "Eén object of terrein, 10–15 bewerkte luchtfoto's.\nTot 60 minuten op locatie.",
    price_label: "vanaf € 235,95 incl. btw · € 195 excl. btw",
    name_en: "Drone photo shoot",
    description_en:
      "One building or site, 10–15 edited aerial photos.\nUp to 60 minutes on location.",
    price_label_en: "from € 235.95 incl. VAT · € 195 excl. VAT",
  },
  dronevideo: {
    name: "Foto en korte film",
    description:
      "10–15 bewerkte luchtfoto's plus een gemonteerde droneclip van 30–45 seconden.\nTot 90 minuten op locatie, passende muziek met gebruikslicentie en één correctieronde.",
    price_label: "vanaf € 422,29 incl. btw · € 349 excl. btw",
    name_en: "Photos and short film",
    description_en:
      "10–15 edited aerial photos plus an edited drone clip of 30–45 seconds.\nUp to 90 minutes on location, fitting licensed music and one round of corrections.",
    price_label_en: "from € 422.29 incl. VAT · € 349 excl. VAT",
  },
  bedrijfsfilm: {
    name: "Drone-sfeerfilm",
    description:
      "Film van 60–90 seconden over één terrein, locatie of project, gemaakt met dronebeelden.\nTot 90 minuten op locatie, passende muziek met gebruikslicentie en één correctieronde.",
    price_label: "vanaf € 598,95 incl. btw · € 495 excl. btw",
    name_en: "Drone atmosphere film",
    description_en:
      "A 60–90 second film about one site, location or project, made with drone footage.\nUp to 90 minutes on location, fitting licensed music and one round of corrections.",
    price_label_en: "from € 598.95 incl. VAT · € 495 excl. VAT",
  },
  bouwvordering: {
    name: "Bouwvoortgang",
    description:
      "Vaste standpunten, 5–10 bewerkte beelden per bezoek en maximaal 45 minuten op locatie.\nHet eerste bezoek omvat de eerste voorbereiding.",
    price_label:
      "eerste bezoek vanaf € 235,95, vervolgbezoek vanaf € 180,29 (incl. btw)",
    name_en: "Construction progress",
    description_en:
      "Fixed viewpoints, 5–10 edited images per visit and up to 45 minutes on location.\nThe first visit includes the initial preparation.",
    price_label_en:
      "first visit from € 235.95, follow-up from € 180.29 (incl. VAT)",
  },
  "project-op-maat": {
    name: "Project op maat",
    description:
      "Meerdere locaties, opnamedagen of een uitgebreidere productie worden vooraf geoffreerd.",
    price_label: "Op aanvraag",
    name_en: "Custom project",
    description_en:
      "Multiple locations, shooting days or a more extensive production are quoted beforehand.",
    price_label_en: "On request",
  },
};

const VELDEN = [
  "name",
  "description",
  "price_label",
  "name_en",
  "description_en",
  "price_label_en",
];

function tijdstempel(nu) {
  return nu.toISOString().replace(/[:.]/g, "-");
}

/**
 * Past de update toe op een geopende database.
 * Geeft terug wat er is gebeurd; schrijft zelf niets naar de console.
 */
function bijwerken(db, { backupDir, dryRun = false, nu = new Date() } = {}) {
  const regels = [];
  const plan = [];

  for (const [slug, nieuw] of Object.entries(NIEUW)) {
    const rij = db
      .prepare(`SELECT id, ${VELDEN.join(", ")} FROM services WHERE slug = ?`)
      .get(slug);

    if (!rij) {
      regels.push(`- ${slug}: bestaat niet, overgeslagen.`);
      continue;
    }
    if (VELDEN.every((veld) => rij[veld] === nieuw[veld])) {
      regels.push(`- ${slug}: al bijgewerkt.`);
      continue;
    }
    const vorig = VORIG[slug];
    const onveranderd = ["name", "description", "price_label"].every(
      (veld) => rij[veld] === vorig[veld],
    );
    if (!onveranderd) {
      regels.push(
        `- ${slug}: zelf aangepast ("${rij.name}", "${rij.price_label}"), blijft staan.`,
      );
      continue;
    }
    plan.push({ slug, id: rij.id, nieuw });
    regels.push(`- ${slug}: ${dryRun ? "wordt bijgewerkt" : "bijgewerkt"}.`);
  }

  let backup = null;
  if (plan.length > 0 && !dryRun) {
    fs.mkdirSync(backupDir, { recursive: true });
    backup = path.join(
      backupDir,
      `kai-aerials-voor-tarieven-2026-10-${tijdstempel(nu)}.db`,
    );
    // VACUUM INTO maakt een consistente kopie, ook als de database in
    // WAL-modus draait en er nog niet-weggeschreven wijzigingen zijn.
    db.prepare("VACUUM INTO ?").run(backup);

    const zet = db.prepare(
      `UPDATE services SET ${VELDEN.map((v) => `${v} = @${v}`).join(", ")} WHERE id = @id`,
    );
    db.transaction(() => {
      for (const { id, nieuw } of plan) zet.run({ ...nieuw, id });
    })();
  }

  return { regels, gewijzigd: dryRun ? 0 : plan.length, gepland: plan.length, backup };
}

module.exports = { bijwerken, NIEUW, VORIG };

if (require.main === module) {
  const Database = require("better-sqlite3");
  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
  const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(dataDir, "kai-aerials.db");
  const dryRun = process.argv.includes("--dry-run");

  if (!fs.existsSync(dbPath)) {
    console.error(`Geen database gevonden op ${dbPath}.`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");
  const uitkomst = bijwerken(db, {
    backupDir: path.join(dataDir, "backups"),
    dryRun,
  });
  db.close();

  console.log(`Database: ${dbPath}${dryRun ? " (dry-run, er wordt niets geschreven)" : ""}`);
  console.log(uitkomst.regels.join("\n"));
  if (uitkomst.backup) console.log(`\nBack-up: ${uitkomst.backup}`);
  console.log(
    dryRun
      ? `\nDry-run klaar. ${uitkomst.gepland} dienst(en) zouden worden bijgewerkt.`
      : `\nKlaar. ${uitkomst.gewijzigd} bijgewerkt.`,
  );
}
