import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

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

const MAX_VIDEO_BYTES = 300 * 1024 * 1024; // 300 MB

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

/** Video-upload voor een project. Grotere bestanden, alleen mp4 of webm. */
export async function saveVideoUpload(file: File): Promise<UploadResult> {
  return saveFile(file, ALLOWED_VIDEO, MAX_VIDEO_BYTES, "300 MB", "MP4 of WebM");
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
