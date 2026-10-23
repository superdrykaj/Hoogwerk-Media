/**
 * ============================================================================
 *  PROJECTTEKSTEN VOOR ZOEKMACHINES (OKTOBER 2026)
 * ============================================================================
 *  De projecten staan in de database. Nieuwe voorbeeldgegevens komen alleen in
 *  een lege database, dus een site die al draait houdt zonder dit script de
 *  oude projectteksten en heeft geen eigen zoekmachinetitel per project.
 *
 *  Dit script doet voor de drie echte projecten (De Zaan in Wormerveer,
 *  IJburg, De Zaanse Schans):
 *
 *    - De velden "Titel voor Google" en "Omschrijving voor Google" worden
 *      gevuld, in het Nederlands en het Engels, bijvoorbeeld "Dronevideo van
 *      de Zaan in Wormerveer". Alleen als ze nog leeg zijn: wat je zelf in de
 *      beheeromgeving hebt ingevuld, blijft staan.
 *    - Onder de uitgebreide tekst komt één alinea met wat aantoonbaar is: de
 *      lengte van de film, het aantal foto's in de galerij en dat het een
 *      vrije portfolio-opname is en geen opdracht van een klant. De lengte is
 *      gemeten aan de bestanden in public/media. Alleen als de tekst nog
 *      precies de vorige voorbeeldtekst is.
 *
 *  Voegt zo nodig zelf de vier nieuwe kolommen toe (de site doet dat ook bij
 *  het opstarten), zodat de volgorde van uitrollen en draaien er niet toe doet.
 *
 *  Veiligheid:
 *    - Vóór de eerste wijziging komt er een back-up in <DATA_DIR>/backups/.
 *    - Opnieuw draaien verandert niets meer en maakt dan ook geen back-up.
 *    - Alle wijzigingen gaan in één transactie: alles of niets.
 *
 *  Gebruik:
 *      node scripts/onderhoud/seo-projecten-2026-10.cjs --dry-run   (alleen tonen)
 *      node scripts/onderhoud/seo-projecten-2026-10.cjs
 *
 *  Op de testomgeving draait dit script bij het opstarten mee zolang
 *  SEO_UPDATE = "2026-10" staat in fly.staging.toml (zie docker-entrypoint.sh).
 *  Op productie draai je het zelf, of via productie-bijwerken-2026-10.cjs.
 * ============================================================================
 */
const fs = require("node:fs");
const path = require("node:path");

/** De vier kolommen die dit script nodig heeft. Gelijk aan lib/db.ts. */
const KOLOMMEN = ["meta_title", "meta_title_en", "meta_description", "meta_description_en"];

/** Wat er onder de uitgebreide tekst komt, per project, in beide talen. */
const NIEUW = {
  "de-zaan-in-wormerveer": {
    meta_title: "Dronevideo van de Zaan in Wormerveer",
    meta_title_en: "Drone video of the River Zaan in Wormerveer",
    meta_description:
      "Dronevideo van de Zaan en het waterfront van Wormerveer: vijf dronepassages gemonteerd tot een film van 28 seconden, met fotogalerij.",
    meta_description_en:
      "Drone video of the River Zaan and the Wormerveer waterfront: five drone passes edited into a 28-second film, with photo gallery.",
    toevoeging:
      "De film duurt 28 seconden in full HD (1920×1080); de fotogalerij bestaat uit vier beelden. Dit is een vrije portfolio-opname en geen opdracht van een klant.",
    toevoeging_en:
      "The film runs 28 seconds in full HD (1920×1080); the photo gallery consists of four images. This is a free portfolio recording, not an assignment for a client.",
  },
  "ijburg-vanuit-de-lucht": {
    meta_title: "Dronevideo van IJburg in Amsterdam",
    meta_title_en: "Drone video of IJburg in Amsterdam",
    meta_description:
      "Dronevideo van IJburg in Amsterdam: waterwoningen, moderne woonblokken en de jachthaven in een film van 33 seconden, met fotogalerij.",
    meta_description_en:
      "Drone video of IJburg in Amsterdam: waterside homes, modern apartment blocks and the marina in a 33-second film, with photo gallery.",
    toevoeging:
      "De film duurt 33 seconden in full HD (1920×1080); de fotogalerij bestaat uit vier beelden. Dit is een vrije portfolio-opname en geen opdracht van een klant of makelaar.",
    toevoeging_en:
      "The film runs 33 seconds in full HD (1920×1080); the photo gallery consists of four images. This is a free portfolio recording, not an assignment for a client or estate agent.",
  },
  "de-zaanse-schans-vanuit-de-lucht": {
    meta_title: "Dronevideo van de Zaanse Schans",
    meta_title_en: "Drone video of Zaanse Schans",
    meta_description:
      "Dronevideo van de molens, waterwegen en houten huizen van de Zaanse Schans in Zaanstad: een film van ruim 20 seconden met fotogalerij.",
    meta_description_en:
      "Drone video of the windmills, waterways and wooden houses of Zaanse Schans in Zaanstad: a film of just over 20 seconds, with photo gallery.",
    toevoeging:
      "De film duurt ruim 20 seconden in full HD (1920×1080); de fotogalerij bestaat uit drie beelden. Dit is een vrije portfolio-opname en geen opdracht van een klant.",
    toevoeging_en:
      "The film runs just over 20 seconds in full HD (1920×1080); the photo gallery consists of three images. This is a free portfolio recording, not an assignment for a client.",
  },
};

