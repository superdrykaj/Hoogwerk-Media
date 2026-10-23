import { getInvoiceByMolliePaymentId } from "@/lib/invoices";
import { syncInvoicePayment } from "@/lib/payments";

/**
 * Mollie stuurt hier alleen een betalings-id naartoe, zonder verdere details.
 * De inhoud van dit verzoek wordt bewust nergens vertrouwd: de status wordt
 * altijd opnieuw bij Mollie zelf opgevraagd voordat een factuur op "betaald"
 * gaat. Zie ook de knop "Status verversen" in de beheeromgeving, die hetzelfde
 * doet voor omgevingen waar deze webhook niet bereikbaar is (bijvoorbeeld
 * lokaal achter localhost).
 */
export async function POST(request: Request) {
  const body = await request.formData().catch(() => null);
  const paymentId = String(body?.get("id") ?? "");
  if (!paymentId) {
    return new Response("Ontbrekend betalings-id", { status: 400 });
  }

  const invoice = getInvoiceByMolliePaymentId(paymentId);
  if (!invoice) {
    // Onbekende of verouderde betaling: niets aan de hand, gewoon negeren.
    return new Response("OK", { status: 200 });
  }

  // Kon Mollie niet worden bereikt, dan een foutcode: Mollie probeert de
  // webhook dan zelf opnieuw. Met een 200 zou een betaling blijven liggen.
  const { reachable } = await syncInvoicePayment(invoice);
  if (!reachable) {
    return new Response("Mollie niet bereikbaar", { status: 503 });
  }

  return new Response("OK", { status: 200 });
}
