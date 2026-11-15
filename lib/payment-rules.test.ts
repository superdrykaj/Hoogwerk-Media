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
  refundedCents: 0,
  chargedBackCents: 0,
  metadataInvoiceId: "7",
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
      refundedCents: 0,
      chargedBackCents: 0,
      metadataInvoiceId: null,
    });
  });
  it("leest terugbetaling, chargeback en het factuur-ID uit de metadata", () => {
    const payment = parseRemotePayment({
      status: "paid",
      amount: { value: "250.00", currency: "EUR" },
      amountRefunded: { value: "100.00", currency: "EUR" },
      amountChargedBack: { value: "25.50", currency: "EUR" },
      metadata: { invoiceId: "7" },
      _links: {},
    });
    expect(payment).toMatchObject({ refundedCents: 10000, chargedBackCents: 2550, metadataInvoiceId: "7" });
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

describe("decidePayment: koppeling aan de juiste factuur", () => {
  const betaald: RemotePayment = { ...open, status: "paid", checkoutUrl: null };

  it("boekt af als het factuur-ID klopt", () => {
    expect(decidePayment(betaald, 25000, 7)).toEqual({ kind: "mark-paid" });
  });
  it("boekt NIET af bij een betaling van een andere factuur", () => {
    expect(decidePayment({ ...betaald, metadataInvoiceId: "8" }, 25000, 7)).toEqual({
      kind: "wrong-invoice",
      found: "8",
    });
  });
  it("hergebruikt een open betaling van een andere factuur ook niet", () => {
    expect(decidePayment({ ...open, metadataInvoiceId: "8" }, 25000, 7).kind).toBe("wrong-invoice");
  });
  it("laat een oudere betaling zonder metadata door (van vóór deze controle)", () => {
    expect(decidePayment({ ...betaald, metadataInvoiceId: null }, 25000, 7)).toEqual({ kind: "mark-paid" });
  });
});

describe("decidePayment: terugbetalingen", () => {
  const betaald: RemotePayment = { ...open, status: "paid", checkoutUrl: null };

  it("herkent een volledige terugbetaling", () => {
    expect(decidePayment({ ...betaald, refundedCents: 25000 }, 25000, 7)).toEqual({ kind: "refunded" });
  });
  it("herkent een chargeback", () => {
    expect(decidePayment({ ...betaald, chargedBackCents: 25000 }, 25000, 7)).toEqual({ kind: "refunded" });
  });
  it("herkent een terugbetaling die uit twee delen bestaat", () => {
    expect(decidePayment({ ...betaald, refundedCents: 15000, chargedBackCents: 10000 }, 25000, 7).kind).toBe("refunded");
  });
  it("laat een gedeeltelijke terugbetaling op betaald staan", () => {
    expect(decidePayment({ ...betaald, refundedCents: 5000 }, 25000, 7)).toEqual({ kind: "mark-paid" });
  });
});
