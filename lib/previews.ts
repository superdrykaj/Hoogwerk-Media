import "server-only";

import crypto from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import sharp from "sharp";

import { DELIVERY_DIR, resolveDeliveryPath } from "./deliveries";
import { getInvoiceFile, setFilePreview } from "./invoices";

/**
 * Voorbeelden met watermerk van de opleverbestanden.
 *
 * Wat de klant vóór betaling ziet, is nooit het origineel maar een apart,
 * verkleind bestand waar het watermerk in is ingebrand. Het staat in een eigen
 * map en onder een eigen naam; de route die het serveert (en alleen die route)
 * leest uit die map. Er bestaat geen pad waarlangs een voorbeeld-aanvraag bij
 * een origineel uitkomt.
 *
 * Faalt het maken van een voorbeeld (geen logo, beschadigd beeld), dan komt er
 * geen voorbeeld en ziet de klant niets van dat bestand: nooit terugvallen op
 * het origineel, nooit op een voorbeeld zonder watermerk.
 */
export const PREVIEW_DIR = path.join(DELIVERY_DIR, "previews");

// De server heeft één kleine processor en 512 MB geheugen. Eén beeld tegelijk
// en geen cache voor tussenresultaten: iets trager, maar een grote foto kan de
// machine niet laten vollopen.
sharp.concurrency(1);
sharp.cache(false);

/** Langste zijde van een voorbeeld: genoeg om te beoordelen, te klein om te gebruiken. */
export const PREVIEW_MAX_SIDE = 1280;
const PREVIEW_QUALITY = 70;
/** Een los voorbeeldbestand (video) dat de beheerder zelf uploadt. */
const PREVIEW_MAX_UPLOAD_BYTES = 300 * 1024 * 1024;

function logoPath(): string {
  return process.env.WATERMARK_LOGO ?? path.join(process.cwd(), "public", "logo-mark.png");
}

/**
 * Eén tegel van het watermerk: het logo tweemaal, schuin en verspringend, een
 * donkere schaduw eronder zodat het op lichte én donkere beelden leesbaar is.
 * Wordt over het hele beeld herhaald, zodat bijsnijden niets oplevert. Geen
 * tekst in het watermerk: de server heeft geen lettertypen nodig.
 */
