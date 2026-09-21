import "server-only";

import { cookies } from "next/headers";

import { hashPassword, verifyPassword } from "./password";
import {
  SESSION_COOKIE,
  SESSION_HOURS,
  createSessionToken,
  verifySessionToken,
} from "./session-token";

/**
 * Beheerderslogin.
 *
 * - ADMIN_PASSWORD_HASH bevat een scrypt-hash van het wachtwoord (zie
 *   `npm run hash-password`). Het wachtwoord zelf staat nergens in de code.
 * - AUTH_SECRET ondertekent het sessiecookie.
 *
 * Beide waarden staan alleen op de server, nooit in de frontend.
 */

export class AuthNotConfiguredError extends Error {}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new AuthNotConfiguredError(
      "AUTH_SECRET ontbreekt of is te kort. Zie .env.example.",
    );
  }
  return secret;
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_SECRET.length >= 16 &&
      process.env.ADMIN_PASSWORD_HASH,
  );
}

/** Controleert het wachtwoord en zet bij succes het sessiecookie. */
export { hashPassword, verifyPassword };

export async function signIn(password: string): Promise<boolean> {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) throw new AuthNotConfiguredError("ADMIN_PASSWORD_HASH ontbreekt.");
  if (!verifyPassword(password, stored)) return false;

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(authSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** True als de huidige bezoeker is ingelogd als beheerder. */
export async function isSignedIn(): Promise<boolean> {
  if (!isAuthConfigured()) return false;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return Boolean(token && verifySessionToken(token, authSecret()));
}

/**
 * Gooit een fout als de bezoeker niet is ingelogd.
 * Roep dit aan in elke server action en elke beheerpagina.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) {
    throw new Error("Niet toegestaan. Log opnieuw in.");
  }
}
