import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

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
  // 300 MB: de praktische limiet, want next.config.ts staat Server Actions
  // niet meer dan serverActions.bodySizeLimit toe. Hoger zetten heeft pas zin
  // als die limiet én het geheugen van de Fly-machine ook omhoog gaan.
  const mb = Number(process.env.DELIVERY_MAX_UPLOAD_MB) || 300;
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

export async function saveDeliveryFile(file: File): Promise<DeliveryUploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Geen bestand gekozen." };
  }
  const limit = maxBytes();
  if (file.size > limit) {
    return {
      ok: false,
      error: `Het bestand is groter dan ${Math.round(limit / (1024 * 1024))} MB.`,
    };
  }
  const extension = ALLOWED[file.type];
  if (!extension) {
    return {
      ok: false,
      error: "Dit bestandstype wordt niet ondersteund voor oplevering.",
    };
  }

  const filename = `${Date.now().toString(36)}-${crypto
    .randomBytes(6)
    .toString("hex")}${extension}`;
  await fs.mkdir(DELIVERY_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(DELIVERY_DIR, filename), buffer);
  return {
    ok: true,
    filename,
    originalName: file.name || filename,
    contentType: file.type,
    sizeBytes: file.size,
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
