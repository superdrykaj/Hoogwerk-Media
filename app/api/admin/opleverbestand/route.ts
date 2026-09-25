import { isSignedIn } from "@/lib/auth";
import { saveDeliveryFileStream } from "@/lib/deliveries";
import { addInvoiceFile, getInvoice } from "@/lib/invoices";

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

  const originalNameHeader = request.headers.get("x-file-name") ?? "";
  let originalName = "bestand";
  try {
    originalName = decodeURIComponent(originalNameHeader) || originalName;
  } catch {
    // Ongeldig gecodeerde header: val terug op de standaardnaam.
  }

  const contentType = request.headers.get("content-type") ?? "application/octet-stream";

  const result = await saveDeliveryFileStream(request.body, {
    contentType,
    originalName,
  });
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }

  addInvoiceFile(invoice.id, result);
  return Response.json({ ok: true });
}
