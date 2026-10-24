import "server-only";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { site } from "@/content/site";

import { getBooking } from "./bookings";
import { DATA_DIR, getDb, withWriteTransaction } from "./db";
import { generateInvoicePdf } from "./invoice-pdf";
import {
  buildSnapshot,
  customerProblems,
  formatPostcode,
  isDateKey,
  supplierProblems,
  type CustomerDetails,
  type InvoiceSnapshot,
} from "./invoice-rules";
import { getInvoice } from "./invoices";
import { getInvoiceSettings } from "./settings";
import { todayKey } from "./time";
import type { Booking, Invoice } from "./types";

/**
 * Het uitgeven van een factuur: nummer toekennen, alles vastleggen, het PDF
 * bewaren. Vanaf dat moment verandert er aan de factuur niets meer (de
 * database dwingt dat zelf af, zie de triggers in lib/db.ts).
 *
 * Opslag: de vastlegging staat in de database (invoices.snapshot_json) en het
 * PDF staat op de gekoppelde schijf in `invoices/`, met een controlesom in de
 * database. Is het bestand weg of beschadigd, dan wordt het PDF opnieuw
 * opgebouwd uit de vastlegging; die is de bron van waarheid.
 */

export const INVOICE_DIR = path.join(DATA_DIR, "invoices");

export function customerOf(invoice: Invoice): CustomerDetails {
  return {
    name: invoice.customerName,
    address: invoice.customerAddress,
    postcode: invoice.customerPostcode,
    city: invoice.customerCity,
    country: invoice.customerCountry,
    vatId: invoice.customerVatId,
  };
}

/** Alles wat nog ontbreekt voordat deze factuur kan worden uitgegeven. Leeg = klaar. */
export function issueProblems(invoice: Invoice): string[] {
  const out: string[] = [];
  if (invoice.amountCents <= 0) out.push("een bedrag groter dan € 0,00");
  if (invoice.description.trim() === "") out.push("een omschrijving van de dienst");
  if (!isDateKey(invoice.deliveryDate)) out.push("de datum van levering of uitvoering");
  if (invoice.paymentTermDays < 0 || invoice.paymentTermDays > 90) {
    out.push("een betaaltermijn tussen 0 en 90 dagen");
  }
  out.push(...customerProblems(customerOf(invoice)));
  out.push(...supplierProblems(getInvoiceSettings()));
  return out;
}

export function problemsMessage(problems: string[]): string {
  return `De factuur kan nog niet worden uitgegeven. Vul eerst in: ${problems.join(", ")}.`;
}

export type IssueResult =
  | { ok: true; invoice: Invoice }
  | { ok: false; problems: string[] };

/**
 * Geeft de factuur uit. Al uitgegeven? Dan komt dezelfde factuur terug: er
 * wordt nooit een tweede nummer uitgegeven.
 */
export async function issueInvoice(invoiceId: number): Promise<IssueResult> {
  const current = getInvoice(invoiceId);
  if (!current) return { ok: false, problems: ["een bestaande factuur"] };
  if (current.issuedUtc) return { ok: true, invoice: current };

  const booking = getBooking(current.bookingId);
  if (!booking) return { ok: false, problems: ["een bestaande boeking"] };

  const problems = issueProblems(current);
  if (problems.length > 0) return { ok: false, problems };

  const supplier = getInvoiceSettings();

  const issued = withWriteTransaction((db) => {
    // Opnieuw lezen binnen de transactie: twee gelijktijdige verzoeken mogen
    // niet allebei een nummer uitgeven.
    const row = db
      .prepare("SELECT snapshot_json FROM invoices WHERE id = ?")
      .get(invoiceId) as { snapshot_json: string } | undefined;
    if (!row || row.snapshot_json !== "") return false;

    const now = Date.now();
    const invoiceDate = todayKey(now);
    const year = Number(invoiceDate.slice(0, 4));
    const teller = db
      .prepare("SELECT counter FROM invoice_sequence WHERE year = ?")
      .get(year) as { counter: number } | undefined;
    const volgnummer = (teller?.counter ?? 0) + 1;
    db.prepare(
      `INSERT INTO invoice_sequence (year, counter) VALUES (?, ?)
       ON CONFLICT(year) DO UPDATE SET counter = excluded.counter`,
    ).run(year, volgnummer);
    const number = `${year}-${String(volgnummer).padStart(4, "0")}`;

    const customer = customerOf(current);
    if (customer.country.trim().toLowerCase() === "nederland") {
      customer.postcode = formatPostcode(customer.postcode);
    }

    const snapshot = buildSnapshot({
      number,
      invoiceDate,
      deliveryDate: current.deliveryDate,
      paymentTermDays: current.paymentTermDays,
      bookingReference: booking.reference,
      supplier,
      supplierEmail: site.email,
      customer,
      description: current.description,
      totalCents: current.amountCents,
    });

    db.prepare(
      `UPDATE invoices
       SET invoice_number = ?, invoice_date = ?, issued_utc = ?,
           customer_postcode = ?, snapshot_json = ?, updated_utc = ?
       WHERE id = ?`,
    ).run(number, invoiceDate, now, customer.postcode, JSON.stringify(snapshot), now, invoiceId);
    return true;
  });

  let invoice = getInvoice(invoiceId)!;
  if (issued) {
    // Direct bewaren. Lukt dat niet, dan is de factuur toch uitgegeven (de
    // vastlegging staat in de database) en komt het PDF bij de eerste download.
    try {
      await storePdf(invoice);
    } catch (error) {
      console.error(`[factuur] PDF bewaren van ${invoice.invoiceNumber} mislukt:`, error);
    }
    // Opnieuw lezen: nu staan de bestandsnaam en controlesom erbij.
    invoice = getInvoice(invoiceId)!;
  }
  return { ok: true, invoice };
}

