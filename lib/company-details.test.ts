import { describe, expect, it } from "vitest";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { DEFAULT_INVOICE_SETTINGS } from "./defaults";

describe("bedrijfsgegevens (content/site.ts)", () => {
  it("heeft het officiële KvK-nummer: acht cijfers", () => {
    expect(site.business.kvk).toBe("42201319");
    expect(site.business.kvk).toMatch(/^\d{8}$/);
  });

  it("noemt de vestigingsplaats en geen straatadres", () => {
    expect(site.business.city).toBe("Zaandam");
    expect(JSON.stringify(site.business)).not.toMatch(/straat|laan|weg\b|\d{4}\s?[A-Z]{2}/i);
  });

  it("heeft geen btw-nummer, of een nummer in de vorm NL123456789B01", () => {
    // Een verzonnen nummer is erger dan geen nummer: leeg laten tot het bekend is.
    if (site.business.vat) expect(site.business.vat).toMatch(/^NL\d{9}B\d{2}$/);
  });

  it("gebruikt het KvK-nummer als beginwaarde op facturen", () => {
    expect(DEFAULT_INVOICE_SETTINGS.companyKvk).toBe(site.business.kvk);
  });

  it("heeft de rechtsvorm in beide talen", () => {
    expect(copy("nl").company.legalForm).toBe("Eenmanszaak");
    expect(copy("en").company.legalForm.toLowerCase()).toContain("eenmanszaak");
  });
});
