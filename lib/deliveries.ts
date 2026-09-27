import "server-only";

import crypto from "node:crypto";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { DATA_DIR } from "./db";

/**
 * Map voor de eindproducten van een oplevering (foto's, video's, zip's).
 *
 * Bewust een andere map dan UPLOAD_DIR (lib/uploads.ts): die wordt zonder
 * enige controle publiek geserveerd via /api/uploads/[name], en dat mag met
 * opleverbestanden niet gebeuren zolang de paywall nog dicht staat. Bestanden
 * hier komen alleen naar buiten via de beveiligde downloadroute, die het
 * token en de betaalstatus controleert.
 */
export const DELIVERY_DIR = path.join(DATA_DIR, "deliveries");

/** Toegestane typen voor eindproducten: foto's, video's, zip's en pdf's. */
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/pdf": ".pdf",
};

function maxBytes(): number {
  // De upload streamt rechtstreeks naar schijf (zie saveDeliveryFileStream),
  // dus het geheugen van de machine is geen beperking meer — alleen de
  // schijfruimte van de gekoppelde volume is dat nog. 4 GB als ruime
  // standaard voor een los bestand uit 4K-beeldmateriaal; zet hoger als je
  // volume dat toelaat.
  const mb = Number(process.env.DELIVERY_MAX_UPLOAD_MB) || 4096;
  return mb * 1024 * 1024;
}

export type DeliveryUploadResult =
  | {
      ok: true;
      filename: string;
      originalName: string;
      contentType: string;
      sizeBytes: number;
    }
  | { ok: false; error: string };

/**
 * Slaat een opleverbestand op door de binnenkomende stream rechtstreeks naar
 * schijf te schrijven, zonder het bestand ooit volledig in het geheugen te
 * houden. Een 4K-video van enkele GB's mag dus groter zijn dan het geheugen
 * van de machine — alleen de schijfruimte is de grens.
 *
 * Bewust geen Server Action (zoals bij de projectfoto's in lib/uploads.ts):
 * Next.js buffert het hele verzoek van een Server Action in het geheugen
 * vóórdat de functie draait, wat voor grote video's niet houdbaar is. Zie
 * app/api/admin/opleverbestand/route.ts, dat deze functie aanroept met de
 * ruwe request-stream.
 */
export async function saveDeliveryFileStream(
  webStream: ReadableStream<Uint8Array>,
  meta: { contentType: string; originalName: string },
): Promise<DeliveryUploadResult> {
  const extension = ALLOWED[meta.contentType];
  if (!extension) {
    return { ok: false, error: "Dit bestandstype wordt niet ondersteund voor oplevering." };
  }

  const limit = maxBytes();
  const filename = `${Date.now().toString(36)}-${crypto
    .randomBytes(6)
    .toString("hex")}${extension}`;
  await fs.mkdir(DELIVERY_DIR, { recursive: true });
  const destPath = path.join(DELIVERY_DIR, filename);

  let total = 0;
  const bewaakDeGrens = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      total += chunk.length;
      if (total > limit) {
        callback(new Error("LIMIET_OVERSCHREDEN"));
        return;
      }
      callback(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(webStream as Parameters<typeof Readable.fromWeb>[0]),
      bewaakDeGrens,
      createWriteStream(destPath),
    );
  } catch (error) {
    await fs.rm(destPath, { force: true });
    if (error instanceof Error && error.message === "LIMIET_OVERSCHREDEN") {
      return {
        ok: false,
        error: `Het bestand is groter dan ${Math.round(limit / (1024 * 1024))} MB.`,
      };
    }
    return { ok: false, error: "Uploaden is mislukt. Probeer het nog eens." };
  }

  if (total === 0) {
    await fs.rm(destPath, { force: true });
    return { ok: false, error: "Geen bestand ontvangen." };
  }

  return {
    ok: true,
    filename,
    originalName: meta.originalName || filename,
    contentType: meta.contentType,
    sizeBytes: total,
  };
}

/** Veilig pad binnen de opleveringsmap; null bij een poging tot uitbreken. */
export function resolveDeliveryPath(filename: string): string | null {
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) return null;
  const full = path.join(DELIVERY_DIR, filename);
  const relative = path.relative(DELIVERY_DIR, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return full;
}

export async function deleteDeliveryFileFromDisk(filename: string): Promise<void> {
  const full = resolveDeliveryPath(filename);
  if (!full) return;
  await fs.rm(full, { force: true });
}
