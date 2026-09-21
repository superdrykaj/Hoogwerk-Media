import crypto from "node:crypto";

/**
 * Het sessiecookie van de beheerder: naam, ondertekening en controle.
 *
 * Staat los van lib/auth.ts omdat proxy.ts deze controle ook nodig heeft, en
 * daar bestaat `cookies()` uit next/headers niet. Alleen het uitlezen van de
 * waarde verschilt; de rekensom eromheen is op beide plekken dezelfde.
 */

export const SESSION_COOKIE = "hoogbeeld_admin_session";
export const SESSION_HOURS = 12;

export function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(secret: string): string {
  const payload = JSON.stringify({
    sub: "admin",
    exp: Date.now() + SESSION_HOURS * 3600000,
    jti: crypto.randomBytes(8).toString("hex"),
  });
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${signPayload(body, secret)}`;
}

/** True als het cookie echt van ons komt en nog niet verlopen is. */
export function verifySessionToken(token: string, secret: string): boolean {
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = signPayload(body, secret);
  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString());
    return (
      parsed.sub === "admin" &&
      typeof parsed.exp === "number" &&
      parsed.exp > Date.now()
    );
  } catch {
    return false;
  }
}
