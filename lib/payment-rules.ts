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
  /** Wat Mollie al heeft terugbetaald of teruggeboekt (chargeback), in centen. */
  refundedCents: number;
  chargedBackCents: number;
  /** Het factuur-ID dat wij bij het aanmaken meegaven; null als het ontbreekt. */
  metadataInvoiceId: string | null;
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
    amountRefunded?: { value?: unknown };
    amountChargedBack?: { value?: unknown };
    metadata?: { invoiceId?: unknown } | null;
    _links?: { checkout?: { href?: unknown } };
  };
  if (typeof d.status !== "string") return null;
  const href = d._links?.checkout?.href;
  return {
    status: d.status,
    checkoutUrl: typeof href === "string" ? href : null,
    amountCents: amountValueToCents(d.amount?.value),
    currency: typeof d.amount?.currency === "string" ? d.amount.currency : null,
    refundedCents: amountValueToCents(d.amountRefunded?.value) ?? 0,
    chargedBackCents: amountValueToCents(d.amountChargedBack?.value) ?? 0,
    metadataInvoiceId:
      d.metadata && (typeof d.metadata.invoiceId === "string" || typeof d.metadata.invoiceId === "number")
        ? String(d.metadata.invoiceId)
        : null,
  };
}

export type PaymentDecision =
  /** Betaald en het bedrag klopt: factuur op betaald zetten. */
  | { kind: "mark-paid" }
  /** Betaald, maar daarna volledig terugbetaald of teruggeboekt: toegang intrekken. */
  | { kind: "refunded" }
  /** De betaling hoort bij een andere factuur dan waar het ID aan hangt: nooit afboeken. */
  | { kind: "wrong-invoice"; found: string }
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
  invoiceId?: number,
): PaymentDecision {
  if (!payment) return { kind: "create-new" };

  // De betaling moet bij déze factuur horen. Mollie krijgt het factuur-ID bij
  // het aanmaken mee; komt er iets anders terug, dan gaat er niets open.
  if (
    invoiceId !== undefined &&
    payment.metadataInvoiceId !== null &&
    payment.metadataInvoiceId !== String(invoiceId)
  ) {
    return { kind: "wrong-invoice", found: payment.metadataInvoiceId };
  }

  if (payment.status === "paid") {
    if (payment.currency === "EUR" && payment.amountCents === invoiceAmountCents) {
      // Volledig terugbetaald of teruggeboekt: de klant heeft niet betaald. Een
      // gedeeltelijke terugbetaling laat de factuur op betaald staan.
      if (payment.refundedCents + payment.chargedBackCents >= payment.amountCents) {
        return { kind: "refunded" };
      }
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
