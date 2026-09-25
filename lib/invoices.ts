// Let op: dit bestand draait alleen op de server (leest en schrijft de database).
import "server-only";

import crypto from "node:crypto";

import { getDb, withWriteTransaction } from "./db";
import type { Invoice, InvoiceFile, InvoiceStatus } from "./types";

export { formatAmountCents, parseAmountInput } from "./currency";

type Row = {
  id: number;
  booking_id: number;
  token: string;
  invoice_number: string | null;
  amount_cents: number;
  description: string;
  pay_before_download: number;
  status: string;
  mollie_payment_id: string;
  paid_utc: number | null;
  payment_sent_utc: number | null;
  delivery_sent_utc: number | null;
  created_utc: number;
  updated_utc: number;
};

function map(row: Row): Invoice {
  return {
    id: row.id,
    bookingId: row.booking_id,
    token: row.token,
    invoiceNumber: row.invoice_number,
    amountCents: row.amount_cents,
    description: row.description,
    payBeforeDownload: row.pay_before_download === 1,
    status: row.status as InvoiceStatus,
    molliePaymentId: row.mollie_payment_id,
    paidUtc: row.paid_utc,
    paymentSentUtc: row.payment_sent_utc,
    deliverySentUtc: row.delivery_sent_utc,
    createdUtc: row.created_utc,
    updatedUtc: row.updated_utc,
  };
}

/** Lang en willekeurig (192 bits), zodat hij niet te raden is. */
function makeToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function getInvoiceByBookingId(bookingId: number): Invoice | null {
  const row = getDb()
    .prepare("SELECT * FROM invoices WHERE booking_id = ?")
    .get(bookingId) as Row | undefined;
  return row ? map(row) : null;
}

export function getInvoiceByToken(token: string): Invoice | null {
  if (!token) return null;
  const row = getDb()
    .prepare("SELECT * FROM invoices WHERE token = ?")
    .get(token) as Row | undefined;
  return row ? map(row) : null;
}

export function getInvoiceByMolliePaymentId(paymentId: string): Invoice | null {
  if (!paymentId) return null;
  const row = getDb()
    .prepare("SELECT * FROM invoices WHERE mollie_payment_id = ?")
    .get(paymentId) as Row | undefined;
  return row ? map(row) : null;
}

export function getInvoice(id: number): Invoice | null {
  const row = getDb().prepare("SELECT * FROM invoices WHERE id = ?").get(id) as
    | Row
    | undefined;
  return row ? map(row) : null;
}

/**
 * Maakt de factuur voor deze boeking aan als die nog niet bestaat, en werkt
 * anders bedrag/omschrijving/paywall bij. De status en het betaalverleden
 * blijven bij een bestaande factuur ongemoeid: dit is bewust alleen het
 * concept-formulier, geen verzendactie.
 */
export function saveInvoiceDraft(
  bookingId: number,
  values: { amountCents: number; description: string; payBeforeDownload: boolean },
): Invoice {
  const db = getDb();
  const now = Date.now();
  const existing = getInvoiceByBookingId(bookingId);

  if (existing) {
    db.prepare(
      `UPDATE invoices
       SET amount_cents = ?, description = ?, pay_before_download = ?, updated_utc = ?
       WHERE id = ?`,
    ).run(
      values.amountCents,
      values.description,
      values.payBeforeDownload ? 1 : 0,
      now,
      existing.id,
    );
    return getInvoice(existing.id)!;
  }

  const result = db
    .prepare(
      `INSERT INTO invoices
        (booking_id, token, amount_cents, description, pay_before_download, status, created_utc, updated_utc)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)`,
    )
    .run(
      bookingId,
      makeToken(),
      values.amountCents,
      values.description,
      values.payBeforeDownload ? 1 : 0,
      now,
      now,
    );
  return getInvoice(Number(result.lastInsertRowid))!;
}

export function setMolliePaymentId(invoiceId: number, paymentId: string): void {
  getDb()
    .prepare("UPDATE invoices SET mollie_payment_id = ?, updated_utc = ? WHERE id = ?")
    .run(paymentId, Date.now(), invoiceId);
}

export function markPaymentSent(invoiceId: number): void {
  const now = Date.now();
  getDb()
    .prepare(
      `UPDATE invoices
       SET status = CASE WHEN status = 'draft' THEN 'sent' ELSE status END,
           payment_sent_utc = ?, updated_utc = ?
       WHERE id = ?`,
    )
    .run(now, now, invoiceId);
}

