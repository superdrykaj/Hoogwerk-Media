// Let op: dit bestand draait alleen op de server (leest en schrijft de database).
import "server-only";

import crypto from "node:crypto";

import { getDb } from "./db";
import type { CustomerDetails } from "./invoice-rules";
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
  customer_name: string;
  customer_address: string;
  customer_postcode: string;
  customer_city: string;
  customer_country: string;
  customer_vat_id: string;
  delivery_date: string;
  payment_term_days: number;
  issued_utc: number | null;
  invoice_date: string | null;
  pdf_filename: string;
  pdf_sha256: string;
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
    customerName: row.customer_name,
    customerAddress: row.customer_address,
    customerPostcode: row.customer_postcode,
    customerCity: row.customer_city,
    customerCountry: row.customer_country,
    customerVatId: row.customer_vat_id,
    deliveryDate: row.delivery_date,
    paymentTermDays: row.payment_term_days,
    issuedUtc: row.issued_utc,
    invoiceDate: row.invoice_date,
    pdfFilename: row.pdf_filename,
    pdfSha256: row.pdf_sha256,
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

export type InvoiceDraftValues = {
  amountCents: number;
  description: string;
  payBeforeDownload: boolean;
  customer: CustomerDetails;
  /** JJJJ-MM-DD */
  deliveryDate: string;
  paymentTermDays: number;
};

/**
 * Maakt de factuur voor deze boeking aan als die nog niet bestaat, en werkt
 * anders het concept bij. De status en het betaalverleden blijven bij een
 * bestaande factuur ongemoeid: dit is bewust alleen het concept-formulier,
 * geen verzendactie.
 *
 * Een uitgegeven factuur is vastgelegd: dan verandert alleen de betaalmuur
 * (die hoort niet bij het document). `locked` meldt dat de rest is genegeerd.
 */
export function saveInvoiceDraft(
  bookingId: number,
  values: InvoiceDraftValues,
): { invoice: Invoice; locked: boolean } {
  const db = getDb();
  const now = Date.now();
  const existing = getInvoiceByBookingId(bookingId);

  if (existing?.issuedUtc) {
    db.prepare("UPDATE invoices SET pay_before_download = ?, updated_utc = ? WHERE id = ?").run(
      values.payBeforeDownload ? 1 : 0,
      now,
      existing.id,
    );
    return { invoice: getInvoice(existing.id)!, locked: true };
  }

  const c = values.customer;
  if (existing) {
    db.prepare(
      `UPDATE invoices
       SET amount_cents = ?, description = ?, pay_before_download = ?,
           customer_name = ?, customer_address = ?, customer_postcode = ?,
           customer_city = ?, customer_country = ?, customer_vat_id = ?,
           delivery_date = ?, payment_term_days = ?, updated_utc = ?
       WHERE id = ?`,
    ).run(
      values.amountCents,
      values.description,
      values.payBeforeDownload ? 1 : 0,
      c.name,
      c.address,
      c.postcode,
      c.city,
      c.country,
      c.vatId,
      values.deliveryDate,
      values.paymentTermDays,
      now,
      existing.id,
    );
    return { invoice: getInvoice(existing.id)!, locked: false };
  }

  const result = db
    .prepare(
      `INSERT INTO invoices
        (booking_id, token, amount_cents, description, pay_before_download, status,
         customer_name, customer_address, customer_postcode, customer_city,
         customer_country, customer_vat_id, delivery_date, payment_term_days,
         created_utc, updated_utc)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      bookingId,
      makeToken(),
      values.amountCents,
      values.description,
      values.payBeforeDownload ? 1 : 0,
      c.name,
      c.address,
      c.postcode,
      c.city,
      c.country,
      c.vatId,
      values.deliveryDate,
      values.paymentTermDays,
      now,
      now,
    );
  return { invoice: getInvoice(Number(result.lastInsertRowid))!, locked: false };
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
