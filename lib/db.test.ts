import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

import { migrate } from "./db";

function verseDatabase() {
  const db = new Database(":memory:");
  // Net als in lib/db.ts: zonder dit wordt ON DELETE CASCADE genegeerd.
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function columns(db: Database.Database, table: string): string[] {
  return (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map(
    (c) => c.name,
  );
}

describe("migratie facturatie en oplevering", () => {
  it("maakt de tabellen invoices, invoice_files en revision_requests aan", () => {
    const db = verseDatabase();
    for (const table of ["invoices", "invoice_files", "revision_requests"]) {
      expect(
        db
          .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
          .get(table),
      ).toBeTruthy();
    }
    db.close();
  });

  it("staat maar één factuur per boeking toe", () => {
    const db = verseDatabase();
    db.prepare(
      `INSERT INTO services (slug, name, duration_minutes) VALUES ('foto', 'Fotografie', 60)`,
    ).run();
    db.prepare(
      `INSERT INTO bookings
        (reference, service_id, start_utc, end_utc, status, name, email, created_utc, updated_utc)
       VALUES ('HM-TEST01', 1, 0, 3600000, 'confirmed', 'Klant', 'klant@example.com', 0, 0)`,
    ).run();

    const insertInvoice = db.prepare(
      `INSERT INTO invoices (booking_id, token, amount_cents, created_utc, updated_utc)
       VALUES (1, ?, 25000, 0, 0)`,
    );
    insertInvoice.run("token-een");
    expect(() => insertInvoice.run("token-twee")).toThrow();
    db.close();
  });

  it("verwijdert opleverbestanden en wijzigingsverzoeken als de factuur wordt verwijderd", () => {
    const db = verseDatabase();
    db.prepare(
      `INSERT INTO services (slug, name, duration_minutes) VALUES ('foto', 'Fotografie', 60)`,
    ).run();
    db.prepare(
      `INSERT INTO bookings
        (reference, service_id, start_utc, end_utc, status, name, email, created_utc, updated_utc)
       VALUES ('HM-TEST01', 1, 0, 3600000, 'confirmed', 'Klant', 'klant@example.com', 0, 0)`,
    ).run();
    db.prepare(
      `INSERT INTO invoices (id, booking_id, token, amount_cents, created_utc, updated_utc)
       VALUES (1, 1, 'token', 25000, 0, 0)`,
    ).run();
    db.prepare(
      `INSERT INTO invoice_files
        (invoice_id, filename, original_name, content_type, size_bytes, created_utc)
       VALUES (1, 'a.mp4', 'video.mp4', 'video/mp4', 1000, 0)`,
    ).run();
    db.prepare(
      `INSERT INTO revision_requests (invoice_id, message, created_utc, updated_utc)
       VALUES (1, 'Kan het warmer?', 0, 0)`,
    ).run();

    db.prepare("DELETE FROM invoices WHERE id = 1").run();

    expect(columns(db, "invoice_files")).toContain("filename"); // tabel bestaat nog
    expect(db.prepare("SELECT COUNT(*) AS n FROM invoice_files").get()).toEqual({ n: 0 });
    expect(db.prepare("SELECT COUNT(*) AS n FROM revision_requests").get()).toEqual({ n: 0 });
    db.close();
  });
});
