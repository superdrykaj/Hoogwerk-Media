import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { UPLOAD_CONTENT_TYPES, resolveUploadPath } from "@/lib/uploads";

/**
 * Serveert geüploade afbeeldingen en video's uit de datamap.
 * Alleen bestandsnamen zonder padtekens worden geaccepteerd.
 *
 * Video's moeten kunnen worden doorzocht (spoelen), en dat vereist dat de
 * browser met een "Range"-verzoek om een stuk van het bestand kan vragen. We
 * lezen bovendien via een stream in plaats van het hele bestand in het
 * geheugen te laden: bij een videobestand van een paar honderd megabyte zou
 * dat anders elk verzoek opnieuw geheugen kosten.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  const full = resolveUploadPath(name);
  if (!full) {
    return new Response("Niet gevonden", { status: 404 });
  }

  const contentType = UPLOAD_CONTENT_TYPES[path.extname(full).toLowerCase()];
  if (!contentType) {
    return new Response("Niet gevonden", { status: 404 });
  }

  let stat: fs.Stats;
  try {
    stat = await fsp.stat(full);
  } catch {
    return new Response("Niet gevonden", { status: 404 });
  }

  const baseHeaders = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = request.headers.get("range");
  if (!range) {
    return new Response(Readable.toWeb(fs.createReadStream(full)) as ReadableStream, {
      headers: { ...baseHeaders, "Content-Length": String(stat.size) },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const start = match?.[1] ? Number(match[1]) : 0;
  const end = match?.[2] ? Number(match[2]) : stat.size - 1;
  const geldig =
    match && Number.isFinite(start) && Number.isFinite(end) && start <= end && end < stat.size;

  if (!geldig) {
    return new Response("Ongeldig bereik", {
      status: 416,
      headers: { "Content-Range": `bytes */${stat.size}` },
    });
  }

  return new Response(Readable.toWeb(fs.createReadStream(full, { start, end })) as ReadableStream, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    },
  });
}
