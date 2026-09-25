import "server-only";

/**
 * ============================================================================
 *  MOLLIE — TESTMODUS
 * ============================================================================
 *  Een dunne client rond de Mollie REST-API (https://docs.mollie.com/reference),
 *  met fetch in plaats van een aparte package: er stond al weinig in
 *  package.json en dit is de enige aanroep die nodig is.
 *
 *  Zolang MOLLIE_API_KEY een testsleutel is (begint met "test_"), gaat er geen
 *  echt geld om: de checkoutpagina is echt, maar elke "betaling" is nep totdat
 *  je zelf een live-sleutel invult.
 *
 *  De webhook (app/api/mollie/webhook/route.ts) vertrouwt nooit de melding
 *  zelf; die haalt de status hier altijd opnieuw op. Om diezelfde reden werkt
 *  de opleveringspagina ook zonder werkende webhook (bijvoorbeeld lokaal
 *  achter localhost): die vraagt de status bij het openen gewoon zelf op.
 * ============================================================================
 */

const API_BASE = "https://api.mollie.com/v2";

export function isMollieConfigured(): boolean {
  return Boolean(process.env.MOLLIE_API_KEY);
}

/** "1234" cent → "12.34", zoals Mollie het bedrag wil hebben. */
export function centsToAmountValue(cents: number): string {
  return (Math.max(0, Math.round(cents)) / 100).toFixed(2);
}

function beschrijfFout(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  return String(error).slice(0, 500);
}

async function mollieFetch(path: string, init: RequestInit) {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error("MOLLIE_API_KEY ontbreekt.");
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(10_000),
  });
}

export type CreatePaymentResult =
  | { ok: true; paymentId: string; checkoutUrl: string }
  | { ok: false; error: string };

export async function createMolliePayment(params: {
  invoiceId: number;
  amountCents: number;
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
}): Promise<CreatePaymentResult> {
  if (!isMollieConfigured()) {
    return { ok: false, error: "Mollie is nog niet ingesteld (MOLLIE_API_KEY ontbreekt)." };
  }
  try {
    const response = await mollieFetch("/payments", {
      method: "POST",
      body: JSON.stringify({
        amount: { currency: "EUR", value: centsToAmountValue(params.amountCents) },
        description: params.description,
        redirectUrl: params.redirectUrl,
        // Mollie accepteert geen localhost-webhook; dan gewoon weglaten. De
        // opleveringspagina vraagt de status hierna zelf opnieuw op.
        ...(params.webhookUrl?.startsWith("https://")
          ? { webhookUrl: params.webhookUrl }
          : {}),
        metadata: { invoiceId: String(params.invoiceId) },
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { id?: string; _links?: { checkout?: { href?: string } }; detail?: string }
      | null;

    if (!response.ok || !data?.id || !data._links?.checkout?.href) {
      return {
        ok: false,
        error: data?.detail || `Mollie gaf een onverwacht antwoord (${response.status}).`,
      };
    }

    return { ok: true, paymentId: data.id, checkoutUrl: data._links.checkout.href };
  } catch (error) {
    return { ok: false, error: beschrijfFout(error) };
  }
}

export type MolliePaymentStatus =
  | "open"
  | "canceled"
  | "pending"
  | "authorized"
  | "expired"
  | "failed"
  | "paid";

export async function fetchMolliePaymentStatus(
  paymentId: string,
): Promise<MolliePaymentStatus | null> {
  if (!isMollieConfigured() || !paymentId) return null;
  try {
    const response = await mollieFetch(`/payments/${encodeURIComponent(paymentId)}`, {
      method: "GET",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { status?: string };
    return (data.status as MolliePaymentStatus) ?? null;
  } catch {
    return null;
  }
}
