import { describe, expect, it } from "vitest";

import {
  KOR_NOTE,
  buildSnapshot,
  customerProblems,
  formatIban,
  formatPostcode,
  isDateKey,
  isPlaceholder,
  isValidDutchPostcode,
  isValidIban,
  isValidKvk,
  isValidVatId,
  normalizeVatId,
  supplierProblems,
} from "./invoice-rules";
import type { InvoiceSettings } from "./types";

const volledig: InvoiceSettings = {
  companyName: "Hoogbeeld Media",
  companyAddress: "Voorbeeldstraat 1",
  companyPostcode: "1500 AB",
  companyCity: "Zaandam",
  companyKvk: "42201319",
  companyVatNumber: "NL123456789B01",
  companyIban: "NL91 ABNA 0417 1643 00",
  vatRatePercent: 21,
};

describe("IBAN", () => {
  it("accepteert geldige nummers, ook met spaties en kleine letters", () => {
    expect(isValidIban("NL91ABNA0417164300")).toBe(true);
    expect(isValidIban("nl91 abna 0417 1643 00")).toBe(true);
    expect(isValidIban("DE89370400440532013000")).toBe(true);
  });
  it("wijst een verkeerd controlegetal of lengte af", () => {
    expect(isValidIban("NL91ABNA0417164301")).toBe(false);
    expect(isValidIban("NL91ABNA041716430")).toBe(false);
    expect(isValidIban("Nog niet ingevuld")).toBe(false);
    expect(isValidIban("")).toBe(false);
  });
  it("zet een IBAN in groepjes van vier", () => {
    expect(formatIban("NL91ABNA0417164300")).toBe("NL91 ABNA 0417 1643 00");
  });
});

describe("KvK, btw-id en postcode", () => {
  it("een KvK-nummer heeft precies 8 cijfers", () => {
    expect(isValidKvk("42201319")).toBe(true);
    expect(isValidKvk("4220131")).toBe(false);
    expect(isValidKvk("Nog niet ingevuld")).toBe(false);
  });
  it("een Nederlands btw-id is NL + 9 cijfers + B + 2 cijfers", () => {
    expect(isValidVatId("NL123456789B01")).toBe(true);
    expect(isValidVatId("nl 1234.56.789 b01")).toBe(true);
    expect(isValidVatId("NL123456789")).toBe(false);
    expect(isValidVatId("Nog niet ingevuld")).toBe(false);
    expect(normalizeVatId("nl 1234.56.789 b01")).toBe("NL123456789B01");
  });
  it("een postcode is 4 cijfers en 2 letters, zonder beginnende 0", () => {
    expect(isValidDutchPostcode("1500 AB")).toBe(true);
    expect(isValidDutchPostcode("1500ab")).toBe(true);
    expect(isValidDutchPostcode("0000 AA")).toBe(false);
    expect(formatPostcode("1500ab")).toBe("1500 AB");
  });
});

describe("invulplekken", () => {
  it("herkent de standaardteksten van een verse installatie", () => {
    for (const v of ["Nog invullen", "Nog niet ingevuld", "0000 AA", "", "  "]) {
      expect(isPlaceholder(v)).toBe(true);
    }
    expect(isPlaceholder("Voorbeeldstraat 1")).toBe(false);
  });
});

describe("supplierProblems", () => {
  it("geeft niets terug bij volledige, geldige gegevens", () => {
    expect(supplierProblems(volledig)).toEqual([]);
  });
  it("meldt alle standaardinvulplekken", () => {
    const problems = supplierProblems({
      ...volledig,
      companyAddress: "Nog invullen",
      companyPostcode: "0000 AA",
      companyCity: "Nog invullen",
      companyVatNumber: "Nog niet ingevuld",
      companyIban: "Nog niet ingevuld",
    });
    expect(problems).toHaveLength(5);
  });
  it("vraagt om een btw-id bij btw, maar niet bij 0% (KOR)", () => {
    const zonder = { ...volledig, companyVatNumber: "" };
    expect(supplierProblems(zonder).join()).toMatch(/btw-identificatienummer/);
    expect(supplierProblems({ ...zonder, vatRatePercent: 0 })).toEqual([]);
  });
});

describe("customerProblems", () => {
  const klant = { name: "Klant BV", address: "Dam 1", postcode: "1012 JS", city: "Amsterdam", country: "Nederland", vatId: "" };
  it("accepteert volledige klantgegevens", () => {
    expect(customerProblems(klant)).toEqual([]);
  });
  it("eist naam, adres, postcode, plaats en land", () => {
    expect(customerProblems({ ...klant, name: "", address: " ", city: "" })).toHaveLength(3);
  });
});

describe("isDateKey", () => {
  it("accepteert alleen bestaande datums", () => {
    expect(isDateKey("2026-10-24")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("24-10-2026")).toBe(false);
    expect(isDateKey("")).toBe(false);
  });
});

describe("buildSnapshot", () => {
  const input = {
    number: "2026-0001",
    invoiceDate: "2026-10-24",
    deliveryDate: "2026-10-20",
    paymentTermDays: 14,
    bookingReference: "HM-TEST01",
    supplier: volledig,
    supplierEmail: "info@hoogbeeldmedia.nl",
    customer: { name: " Klant BV ", address: "Dam 1", postcode: "1012 JS", city: "Amsterdam", country: "Nederland", vatId: "" },
    description: " Dronefotografie ",
    totalCents: 25000,
  };

  it("rekent btw uit het bedrag inclusief btw en telt exact op", () => {
    const s = buildSnapshot(input);
    expect(s.subtotalCents).toBe(20661);
    expect(s.vatCents).toBe(4339);
    expect(s.subtotalCents + s.vatCents).toBe(s.totalCents);
    expect(s.vatRatePercent).toBe(21);
    expect(s.vatNote).toBe("");
  });

  it("telt altijd op, ook bij rare bedragen", () => {
    for (const cents of [1, 99, 12345, 100001, 999999]) {
      const s = buildSnapshot({ ...input, totalCents: cents });
      expect(s.subtotalCents + s.vatCents).toBe(cents);
    }
  });

  it("berekent de uiterste betaaldatum uit factuurdatum en termijn", () => {
    expect(buildSnapshot(input).dueDate).toBe("2026-11-07");
    expect(buildSnapshot({ ...input, paymentTermDays: 30 }).dueDate).toBe("2026-11-23");
  });

  it("normaliseert IBAN en btw-id en schrapt witruimte", () => {
    const s = buildSnapshot(input);
    expect(s.supplier.iban).toBe("NL91ABNA0417164300");
    expect(s.supplier.vatId).toBe("NL123456789B01");
    expect(s.customer.name).toBe("Klant BV");
    expect(s.description).toBe("Dronefotografie");
  });

  it("bij 0% geen btw, geen btw-id en de KOR-vermelding", () => {
    const s = buildSnapshot({ ...input, supplier: { ...volledig, vatRatePercent: 0 } });
    expect(s.vatCents).toBe(0);
    expect(s.subtotalCents).toBe(25000);
    expect(s.supplier.vatId).toBe("");
    expect(s.vatNote).toBe(KOR_NOTE);
  });
});
