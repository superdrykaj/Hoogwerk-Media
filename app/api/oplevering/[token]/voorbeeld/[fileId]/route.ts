import { streamFile } from "@/lib/delivery-access";
import { getInvoiceByToken, getInvoiceFile } from "@/lib/invoices";
import { resolvePreviewPath } from "@/lib/previews";


/**
 * Het voorbeeld met watermerk van één bestand. Vrij op te vragen met de
 * persoonlijke link (dat is de bedoeling: de klant beoordeelt eerst), maar
 * serveert uitsluitend het aparte voorbeeldbestand uit de voorbeeldmap. Er is
 * geen weg van dit adres naar het origineel, en een bestand zonder voorbeeld
 * geeft niets terug.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string; fileId: string }> },
) {
  const { token, fileId } = await context.params;
  const id = Number(fileId);
  const invoice = Number.isInteger(id) ? getInvoiceByToken(token) : null;
  const file = invoice ? getInvoiceFile(id) : null;
  if (!invoice || !file || file.invoiceId !== invoice.id || !file.previewFilename) {
    return new Response("Niet gevonden", { status: 404 });
  }
  const full = resolvePreviewPath(file.previewFilename);
  if (!full) return new Response("Niet gevonden", { status: 404 });

  return streamFile(request, full, {
    contentType: file.previewType,
    disposition: "inline",
    // Een voorbeeld verandert niet; de klant mag het een uur onthouden.
    cache: "private, max-age=3600",
  });
}
