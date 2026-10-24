import crypto from "node:crypto";

/**
 * Kort geldige, ondertekende downloadlinks voor de originele bestanden.
 *
 * De persoonlijke klantlink (/oplevering/<token>) blijft hetzelfde; de links
 * naar de bestanden zelf worden bij elk bezoek van die pagina opnieuw gemaakt
 * en verlopen na een half uur. Een doorgestuurde of in de browsergeschiedenis
 * achtergebleven bestandslink werkt dus niet blijvend, en zonder geldige
 * ondertekening geeft de downloadroute niets prijs.
 *
 * De ondertekening dekt token, soort download, bestand en verlooptijd, dus een
 * link voor het ene bestand werkt niet voor het andere, en een nieuw token
 * (zie "Nieuwe link maken" in Beheer) maakt alle oude links ongeldig. De
 * betaalstatus wordt bij elk verzoek opnieuw gecontroleerd: een geldige
 * ondertekening geeft dus geen toegang meer zodra een factuur is terugbetaald.
 */

export const DEFAULT_LINK_MINUTES = 30;

export type DownloadTarget = { kind: "file"; fileId: number } | { kind: "zip" };

function targetKey(target: DownloadTarget): string {
  return target.kind === "zip" ? "zip" : `file:${target.fileId}`;
}

function secretKey(secret: string): Buffer {
  // Afgeleide sleutel: de beheerderssessie en de downloadlinks delen nooit
  // dezelfde ondertekening, ook al komen ze uit hetzelfde geheim.
  return crypto.createHmac("sha256", secret).update("oplevering-download-v1").digest();
}

export function signDownload(
  token: string,
  target: DownloadTarget,
  expiresAtSec: number,
  secret: string,
): string {
  return crypto
    .createHmac("sha256", secretKey(secret))
    .update(`${token}|${targetKey(target)}|${expiresAtSec}`)
    .digest("base64url");
}

export type Verification = "ok" | "expired" | "invalid";

/** Controleert ondertekening en verlooptijd. Vergelijkt in constante tijd. */
export function verifyDownload(
  token: string,
  target: DownloadTarget,
  expiresAtSec: number,
  signature: string,
  secret: string,
  nowMs: number = Date.now(),
): Verification {
  if (!Number.isInteger(expiresAtSec) || !signature) return "invalid";
  const expected = signDownload(token, target, expiresAtSec, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "invalid";
  return expiresAtSec * 1000 < nowMs ? "expired" : "ok";
}

/** De query-delen van een gemaakte link, bijvoorbeeld "e=1730000000&s=…". */
export function signedQuery(
  token: string,
  target: DownloadTarget,
  secret: string,
  minutes: number = DEFAULT_LINK_MINUTES,
  nowMs: number = Date.now(),
): string {
  const exp = Math.floor(nowMs / 1000) + Math.round(minutes * 60);
  return `e=${exp}&s=${signDownload(token, target, exp, secret)}`;
}

/** Wat de downloadroute uit een verzoek haalt; null als de delen ontbreken. */
export function readSignature(
  searchParams: URLSearchParams,
): { expiresAtSec: number; signature: string } | null {
  const e = searchParams.get("e");
  const s = searchParams.get("s");
  if (!e || !s || !/^\d{1,12}$/.test(e)) return null;
  return { expiresAtSec: Number(e), signature: s };
}
