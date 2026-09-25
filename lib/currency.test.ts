import { describe, expect, it } from "vitest";

import { formatAmountCents, parseAmountInput } from "./currency";

describe("parseAmountInput", () => {
  it("leest een bedrag met komma", () => {
    expect(parseAmountInput("250,00")).toBe(25000);
  });

  it("leest een bedrag met punt", () => {
    expect(parseAmountInput("250.50")).toBe(25050);
  });

  it("leest een heel getal zonder decimalen", () => {
    expect(parseAmountInput("100")).toBe(10000);
  });

  it("rondt centen correct af", () => {
    expect(parseAmountInput("9,99")).toBe(999);
  });

  it("wijst tekst af", () => {
    expect(parseAmountInput("abc")).toBeNull();
  });

  it("wijst een negatief bedrag af", () => {
    expect(parseAmountInput("-10")).toBeNull();
  });

  it("wijst meer dan twee decimalen af", () => {
    expect(parseAmountInput("10,999")).toBeNull();
  });

  it("wijst een leeg veld af", () => {
    expect(parseAmountInput("")).toBeNull();
  });
});

describe("formatAmountCents", () => {
  // Intl.NumberFormat zet in "nl-NL" een vaste spatie (U+00A0) tussen het
  // teken en het bedrag, geen gewone spatie.
  const NBSP = " ";

  it("formatteert in het Nederlands met een komma", () => {
    expect(formatAmountCents(25000, "nl")).toBe(`€${NBSP}250,00`);
  });

  it("formatteert in het Engels met een punt", () => {
    expect(formatAmountCents(25000, "en")).toBe("€250.00");
  });

  it("rondt af naar hele centen", () => {
    expect(formatAmountCents(999, "nl")).toBe(`€${NBSP}9,99`);
  });
});
