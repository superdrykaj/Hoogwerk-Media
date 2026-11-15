import { isSignedIn } from "@/lib/auth";
import { saveDeliveryFileStream } from "@/lib/deliveries";
import { addInvoiceFile, getInvoice, getInvoiceFile } from "@/lib/invoices";
import { createImagePreview, isImageType, saveManualPreview } from "@/lib/previews";
import { roomForUpload } from "@/lib/storage-usage";

/**
 * Uploadt een opleverbestand door de binnenkomende stream rechtstreeks naar
 * schijf te schrijven (zie lib/deliveries.ts). Bewust een gewone route en
 * geen Server Action: die laatste buffert de hele upload in het geheugen van
 * de machine, wat voor video's van meerdere GB niet houdbaar is.
 *
 * De klant stuurt het ruwe bestand als body mee (geen multipart/form-data),
 * met de oorspronkelijke bestandsnaam in de X-File-Name-header.
 */
export async function POST(request: Request) {
  if (!(await isSignedIn())) {
    return Response.json({ ok: false, error: "Niet ingelogd." }, { status: 401 });
  }

  const invoiceId = Number(new URL(request.url).searchParams.get("invoiceId"));
  const invoice = invoiceId ? getInvoice(invoiceId) : null;
  if (!invoice) {
    return Response.json({ ok: false, error: "Factuur niet gevonden." }, { status: 404 });
  }

  if (!request.body) {
    return Response.json({ ok: false, error: "Geen bestand ontvangen." }, { status: 400 });
  }

  const contentTypeHeader = request.headers.get("content-type") ?? "application/octet-stream";

  // Eerst kijken of het volume het nog aankan: een vol volume blokkeert ook de
  // database. Er wordt niets weggegooid; de upload wordt alleen geweigerd.
  const ruimte = await roomForUpload(Number(request.headers.get("content-length")) || 0);
  if (!ruimte.ok) {
    return Response.json({ ok: false, error: ruimte.message }, { status: 507 });
  }

  // Een los voorbeeld (watermerkvideo) bij een bestand dat al is geüpload.
  const previewFor = Number(new URL(request.url).searchParams.get("previewFor"));
  if (previewFor) {
    const target = getInvoiceFile(previewFor);
    if (!target || target.invoiceId !== invoice.id) {
      return Response.json({ ok: false, error: "Bestand niet gevonden." }, { status: 404 });
    }
    const saved = await saveManualPreview(previewFor, request.body, contentTypeHeader);
    return saved.ok
      ? Response.json({ ok: true })
      : Response.json({ ok: false, error: saved.error }, { status: 400 });
  }

  const originalNameHeader = request.headers.get("x-file-name") ?? "";
  let originalName = "bestand";
  try {
    originalName = decodeURIComponent(originalNameHeader) || originalName;
  } catch {
    // Ongeldig gecodeerde header: val terug op de standaardnaam.
  }

  const contentType = contentTypeHeader;

  const result = await saveDeliveryFileStream(request.body, {
    contentType,
    originalName,
  });
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }

  const fileId = addInvoiceFile(invoice.id, result);

  // Foto's krijgen meteen hun voorbeeld met watermerk. Mislukt dat, dan is het
  // bestand wel opgeslagen; de klant ziet er dan niets van tot er een
  // voorbeeld is (zie "Voorbeeld opnieuw maken" in Beheer).
  if (isImageType(result.contentType)) {
    const preview = await createImagePreview(fileId);
    if (!preview.ok) {
      return Response.json({ ok: true, warning: preview.error });
    }
  }
  return Response.json({ ok: true });
}
