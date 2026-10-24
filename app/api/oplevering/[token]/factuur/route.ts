import { getBooking } from "@/lib/bookings";
import { getInvoicePdf } from "@/lib/invoice-issue";
import { getInvoiceByToken } from "@/lib/invoices";

/**
 * Het factuur-PDF. Anders dan de opleverbestanden zit hier geen paywall op:
 * de klant moet de factuur altijd kunnen inzien en downloaden, ook als hij
 * nog niet betaald heeft — dat is juist het document waarmee hij betaalt.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const invoice = getInvoiceByToken(token);
  const booking = invoice ? getBooking(invoice.bookingId) : null;
  if (!invoice || !booking) {
    return new Response("Niet gevonden", { status: 404 });
  }

  // Uitgegeven: het bewaarde, onveranderde PDF. Anders een voorbeeld met CONCEPT.
  const { pdf, filename: bestandsnaam } = await getInvoicePdf(invoice, booking);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${bestandsnaam}"`,
      "Content-Length": String(pdf.length),
      // Een uitgegeven factuur verandert niet, een concept wel.
      "Cache-Control": invoice.issuedUtc ? "private, max-age=3600" : "no-store",
    },
  });
}
