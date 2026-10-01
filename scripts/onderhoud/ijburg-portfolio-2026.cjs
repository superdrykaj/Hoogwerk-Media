/**
 * Zet het echte IJburg-project in de database van de site die al draait,
 * op dezelfde manier als scripts/onderhoud/zaanse-schans-2026.cjs: nieuwe
 * voorbeeldgegevens (lib/example-data.ts) komen alleen in een lege database
 * terecht.
 *
 * Draai dit nadat de bijbehorende mediabestanden zijn uitgerold:
 *   node scripts/onderhoud/ijburg-portfolio-2026.cjs
 *
 * Op de testomgeving:
 *   fly ssh console --app hoogbeeld-media-test -C "node scripts/onderhoud/ijburg-portfolio-2026.cjs"
 *
 * Raakt alleen het IJburg-project en zijn eigen galerijrecords. IJburg staat
 * op de homepage in de plaats van Knooppunt Zaandam: dat project wordt
 * ongepubliceerd en niet meer uitgelicht (niet verwijderd; in Beheer weer aan
 * te zetten). Opnieuw te
 * draaien zonder gevolgen: een tweede keer verandert er niets meer.
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

const project = {
  slug: "ijburg-vanuit-de-lucht",
  title: "IJburg vanuit de lucht",
  category: "vastgoed",
  location: "IJburg, Amsterdam",
  summary:
    "Een drone-impressie van IJburg, met moderne waterfrontarchitectuur, waterwoningen en de jachthaven.",
  body:
    "Vanuit de lucht komen de moderne woonblokken, waterwoningen en de jachthaven van IJburg samen in één overzicht van het stadsdeel. De rustige camerabewegingen laten zien hoe de architectuur en het water het karakter van deze Amsterdamse wijk bepalen.",
  cover_url: "/media/ijburg-poster.webp",
  cover_alt: "Luchtbeeld van de waterwoningen en jachthaven in IJburg.",
  title_en: "IJburg from the air",
  location_en: "IJburg, Amsterdam",
  summary_en:
    "An aerial impression of IJburg, featuring modern waterfront architecture, waterside homes and the marina.",
  body_en:
    "From above, IJburg's modern apartment blocks, waterside homes and marina come together in a single overview of the district. The calm camera movements show how architecture and water shape the character of this Amsterdam neighbourhood.",
  cover_alt_en: "Aerial view of IJburg's waterside homes and marina.",
  video_url: "/media/ijburg-dronevideo.mp4",
  published: 1,
  featured: 1,
  sort_order: 2,
  is_example: 0,
};

const images = [
  {
    url: "/media/ijburg-01.webp",
    alt: "Moderne woningen en water in IJburg, gefilmd vanuit de lucht.",
    alt_en: "Modern homes and waterways in IJburg, filmed from the air.",
    sort_order: 1,
  },
  {
    url: "/media/ijburg-02.webp",
    alt: "De jachthaven en open water rond IJburg.",
    alt_en: "The marina and open water around IJburg.",
    sort_order: 2,
  },
  {
    url: "/media/ijburg-03.webp",
    alt: "Waterwoningen aan een kanaal in IJburg.",
    alt_en: "Waterside homes along a canal in IJburg.",
    sort_order: 3,
  },
  {
    url: "/media/ijburg-04.webp",
    alt: "Woonarchitectuur en waterwegen in IJburg.",
    alt_en: "Residential architecture and waterways in IJburg.",
    sort_order: 4,
  },
];

for (const url of [project.cover_url, project.video_url, ...images.map((image) => image.url)]) {
  const filePath = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));
  if (!fs.existsSync(filePath)) {
    throw new Error(`Ontbrekend mediabestand voor IJburg: ${filePath}`);
  }
}

const db = new Database(dbPath);
try {
  const projectColumns = new Set(
    db.prepare("PRAGMA table_info(projects)").all().map((column) => column.name),
  );
  const imageColumns = new Set(
    db.prepare("PRAGMA table_info(project_images)").all().map((column) => column.name),
  );
  for (const column of Object.keys(project)) {
    if (!projectColumns.has(column)) {
      throw new Error(`Kolom projects.${column} ontbreekt; rol eerst de huidige versie uit.`);
    }
  }
  for (const column of ["project_id", "url", "alt", "alt_en", "sort_order"]) {
    if (!imageColumns.has(column)) {
      throw new Error(`Kolom project_images.${column} ontbreekt; rol eerst de huidige versie uit.`);
    }
  }

  const sync = db.transaction(() => {
    const existing = db
      .prepare("SELECT id FROM projects WHERE slug = ?")
      .get(project.slug);
    let projectId;

    if (existing) {
      const fields = Object.keys(project).filter((field) => field !== "slug");
      db.prepare(
        `UPDATE projects SET ${fields.map((field) => `${field} = @${field}`).join(", ")} WHERE slug = @slug`,
      ).run(project);
      projectId = existing.id;
    } else {
      const fields = [...Object.keys(project), "created_utc"];
      const result = db.prepare(
        `INSERT INTO projects (${fields.join(", ")}) VALUES (${fields.map((field) => `@${field}`).join(", ")})`,
      ).run({ ...project, created_utc: Date.now() });
      projectId = Number(result.lastInsertRowid);
    }

    for (const image of images) {
      const existingImage = db
        .prepare("SELECT id FROM project_images WHERE project_id = ? AND url = ?")
        .get(projectId, image.url);
      if (existingImage) {
        db.prepare(
          "UPDATE project_images SET alt = ?, alt_en = ?, sort_order = ? WHERE id = ?",
        ).run(image.alt, image.alt_en, image.sort_order, existingImage.id);
      } else {
        db.prepare(
          "INSERT INTO project_images (project_id, url, alt, alt_en, sort_order) VALUES (?, ?, ?, ?, ?)",
        ).run(projectId, image.url, image.alt, image.alt_en, image.sort_order);
      }
    }
    db.prepare(
      "UPDATE projects SET published = 0, featured = 0 WHERE slug = ?",
    ).run("knooppunt-zaandam-bij-zonsondergang");
    return { projectId, galleryCount: images.length };
  });

  const result = sync();
  console.log(
    `IJburg-project ${project.slug} staat klaar (id ${result.projectId}, ` +
      `${result.galleryCount} galerijbeelden, NL/EN, gepubliceerd). DB: ${dbPath}`,
  );
} finally {
  db.close();
}
