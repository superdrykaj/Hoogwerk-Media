/**
 * Beslisregels voor Mollie-betalingen. Geen databasetoegang en geen netwerk,
 * zodat dit zonder server-only te testen is. De aanroepen staan in
 * lib/payments.ts.
 */

/** Wat we van een Mollie-betaling nodig hebben. */
export type RemotePayment = {
  status: string;
  /** Alleen aanwezig zolang de betaling nog open is. */
  checkoutUrl: string | null;
  amountCents: number | null;
  currency: string | null;
};

/** "12.34" → 1234. Null bij alles wat geen bedrag met hooguit twee decimalen is. */
export function amountValueToCents(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(\.\d{1,2})?$/.test(value)) return null;
  return Math.round(Number(value) * 100);
}

/** Leest het antwoord van GET /v2/payments/{id} zonder iets te vertrouwen. */
export function parseRemotePayment(data: unknown): RemotePayment | null {
  if (!data || typeof data !== "object") return null;
  const d = data as {
    status?: unknown;
    amount?: { value?: unknown; currency?: unknown };
    _links?: { checkout?: { href?: unknown } };
  };
  if (typeof d.status !== "string") return null;
  const href = d._links?.checkout?.href;
  return {
    status: d.status,
    checkoutUrl: typeof href === "string" ? href : null,
    amountCents: amountValueToCents(d.amount?.value),
    currency: typeof d.amount?.currency === "string" ? d.amount.currency : null,
  };
}

export type PaymentDecision =
  /** Betaald en het bedrag klopt: factuur op betaald zetten. */
  | { kind: "mark-paid" }
  /** Betaald, maar het bedrag of de valuta wijkt af van de factuur: niet automatisch afboeken. */
  | { kind: "mismatch"; paidCents: number | null; expectedCents: number }
  /** De betaling staat nog open en de klant kan er nog mee betalen. */
  | { kind: "reuse"; checkoutUrl: string }
  /** Verlopen, mislukt of geannuleerd: een nieuwe betaling aanmaken. */
  | { kind: "create-new" };

/**
 * Wat te doen met de betaling die al aan een factuur hangt?
 * `payment` is null als er nog geen is of als Mollie niet antwoordde; dan is
 * een nieuwe betaling de veilige keuze, behalve als we niet konden vragen.
 */
export function decidePayment(
  payment: RemotePayment | null,
  invoiceAmountCents: number,
): PaymentDecision {
  if (!payment) return { kind: "create-new" };

  if (payment.status === "paid") {
    if (payment.currency === "EUR" && payment.amountCents === invoiceAmountCents) {
      return { kind: "mark-paid" };
    }
    return {
      kind: "mismatch",
      paidCents: payment.amountCents,
      expectedCents: invoiceAmountCents,
    };
  }

  // Alleen hergebruiken als het bedrag nog klopt; is de factuur na het aanmaken
  // gewijzigd, dan moet de klant het nieuwe bedrag betalen.
  if (
    (payment.status === "open" || payment.status === "pending") &&
    payment.checkoutUrl &&
    payment.currency === "EUR" &&
    payment.amountCents === invoiceAmountCents
  ) {
    return { kind: "reuse", checkoutUrl: payment.checkoutUrl };
  }

  return { kind: "create-new" };
}
