import { createReadStream } from "node:fs";
import { PassThrough, Readable } from "node:stream";

import { ZipArchive } from "archiver";

import { attachment, authorizeDownload } from "@/lib/delivery-access";
import { resolveDeliveryPath } from "@/lib/deliveries";
import { getBooking } from "@/lib/bookings";
import { listInvoiceFiles } from "@/lib/invoices";

/**
 * Alle originelen van een oplevering in één ZIP. Dezelfde controles als bij een
 * los bestand (ondertekende link, betaling bevestigd).
 *
 * De ZIP wordt tijdens het verzenden opgebouwd en niet eerst op schijf of in
 * het geheugen gezet, zonder compressie (foto's en video's zijn al gecomprimeerd)
 * en met ZIP64 zodra het geheel groter is dan 4 GB. Er is geen Content-Length,
 * dus een onderbroken ZIP-download begint opnieuw; voor hervatten kunnen de
 * bestanden los worden gedownload.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const auth = authorizeDownload(request, token, { kind: "zip" });
  if (!auth.ok) return auth.response;

  const files = listInvoiceFiles(auth.invoice.id)
    .map((f) => ({ file: f, path: resolveDeliveryPath(f.filename) }))
    .filter((x): x is { file: (typeof x)["file"]; path: string } => x.path !== null);
  if (files.length === 0) return new Response("Geen bestanden.", { status: 404 });

  const archive = new ZipArchive({ store: true, zlib: { level: 0 } });
  const out = new PassThrough();
  archive.pipe(out);

  // Dubbele bestandsnamen krijgen een nummer, anders overschrijven ze elkaar in de ZIP.
  const gebruikt = new Map<string, number>();
  const unieke = (naam: string) => {
    const schoon = naam.replace(/[\\/:*?"<>|\r\n]/g, "_") || "bestand";
    const n = gebruikt.get(schoon.toLowerCase()) ?? 0;
    gebruikt.set(schoon.toLowerCase(), n + 1);
    if (n === 0) return schoon;
    const punt = schoon.lastIndexOf(".");
    return punt > 0 ? `${schoon.slice(0, punt)} (${n + 1})${schoon.slice(punt)}` : `${schoon} (${n + 1})`;
  };
  for (const { file, path } of files) {
    archive.append(createReadStream(path), { name: unieke(file.originalName) });
  }
  archive.on("error", (error) => {
    console.error("[oplevering] ZIP maken mislukt:", error);
    out.destroy(error);
  });
  void archive.finalize();

  // Verbreekt de klant halverwege de verbinding, dan stopt het lezen van de schijf.
  request.signal.addEventListener("abort", () => archive.abort(), { once: true });

  const booking = getBooking(auth.invoice.bookingId);
  const naam = `${booking?.reference ?? "oplevering"} - Hoogbeeld Media.zip`;
  return new Response(Readable.toWeb(out) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": attachment(naam),
      "Cache-Control": "private, no-store",
    },
  });
}