export function snapshotOf(invoice: Invoice): InvoiceSnapshot | null {
  const row = getDb()
    .prepare("SELECT snapshot_json FROM invoices WHERE id = ?")
    .get(invoice.id) as { snapshot_json: string } | undefined;
  if (!row || row.snapshot_json === "") return null;
  return JSON.parse(row.snapshot_json) as InvoiceSnapshot;
}

function pdfName(invoice: Invoice): string {
  return invoice.invoiceNumber && /^\d{4}-\d{4}$/.test(invoice.invoiceNumber)
    ? `${invoice.invoiceNumber}.pdf`
    : `factuur-${invoice.id}.pdf`;
}

function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/** Bouwt het PDF uit de vastlegging, bewaart het en legt de controlesom vast. */
async function storePdf(invoice: Invoice): Promise<Buffer> {
  const snapshot = snapshotOf(invoice);
  if (!snapshot) throw new Error("Factuur is nog niet uitgegeven.");
  const pdf = await generateInvoicePdf(snapshot, {
    createdAt: new Date(invoice.issuedUtc ?? Date.now()),
  });

  fs.mkdirSync(INVOICE_DIR, { recursive: true });
  const filename = pdfName(invoice);
  const target = path.join(INVOICE_DIR, filename);
  // Eerst naar een tijdelijk bestand en dan hernoemen, zodat er nooit een half
  // PDF onder de definitieve naam staat.
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, pdf, { mode: 0o640 });
  fs.renameSync(tmp, target);

  getDb()
    .prepare("UPDATE invoices SET pdf_filename = ?, pdf_sha256 = ? WHERE id = ?")
    .run(filename, sha256(pdf), invoice.id);
  return pdf;
}

/**
 * Het PDF van deze factuur. Uitgegeven: het bewaarde bestand, na controle van
 * de controlesom; ontbreekt of wijkt het af, dan wordt het uit de vastlegging
 * opnieuw opgebouwd (en een afwijking in het log gezet). Nog niet uitgegeven:
 * een voorbeeld met "CONCEPT" erop, dat niets vastlegt.
 */
export async function getInvoicePdf(
  invoice: Invoice,
  booking: Booking,
): Promise<{ pdf: Buffer; filename: string }> {
  if (!invoice.issuedUtc) {
    const supplier = getInvoiceSettings();
    const snapshot = buildSnapshot({
      number: "concept",
      invoiceDate: todayKey(),
      deliveryDate: isDateKey(invoice.deliveryDate) ? invoice.deliveryDate : todayKey(),
      paymentTermDays: invoice.paymentTermDays,
      bookingReference: booking.reference,
      supplier,
      supplierEmail: site.email,
      customer: customerOf(invoice),
      description: invoice.description || booking.serviceName,
      totalCents: invoice.amountCents,
    });
    return {
      pdf: await generateInvoicePdf(snapshot, { concept: true }),
      filename: "factuur-concept.pdf",
    };
  }

  const filename = `factuur-${invoice.invoiceNumber}.pdf`;
  if (invoice.pdfFilename) {
    const file = path.join(INVOICE_DIR, path.basename(invoice.pdfFilename));
    try {
      const stored = fs.readFileSync(file);
      if (sha256(stored) === invoice.pdfSha256) return { pdf: stored, filename };
      console.error(
        `[factuur] Controlesom van ${invoice.pdfFilename} klopt niet; PDF wordt opnieuw opgebouwd uit de vastlegging.`,
      );
    } catch {
      console.error(
        `[factuur] Bestand ${invoice.pdfFilename} ontbreekt; PDF wordt opnieuw opgebouwd uit de vastlegging.`,
      );
    }
  }
  return { pdf: await storePdf(invoice), filename };
}