/** De uitgebreide tekst zoals die vóór deze update was, per project en taal. */
const VORIG = {
  "de-zaan-in-wormerveer": {
    body: "Voor deze locatie-impressie heb ik de Zaan en het waterfront van Wormerveer vanuit meerdere hoogtes en richtingen vastgelegd.\n\nDe rustige camerabewegingen laten het water, de bebouwing en de kade in samenhang zien. Vijf zorgvuldig gekozen dronepassages zijn samengebracht tot een compacte, filmische webvideo.",
    body_en:
      "For this location film, I captured the River Zaan and the Wormerveer waterfront from several heights and directions.\n\nThe calm camera movements show the relationship between the water, the buildings and the quay. Five carefully selected drone passes were combined into a concise, cinematic web video.",
  },
  "ijburg-vanuit-de-lucht": {
    body: "Vanuit de lucht komen de moderne woonblokken, waterwoningen en de jachthaven van IJburg samen in één overzicht van het stadsdeel. De rustige camerabewegingen laten zien hoe de architectuur en het water het karakter van deze Amsterdamse wijk bepalen.",
    body_en:
      "From above, IJburg's modern apartment blocks, waterside homes and marina come together in a single overview of the district. The calm camera movements show how architecture and water shape the character of this Amsterdam neighbourhood.",
  },
  "de-zaanse-schans-vanuit-de-lucht": {
    body: "Voor deze locatie-impressie legde ik de molens, waterwegen en karakteristieke houten huizen van de Zaanse Schans vast.\n\nDe montage beweegt van dichtbij langs de molens naar een breder overzicht van het dorp en het omliggende landschap.",
    body_en:
      "This location film captures the windmills, waterways and distinctive wooden houses of Zaanse Schans.\n\nThe edit moves from closer views of the mills to a wider view of the village and surrounding landscape.",
  },
};

/** De nieuwe uitgebreide tekst: de vorige, met de toevoeging als laatste alinea. */
function nieuweTekst(slug, taal) {
  const veld = taal === "nl" ? "body" : "body_en";
  const toevoeging = NIEUW[slug][taal === "nl" ? "toevoeging" : "toevoeging_en"];
  return `${VORIG[slug][veld]}\n\n${toevoeging}`;
}

function tijdstempel(nu) {
  return nu.toISOString().replace(/[:.]/g, "-");
}

/** Voegt de kolommen toe als ze er nog niet zijn. Bestaande gegevens blijven. */
function zorgVoorKolommen(db) {
  const aanwezig = db.prepare("PRAGMA table_info(projects)").all().map((k) => k.name);
  for (const kolom of KOLOMMEN) {
    if (!aanwezig.includes(kolom)) {
      db.exec(`ALTER TABLE projects ADD COLUMN ${kolom} TEXT NOT NULL DEFAULT ''`);
    }
  }
}

