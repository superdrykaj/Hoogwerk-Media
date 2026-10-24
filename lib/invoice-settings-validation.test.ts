import { describe, expect, it } from "vitest";

import { invoiceSettingsFormSchema } from "./validation";

const geldig = {
  companyName: "Hoogbeeld Media",
  companyAddress: "Voorbeeldstraat 1",
  companyPostcode: "1500ab",
  companyCity: "Zaandam",
  companyKvk: "42201319",
  companyVatNumber: "nl 123456789 b01",
  companyIban: "nl91 abna 0417 1643 00",
  vatRatePercent: "21",
};

describe("bedrijfsgegevens voor facturen opslaan", () => {
  it("accepteert geldige gegevens en slaat ze genormaliseerd op", () => {
    const r = invoiceSettingsFormSchema.safeParse(geldig);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyPostcode).toBe("1500 AB");
      expect(r.data.companyIban).toBe("NL91ABNA0417164300");
      expect(r.data.companyVatNumber).toBe("NL123456789B01");
    }
  });

  it("weigert de invulplekken van een verse installatie", () => {
    const r = invoiceSettingsFormSchema.safeParse({
      ...geldig,
      companyAddress: "Nog invullen",
      companyCity: "Nog invullen",
      companyPostcode: "0000 AA",
      companyIban: "Nog niet ingevuld",
      companyVatNumber: "Nog niet ingevuld",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const velden = r.error.issues.map((i) => i.path[0]);
      expect(velden).toEqual(
        expect.arrayContaining(["companyAddress", "companyCity", "companyPostcode", "companyIban", "companyVatNumber"]),
      );
    }
  });

  it("weigert een KvK-nummer van de verkeerde lengte en een verkeerd IBAN", () => {
    const r = invoiceSettingsFormSchema.safeParse({ ...geldig, companyKvk: "1234", companyIban: "NL91ABNA0417164301" });
    expect(r.success).toBe(false);
  });

  it("vraagt om een btw-id bij btw, maar niet bij 0% (KOR)", () => {
    expect(invoiceSettingsFormSchema.safeParse({ ...geldig, companyVatNumber: "" }).success).toBe(false);
    expect(
      invoiceSettingsFormSchema.safeParse({ ...geldig, companyVatNumber: "", vatRatePercent: "0" }).success,
    ).toBe(true);
  });
});