export function markDeliverySent(invoiceId: number): void {
  const now = Date.now();
  getDb()
    .prepare(
      `UPDATE invoices
       SET status = CASE WHEN status = 'draft' THEN 'sent' ELSE status END,
           delivery_sent_utc = ?, updated_utc = ?
       WHERE id = ?`,
    )
    .run(now, now, invoiceId);
}

export function markPaid(invoiceId: number): void {
  const now = Date.now();
  getDb()
    .prepare(
      `UPDATE invoices
       SET status = 'paid', paid_utc = ?, updated_utc = ?
       WHERE id = ? AND status != 'paid'`,
    )
    .run(now, now, invoiceId);
}

/**
 * Kent bij de eerste verzending (betaalverzoek of oplevering, wat het eerst
 * gebeurt) een doorlopend factuurnummer toe, bijvoorbeeld "2026-0001". Een
 * concept dat nooit is verstuurd krijgt er nooit een, zodat verwijderde
 * concepten geen gat in de nummering veroorzaken. Al toegekend? Dan komt
 * hetzelfde nummer terug — er wordt er nooit een tweede uitgegeven.
 *
 * Let op: het bedrag op een al genummerde factuur kan daarna nog wijzigen
 * (bijvoorbeeld na een gesprek met de klant). Verstuur in dat geval opnieuw,
 * anders wijkt de eerder verstuurde factuur af van wat er nu klaarstaat.
 */
export function ensureInvoiceNumber(invoiceId: number): string {
  return withWriteTransaction((db) => {
    const existing = db
      .prepare("SELECT invoice_number FROM invoices WHERE id = ?")
      .get(invoiceId) as { invoice_number: string | null } | undefined;
    if (existing?.invoice_number) return existing.invoice_number;

    const year = new Date().getFullYear();
    const row = db
      .prepare("SELECT counter FROM invoice_sequence WHERE year = ?")
      .get(year) as { counter: number } | undefined;
    const volgnummer = (row?.counter ?? 0) + 1;
    db.prepare(
      `INSERT INTO invoice_sequence (year, counter) VALUES (?, ?)
       ON CONFLICT(year) DO UPDATE SET counter = excluded.counter`,
    ).run(year, volgnummer);

    const nummer = `${year}-${String(volgnummer).padStart(4, "0")}`;
    db.prepare("UPDATE invoices SET invoice_number = ?, updated_utc = ? WHERE id = ?").run(
      nummer,
      Date.now(),
      invoiceId,
    );
    return nummer;
  });
}

export function listInvoiceFiles(invoiceId: number): InvoiceFile[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM invoice_files WHERE invoice_id = ? ORDER BY sort_order, id",
    )
    .all(invoiceId) as {
    id: number;
    invoice_id: number;
    filename: string;
    original_name: string;
    content_type: string;
    size_bytes: number;
    sort_order: number;
    created_utc: number;
  }[];
  return rows.map((row) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    filename: row.filename,
    originalName: row.original_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    sortOrder: row.sort_order,
    createdUtc: row.created_utc,
  }));
}

export function getInvoiceFile(id: number): InvoiceFile | null {
  const row = getDb()
    .prepare("SELECT * FROM invoice_files WHERE id = ?")
    .get(id) as
    | {
        id: number;
        invoice_id: number;
        filename: string;
        original_name: string;
        content_type: string;
        size_bytes: number;
        sort_order: number;
        created_utc: number;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    filename: row.filename,
    originalName: row.original_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    sortOrder: row.sort_order,
    createdUtc: row.created_utc,
  };
}

export function addInvoiceFile(
  invoiceId: number,
  file: { filename: string; originalName: string; contentType: string; sizeBytes: number },
): void {
  const db = getDb();
  const sortOrder = (db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS n FROM invoice_files WHERE invoice_id = ?")
    .get(invoiceId) as { n: number }).n + 1;
  db.prepare(
    `INSERT INTO invoice_files
      (invoice_id, filename, original_name, content_type, size_bytes, sort_order, created_utc)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(invoiceId, file.filename, file.originalName, file.contentType, file.sizeBytes, sortOrder, Date.now());
}

export function deleteInvoiceFile(id: number): InvoiceFile | null {
  const file = getInvoiceFile(id);
  if (!file) return null;
  getDb().prepare("DELETE FROM invoice_files WHERE id = ?").run(id);
  return file;
}
