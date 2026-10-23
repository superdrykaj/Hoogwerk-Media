import "server-only";

import { getInvoice, markPaid, setMolliePaymentId } from "./invoices";
import { createMolliePayment, fetchMolliePayment } from "./mollie";
import { decidePayment } from "./payment-rules";
import type { Invoice } from "./types";

/**
 * De ene plek waar een factuur op "betaald" gaat op basis van Mollie. De
 * webhook, de knop "Status verversen" en de opleveringspagina roepen allemaal
 * dit aan, zodat de regels overal gelijk zijn.
 *
 * Mollie wordt altijd zelf gevraagd; niets uit een inkomend verzoek wordt
 * vertrouwd. Wijkt het betaalde bedrag af van de factuur, dan wordt er niet
 * automatisch afgeboekt maar een melding in het serverlog gezet: dat is een
 * geval voor een mens.
 */
export async function syncInvoicePayment(
  invoice: Invoice,
): Promise<{ invoice: Invoice; reachable: boolean }> {
  if (invoice.status === "paid" || !invoice.molliePaymentId) {
    return { invoice, reachable: true };
  }

  const remote = await fetchMolliePayment(invoice.molliePaymentId);
  if (remote === "unreachable") return { invoice, reachable: false };
  if (remote === null) return { invoice, reachable: true };

  const decision = decidePayment(remote, invoice.amountCents);
  if (decision.kind === "mark-paid") {
    markPaid(invoice.id);
    return { invoice: getInvoice(invoice.id) ?? invoice, reachable: true };
  }
  if (decision.kind === "mismatch") {
    console.error(
      `[mollie] Betaling ${invoice.molliePaymentId} is betaald, maar het bedrag ` +
        `(${decision.paidCents ?? "onbekend"} cent) wijkt af van factuur ` +
        `${invoice.invoiceNumber ?? invoice.id} (${decision.expectedCents} cent). ` +
        "Niet automatisch afgeboekt.",
    );
  }
  return { invoice, reachable: true };
}

export type CheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; alreadyPaid: boolean; error: string };

/**
 * Geeft een betaallink voor deze factuur. Bestaat er al een open betaling met
 * hetzelfde bedrag, dan krijgt de klant dezelfde link terug in plaats van een
 * nieuwe betaling: anders raakt een eerdere, alsnog betaalde betaling zoek
 * (er staat maar één betalings-ID per factuur). Is de bestaande betaling al
 * betaald, dan wordt er niets nieuws aangemaakt.
 */
export async function getOrCreateCheckout(params: {
  invoice: Invoice;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
}): Promise<CheckoutResult> {
  const { invoice } = params;

  if (invoice.status === "paid") {
    return { ok: false, alreadyPaid: true, error: "Deze factuur is al betaald." };
  }

  if (invoice.molliePaymentId) {
    const remote = await fetchMolliePayment(invoice.molliePaymentId);
    // Niet kunnen vragen is geen reden om een tweede betaling te starten.
    if (remote === "unreachable") {
      return {
        ok: false,
        alreadyPaid: false,
        error: "Mollie is nu niet bereikbaar. Probeer het zo opnieuw.",
      };
    }
    const decision = decidePayment(remote, invoice.amountCents);
    if (decision.kind === "mark-paid") {
      markPaid(invoice.id);
      return { ok: false, alreadyPaid: true, error: "Deze factuur is al betaald." };
    }
    if (decision.kind === "mismatch") {
      return {
        ok: false,
        alreadyPaid: false,
        error:
          "Er is al betaald, maar het bedrag wijkt af van de factuur. Controleer dit in Mollie.",
      };
    }
    if (decision.kind === "reuse") {
      return { ok: true, checkoutUrl: decision.checkoutUrl };
    }
  }

  const payment = await createMolliePayment({
    invoiceId: invoice.id,
    amountCents: invoice.amountCents,
    description: params.description,
    redirectUrl: params.redirectUrl,
    webhookUrl: params.webhookUrl,
  });
  if (!payment.ok) return { ok: false, alreadyPaid: false, error: payment.error };

  setMolliePaymentId(invoice.id, payment.paymentId);
  return { ok: true, checkoutUrl: payment.checkoutUrl };
}
