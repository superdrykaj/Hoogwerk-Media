"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getBooking } from "@/lib/bookings";
import { getInvoiceByToken, markPaymentSent, setMolliePaymentId } from "@/lib/invoices";
import { sendRevisionRequestedMail } from "@/lib/mail";
import { createMolliePayment } from "@/lib/mollie";
import { rateLimit } from "@/lib/rate-limit";
import { createRevisionRequest } from "@/lib/revisions";
import { siteOrigin } from "@/lib/site-url";

async function clientKey(prefix: string): Promise<string> {
  const head = await headers();
  const forwarded = head.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || head.get("x-real-ip") || "onbekend";
  return `${prefix}:${ip}`;
}

/**
 * Start een Mollie-betaling voor deze factuur en stuurt door naar de
 * checkoutpagina. Mislukt dat, dan gaat de bezoeker terug naar dezelfde
 * opleveringspagina met een foutmelding in de zoekparameters.
 */
export async function startInvoicePaymentAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const invoice = getInvoiceByToken(token);
  const booking = invoice ? getBooking(invoice.bookingId) : null;
  if (!invoice || !booking) redirect("/oplevering/ongeldig");

  const limit = rateLimit(await clientKey("oplevering-betalen"), 10, 10 * 60 * 1000);
  if (!limit.allowed) redirect(`/oplevering/${token}?fout=1`);

  const origin = await siteOrigin();
  const payment = await createMolliePayment({
    invoiceId: invoice.id,
    amountCents: invoice.amountCents,
    description: invoice.description || `${booking.serviceName} — ${booking.reference}`,
    redirectUrl: `${origin}/oplevering/${token}`,
    webhookUrl: `${origin}/api/mollie/webhook`,
  });

  if (!payment.ok) {
    redirect(`/oplevering/${token}?fout=1`);
  }

  setMolliePaymentId(invoice.id, payment.paymentId);
  markPaymentSent(invoice.id);
  redirect(payment.checkoutUrl);
}

/**
 * Een klant die niet tevreden is over de eerste oplevering kan hier een
 * wijziging aanvragen. Komt zowel in de beheeromgeving als per e-mail binnen.
 */
export async function submitRevisionRequestAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const invoice = getInvoiceByToken(token);
  const booking = invoice ? getBooking(invoice.bookingId) : null;
  if (!invoice || !booking) redirect("/oplevering/ongeldig");

  const limit = rateLimit(await clientKey("oplevering-wijziging"), 5, 10 * 60 * 1000);
  if (!limit.allowed) redirect(`/oplevering/${token}?fout=wijziging`);

  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  if (message.length < 10) redirect(`/oplevering/${token}?fout=wijziging`);

  createRevisionRequest(invoice.id, message);
  await sendRevisionRequestedMail(booking, message);
  redirect(`/oplevering/${token}?verzonden=1`);
}
