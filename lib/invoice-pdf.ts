import "server-only";

import PDFDocument from "pdfkit";

import { calculateVatBreakdown, formatAmountCents } from "./currency";
import { formatDateLong, dateKeyOf } from "./time";
import type { Booking, Invoice, InvoiceSettings } from "./types";

/**
 * Genereert het factuur-PDF, op basis van de gegevens die er op het moment
 * van downloaden in staan. Er wordt bewust niets op schijf bewaard: het
 * document wordt bij elk verzoek opnieuw opgebouwd uit de factuur, de boeking
 * en de bedrijfsgegevens, zodat het altijd de actuele stand toont.
 *
 * Altijd in het Nederlands: het is een administratief document van een
 * Nederlandse eenmanszaak, ongeacht de taal waarin de klant de site bezocht.
 */
export async function generateInvoicePdf(
  invoice: Invoice,
  booking: Booking,
  company: InvoiceSettings,
): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const { subtotalCents, vatCents, totalCents } = calculateVatBreakdown(
    invoice.amountCents,
    company.vatRatePercent,
  );
  const datum = formatDateLong(dateKeyOf(invoice.createdUtc));
  const nummer = invoice.invoiceNumber ?? "concept";

  // Kop: eigen bedrijfsgegevens links, factuurgegevens rechts.
  doc.font("Helvetica-Bold").fontSize(16).text(company.companyName, 56, 56);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#444444")
    .text(company.companyAddress)
    .text(`${company.companyPostcode} ${company.companyCity}`)
    .moveDown(0.5)
    .text(`KvK-nummer: ${company.companyKvk}`)
    .text(`BTW-nummer: ${company.companyVatNumber}`)
    .text(`IBAN: ${company.companyIban}`);

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#000000")
    .text("FACTUUR", 350, 56, { align: "right" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#444444")
    .text(`Factuurnummer: ${nummer}`, 350, 84, { align: "right" })
    .text(`Factuurdatum: ${datum}`, { align: "right" })
    .text(`Boekingskenmerk: ${booking.reference}`, { align: "right" });

  doc.moveDown(3);

  // Klantgegevens.
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#000000")
    .text("Factuur aan", 56, 190);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#444444")
    .text(booking.name)
    .text(booking.email)
    .text(booking.location || "");

  // Regel met de dienst.
  const tabelY = 280;
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000");
  doc.text("Omschrijving", 56, tabelY);
  doc.text("Bedrag", 420, tabelY, { width: 120, align: "right" });
  doc
    .moveTo(56, tabelY + 16)
    .lineTo(540, tabelY + 16)
    .strokeColor("#cccccc")
    .stroke();

  doc.font("Helvetica").fontSize(10).fillColor("#333333");
  const omschrijving = invoice.description || booking.serviceName;
  doc.text(omschrijving, 56, tabelY + 26, { width: 340 });
  doc.text(formatAmountCents(subtotalCents, "nl"), 420, tabelY + 26, {
    width: 120,
    align: "right",
  });

  let y = tabelY + 60;
  doc.text(`BTW (${company.vatRatePercent}%)`, 300, y, { width: 140, align: "right" });
  doc.text(formatAmountCents(vatCents, "nl"), 420, y, { width: 120, align: "right" });

  y += 20;
  doc.moveTo(300, y).lineTo(540, y).strokeColor("#cccccc").stroke();

  y += 10;
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000");
  doc.text("Totaal", 300, y, { width: 140, align: "right" });
  doc.text(formatAmountCents(totalCents, "nl"), 420, y, { width: 120, align: "right" });

  // Voettekst: betaalstatus.
  y += 60;
  doc.font("Helvetica").fontSize(10).fillColor("#444444");
  if (invoice.status === "paid" && invoice.paidUtc) {
    doc.text(`Betaald op ${formatDateLong(dateKeyOf(invoice.paidUtc))}.`, 56, y);
  } else {
    doc.text(
      "Nog niet betaald. Gebruik de betaallink uit de e-mail, of maak het bedrag over " +
        `op ${company.companyIban} onder vermelding van het factuurnummer.`,
      56,
      y,
      { width: 480 },
    );
  }

  doc.end();
  return done;
}
