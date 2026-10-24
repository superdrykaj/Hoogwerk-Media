// Let op: dit bestand draait alleen op de server (native module + bestandssysteem).
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { site } from "@/content/site";

import { DEFAULT_INVOICE_SETTINGS, DEFAULT_SETTINGS } from "./defaults";
import { installExampleData } from "./example-data";
import { DEFAULT_PAYMENT_TERM_DAYS, buildSnapshot } from "./invoice-rules";
import { dateKeyOf } from "./time";
import type { InvoiceSettings } from "./types";

/**
 * SQLite-database. Het bestand heet `kai-aerials.db`: die naam stamt uit de
 * tijd vóór de naamswijziging en blijft staan, omdat hernoemen een bestaande
 * database onvindbaar zou maken. Zet DATABASE_PATH om een andere naam of
 * locatie te gebruiken.
 * Zet DATABASE_PATH in het .env-bestand om een andere locatie te gebruiken.
 */

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(DATA_DIR, "kai-aerials.db");

declare global {
  var __hoogbeeldMediaDb: Database.Database | undefined;
}

function create(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  // Wacht tot 5 seconden als een andere schrijver bezig is.
  db.pragma("busy_timeout = 5000");
  migrate(db);
  bootstrap(db);
  return db;
}

/**
 * Vult een verse database met de fictieve voorbeeldgegevens, zodat een nieuw
 * geplaatste server niet leeg is. Draait alleen als er nog geen enkele dienst
 * bestaat, dus bestaande gegevens worden nooit overschreven.
 *
 * Zet SEED_ON_EMPTY="false" om dit uit te schakelen, bijvoorbeeld als je met
 * een schone installatie wilt beginnen.
 */
function bootstrap(db: Database.Database) {
  if (process.env.SEED_ON_EMPTY === "false") return;

  const existing = db.prepare("SELECT COUNT(*) AS n FROM services").get() as {
    n: number;
  };
  if (existing.n > 0) return;

  const insertSetting = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING",
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, String(value));
  }

  const counts = installExampleData(db);
  console.log(
    `[hoogbeeld-media] Verse database gevuld met voorbeeldgegevens: ` +
      `${counts.services} diensten, ${counts.projects} projecten.`,
  );
}

export function getDb(): Database.Database {
  if (!globalThis.__hoogbeeldMediaDb) {
    globalThis.__hoogbeeldMediaDb = create();
  }
  return globalThis.__hoogbeeldMediaDb;
}

/**
 * Zet de tabellen klaar en voegt ontbrekende kolommen toe. Geëxporteerd zodat
 * een test dit op een database in het geheugen kan draaien.
 */
