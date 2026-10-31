import "server-only";

import { getInvoice, markPaid, markRefunded, setMolliePaymentId } from "./invoices";
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
  options: { recheckPaid?: boolean } = {},
): Promise<{ invoice: Invoice; reachable: boolean }> {
  if (!invoice.molliePaymentId) return { invoice, reachable: true };
  // Een betaalde factuur vraagt alleen om een nieuwe controle als daar reden
  // voor is (de webhook van Mollie, de knop in Beheer): dan kan het een
  // terugbetaling zijn. Een gewoon paginabezoek belt Mollie niet.
  if (invoice.status === "paid" && !options.recheckPaid) return { invoice, reachable: true };

  const remote = await fetchMolliePayment(invoice.molliePaymentId);
  if (remote === "unreachable") return { invoice, reachable: false };
  if (remote === null) return { invoice, reachable: true };

  const decision = decidePayment(remote, invoice.amountCents, invoice.id);

  if (invoice.status === "paid") {
    if (invoice.paymentMethod === "manual") {
      // Door de beheerder als betaald geboekt, en nu betaalt de klant óók via
      // Mollie: dubbel betaald. Niet automatisch terugbetalen, wel melden.
      if (decision.kind === "mark-paid") {
        console.error(
          `[mollie] Factuur ${invoice.invoiceNumber ?? invoice.id} is handmatig als betaald geboekt, ` +
            `maar Mollie-betaling ${invoice.molliePaymentId} is ook betaald. Betaal één van de twee terug.`,
        );
      }
      return { invoice, reachable: true };
    }
    if (decision.kind === "refunded") {
      markRefunded(invoice.id);
      console.error(
        `[mollie] Betaling ${invoice.molliePaymentId} van factuur ${invoice.invoiceNumber ?? invoice.id} ` +
          "is volledig terugbetaald of teruggeboekt; de bestanden zijn niet meer beschikbaar.",
      );
      return { invoice: getInvoice(invoice.id) ?? invoice, reachable: true };
    }
    return { invoice, reachable: true };
  }

  if (decision.kind === "mark-paid") {
    markPaid(invoice.id, "mollie");
    return { invoice: getInvoice(invoice.id) ?? invoice, reachable: true };
  }
  if (decision.kind === "wrong-invoice") {
    console.error(
      `[mollie] Betaling ${invoice.molliePaymentId} hoort volgens Mollie bij factuur-ID ${decision.found}, ` +
        `niet bij ${invoice.id}. Niet afgeboekt.`,
    );
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
  if (invoice.status === "cancelled") {
    return { ok: false, alreadyPaid: false, error: "Deze factuur is geannuleerd." };
  }
  if (invoice.status === "refunded") {
    return { ok: false, alreadyPaid: false, error: "Deze factuur is terugbetaald." };
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
    const decision = decidePayment(remote, invoice.amountCents, invoice.id);
    if (decision.kind === "mark-paid") {
      markPaid(invoice.id, "mollie");
      return { ok: false, alreadyPaid: true, error: "Deze factuur is al betaald." };
    }
    if (decision.kind === "refunded" || decision.kind === "wrong-invoice") {
      return {
        ok: false,
        alreadyPaid: false,
        error: "Deze betaling kan niet worden hergebruikt. Neem contact op met Hoogbeeld Media.",
      };
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
