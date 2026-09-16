/**
 * Vult de database met FICTIEVE voorbeeldgegevens.
 *
 *   npm run seed            # vult alleen aan wat nog ontbreekt
 *   npm run seed -- --reset # gooit eerst ALLES weg, ook echte boekingen
 *
 * De gegevens zelf staan in lib/example-data.ts. Op een verse server worden ze
 * ook automatisch geplaatst bij de eerste keer opstarten.
 */
import { getDb } from "../lib/db";
import { installExampleData, wipeAllData } from "../lib/example-data";
import { DEFAULT_SETTINGS, saveSettings } from "../lib/settings";

const db = getDb();

if (process.argv.includes("--reset")) {
  wipeAllData(db);
  console.log("Bestaande gegevens verwijderd.");
}

saveSettings(DEFAULT_SETTINGS);
const counts = installExampleData(db);

console.log(
  `Klaar. Toegevoegd: ${counts.services} diensten, ${counts.projects} ` +
    `voorbeeldprojecten en ${counts.weekly} beschikbare periodes. ` +
    "Wat al bestond is ongemoeid gelaten.",
);
