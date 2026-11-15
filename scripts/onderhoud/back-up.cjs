#!/usr/bin/env node
/**
 * Back-up en herstelcontrole van de gegevens op de gekoppelde schijf.
 *
 *   node scripts/onderhoud/back-up.cjs                 maakt een back-up
 *   node scripts/onderhoud/back-up.cjs controleer      controleert de nieuwste back-up
 *   node scripts/onderhoud/back-up.cjs controleer <map> controleert een bepaalde back-up
 *   node scripts/onderhoud/back-up.cjs lijst           toont de aanwezige back-ups
 *
 * Wat er in een back-up zit: de hele database (met VACUUM INTO, dus consistent
 * ook terwijl de site draait) en alle factuur-PDF's, met een manifest met
 * controlesommen. De opleverbestanden (foto's en video's) zitten er bewust
 * niet in: dat zijn gigabytes en ze zijn het werk zelf; zie docs/BACKUP.md
 * voor hoe je die beschermt.
 *
 * Een back-up op dezelfde schijf beschermt tegen een foutje of een kapotte
 * database, niet tegen het verlies van de schijf zelf. Kopieer daarom af en toe
 * een back-up naar een andere plek (docs/BACKUP.md).
 *
 * Draait zonder herstart en zonder iets aan de bestaande gegevens te wijzigen.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const BEWAAR_AANTAL = 14;
const MIN_VRIJE_MB = 100;

function dataDir() {
  return process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
}
function dbPad(dir) {
  return process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : path.join(dir, "kai-aerials.db");
}
function sha256(file) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash("sha256");
    fs.createReadStream(file).on("data", (c) => h.update(c)).on("end", () => resolve(h.digest("hex"))).on("error", reject);
  });
}
function stempel(nu = new Date()) {
  // Europe/Amsterdam, zodat "vandaag" overeenkomt met wat je zelf ziet.
  const d = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(nu);
  return d.replace(" ", "T").replace(":", "");
}
const MAP_PATROON = /^\d{4}-\d{2}-\d{2}T\d{4}$/;

function backupMap(dir) {
  return path.join(dir, "backups", "dagelijks");
}
function lijst(dir) {
  const m = backupMap(dir);
  if (!fs.existsSync(m)) return [];
  return fs.readdirSync(m).filter((n) => MAP_PATROON.test(n)).sort();
}

/** Maakt een back-up en geeft de map terug. */
async function maakBackup({ dir = dataDir(), nu = new Date() } = {}) {
  const Database = require("better-sqlite3");
  const bron = dbPad(dir);
  if (!fs.existsSync(bron)) throw new Error(`Geen database gevonden op ${bron}.`);

  fs.mkdirSync(backupMap(dir), { recursive: true });
  const vrij = fs.statfsSync(dir);
  const vrijMb = Math.floor((vrij.bavail * vrij.bsize) / 1048576);
  if (vrijMb < MIN_VRIJE_MB) {
    throw new Error(`Te weinig vrije schijfruimte (${vrijMb} MB); er is geen back-up gemaakt. Vergroot de schijf.`);
  }

  const doel = path.join(backupMap(dir), stempel(nu));
  if (fs.existsSync(doel)) throw new Error(`Back-up ${path.basename(doel)} bestaat al.`);
  const tijdelijk = `${doel}.bezig`;
  fs.rmSync(tijdelijk, { recursive: true, force: true });
  fs.mkdirSync(path.join(tijdelijk, "invoices"), { recursive: true });

  const db = new Database(bron, { readonly: true, fileMustExist: true });
  const manifest = { gemaakt: nu.toISOString(), facturen: [], databaseBytes: 0 };
  try {
    db.prepare("VACUUM INTO ?").run(path.join(tijdelijk, "kai-aerials.db"));
    const rijen = db
      .prepare("SELECT invoice_number, pdf_filename, pdf_sha256 FROM invoices WHERE issued_utc IS NOT NULL ORDER BY id")
      .all();
    for (const r of rijen) {
      const entry = { nummer: r.invoice_number, bestand: r.pdf_filename, sha256: r.pdf_sha256, gekopieerd: false };
      if (r.pdf_filename && /^[A-Za-z0-9._-]+$/.test(r.pdf_filename)) {
        const van = path.join(dir, "invoices", r.pdf_filename);
        if (fs.existsSync(van)) {
          fs.copyFileSync(van, path.join(tijdelijk, "invoices", r.pdf_filename));
          entry.gekopieerd = true;
        }
      }
      manifest.facturen.push(entry);
    }
  } finally {
    db.close();
  }
  manifest.databaseBytes = fs.statSync(path.join(tijdelijk, "kai-aerials.db")).size;
  fs.writeFileSync(path.join(tijdelijk, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.renameSync(tijdelijk, doel);

  // Oude back-ups opruimen: alleen mappen met onze eigen naam, de nieuwste blijven.
  const alle = lijst(dir);
  for (const oud of alle.slice(0, Math.max(0, alle.length - BEWAAR_AANTAL))) {
    fs.rmSync(path.join(backupMap(dir), oud), { recursive: true, force: true });
  }
  return doel;
}

/**
 * Controleert of een back-up bruikbaar is voor herstel: de database is heel,
 * elke uitgegeven factuur heeft zijn PDF en elk PDF is byte voor byte wat er
 * bij uitgifte is vastgelegd. Wijzigt niets.
 */
async function controleer(map) {
  const Database = require("better-sqlite3");
  const problemen = [];
  const dbBestand = path.join(map, "kai-aerials.db");
  if (!fs.existsSync(dbBestand)) return { ok: false, problemen: ["kai-aerials.db ontbreekt in de back-up"], samenvatting: {} };

  const db = new Database(dbBestand, { readonly: true, fileMustExist: true });
  let samenvatting = {};
  try {
    const integriteit = db.pragma("integrity_check", { simple: true });
    if (integriteit !== "ok") problemen.push(`database is beschadigd: ${integriteit}`);
    const fk = db.pragma("foreign_key_check");
    if (fk.length > 0) problemen.push(`${fk.length} verwijzingen in de database kloppen niet`);

    const telling = (sql) => db.prepare(sql).get().n;
    samenvatting = {
      boekingen: telling("SELECT COUNT(*) n FROM bookings"),
      facturen: telling("SELECT COUNT(*) n FROM invoices"),
      uitgegeven: telling("SELECT COUNT(*) n FROM invoices WHERE issued_utc IS NOT NULL"),
      opleverbestanden: telling("SELECT COUNT(*) n FROM invoice_files"),
    };

    const uitgegeven = db
      .prepare("SELECT invoice_number, pdf_filename, pdf_sha256, snapshot_json FROM invoices WHERE issued_utc IS NOT NULL")
      .all();
    let pdfOk = 0;
    for (const f of uitgegeven) {
      if (!f.snapshot_json) problemen.push(`factuur ${f.invoice_number}: vastlegging ontbreekt`);
      if (!f.pdf_filename) continue; // PDF wordt dan bij de eerste download opnieuw opgebouwd uit de vastlegging
      const pad = path.join(map, "invoices", path.basename(f.pdf_filename));
      if (!fs.existsSync(pad)) {
        problemen.push(`factuur ${f.invoice_number}: PDF ${f.pdf_filename} ontbreekt in de back-up`);
        continue;
      }
      if ((await sha256(pad)) !== f.pdf_sha256) {
        problemen.push(`factuur ${f.invoice_number}: PDF wijkt af van de vastgelegde controlesom`);
        continue;
      }
      pdfOk++;
    }
    samenvatting.pdfControleOk = pdfOk;
  } finally {
    db.close();
  }
  return { ok: problemen.length === 0, problemen, samenvatting };
}

/**
 * Draait dit als root (bijvoorbeeld via `fly ssh console`), dan zou het openen
 * van de database bestanden kunnen aanmaken die van root zijn, waarna de server
 * ze niet meer kan beschrijven. Daarom eerst overschakelen naar de eigenaar van
 * de gegevensmap, dezelfde gebruiker als waaronder de server draait.
 */
function laatRootLos(dir) {
  if (typeof process.getuid !== "function" || process.getuid() !== 0 || !fs.existsSync(dir)) return;
  const { uid, gid } = fs.statSync(dir);
  if (uid !== 0) {
    process.setgid(gid);
    process.setuid(uid);
  }
}

async function main() {
  const dir = dataDir();
  laatRootLos(dir);
  const [cmd = "maak", arg] = process.argv.slice(2);
  if (cmd === "lijst") {
    const alle = lijst(dir);
    console.log(alle.length ? alle.map((n) => `  ${n}`).join("\n") : "Geen back-ups gevonden.");
    return;
  }
  if (cmd === "controleer") {
    const map = arg ? path.resolve(arg) : (() => { const a = lijst(dir); return a.length ? path.join(backupMap(dir), a.at(-1)) : null; })();
    if (!map) { console.error("Geen back-up om te controleren."); process.exit(1); }
    const r = await controleer(map);
    console.log(`Back-up: ${map}\n${JSON.stringify(r.samenvatting)}`);
    if (r.ok) console.log("Controle geslaagd: de back-up is bruikbaar voor herstel.");
    else { console.error("Controle MISLUKT:\n - " + r.problemen.join("\n - ")); process.exit(1); }
    return;
  }
  if (cmd === "maak") {
    const doel = await maakBackup({ dir });
    const r = await controleer(doel);
    console.log(`Back-up gemaakt: ${doel}\n${JSON.stringify(r.samenvatting)}`);
    if (!r.ok) { console.error("Let op, de nieuwe back-up is niet in orde:\n - " + r.problemen.join("\n - ")); process.exit(1); }
    return;
  }
  console.error("Onbekende opdracht. Gebruik: maak | controleer [map] | lijst");
  process.exit(2);
}

module.exports = { maakBackup, controleer, lijst, backupMap, stempel, BEWAAR_AANTAL };

if (require.main === module) {
  main().catch((e) => { console.error(`Back-up mislukt: ${e.message}`); process.exit(1); });
}
