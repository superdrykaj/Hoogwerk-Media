import "server-only";

import PDFDocument from "pdfkit";

import { formatAmountCents } from "./currency";
import { formatIban, type InvoiceSnapshot } from "./invoice-rules";

/**
 * Bouwt het factuur-PDF uit de vastgelegde factuur (zie lib/invoice-rules.ts,
 * InvoiceSnapshot). Het PDF bevat alleen wat bij het document hoort: de
 * betaalstatus staat er bewust niet in, want die verandert nadat de factuur is
 * uitgegeven en het document zelf mag dat niet.
 *
 * Altijd in het Nederlands: het is een administratief document van een
 * Nederlandse eenmanszaak, ongeacht de taal waarin de klant de site bezocht.
 */
export async function generateInvoicePdf(
  snapshot: InvoiceSnapshot,
  options: {
    /** Voorbeeld van een nog niet uitgegeven factuur. */
    concept?: boolean;
    /** Aanmaakmoment in de PDF-gegevens; bij een uitgegeven factuur het moment van uitgifte. */
    createdAt?: Date;
    /** Uit zetten in tests, zodat de tekst in het PDF leesbaar blijft. */
    compress?: boolean;
  } = {},
): Promise<Buffer> {
  const s = snapshot;
  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    compress: options.compress ?? true,
    info: {
      Title: options.concept ? "Factuur (concept)" : `Factuur ${s.number}`,
      Author: s.supplier.name,
      Subject: `Factuur ${s.number}`,
      CreationDate: options.createdAt ?? new Date(`${s.invoiceDate}T12:00:00Z`),
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const grijs = "#444444";
  /** 2026-10-25 → 25-10-2026: kort genoeg voor de kolom, en ondubbelzinnig. */
  const datum = (key: string) => key.split("-").reverse().join("-");
  const euro = (cents: number) => formatAmountCents(cents, "nl");

  // Leverancier links, factuurgegevens rechts.
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#000000").text(s.supplier.name, 56, 56);
  doc.font("Helvetica").fontSize(10).fillColor(grijs);
  doc.text(s.supplier.address).text(`${s.supplier.postcode} ${s.supplier.city}`);
  doc.moveDown(0.5);
  doc.text(`KvK-nummer: ${s.supplier.kvk}`);
  if (s.supplier.vatId) doc.text(`BTW-identificatienummer: ${s.supplier.vatId}`);
  doc.text(`IBAN: ${formatIban(s.supplier.iban)}`);
  if (s.supplier.email) doc.text(`E-mail: ${s.supplier.email}`);

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#000000")
    .text("FACTUUR", 330, 56, { width: 210, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor(grijs);
  const rechts = (label: string, waarde: string) =>
    doc.text(`${label}: ${waarde}`, 330, doc.y, { width: 210, align: "right" });
  doc.y = 84;
  rechts("Factuurnummer", options.concept ? "concept" : s.number);
  rechts("Factuurdatum", datum(s.invoiceDate));
  rechts("Levering/uitvoering", datum(s.deliveryDate));
  rechts("Betaaltermijn", `${s.paymentTermDays} dagen`);
  rechts("Uiterste betaaldatum", datum(s.dueDate));
  rechts("Boekingskenmerk", s.bookingReference);

  // Afnemer.
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000").text("Factuur aan", 56, 215);
  doc.font("Helvetica").fontSize(10).fillColor(grijs);
  doc.text(s.customer.name, 56, 232);
  if (s.customer.address) doc.text(s.customer.address);
  const plaats = `${s.customer.postcode} ${s.customer.city}`.trim();
  if (plaats) doc.text(plaats);
  if (s.customer.country) doc.text(s.customer.country);
  if (s.customer.vatId) doc.text(`BTW-identificatienummer: ${s.customer.vatId}`);

  // Regel met de dienst.
  const tabelY = 330;
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000");
  doc.text("Omschrijving", 56, tabelY);
  doc.text("Bedrag excl. btw", 400, tabelY, { width: 140, align: "right" });
  doc.moveTo(56, tabelY + 16).lineTo(540, tabelY + 16).strokeColor("#cccccc").stroke();

  doc.font("Helvetica").fontSize(10).fillColor("#333333");
  doc.text(s.description, 56, tabelY + 26, { width: 330 });
  doc.text(euro(s.subtotalCents), 400, tabelY + 26, { width: 140, align: "right" });

  let y = Math.max(doc.y, tabelY + 26) + 30;
  doc.moveTo(300, y - 8).lineTo(540, y - 8).strokeColor("#cccccc").stroke();
  const regel = (label: string, waarde: string, vet = false) => {
    doc.font(vet ? "Helvetica-Bold" : "Helvetica").fontSize(vet ? 11 : 10).fillColor(vet ? "#000000" : "#333333");
    doc.text(label, 300, y, { width: 150, align: "right" });
    doc.text(waarde, 450, y, { width: 90, align: "right" });
    y += vet ? 22 : 18;
  };
  regel("Totaal excl. btw", euro(s.subtotalCents));
  regel(
    s.vatRatePercent > 0 ? `Btw ${s.vatRatePercent}% over ${euro(s.subtotalCents)}` : "Btw",
    euro(s.vatCents),
  );
  doc.moveTo(300, y - 4).lineTo(540, y - 4).strokeColor("#cccccc").stroke();
  y += 4;
  regel("Totaal te betalen", euro(s.totalCents), true);

  if (s.vatNote) {
    doc.font("Helvetica").fontSize(9).fillColor(grijs).text(s.vatNote, 56, y + 6, { width: 484 });
    y = doc.y + 6;
  }

  // Betaalinstructie. Zonder betaalstatus: zie de uitleg bovenaan.
  y += 24;
  doc.font("Helvetica").fontSize(10).fillColor(grijs);
  doc.text(
    `Wij verzoeken je het bedrag van ${euro(s.totalCents)} uiterlijk op ` +
      `${datum(s.dueDate)} te voldoen op IBAN ${formatIban(s.supplier.iban)} ` +
      `t.n.v. ${s.supplier.name}, onder vermelding van factuurnummer ${options.concept ? "(volgt)" : s.number}. ` +
      "Betalen kan ook met de betaallink uit de e-mail.",
    56,
    y,
    { width: 484 },
  );

  if (options.concept) {
    doc.save();
    doc.rotate(-30, { origin: [300, 480] });
    doc.font("Helvetica-Bold").fontSize(64).fillColor("#d0d0d0").opacity(0.35);
    doc.text("CONCEPT", 120, 440, { width: 360, align: "center" });
    doc.restore();
  }

  doc.end();
  return done;
}