/**
 * Past de database aan en geeft terug wat er gebeurde. Met `dryRun` wordt er
 * niets geschreven (ook de kolommen niet), en wordt de stand zo goed als kan
 * voorspeld.
 */
function bijwerken(db, { backupDir, dryRun = false, nu = new Date() } = {}) {
  const regels = [];
  const plan = [];

  const aanwezig = db.prepare("PRAGMA table_info(projects)").all().map((k) => k.name);
  const metaKolommen = KOLOMMEN.every((kolom) => aanwezig.includes(kolom));

  for (const [slug, nieuw] of Object.entries(NIEUW)) {
    const rij = db
      .prepare(
        `SELECT id, body, body_en${metaKolommen ? `, ${KOLOMMEN.join(", ")}` : ""} FROM projects WHERE slug = ?`,
      )
      .get(slug);
    if (!rij) {
      regels.push(`- ${slug}: bestaat niet, overgeslagen.`);
      continue;
    }

    const wijzigingen = {};
    const notities = [];

    for (const veld of KOLOMMEN) {
      const huidig = metaKolommen ? rij[veld] : "";
      if (huidig === nieuw[veld]) continue;
      if (huidig === "") wijzigingen[veld] = nieuw[veld];
      else notities.push(`${veld} zelf ingevuld, blijft staan`);
    }

    for (const [veld, taal] of [["body", "nl"], ["body_en", "en"]]) {
      const nieuweWaarde = nieuweTekst(slug, taal);
      if (rij[veld] === nieuweWaarde) continue;
      if (rij[veld] === VORIG[slug][veld]) wijzigingen[veld] = nieuweWaarde;
      else notities.push(`${veld} zelf aangepast, blijft staan`);
    }

    const aantal = Object.keys(wijzigingen).length;
    if (aantal > 0) plan.push({ slug, id: rij.id, wijzigingen });
    regels.push(
      `- ${slug}: ${
        aantal === 0
          ? "al bijgewerkt"
          : `${dryRun ? "wordt bijgewerkt" : "bijgewerkt"} (${Object.keys(wijzigingen).join(", ")})`
      }${notities.length ? `; ${notities.join("; ")}` : ""}.`,
    );
  }

  let backup = null;
  let gewijzigd = 0;
  if (plan.length > 0 && !dryRun) {
    fs.mkdirSync(backupDir, { recursive: true });
    backup = path.join(backupDir, `kai-aerials-voor-seo-2026-10-${tijdstempel(nu)}.db`);
    // VACUUM INTO maakt een consistente kopie, ook in WAL-modus.
    db.prepare("VACUUM INTO ?").run(backup);

    db.transaction(() => {
      zorgVoorKolommen(db);
      for (const { id, wijzigingen } of plan) {
        const velden = Object.keys(wijzigingen);
        db.prepare(`UPDATE projects SET ${velden.map((v) => `${v} = ?`).join(", ")} WHERE id = ?`).run(
          ...velden.map((v) => wijzigingen[v]),
          id,
        );
        gewijzigd += 1;
      }
    })();
  }

  return { regels, gepland: plan.length, gewijzigd, backup };
}

module.exports = { bijwerken, NIEUW, VORIG, KOLOMMEN, nieuweTekst };

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
  const uitkomst = bijwerken(db, { backupDir: path.join(dataDir, "backups"), dryRun });
  db.close();

  console.log(`Database: ${dbPath}${dryRun ? " (dry-run, er wordt niets geschreven)" : ""}`);
  console.log(uitkomst.regels.join("\n"));
  if (uitkomst.backup) console.log(`\nBack-up: ${uitkomst.backup}`);
  console.log(
    dryRun
      ? `\nDry-run klaar. ${uitkomst.gepland} project(en) zouden worden bijgewerkt.`
      : `\nKlaar. ${uitkomst.gewijzigd} project(en) bijgewerkt.`,
  );
}
