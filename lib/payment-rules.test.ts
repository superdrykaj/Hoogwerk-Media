import { describe, expect, it } from "vitest";

import {
  amountValueToCents,
  decidePayment,
  parseRemotePayment,
  type RemotePayment,
} from "./payment-rules";

const open: RemotePayment = {
  status: "open",
  checkoutUrl: "https://www.mollie.com/checkout/select-method/abc",
  amountCents: 25000,
  currency: "EUR",
};

describe("amountValueToCents", () => {
  it("leest het bedrag zoals Mollie het geeft", () => {
    expect(amountValueToCents("250.00")).toBe(25000);
    expect(amountValueToCents("0.10")).toBe(10);
    expect(amountValueToCents("12")).toBe(1200);
  });
  it("wijst alles af wat geen bedrag is", () => {
    expect(amountValueToCents("12,50")).toBeNull();
    expect(amountValueToCents("-1.00")).toBeNull();
    expect(amountValueToCents(12.5)).toBeNull();
    expect(amountValueToCents(undefined)).toBeNull();
  });
});

describe("parseRemotePayment", () => {
  it("leest status, bedrag en betaallink", () => {
    const payment = parseRemotePayment({
      status: "open",
      amount: { value: "250.00", currency: "EUR" },
      _links: { checkout: { href: "https://www.mollie.com/checkout/x" } },
    });
    expect(payment).toEqual({
      status: "open",
      checkoutUrl: "https://www.mollie.com/checkout/x",
      amountCents: 25000,
      currency: "EUR",
    });
  });
  it("heeft geen betaallink meer als de betaling is afgerond", () => {
    const payment = parseRemotePayment({
      status: "paid",
      amount: { value: "250.00", currency: "EUR" },
      _links: {},
    });
    expect(payment?.checkoutUrl).toBeNull();
  });
  it("geeft null bij onbruikbare antwoorden", () => {
    expect(parseRemotePayment(null)).toBeNull();
    expect(parseRemotePayment("tekst")).toBeNull();
    expect(parseRemotePayment({ amount: { value: "1.00" } })).toBeNull();
  });
});

describe("decidePayment", () => {
  it("boekt af als er betaald is en het bedrag klopt", () => {
    expect(
      decidePayment({ ...open, status: "paid", checkoutUrl: null }, 25000),
    ).toEqual({ kind: "mark-paid" });
  });

  it("boekt NIET af als het betaalde bedrag afwijkt", () => {
    expect(
      decidePayment({ ...open, status: "paid", amountCents: 100 }, 25000),
    ).toEqual({ kind: "mismatch", paidCents: 100, expectedCents: 25000 });
  });

  it("boekt NIET af bij een andere valuta", () => {
    expect(
      decidePayment({ ...open, status: "paid", currency: "USD" }, 25000).kind,
    ).toBe("mismatch");
  });

  it("boekt niet af bij een betaling die alleen is geautoriseerd of nog loopt", () => {
    expect(decidePayment({ ...open, status: "authorized" }, 25000).kind).not.toBe(
      "mark-paid",
    );
    expect(decidePayment({ ...open, status: "pending" }, 25000).kind).not.toBe(
      "mark-paid",
    );
  });

  it("hergebruikt een open betaling met hetzelfde bedrag", () => {
    expect(decidePayment(open, 25000)).toEqual({
      kind: "reuse",
      checkoutUrl: open.checkoutUrl,
    });
  });

  it("maakt een nieuwe betaling als het bedrag van de factuur is veranderd", () => {
    expect(decidePayment(open, 30000)).toEqual({ kind: "create-new" });
  });

  it("maakt een nieuwe betaling na verlopen, mislukt of geannuleerd", () => {
    for (const status of ["expired", "failed", "canceled"]) {
      expect(decidePayment({ ...open, status, checkoutUrl: null }, 25000)).toEqual({
        kind: "create-new",
      });
    }
  });

  it("maakt een nieuwe betaling als er nog geen betaling is", () => {
    expect(decidePayment(null, 25000)).toEqual({ kind: "create-new" });
  });
});
