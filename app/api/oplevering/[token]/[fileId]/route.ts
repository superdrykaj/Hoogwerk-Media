import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

import { resolveDeliveryPath } from "@/lib/deliveries";
import { getInvoiceByToken, getInvoiceFile } from "@/lib/invoices";

/**
 * Serveert één opleveringsbestand, maar alleen als het token bij een echte
 * factuur hoort én de paywall open staat (geen paywall, of al betaald).
 *
 * Anders dan /api/uploads/[name] (publiek, voor projectfoto's) laadt deze
 * route het bestand niet volledig in het geheugen: video's kunnen honderden
 * MB's tot enkele GB's zijn. In plaats daarvan wordt gestreamd, met
 * basisondersteuning voor Range-verzoeken zodat een onderbroken download
 * hervat kan worden.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string; fileId: string }> },
) {
  const { token, fileId } = await context.params;

  const invoice = getInvoiceByToken(token);
  if (!invoice) {
    return new Response("Niet gevonden", { status: 404 });
  }
  if (invoice.payBeforeDownload && invoice.status !== "paid") {
    return new Response("Deze bestanden zijn nog niet vrijgegeven.", { status: 402 });
  }

  const file = getInvoiceFile(Number(fileId));
  if (!file || file.invoiceId !== invoice.id) {
    return new Response("Niet gevonden", { status: 404 });
  }

  const full = resolveDeliveryPath(file.filename);
  if (!full) {
    return new Response("Niet gevonden", { status: 404 });
  }

  let size: number;
  try {
    size = (await stat(full)).size;
  } catch {
    return new Response("Niet gevonden", { status: 404 });
  }

  const safeName = file.originalName.replace(/["\r\n]/g, "");
  const disposition = `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(
    file.originalName,
  )}`;

  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
      if (start <= end && start < size) {
        const stream = createReadStream(full, { start, end });
        return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
          status: 206,
          headers: {
            "Content-Type": file.contentType || "application/octet-stream",
            "Content-Disposition": disposition,
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Content-Length": String(end - start + 1),
            "Accept-Ranges": "bytes",
          },
        });
      }
    }
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }

  const stream = createReadStream(full);
  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": disposition,
      "Content-Length": String(size),
      "Accept-Ranges": "bytes",
    },
  });
}
