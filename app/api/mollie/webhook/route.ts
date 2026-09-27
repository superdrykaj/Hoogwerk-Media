import { getInvoiceByMolliePaymentId, markPaid } from "@/lib/invoices";
import { fetchMolliePaymentStatus } from "@/lib/mollie";

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

  const status = await fetchMolliePaymentStatus(paymentId);
  if (status === "paid") {
    markPaid(invoice.id);
  }

  return new Response("OK", { status: 200 });
}
