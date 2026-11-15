import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import Database from "better-sqlite3";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Gaat uit van een echte database op schijf (zoals in productie), in een
 * tijdelijke map. DATA_DIR moet gezet zijn vóórdat lib/db wordt geladen.
 */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-factuur-"));
process.env.DATA_DIR = tmp;
process.env.SEED_ON_EMPTY = "false";

type Modules = {
  migrate: typeof import("./db")["migrate"];
  db: typeof import("./db");
  invoices: typeof import("./invoices");
  issue: typeof import("./invoice-issue");
  settings: typeof import("./settings");
};
let m: Modules;

beforeAll(async () => {
  const db = await import("./db");
  m = {
    migrate: db.migrate,
    db,
    invoices: await import("./invoices"),
    issue: await import("./invoice-issue"),
    settings: await import("./settings"),
  };
});
afterAll(() => {
  m?.db.getDb().close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

const leverancier = {
  companyName: "Hoogbeeld Media",
  companyAddress: "Voorbeeldstraat 1",
  companyPostcode: "1500 AB",
  companyCity: "Zaandam",
  companyKvk: "42201319",
  companyVatNumber: "NL123456789B01",
  companyIban: "NL91ABNA0417164300",
  vatRatePercent: 21,
};
const klant = { name: "Klant BV", address: "Dam 1", postcode: "1012js", city: "Amsterdam", country: "Nederland", vatId: "" };

function maakBoeking(n: number): number {
  const db = m.db.getDb();
  db.prepare(`INSERT OR IGNORE INTO services (id, slug, name, duration_minutes) VALUES (1, 'foto', 'Fotografie', 60)`).run();
  const r = db
    .prepare(
      `INSERT INTO bookings (reference, service_id, start_utc, end_utc, status, name, email, location, created_utc, updated_utc)
       VALUES (?, 1, ?, ?, 'confirmed', 'Klant BV', 'klant@example.test', 'Dam 1', 0, 0)`,
    )
    .run(`HM-T${n}`, 1_700_000_000_000 + n, 1_700_003_600_000 + n);
  return Number(r.lastInsertRowid);
}

function concept(bookingId: number, extra: Partial<Parameters<Modules["invoices"]["saveInvoiceDraft"]>[1]> = {}) {
  return m.invoices.saveInvoiceDraft(bookingId, {
    amountCents: 25000,
    description: "Dronefotografie — pakket compleet",
    payBeforeDownload: true,
    customer: klant,
    deliveryDate: "2026-10-20",
    paymentTermDays: 14,
    ...extra,
  }).invoice;
}

describe("een factuur uitgeven", () => {
  it("weigert zolang de eigen bedrijfsgegevens invulplekken zijn", async () => {
    const draft = concept(maakBoeking(1));
    const result = await m.issue.issueInvoice(draft.id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problems.join()).toMatch(/adres|IBAN|btw/);
    expect(m.invoices.getInvoice(draft.id)?.invoiceNumber).toBeNull();
  });

  it("weigert zolang klantadres of leverdatum ontbreekt", async () => {
    m.settings.saveInvoiceSettings(leverancier);
    const draft = concept(maakBoeking(2), { customer: { ...klant, address: "" }, deliveryDate: "" });
    const result = await m.issue.issueInvoice(draft.id);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.problems.join()).toMatch(/adres van de klant/);
      expect(result.problems.join()).toMatch(/datum van levering/);
    }
  });

  it("kent doorlopende nummers toe en geeft nooit twee keer hetzelfde nummer", async () => {
    m.settings.saveInvoiceSettings(leverancier);
    const a = concept(maakBoeking(3));
    const b = concept(maakBoeking(4));
    const ra = await m.issue.issueInvoice(a.id);
    const rb = await m.issue.issueInvoice(b.id);
    const ra2 = await m.issue.issueInvoice(a.id);
    expect(ra.ok && rb.ok && ra2.ok).toBe(true);
    if (ra.ok && rb.ok && ra2.ok) {
      const jaar = new Date().getFullYear();
      expect(ra.invoice.invoiceNumber).toMatch(new RegExp(`^${jaar}-\\d{4}$`));
      const na = Number(ra.invoice.invoiceNumber!.slice(5));
      const nb = Number(rb.invoice.invoiceNumber!.slice(5));
      expect(nb).toBe(na + 1);
      expect(ra2.invoice.invoiceNumber).toBe(ra.invoice.invoiceNumber);
    }
  });

  it("legt alles vast: een latere wijziging van de bedrijfsgegevens verandert de factuur niet", async () => {
    m.settings.saveInvoiceSettings(leverancier);
    const draft = concept(maakBoeking(5));
    const r = await m.issue.issueInvoice(draft.id);
    if (!r.ok) throw new Error("uitgeven mislukt");
    const voor = m.issue.snapshotOf(r.invoice)!;
    expect(voor.supplier.iban).toBe("NL91ABNA0417164300");
    expect(voor.customer.postcode).toBe("1012 JS");
    expect(voor.totalCents).toBe(25000);
    expect(voor.subtotalCents + voor.vatCents).toBe(25000);

    m.settings.saveInvoiceSettings({ ...leverancier, companyIban: "DE89370400440532013000", companyAddress: "Elders 9", vatRatePercent: 9 });
    const na = m.issue.snapshotOf(m.invoices.getInvoice(draft.id)!)!;
    expect(na).toEqual(voor);
  });

  it("bewaart het PDF op schijf met een controlesom en levert dat onveranderd terug", async () => {
    m.settings.saveInvoiceSettings(leverancier);
    const booking = maakBoeking(6);
    const draft = concept(booking);
    const r = await m.issue.issueInvoice(draft.id);
    if (!r.ok) throw new Error("uitgeven mislukt");
    expect(r.invoice.pdfFilename).toBe(`${r.invoice.invoiceNumber}.pdf`);
    expect(r.invoice.pdfSha256).toMatch(/^[0-9a-f]{64}$/);
    const bestand = path.join(m.issue.INVOICE_DIR, r.invoice.pdfFilename);
    expect(fs.existsSync(bestand)).toBe(true);

    const bk = (await import("./bookings")).getBooking(booking)!;
    const a = await m.issue.getInvoicePdf(r.invoice, bk);
    const b = await m.issue.getInvoicePdf(r.invoice, bk);
    expect(a.pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(Buffer.compare(a.pdf, b.pdf)).toBe(0);
    expect(a.filename).toBe(`factuur-${r.invoice.invoiceNumber}.pdf`);
  });

  it("bouwt het PDF opnieuw op uit de vastlegging als het bestand weg of beschadigd is", async () => {
    m.settings.saveInvoiceSettings(leverancier);
    const booking = maakBoeking(7);
    const r = await m.issue.issueInvoice(concept(booking).id);
    if (!r.ok) throw new Error("uitgeven mislukt");
    const bk = (await import("./bookings")).getBooking(booking)!;
    const bestand = path.join(m.issue.INVOICE_DIR, r.invoice.pdfFilename);

    fs.writeFileSync(bestand, "beschadigd");
    const hersteld = await m.issue.getInvoicePdf(m.invoices.getInvoice(r.invoice.id)!, bk);
    expect(hersteld.pdf.subarray(0, 5).toString()).toBe("%PDF-");

    fs.rmSync(bestand);
    const opnieuw = await m.issue.getInvoicePdf(m.invoices.getInvoice(r.invoice.id)!, bk);
    expect(opnieuw.pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(fs.existsSync(bestand)).toBe(true);
  });

  it("geeft van een concept een voorbeeld dat niets vastlegt", async () => {
    const booking = maakBoeking(8);
    const draft = concept(booking);
    const bk = (await import("./bookings")).getBooking(booking)!;
    const { pdf, filename } = await m.issue.getInvoicePdf(draft, bk);
    expect(filename).toBe("factuur-concept.pdf");
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(m.invoices.getInvoice(draft.id)?.issuedUtc).toBeNull();
  });
});

describe("een uitgegeven factuur is onveranderbaar", () => {
  async function uitgegeven(n: number) {
    m.settings.saveInvoiceSettings(leverancier);
    const booking = maakBoeking(n);
    const r = await m.issue.issueInvoice(concept(booking).id);
    if (!r.ok) throw new Error("uitgeven mislukt");
    return { booking, invoice: r.invoice };
  }

  it("slaat via de applicatie alleen de betaalmuur op", async () => {
    const { booking, invoice } = await uitgegeven(20);
    const res = m.invoices.saveInvoiceDraft(booking, {
      amountCents: 1,
      description: "anders",
      payBeforeDownload: false,
      customer: { ...klant, name: "Iemand anders" },
      deliveryDate: "2020-01-01",
      paymentTermDays: 90,
    });
    expect(res.locked).toBe(true);
    const nu = m.invoices.getInvoice(invoice.id)!;
    expect(nu.amountCents).toBe(25000);
    expect(nu.description).toBe(invoice.description);
    expect(nu.customerName).toBe("Klant BV");
    expect(nu.payBeforeDownload).toBe(false);
  });

  it("weigert in de database elke wijziging van de vastgelegde velden", async () => {
    const { invoice } = await uitgegeven(21);
    const db = m.db.getDb();
    for (const sql of [
      "UPDATE invoices SET amount_cents = 1 WHERE id = ?",
      "UPDATE invoices SET invoice_number = '2026-9999' WHERE id = ?",
      "UPDATE invoices SET description = 'x' WHERE id = ?",
      "UPDATE invoices SET customer_name = 'x' WHERE id = ?",
      "UPDATE invoices SET snapshot_json = '{}' WHERE id = ?",
      "UPDATE invoices SET issued_utc = 1 WHERE id = ?",
      "DELETE FROM invoices WHERE id = ?",
    ]) {
      expect(() => db.prepare(sql).run(invoice.id), sql).toThrow(/uitgegeven factuur/);
    }
  });

  it("laat betaalstatus en paywall wel toe", async () => {
    const { invoice } = await uitgegeven(22);
    m.invoices.markPaid(invoice.id);
    const betaald = m.invoices.getInvoice(invoice.id)!;
    expect(betaald.status).toBe("paid");
    expect(betaald.paidUtc).not.toBeNull();
  });

  it("verwijdert een uitgegeven factuur niet mee als de boeking wordt verwijderd", async () => {
    const { booking, invoice } = await uitgegeven(23);
    const db = m.db.getDb();
    expect(() => db.prepare("DELETE FROM bookings WHERE id = ?").run(booking)).toThrow(/bewaarplicht/);
    expect(m.invoices.getInvoice(invoice.id)).not.toBeNull();
  });

  it("verwijdert een concept wel mee met de boeking", async () => {
    const booking = maakBoeking(24);
    const draft = concept(booking);
    m.db.getDb().prepare("DELETE FROM bookings WHERE id = ?").run(booking);
    expect(m.invoices.getInvoice(draft.id)).toBeNull();
  });
});

describe("bestaande facturen bij de overgang", () => {
  /** Een database zoals die vóór deze wijziging bestond: nummers zonder vastlegging. */
  function oudeDatabase() {
    const db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    db.exec(`
      CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE services (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, duration_minutes INTEGER NOT NULL);
      CREATE TABLE bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT NOT NULL, service_id INTEGER NOT NULL, start_utc INTEGER NOT NULL, end_utc INTEGER NOT NULL, status TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', created_utc INTEGER NOT NULL, updated_utc INTEGER NOT NULL);
      CREATE TABLE invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        amount_cents INTEGER NOT NULL DEFAULT 0,
        description TEXT NOT NULL DEFAULT '',
        pay_before_download INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'draft',
        mollie_payment_id TEXT NOT NULL DEFAULT '',
        paid_utc INTEGER, payment_sent_utc INTEGER, delivery_sent_utc INTEGER,
        created_utc INTEGER NOT NULL, updated_utc INTEGER NOT NULL,
        invoice_number TEXT
      );
      CREATE TABLE invoice_sequence (year INTEGER PRIMARY KEY, counter INTEGER NOT NULL DEFAULT 0);
    `);
    db.prepare("INSERT INTO services (slug, name, duration_minutes) VALUES ('foto','Foto',60)").run();
    const boeking = db.prepare(
      `INSERT INTO bookings (reference, service_id, start_utc, end_utc, status, name, email, location, created_utc, updated_utc)
       VALUES (?, 1, ?, ?, 'confirmed', ?, 'k@example.test', 'Dam 1, Amsterdam', 0, 0)`,
    );
    boeking.run("HM-OUD1", Date.UTC(2026, 8, 10, 8), Date.UTC(2026, 8, 10, 9), "Oude Klant");
    boeking.run("HM-OUD2", Date.UTC(2026, 8, 12, 8), Date.UTC(2026, 8, 12, 9), "Concept Klant");
    const inv = db.prepare(
      `INSERT INTO invoices (booking_id, token, amount_cents, description, status, payment_sent_utc, paid_utc, created_utc, updated_utc, invoice_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    inv.run(1, "tok1", 12100, "Oude dienst", "paid", Date.UTC(2026, 8, 15, 10), Date.UTC(2026, 8, 16), 0, 0, "2026-0007");
    inv.run(2, "tok2", 5000, "Nog concept", "draft", null, null, 0, 0, null);
    db.prepare("INSERT INTO invoice_sequence VALUES (2026, 7)").run();
    return db;
  }

  it("behoudt nummers, bedragen en tokens en legt de genummerde factuur vast", () => {
    const db = oudeDatabase();
    m.migrate(db);
    const rows = db.prepare("SELECT * FROM invoices ORDER BY id").all() as Record<string, unknown>[];
    expect(rows[0]).toMatchObject({ invoice_number: "2026-0007", amount_cents: 12100, token: "tok1", status: "paid" });
    expect(rows[0].issued_utc).toBe(Date.UTC(2026, 8, 15, 10));
    expect(rows[0].invoice_date).toBe("2026-09-15");
    const snap = JSON.parse(rows[0].snapshot_json as string);
    expect(snap).toMatchObject({ legacy: true, number: "2026-0007", totalCents: 12100, invoiceDate: "2026-09-15", deliveryDate: "2026-09-10" });
    expect(snap.subtotalCents + snap.vatCents).toBe(12100);
    // Het concept blijft een concept.
    expect(rows[1]).toMatchObject({ invoice_number: null, snapshot_json: "", issued_utc: null });
    // De teller loopt door: het volgende nummer is 0008.
    expect(db.prepare("SELECT counter FROM invoice_sequence WHERE year = 2026").get()).toEqual({ counter: 7 });
    db.close();
  });

  it("is herhaalbaar en beschermt de vastgelegde oude factuur", () => {
    const db = oudeDatabase();
    m.migrate(db);
    const eerst = db.prepare("SELECT snapshot_json FROM invoices WHERE id = 1").get();
    m.migrate(db);
    expect(db.prepare("SELECT snapshot_json FROM invoices WHERE id = 1").get()).toEqual(eerst);
    expect(() => db.prepare("UPDATE invoices SET amount_cents = 1 WHERE id = 1").run()).toThrow(/uitgegeven factuur/);
    expect(() => db.prepare("DELETE FROM bookings WHERE id = 1").run()).toThrow(/bewaarplicht/);
    db.close();
  });
});
