import "server-only";

import crypto from "node:crypto";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { UPLOAD_DIR } from "./db";

/** Toegestane afbeeldingstypen voor uploads in de beheeromgeving. */
const ALLOWED_IMAGE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB

/** Toegestane videotypen voor project-video's in de beheeromgeving. */
const ALLOWED_VIDEO: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

function maxVideoStreamBytes(): number {
  // De video streamt rechtstreeks naar schijf (zie saveVideoUploadStream),
  // dus het geheugen van de machine is geen beperking — alleen de
  // schijfruimte van de gekoppelde volume. 500 MB als ruime standaard voor
  // een projectvideo.
  const mb = Number(process.env.PROJECT_VIDEO_MAX_UPLOAD_MB) || 500;
  return mb * 1024 * 1024;
}

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

async function saveFile(
  file: File,
  allowed: Record<string, string>,
  maxBytes: number,
  maxLabel: string,
  typesLabel: string,
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Geen bestand gekozen." };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `Het bestand is groter dan ${maxLabel}.` };
  }
  const extension = allowed[file.type];
  if (!extension) {
    return { ok: false, error: `Alleen ${typesLabel} worden ondersteund.` };
  }

  const name = `${Date.now().toString(36)}-${crypto
    .randomBytes(6)
    .toString("hex")}${extension}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  return { ok: true, url: `/api/uploads/${name}` };
}

export async function saveUpload(file: File): Promise<UploadResult> {
  return saveFile(file, ALLOWED_IMAGE, MAX_IMAGE_BYTES, "12 MB", "JPG, PNG, WebP of AVIF");
}

/**
 * Video-upload voor een project: streamt de binnenkomende data rechtstreeks
 * naar schijf, zonder het bestand ooit volledig in het geheugen te houden.
 *
 * Bewust geen Server Action (zoals bij de afbeeldingen hierboven): Next.js
 * buffert het hele verzoek van een Server Action in het geheugen vóórdat de
 * functie draait, wat voor een video van een paar honderd megabyte op een
 * server met weinig werkgeheugen niet houdbaar is. Zie
 * app/api/admin/project-video/route.ts, dat deze functie aanroept met de
 * ruwe request-stream, en components/admin/video-upload-field.tsx, dat de
 * upload vanuit de browser stuurt.
 */
export async function saveVideoUploadStream(
  webStream: ReadableStream<Uint8Array>,
  contentType: string,
): Promise<UploadResult> {
  const extension = ALLOWED_VIDEO[contentType];
  if (!extension) {
    return { ok: false, error: "Alleen MP4 of WebM worden ondersteund." };
  }

  const limit = maxVideoStreamBytes();
  const name = `${Date.now().toString(36)}-${crypto
    .randomBytes(6)
    .toString("hex")}${extension}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const destPath = path.join(UPLOAD_DIR, name);

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

  return { ok: true, url: `/api/uploads/${name}` };
}

/** Veilig pad binnen de uploadmap; null bij een poging tot uitbreken. */
export function resolveUploadPath(name: string): string | null {
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return null;
  const full = path.join(UPLOAD_DIR, name);
  const relative = path.relative(UPLOAD_DIR, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return full;
}

export const UPLOAD_CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};
