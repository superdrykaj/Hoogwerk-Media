import { attachment, authorizeDownload, streamFile } from "@/lib/delivery-access";
import { resolveDeliveryPath } from "@/lib/deliveries";
import { getInvoiceFile } from "@/lib/invoices";

/**
 * Het originele bestand, zonder watermerk. Alleen met een geldige,
 * ondertekende en niet verlopen link (die de klantpagina bij elk bezoek
 * opnieuw maakt) én als de betaling bevestigd is: zie lib/delivery-access.ts.
 * Niets hiervan is te raden uit een bestandsnaam of adres.
 *
 * Streamt van schijf met Range-ondersteuning, zodat een grote video niet in
 * het geheugen komt en een onderbroken download kan worden hervat.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string; fileId: string }> },
) {
  const { token, fileId } = await context.params;
  const id = Number(fileId);
  if (!Number.isInteger(id)) return new Response("Niet gevonden", { status: 404 });

  const auth = authorizeDownload(request, token, { kind: "file", fileId: id });
  if (!auth.ok) return auth.response;

  const file = getInvoiceFile(id);
  if (!file || file.invoiceId !== auth.invoice.id) {
    return new Response("Niet gevonden", { status: 404 });
  }
  const full = resolveDeliveryPath(file.filename);
  if (!full) return new Response("Niet gevonden", { status: 404 });

  return streamFile(request, full, {
    contentType: file.contentType,
    disposition: attachment(file.originalName),
    cache: "private, no-store",
  });
}
