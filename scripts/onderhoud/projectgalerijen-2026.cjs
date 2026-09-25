/**
 * ============================================================================
 *  FOTOGALERIJEN BIJ DE TWEE ECHTE PROJECTEN
 * ============================================================================
 *  De galerijbeelden staan in de database. Nieuwe voorbeeldgegevens worden
 *  alleen in een lege database gezet, dus een site die al draait krijgt deze
 *  foto's niet vanzelf. Dit script zet ze er alsnog in.
 *
 *  Het werkt op `url` als sleutel binnen een project:
 *
 *    - staat de foto er nog niet, dan wordt hij toegevoegd;
 *    - staat hij er al, dan worden alleen de bijschriften en de volgorde
 *      bijgewerkt als die afwijken;
 *    - staat er iets anders in de galerij, dan blijft dat staan.
 *
 *  Draai je het script twee keer, dan verandert er de tweede keer niets meer.
 *  Er komt dus nooit een dubbele regel bij, ook niet na een nieuwe uitrol.
 *
 *  Het script controleert eerst of het bestand er echt is. Ontbreekt een foto
 *  in public/media, dan wordt die regel overgeslagen: liever geen galerij dan
 *  een galerij vol gebroken afbeeldingen. Zet de bestanden erbij en draai het
 *  script opnieuw.
 *
 *  Bewust géén onderdeel van het opstarten: haal je een foto weg in de
 *  beheeromgeving, dan hoort die niet bij de volgende uitrol terug te komen.
 *
 *  Lokaal draaien:
 *      node scripts/onderhoud/projectgalerijen-2026.cjs
 *
 *  Op de server, nadat de nieuwe versie is uitgerold:
 *      fly ssh console -C "node scripts/onderhoud/projectgalerijen-2026.cjs"
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

/** Per project de galerij, in de volgorde waarin hij op de site komt. */
const GALERIJEN = {
  "de-zaan-in-wormerveer": [
    {
      url: "/media/wormerveer-de-zaan-01.webp",
      alt: "Karakteristieke bebouwing en woonboten langs de Zaan in Wormerveer",
      alt_en: "Waterfront buildings and houseboats along the River Zaan in Wormerveer",
    },
    {
      url: "/media/wormerveer-de-zaan-02.webp",
      alt: "Uitzicht over de Zaan met bomen en kade in Wormerveer",
      alt_en: "View across the River Zaan with trees and the quay in Wormerveer",
    },
    {
      url: "/media/wormerveer-de-zaan-03.webp",
      alt: "Hoog droneperspectief over Wormerveer en de Zaan",
      alt_en: "High aerial view across Wormerveer and the River Zaan",
    },
    {
      url: "/media/wormerveer-de-zaan-04.webp",
      alt: "Bocht in de Zaan langs de kade van Wormerveer",
      alt_en: "Bend in the River Zaan along the Wormerveer quay",
    },
  ],
  "knooppunt-zaandam-bij-zonsondergang": [
    {
      url: "/media/knooppunt-zaandam-01.webp",
      alt: "Snelweg door het groene landschap bij knooppunt Zaandam in de avond",
      alt_en:
        "Motorway through the green landscape near Zaandam interchange in the evening",
    },
    {
      url: "/media/knooppunt-zaandam-02.webp",
      alt: "Rijbanen en verkeer bij knooppunt Zaandam vanuit de lucht",
      alt_en: "Aerial view of the carriageways and traffic near Zaandam interchange",
    },
    {
      url: "/media/knooppunt-zaandam-03.webp",
      alt: "Snelweg en watergang bij knooppunt Zaandam rond zonsondergang",
      alt_en: "Motorway and waterway near Zaandam interchange around sunset",
    },
    {
      url: "/media/knooppunt-zaandam-04.webp",
      alt: "Avondverkeer op de snelweg richting Zaandam",
      alt_en: "Evening traffic on the motorway towards Zaandam",
    },
  ],
};

const db = new Database(dbPath);

// De kolom komt normaal uit de migratie bij het opstarten. Draait dit script
// vóór de eerste start van de nieuwe versie, dan zetten we hem hier alsnog.
const kolommen = db.prepare("PRAGMA table_info(project_images)").all();
if (!kolommen.some((k) => k.name === "alt_en")) {
  db.exec("ALTER TABLE project_images ADD COLUMN alt_en TEXT NOT NULL DEFAULT ''");
  console.log("- kolom alt_en toegevoegd");
}

let toegevoegd = 0;
let bijgewerkt = 0;
let ongemoeid = 0;
let ontbreekt = 0;

for (const [slug, beelden] of Object.entries(GALERIJEN)) {
  const project = db
    .prepare("SELECT id FROM projects WHERE slug = ?")
    .get(slug);

  if (!project) {
    console.log(`- ${slug}: project niet gevonden, galerij overgeslagen`);
    continue;
  }

  beelden.forEach((beeld, index) => {
    const bestand = path.join(publicDir, beeld.url.replace(/^\//, ""));
    if (!fs.existsSync(bestand)) {
      console.log(`- ${beeld.url}: bestand ontbreekt, overgeslagen`);
      ontbreekt++;
      return;
    }

    const bestaand = db
      .prepare("SELECT * FROM project_images WHERE project_id = ? AND url = ?")
      .get(project.id, beeld.url);

    if (!bestaand) {
      db.prepare(
        `INSERT INTO project_images (project_id, url, alt, alt_en, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(project.id, beeld.url, beeld.alt, beeld.alt_en, index);
      console.log(`- ${beeld.url}: toegevoegd`);
      toegevoegd++;
      return;
    }

    const afwijkend =
      bestaand.alt !== beeld.alt ||
      (bestaand.alt_en ?? "") !== beeld.alt_en ||
      bestaand.sort_order !== index;

    if (!afwijkend) {
      ongemoeid++;
      return;
    }

    db.prepare(
      "UPDATE project_images SET alt = ?, alt_en = ?, sort_order = ? WHERE id = ?",
    ).run(beeld.alt, beeld.alt_en, index, bestaand.id);
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