async function watermarkTile(width: number): Promise<Buffer> {
  // public/ staat in het Docker-image naast de server (zie Dockerfile); het pad is bewust dynamisch.
  const logo = await fs.readFile(/*turbopackIgnore: true*/ logoPath());
  const size = Math.round(Math.min(220, Math.max(80, width * 0.17)));
  const light = await sharp(logo)
    .resize(size, size, { fit: "inside" })
    .ensureAlpha()
    .linear([1, 1, 1, 0.55], [0, 0, 0, 0])
    .rotate(-28, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const dark = await sharp(light).modulate({ brightness: 0 }).linear([1, 1, 1, 0.7], [0, 0, 0, 0]).png().toBuffer();

  const { width: lw = size, height: lh = size } = await sharp(light).metadata();
  const cellW = Math.round(lw * 2.0);
  const cellH = Math.round(lh * 1.8);
  const at = (cx: number, cy: number) => ({ left: Math.round(cx - lw / 2), top: Math.round(cy - lh / 2) });
  const spots = [at(cellW * 0.25, cellH * 0.28), at(cellW * 0.75, cellH * 0.78)];

  return sharp({
    create: { width: cellW, height: cellH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(
      spots.flatMap((p) => [
        { input: dark, left: p.left + 2, top: p.top + 2 },
        { input: light, left: p.left, top: p.top },
      ]),
    )
    .png()
    .toBuffer();
}

/**
 * Een verkleinde JPEG met het watermerk over het hele beeld. Zonder
 * metagegevens (de locatie en het cameratype uit de foto vallen weg).
 */
export async function buildWatermarkedJpeg(input: string | Buffer): Promise<Buffer> {
  const base = await sharp(input, { failOn: "none" })
    .rotate() // volgt de standaard-oriëntatie van de foto en gooit die daarna weg
    .resize({ width: PREVIEW_MAX_SIDE, height: PREVIEW_MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .toBuffer({ resolveWithObject: true });

  const tile = await watermarkTile(base.info.width);
  return sharp(base.data)
    .composite([{ input: tile, tile: true, blend: "over" }])
    .jpeg({ quality: PREVIEW_QUALITY, mozjpeg: true })
    .toBuffer();
}

function previewName(extension: string): string {
  return `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}${extension}`;
}

/** Veilig pad binnen de voorbeeldmap; null bij een poging tot uitbreken. */
export function resolvePreviewPath(filename: string): string | null {
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) return null;
  const full = path.join(PREVIEW_DIR, filename);
  const rel = path.relative(PREVIEW_DIR, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

export async function deletePreviewFromDisk(filename: string): Promise<void> {
  if (!filename) return;
  const full = resolvePreviewPath(filename);
  if (full) await fs.rm(full, { force: true });
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function isImageType(contentType: string): boolean {
  return IMAGE_TYPES.has(contentType);
}

export type PreviewResult = { ok: true } | { ok: false; error: string };

/**
 * Maakt (opnieuw) het voorbeeld van een opleverfoto. Een eerder voorbeeld
 * wordt vervangen. Video's krijgen geen automatisch voorbeeld: zie
 * saveManualPreview.
 */
export async function createImagePreview(fileId: number): Promise<PreviewResult> {
  const file = getInvoiceFile(fileId);
  if (!file) return { ok: false, error: "Bestand niet gevonden." };
  if (!isImageType(file.contentType)) {
    return { ok: false, error: "Alleen foto's krijgen automatisch een voorbeeld." };
  }
  const original = resolveDeliveryPath(file.filename);
  if (!original) return { ok: false, error: "Bestand niet gevonden." };

  try {
    const jpeg = await buildWatermarkedJpeg(original);
    await fs.mkdir(PREVIEW_DIR, { recursive: true });
    const name = previewName(".jpg");
    const target = path.join(PREVIEW_DIR, name);
    const tmp = `${target}.tmp`;
    await fs.writeFile(tmp, jpeg, { mode: 0o640 });
    await fs.rename(tmp, target);
    const oud = file.previewFilename;
    setFilePreview(file.id, name, "image/jpeg");
    await deletePreviewFromDisk(oud);
    return { ok: true };
  } catch (error) {
    console.error(`[voorbeeld] Voorbeeld van bestand ${fileId} maken mislukt:`, error);
    return { ok: false, error: "Het voorbeeld kon niet worden gemaakt." };
  }
}

/**
 * Een voorbeeld dat de beheerder zelf aanlevert, bedoeld voor video's: een
 * korte, verkleinde clip met watermerk uit de eigen montagesoftware (zie
 * scripts/maak-voorbeeld.sh). Een foto die hier wordt aangeleverd gaat
 * alsnog door het watermerk van de server. Een video wordt ongewijzigd
 * bewaard; of daar een watermerk in staat is aan de beheerder.
 */
export async function saveManualPreview(
  fileId: number,
  webStream: ReadableStream<Uint8Array>,
  contentType: string,
): Promise<PreviewResult> {
  const file = getInvoiceFile(fileId);
  if (!file) return { ok: false, error: "Bestand niet gevonden." };
  const isVideo = contentType === "video/mp4";
  if (!isVideo && !isImageType(contentType)) {
    return { ok: false, error: "Een voorbeeld is een MP4-video of een foto." };
  }

  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  const tempName = previewName(".upload");
  const temp = path.join(PREVIEW_DIR, tempName);
  let total = 0;
  const grens = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      total += chunk.length;
      if (total > PREVIEW_MAX_UPLOAD_BYTES) cb(new Error("TE_GROOT"));
      else cb(null, chunk);
    },
  });
  try {
    await pipeline(
      Readable.fromWeb(webStream as Parameters<typeof Readable.fromWeb>[0]),
      grens,
      createWriteStream(temp),
    );
  } catch (error) {
    await fs.rm(temp, { force: true });
    return {
      ok: false,
      error:
        error instanceof Error && error.message === "TE_GROOT"
          ? "Het voorbeeld is groter dan 300 MB. Maak het kleiner (bijvoorbeeld 720p, 30 seconden)."
          : "Uploaden van het voorbeeld is mislukt.",
    };
  }
  if (total === 0) {
    await fs.rm(temp, { force: true });
    return { ok: false, error: "Geen bestand ontvangen." };
  }

  try {
    // Een voorbeeld mag nooit het origineel zelf zijn: dat zou het bestand
    // zonder watermerk vóór betaling vrijgeven. Is de beheerder per ongeluk
    // het verkeerde bestand aan het uploaden, dan stopt het hier.
    if (await isSameFile(temp, resolveDeliveryPath(file.filename))) {
      await fs.rm(temp, { force: true });
      return {
        ok: false,
        error: "Dit is het originele bestand zelf, geen voorbeeld. Upload de verkleinde versie met watermerk.",
      };
    }
    if (isVideo && !(await looksLikeMp4(temp))) {
      await fs.rm(temp, { force: true });
      return { ok: false, error: "Dit is geen geldig MP4-bestand." };
    }

    let name: string;
    let type: string;
    if (isVideo) {
      name = previewName(".mp4");
      await fs.rename(temp, path.join(PREVIEW_DIR, name));
      type = "video/mp4";
    } else {
      const jpeg = await buildWatermarkedJpeg(temp);
      await fs.rm(temp, { force: true });
      name = previewName(".jpg");
      await fs.writeFile(path.join(PREVIEW_DIR, name), jpeg, { mode: 0o640 });
      type = "image/jpeg";
    }
    const oud = file.previewFilename;
    setFilePreview(file.id, name, type);
    await deletePreviewFromDisk(oud);
    return { ok: true };
  } catch (error) {
    await fs.rm(temp, { force: true });
    console.error(`[voorbeeld] Eigen voorbeeld van bestand ${fileId} bewaren mislukt:`, error);
    return { ok: false, error: "Het voorbeeld kon niet worden verwerkt." };
  }
}

/** Een MP4 begint met een "ftyp"-blok op positie 4. */
async function looksLikeMp4(file: string): Promise<boolean> {
  const handle = await fs.open(file, "r");
  try {
    const head = Buffer.alloc(12);
    await handle.read(head, 0, 12, 0);
    return head.subarray(4, 8).toString("latin1") === "ftyp";
  } finally {
    await handle.close();
  }
}

/** Zijn dit dezelfde bytes? Eerst de grootte (goedkoop), pas dan de inhoud. */
async function isSameFile(candidate: string, original: string | null): Promise<boolean> {
  if (!original) return false;
  try {
    const [a, b] = await Promise.all([fs.stat(candidate), fs.stat(original)]);
    if (a.size !== b.size) return false;
    const hash = (file: string) =>
      new Promise<string>((resolve, reject) => {
        const h = crypto.createHash("sha256");
        createReadStream(file).on("data", (c) => h.update(c)).on("end", () => resolve(h.digest("hex"))).on("error", reject);
      });
    return (await hash(candidate)) === (await hash(original));
  } catch {
    return false;
  }
}
