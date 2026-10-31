import { describe, expect, it } from "vitest";

import { generateInvoicePdf } from "./invoice-pdf";
import { KOR_NOTE, buildSnapshot } from "./invoice-rules";

const basis = {
  number: "2026-0042",
  invoiceDate: "2026-10-24",
  deliveryDate: "2026-10-20",
  paymentTermDays: 14,
  bookingReference: "HM-TEST01",
  supplier: {
    companyName: "Hoogbeeld Media",
    companyAddress: "Voorbeeldstraat 1",
    companyPostcode: "1500 AB",
    companyCity: "Zaandam",
    companyKvk: "42201319",
    companyVatNumber: "NL123456789B01",
    companyIban: "NL91ABNA0417164300",
    vatRatePercent: 21,
  },
  supplierEmail: "info@hoogbeeldmedia.nl",
  customer: { name: "Klant BV", address: "Dam 1", postcode: "1012 JS", city: "Amsterdam", country: "Nederland", vatId: "" },
  description: "Dronefotografie — pakket compleet",
  totalCents: 25000,
};

/**
 * Leest de tekst uit een PDF zonder compressie. PDFKit schrijft elke tekstregel
 * als `[<hex> kerning <hex>] TJ`; de hexstukken samen zijn de regel.
 */
function pdfText(pdf: Buffer): string {
  const bron = pdf.toString("latin1");
  const regels: string[] = [];
  for (const m of bron.matchAll(/\[([^\]]*)\]\s*TJ/g)) {
    let regel = "";
    for (const hex of m[1].matchAll(/<([0-9a-fA-F]*)>/g)) {
      regel += Buffer.from(hex[1], "hex").toString("latin1");
    }
    regels.push(regel);
  }
  return regels.join("\n");
}

async function tekst(snapshot = buildSnapshot(basis), concept = false): Promise<string> {
  return pdfText(await generateInvoicePdf(snapshot, { compress: false, concept }));
}

describe("factuur-PDF", () => {
  it("is een geldig PDF-bestand van één pagina", async () => {
    const pdf = await generateInvoicePdf(buildSnapshot(basis));
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.subarray(-6).toString()).toContain("%%EOF");
    expect((pdf.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length).toBe(1);
  });

  it("bevat alle verplichte gegevens", async () => {
    const t = await tekst();
    for (const verwacht of [
      "FACTUUR",
      "2026-0042", // nummer
      "Hoogbeeld Media",
      "Voorbeeldstraat 1",
      "42201319", // KvK
      "NL123456789B01", // btw-id leverancier
      "NL91 ABNA 0417 1643 00", // IBAN
      "Factuurdatum: 24-10-2026",
      "Levering/uitvoering: 20-10-2026",
      "Uiterste betaaldatum: 07-11-2026",
      "Klant BV", // afnemer
      "Dam 1",
      "1012 JS Amsterdam",
      "Nederland",
      "Dronefotografie",
      "Totaal excl. btw",
      "Btw 21%",
      "Totaal te betalen",
    ]) {
      expect(t, verwacht).toContain(verwacht);
    }
  });

  it("toont geen betaalstatus: het document verandert niet na uitgifte", async () => {
    const t = await tekst();
    expect(t).not.toMatch(/Betaald op|Nog niet betaald/);
  });

  it("noemt bij 0% btw de KOR en geen btw-id", async () => {
    const snap = buildSnapshot({ ...basis, supplier: { ...basis.supplier, vatRatePercent: 0, companyVatNumber: "" } });
    const t = await tekst(snap);
    expect(t).toContain("kleineondernemersregeling");
    expect(snap.vatNote).toBe(KOR_NOTE);
    expect(t).not.toContain("BTW-identificatienummer: NL");
  });

  it("zet CONCEPT op een voorbeeld", async () => {
    expect(await tekst(buildSnapshot({ ...basis, number: "concept" }), true)).toContain("CONCEPT");
    expect(await tekst()).not.toContain("CONCEPT");
  });
});
