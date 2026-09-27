import { getBooking } from "@/lib/bookings";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { getInvoiceByToken } from "@/lib/invoices";
import { getInvoiceSettings } from "@/lib/settings";

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

  const pdf = await generateInvoicePdf(invoice, booking, getInvoiceSettings());
  const bestandsnaam = `factuur-${invoice.invoiceNumber ?? "concept"}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${bestandsnaam}"`,
      "Content-Length": String(pdf.length),
    },
  });
}
