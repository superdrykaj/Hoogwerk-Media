import "server-only";

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

import {
  DEFAULT_LINK_MINUTES,
  readSignature,
  signedQuery,
  verifyDownload,
  type DownloadTarget,
} from "./delivery-links";
import { canDownloadOriginals, getInvoiceByToken } from "./invoices";
import type { Invoice } from "./types";

/** Het geheim voor de ondertekening; hetzelfde AUTH_SECRET als voor de beheerderslogin. */
function secret(): string | null {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= 16 ? s : null;
}

function linkMinutes(): number {
  const n = Number(process.env.DOWNLOAD_LINK_MINUTES);
  return Number.isFinite(n) && n >= 1 && n <= 24 * 60 ? n : DEFAULT_LINK_MINUTES;
}

/**
 * De korte, ondertekende links voor de klantpagina. Leeg als er geen geheim
 * is ingesteld: dan zijn er geen downloads, liever dan onbeveiligde.
 */
export function downloadLinks(
  invoice: Invoice,
  fileIds: number[],
): { zip: string; files: Record<number, string>; minutes: number } | null {
  const s = secret();
  if (!s) return null;
  const minutes = linkMinutes();
  const q = (target: DownloadTarget) => signedQuery(invoice.token, target, s, minutes);
  return {
    minutes,
    zip: `/api/oplevering/${invoice.token}/alles?${q({ kind: "zip" })}`,
    files: Object.fromEntries(
      fileIds.map((id) => [id, `/api/oplevering/${invoice.token}/${id}?${q({ kind: "file", fileId: id })}`]),
    ),
  };
}

export type Authorized = { ok: true; invoice: Invoice } | { ok: false; response: Response };

const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Alle controles voor het ophalen van een origineel: ondertekening, verlooptijd,
 * bestaan van de factuur en betaalstatus (opnieuw, bij elk verzoek). Pas als
 * dit slaagt wordt er iets van de schijf gelezen.
 */
export function authorizeDownload(
  request: Request,
  token: string,
  target: DownloadTarget,
): Authorized {
  const s = secret();
  const sig = readSignature(new URL(request.url).searchParams);
  if (!s || !sig) {
    return { ok: false, response: new Response("Ongeldige downloadlink.", { status: 403, headers: NO_STORE }) };
  }

  const check = verifyDownload(token, target, sig.expiresAtSec, sig.signature, s);
  if (check === "invalid") {
    return { ok: false, response: new Response("Ongeldige downloadlink.", { status: 403, headers: NO_STORE }) };
  }
  if (check === "expired") {
    // Verlopen is geen fout van de klant: terug naar de pagina, die geeft
    // meteen een nieuwe link.
    return {
      ok: false,
      response: new Response(null, {
        status: 303,
        headers: { ...NO_STORE, Location: `/oplevering/${encodeURIComponent(token)}?fout=verlopen` },
      }),
    };
  }

  const invoice = getInvoiceByToken(token);
  if (!invoice) {
    return { ok: false, response: new Response("Niet gevonden", { status: 404, headers: NO_STORE }) };
  }
  if (!canDownloadOriginals(invoice)) {
    const gone = invoice.status === "refunded" || invoice.status === "cancelled";
    return {
      ok: false,
      response: new Response(
        gone ? "Deze bestanden zijn niet meer beschikbaar." : "Deze bestanden zijn nog niet vrijgegeven.",
        { status: gone ? 410 : 402, headers: NO_STORE },
      ),
    };
  }
  return { ok: true, invoice };
}

/** "bytes=0-99", "bytes=100-" of "bytes=-500". Null als er geen (bruikbare) Range is. */
export function parseRange(
  header: string | null,
  size: number,
): { start: number; end: number } | "onbevredigend" | null {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === "" && m[2] === "")) return header.includes(",") ? null : "onbevredigend";
  let start: number;
  let end: number;
  if (m[1] === "") {
    const last = Number(m[2]); // de laatste n bytes
    if (last === 0) return "onbevredigend";
    start = Math.max(0, size - last);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (size === 0 || start >= size || start > end) return "onbevredigend";
  return { start, end };
}

/**
 * Streamt een bestand van schijf, met Range-ondersteuning voor hervatten. Het
 * bestand wordt nooit in het geheugen geladen: een video van enkele GB's
 * gaat in stukjes naar de klant.
 */
export async function streamFile(
  request: Request,
  fullPath: string,
  options: { contentType: string; disposition: string; cache: string },
): Promise<Response> {
  let size: number;
  try {
    size = (await stat(fullPath)).size;
  } catch {
    return new Response("Niet gevonden", { status: 404, headers: NO_STORE });
  }

  const base = {
    "Content-Type": options.contentType || "application/octet-stream",
    "Content-Disposition": options.disposition,
    "Accept-Ranges": "bytes",
    "Cache-Control": options.cache,
  };

  const range = parseRange(request.headers.get("range"), size);
  if (range === "onbevredigend") {
    return new Response(null, { status: 416, headers: { ...NO_STORE, "Content-Range": `bytes */${size}` } });
  }
  if (range) {
    const stream = createReadStream(fullPath, { start: range.start, end: range.end });
    return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
      status: 206,
      headers: {
        ...base,
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
        "Content-Length": String(range.end - range.start + 1),
      },
    });
  }
  return new Response(Readable.toWeb(createReadStream(fullPath)) as ReadableStream<Uint8Array>, {
    headers: { ...base, "Content-Length": String(size) },
  });
}

export function attachment(name: string): string {
  const veilig = name.replace(/[\r\n"\\/]/g, "_");
  return `attachment; filename="${veilig.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