export function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      slug             TEXT NOT NULL UNIQUE,
      name             TEXT NOT NULL,
      description      TEXT NOT NULL DEFAULT '',
      duration_minutes INTEGER NOT NULL,
      price_label      TEXT NOT NULL DEFAULT '',
      buffer_minutes   INTEGER NOT NULL DEFAULT 0,
      bookable         INTEGER NOT NULL DEFAULT 1,
      intro_only       INTEGER NOT NULL DEFAULT 0,
      sort_order       INTEGER NOT NULL DEFAULT 0,
      active           INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS weekly_availability (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      weekday      INTEGER NOT NULL,  -- 0 = zondag
      start_minute INTEGER NOT NULL,
      end_minute   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS date_overrides (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      date_key     TEXT NOT NULL,     -- 'YYYY-MM-DD'
      kind         TEXT NOT NULL,     -- 'block' | 'open'
      start_minute INTEGER NOT NULL,
      end_minute   INTEGER NOT NULL,
      note         TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_overrides_date ON date_overrides(date_key);

    CREATE TABLE IF NOT EXISTS bookings (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      reference    TEXT NOT NULL UNIQUE,
      service_id   INTEGER NOT NULL REFERENCES services(id),
      start_utc    INTEGER NOT NULL,
      end_utc      INTEGER NOT NULL,
      status       TEXT NOT NULL,     -- pending | confirmed | rejected | cancelled
      name         TEXT NOT NULL,
      email        TEXT NOT NULL,
      phone        TEXT NOT NULL DEFAULT '',
      location     TEXT NOT NULL DEFAULT '',
      description  TEXT NOT NULL DEFAULT '',
      -- Alleen ingevuld bij een project op maat (zie lib/project-scope.ts).
      extra_locations  TEXT NOT NULL DEFAULT '',
      session_count    TEXT NOT NULL DEFAULT '',
      period_wish      TEXT NOT NULL DEFAULT '',
      time_preferences TEXT NOT NULL DEFAULT '',
      admin_note   TEXT NOT NULL DEFAULT '',
      created_utc  INTEGER NOT NULL,
      updated_utc  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_start ON bookings(start_utc);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

    CREATE TABLE IF NOT EXISTS projects (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT NOT NULL UNIQUE,
      title        TEXT NOT NULL,
      category     TEXT NOT NULL,
      location     TEXT NOT NULL DEFAULT '',
      summary      TEXT NOT NULL DEFAULT '',
      body         TEXT NOT NULL DEFAULT '',
      cover_url    TEXT NOT NULL DEFAULT '',
      cover_alt    TEXT NOT NULL DEFAULT '',
      video_url    TEXT NOT NULL DEFAULT '',
      published    INTEGER NOT NULL DEFAULT 0,
      featured     INTEGER NOT NULL DEFAULT 0,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      created_utc  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      url        TEXT NOT NULL,
      alt        TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_project_images ON project_images(project_id);

    CREATE TABLE IF NOT EXISTS contact_messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      subject     TEXT NOT NULL,
      message     TEXT NOT NULL,
      handled     INTEGER NOT NULL DEFAULT 0,
      created_utc INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mail_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      to_address  TEXT NOT NULL,
      subject     TEXT NOT NULL,
      status      TEXT NOT NULL,     -- sent | skipped | failed
      detail      TEXT NOT NULL DEFAULT '',
      created_utc INTEGER NOT NULL
    );

    -- Eén factuur/oplevering per boeking. Het bedrag vult Kai zelf in; dat
    -- staat los van services.price_label, wat maar een indicatie is.
    CREATE TABLE IF NOT EXISTS invoices (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id          INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      -- Lang en willekeurig, voor de opleveringslink. Bewust niet de korte,
      -- mensleesbare boekingsreferentie: die staat al in mails en het adres.
      token               TEXT NOT NULL UNIQUE,
      amount_cents        INTEGER NOT NULL DEFAULT 0,
      description         TEXT NOT NULL DEFAULT '',
      pay_before_download INTEGER NOT NULL DEFAULT 1,
      status              TEXT NOT NULL DEFAULT 'draft', -- draft | sent | paid | cancelled
      mollie_payment_id   TEXT NOT NULL DEFAULT '',
      paid_utc            INTEGER,
      payment_sent_utc    INTEGER,
      delivery_sent_utc   INTEGER,
      created_utc         INTEGER NOT NULL,
      updated_utc         INTEGER NOT NULL
    );

    -- Doorlopende, jaarlijks herstartende teller voor factuurnummers.
    -- Apart van invoices.id: dat springt bij verwijderde concepten, een
    -- toegekend factuurnummer mag geen gaten hebben die daaraan te wijten zijn.
    CREATE TABLE IF NOT EXISTS invoice_sequence (
      year    INTEGER PRIMARY KEY,
      counter INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS invoice_files (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id    INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      -- Willekeurige naam op schijf; original_name is wat de klant ziet.
      filename      TEXT NOT NULL,
      original_name TEXT NOT NULL,
      content_type  TEXT NOT NULL,
      size_bytes    INTEGER NOT NULL,
      sort_order    INTEGER NOT NULL DEFAULT 0,
      created_utc   INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_invoice_files_invoice ON invoice_files(invoice_id);

    CREATE TABLE IF NOT EXISTS revision_requests (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      message      TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'open', -- open | done
      created_utc  INTEGER NOT NULL,
      updated_utc  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_revision_requests_invoice ON revision_requests(invoice_id);
  `);

  // Kolommen die later zijn bijgekomen. `CREATE TABLE IF NOT EXISTS` voegt ze
  // niet toe aan een database die al bestaat, dus dat gebeurt hier.
  // Engelse vertalingen. Leeg betekent: toon de Nederlandse tekst.
  addColumn(db, "services", "name_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "services", "description_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "services", "price_label_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "title_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "location_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "summary_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "body_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "cover_alt_en", "TEXT NOT NULL DEFAULT ''");
  /**
   * Eigen titel en omschrijving voor zoekmachines, per taal. Leeg betekent:
   * gebruik de gewone titel en korte beschrijving van het project.
   */
  addColumn(db, "projects", "meta_title", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "meta_title_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "meta_description", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "projects", "meta_description_en", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "project_images", "alt_en", "TEXT NOT NULL DEFAULT ''");
  /**
   * Is dit een verzonnen voorbeeldproject?
   *
   * Standaard 0, dus "echt". Dat is met opzet: een project dat jij zelf in de
   * beheeromgeving hebt aangemaakt mag nooit per ongeluk het label
   * "voorbeeldproject" krijgen. De verzonnen projecten worden expliciet op 1
   * gezet, door de voorbeeldgegevens en door het onderhoudsscript.
   */
  addColumn(db, "projects", "is_example", "INTEGER NOT NULL DEFAULT 0");
  // Taal waarin de aanvraag is gedaan, zodat ook latere mails kloppen.
  addColumn(db, "bookings", "locale", "TEXT NOT NULL DEFAULT 'nl'");

  addColumn(db, "bookings", "extra_locations", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "bookings", "session_count", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "bookings", "period_wish", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "bookings", "time_preferences", "TEXT NOT NULL DEFAULT ''");

  // Toegekend bij de eerste keer versturen (betaalverzoek of oplevering), niet
  // al bij het opslaan van een concept. Zie ensureInvoiceNumber in lib/invoices.ts.
  addColumn(db, "invoices", "invoice_number", "TEXT");
  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number) WHERE invoice_number IS NOT NULL",
  );

  // Klantgegevens, leverdatum en vastlegging van een uitgegeven factuur. Zie
  // lib/invoice-issue.ts. Alleen kolommen erbij: bestaande facturen en hun
  // nummers blijven zoals ze zijn.
  addColumn(db, "invoices", "customer_name", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "customer_address", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "customer_postcode", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "customer_city", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "customer_country", "TEXT NOT NULL DEFAULT 'Nederland'");
  addColumn(db, "invoices", "customer_vat_id", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "delivery_date", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "payment_term_days", "INTEGER NOT NULL DEFAULT 14");
  addColumn(db, "invoices", "issued_utc", "INTEGER");
  addColumn(db, "invoices", "invoice_date", "TEXT");
  // De vastgelegde factuur als JSON. Leeg zolang de factuur nog niet is uitgegeven.
  addColumn(db, "invoices", "snapshot_json", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "pdf_filename", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "invoices", "pdf_sha256", "TEXT NOT NULL DEFAULT ''");

  freezeLegacyInvoices(db);

  // Een uitgegeven factuur is een fiscaal document (bewaarplicht zeven jaar).
  // Ook als de applicatie een fout zou maken, weigert de database elke
  // wijziging van de vastgelegde velden en elke verwijdering, ook het
  // meeverwijderen via een boeking. Betaalstatus en paywall blijven wijzigbaar.
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS invoices_frozen_no_update
    BEFORE UPDATE OF invoice_number, amount_cents, description, booking_id,
      customer_name, customer_address, customer_postcode, customer_city,
      customer_country, customer_vat_id, delivery_date, payment_term_days,
      issued_utc, invoice_date, snapshot_json
    ON invoices
    WHEN OLD.snapshot_json <> ''
    BEGIN
      SELECT RAISE(ABORT, 'Een uitgegeven factuur kan niet worden gewijzigd.');
    END;

    CREATE TRIGGER IF NOT EXISTS invoices_frozen_no_delete
    BEFORE DELETE ON invoices
    WHEN OLD.snapshot_json <> ''
    BEGIN
      SELECT RAISE(ABORT, 'Een uitgegeven factuur kan niet worden verwijderd (bewaarplicht).');
    END;
  `);
}

/**
 * Facturen die al een nummer hadden vóór de vastlegging bestond (het nummer
 * werd toen bij de eerste verzending toegekend): leg ze nu vast, met hetzelfde
 * nummer en het bedrag en de omschrijving zoals ze nu staan. Het klantadres is
 * van die facturen nooit bewaard; dat blijft leeg en de factuur is gemarkeerd
 * als "legacy". Herhaalbaar: een factuur met een vastlegging wordt overgeslagen.
 */
function freezeLegacyInvoices(db: Database.Database) {
  const rows = db
    .prepare(
      `SELECT i.id, i.invoice_number, i.amount_cents, i.description,
              i.payment_sent_utc, i.delivery_sent_utc, i.created_utc, i.updated_utc,
              b.name AS booking_name, b.location AS booking_location,
              b.reference AS booking_reference, b.start_utc AS booking_start
       FROM invoices i JOIN bookings b ON b.id = i.booking_id
       WHERE i.invoice_number IS NOT NULL AND i.snapshot_json = ''`,
    )
    .all() as {
    id: number;
    invoice_number: string;
    amount_cents: number;
    description: string;
    payment_sent_utc: number | null;
    delivery_sent_utc: number | null;
    created_utc: number;
    updated_utc: number;
    booking_name: string;
    booking_location: string;
    booking_reference: string;
    booking_start: number;
  }[];
  if (rows.length === 0) return;

  const settingRows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const settings = new Map(settingRows.map((r) => [r.key, r.value]));
  const str = (key: keyof InvoiceSettings) =>
    String(settings.get(key) ?? DEFAULT_INVOICE_SETTINGS[key]);
  const rate = Number(settings.get("vatRatePercent"));
  const supplier: InvoiceSettings = {
    companyName: str("companyName"),
    companyAddress: str("companyAddress"),
    companyPostcode: str("companyPostcode"),
    companyCity: str("companyCity"),
    companyKvk: str("companyKvk"),
    companyVatNumber: str("companyVatNumber"),
    companyIban: str("companyIban"),
    vatRatePercent: Number.isFinite(rate) ? rate : DEFAULT_INVOICE_SETTINGS.vatRatePercent,
  };

  const update = db.prepare(
    `UPDATE invoices
     SET issued_utc = ?, invoice_date = ?, delivery_date = ?, customer_name = ?,
         payment_term_days = ?, snapshot_json = ?
     WHERE id = ? AND snapshot_json = ''`,
  );
  const freeze = db.transaction(() => {
    for (const r of rows) {
      const issuedUtc = r.payment_sent_utc ?? r.delivery_sent_utc ?? r.updated_utc;
      const invoiceDate = dateKeyOf(issuedUtc);
      const snapshot = buildSnapshot({
        legacy: true,
        number: r.invoice_number,
        invoiceDate,
        deliveryDate: dateKeyOf(r.booking_start),
        paymentTermDays: DEFAULT_PAYMENT_TERM_DAYS,
        bookingReference: r.booking_reference,
        supplier,
        supplierEmail: site.email,
        customer: {
          name: r.booking_name,
          address: r.booking_location,
          postcode: "",
          city: "",
          country: "",
          vatId: "",
        },
        description: r.description,
        totalCents: r.amount_cents,
      });
      update.run(
        issuedUtc,
        invoiceDate,
        dateKeyOf(r.booking_start),
        r.booking_name,
        DEFAULT_PAYMENT_TERM_DAYS,
        JSON.stringify(snapshot),
        r.id,
      );
    }
  });
  freeze();
}

/** Voegt een kolom toe als die er nog niet is. Bestaande gegevens blijven. */
function addColumn(
  db: Database.Database,
  table: string,
  column: string,
  definition: string,
) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (columns.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

/**
 * Voert een schrijfbewerking uit in een exclusieve transactie.
 * `BEGIN IMMEDIATE` zorgt ervoor dat twee gelijktijdige aanvragen niet allebei
 * hetzelfde tijdslot kunnen claimen: de tweede wacht tot de eerste klaar is en
 * ziet dan de zojuist aangemaakte boeking.
 */
export function withWriteTransaction<T>(fn: (db: Database.Database) => T): T {
  const db = getDb();
  const run = db.transaction(fn);
  return run.immediate(db);
}
