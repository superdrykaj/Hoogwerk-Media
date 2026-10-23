/**
 * ============================================================================
 *  EEN BESTAANDE DATABASE OP DE NIEUWSTE STAND BRENGEN (OKTOBER 2026)
 * ============================================================================
 *  Nieuwe voorbeeldgegevens komen alleen in een lege database. Een site die al
 *  draait, zoals productie, mist daardoor de herziene diensten en tarieven,
 *  de echte projecten (De Zaan in Wormerveer, IJburg, De Zaanse Schans) en de
 *  opgeschoonde voorbeeldprojecten. Dit script draait de losse
 *  onderhoudsscripts in de juiste volgorde, zodat je niet zelf hoeft te
 *  onthouden welke er al zijn geweest.
 *
 *  Volgorde, met per stap wat er gebeurt:
 *    1. Back-up van de hele database in <DATA_DIR>/backups/ (VACUUM INTO).
 *    2. werkgebied-noord-holland  voorbeeldteksten (alleen als ongewijzigd)
 *    3. echte-projecten-2026    echte projecten erin, veenweide eruit
 *    4. projectgalerijen-2026   fotogalerijen bij de echte projecten
 *    5. voorbeelden-als-concept voorbeeldprojecten naar concept
 *    6. ijburg-portfolio-2026   IJburg uitgelicht, Knooppunt Zaandam uit
 *    7. zaanse-schans-2026      De Zaanse Schans erbij
 *    8. tarieven-2026-10        diensten, prijzen, omschrijvingen, duur
 *    9. seo-projecten-2026-10   zoektitels en projectteksten (na stap 3-7)
 *
 *  Het oudere tarieven-2026 draait hier bewust NIET: tarieven-2026-10 doet
 *  alles wat dat script voor de diensten deed, en het oude script zet een
 *  omschrijving bij elke run terug naar een oude tekst. De voorbeeldprojecten
 *  die het oude script aanraakte (festival, nieuwbouw) staan na stap 3 en 5
 *  toch al op concept.
 *
 *  Veilig om opnieuw te draaien: de eindstand is na elke run gelijk en
 *  aangepaste gegevens blijven staan. (De twee galeriescripts zetten de
 *  IJburg-bijschriften bij een herhaling even om en weer terug; het
 *  IJburg-script draait later en bepaalt de eindstand.) Stopt bij de eerste fout; de
 *  back-up uit stap 1 is dan het herstelpunt.
 *
 *  Gebruik:
 *      node scripts/onderhoud/productie-bijwerken-2026-10.cjs --dry-run
 *      node scripts/onderhoud/productie-bijwerken-2026-10.cjs
 *
 *  Met --dry-run wordt alleen het dienstenscript droog uitgevoerd (alleen dat
 *  script kent een dry-run; seo-projecten-2026-10 kun je ook los met --dry-run
 *  bekijken, nadat de projecten er zijn); de rest staat als lijst. Er wordt niets geschreven.
 *
 *  Op productie:
 *      fly ssh console --app hoogbeeld-media -C "node scripts/onderhoud/productie-bijwerken-2026-10.cjs"
 *
 *  Bewust géén onderdeel van het opstarten, zodat er nooit ongevraagd in je
 *  eigen gegevens wordt geschreven.
 * ============================================================================
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const STAPPEN = [
  ["werkgebied-noord-holland.cjs", "voorbeeldteksten (alleen als ongewijzigd)"],
  ["echte-projecten-2026.cjs", "echte projecten erin, veenweide eruit"],
  ["projectgalerijen-2026.cjs", "fotogalerijen bij de echte projecten"],
  ["voorbeelden-als-concept.cjs", "voorbeeldprojecten naar concept"],
  ["ijburg-portfolio-2026.cjs", "IJburg uitgelicht, Knooppunt Zaandam uit"],
  ["zaanse-schans-2026.cjs", "De Zaanse Schans erbij"],
  // Als laatste: bepaalt de definitieve stand van de diensten.
  ["tarieven-2026-10.cjs", "diensten, prijzen, omschrijvingen en duur"],
  // Na de projectscripts: die zetten de projectteksten terug naar de oude
  // stand, dit script voegt daar de nieuwe zoektitels en alinea aan toe.
  ["seo-projecten-2026-10.cjs", "zoektitels en projectteksten"],
];
const DIENSTEN = "tarieven-2026-10.cjs";

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(dataDir, "kai-aerials.db");
const dryRun = process.argv.includes("--dry-run");
const map = __dirname;

function kop(tekst) {
  console.log(`\n=== ${tekst}`);
}

if (!fs.existsSync(dbPath)) {
  console.error(`Geen database gevonden op ${dbPath}.`);
  process.exit(1);
}
console.log(`Database: ${dbPath}${dryRun ? " (dry-run, er wordt niets geschreven)" : ""}`);

if (dryRun) {
  kop("1. Back-up (wordt bij een echte run gemaakt)");
  console.log("\nDeze stappen draaien bij een echte run (alleen de laatste kent een dry-run):");
  STAPPEN.forEach(([bestand, wat], i) =>
    console.log(`  ${i + 2}. ${bestand.replace(".cjs", "")}: ${wat}`),
  );
  kop(`${STAPPEN.findIndex(([bestand]) => bestand === DIENSTEN) + 2}. ${DIENSTEN.replace(".cjs", "")} (dry-run)`);
  console.log("Let op: dit toont wat dit script zelf zou doen op de huidige database.");
  console.log("Na de oudere stappen kunnen de diensten er al deels anders uitzien.\n");
  execFileSync(process.execPath, [path.join(map, DIENSTEN), "--dry-run"], {
    stdio: "inherit",
    env: process.env,
  });
  console.log("\nDry-run klaar. Er is niets geschreven.");
  process.exit(0);
}

// Stap 1: back-up. Eerst dit, voordat een script iets aanraakt.
kop("1. Back-up");
const Database = require("better-sqlite3");
const backupDir = path.join(dataDir, "backups");
fs.mkdirSync(backupDir, { recursive: true });
const stempel = new Date().toISOString().replace(/[:.]/g, "-");
const backup = path.join(backupDir, `kai-aerials-voor-bijwerken-2026-10-${stempel}.db`);
const db = new Database(dbPath);
db.pragma("busy_timeout = 5000");
db.prepare("VACUUM INTO ?").run(backup);
db.close();
console.log(`Back-up: ${backup}`);

STAPPEN.forEach(([bestand, wat], i) => {
  kop(`${i + 2}. ${bestand.replace(".cjs", "")}: ${wat}`);
  try {
    execFileSync(process.execPath, [path.join(map, bestand)], {
      stdio: "inherit",
      env: process.env,
    });
  } catch {
    console.error(
      `\nStap ${i + 2} (${bestand}) is mislukt; de rest is niet uitgevoerd.\n` +
        `Herstelpunt: ${backup}`,
    );
    process.exit(1);
  }
});

console.log(`\nKlaar. Alle stappen zijn uitgevoerd. Back-up: ${backup}`);
