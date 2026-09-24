import "server-only";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { getDb } from "./db";
import { DEFAULT_LOCALE, type Locale } from "./locale";
import { scopeLines } from "./project-scope";
import { formatTimestamp } from "./time";
import type { Booking, ContactMessage } from "./types";

/**
 * E-mail versturen via SMTP.
 *
 * Zolang de SMTP-instellingen ontbreken wordt er GEEN e-mail verstuurd.
 * De poging wordt dan met status "skipped" in de tabel `mail_log` gezet en de
 * beheeromgeving laat zien dat e-mail nog niet is ingesteld. De website doet
 * dus nooit alsof er een mail is verzonden.
 *
 * Nodig om te kunnen versturen (zie .env.example):
 *   SMTP_HOST, SMTP_PORT, MAIL_FROM
 * Meestal ook:
 *   SMTP_USER, SMTP_PASSWORD
 * Optioneel, om de post te scheiden:
 *   MAIL_TO_BOOKINGS, MAIL_TO_CONTACT, of MAIL_TO voor allebei tegelijk
 */

export type MailStatus = "sent" | "skipped" | "failed";

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.MAIL_FROM,
  );
}

/**
 * Waar de meldingen naartoe gaan.
 *
 * Aanvragen horen bij het boekingenadres en algemene berichten bij het
 * algemene adres. Staat er één MAIL_TO ingesteld, dan gaat alles daarheen;
 * staat er niets, dan worden de adressen uit content/site.ts gebruikt.
 */
export function mailRecipients(): { bookings: string; contact: string } {
  const beide = process.env.MAIL_TO?.trim();
  return {
    bookings:
      process.env.MAIL_TO_BOOKINGS?.trim() || beide || site.bookingEmail,
    contact: process.env.MAIL_TO_CONTACT?.trim() || beide || site.email,
  };
}

function logMail(
  to: string,
  subject: string,
  status: MailStatus,
  detail: string,
) {
  getDb()
    .prepare(
      "INSERT INTO mail_log (to_address, subject, status, detail, created_utc) VALUES (?, ?, ?, ?, ?)",
    )
    .run(to, subject, status, detail, Date.now());
}

export function recentMailLog(limit = 20) {
  return getDb()
    .prepare(
      "SELECT to_address, subject, status, detail, created_utc FROM mail_log ORDER BY id DESC LIMIT ?",
    )
    .all(limit) as {
    to_address: string;
    subject: string;
    status: string;
    detail: string;
    created_utc: number;
  }[];
}

async function send(
  to: string,
  subject: string,
  text: string,
  /** Adres waarop de ontvanger moet antwoorden, als dat niet de afzender is. */
  replyTo?: string,
): Promise<MailStatus> {
  if (!isMailConfigured()) {
    logMail(to, subject, "skipped", "SMTP nog niet ingesteld; niets verzonden.");
    return "skipped";
  }
  try {
    const nodemailer = (await import("nodemailer")).default;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to,
      replyTo,
      subject,
      text,
    });
    logMail(to, subject, "sent", "");
    return "sent";
  } catch (error) {
    logMail(to, subject, "failed", String(error).slice(0, 500));
    return "failed";
  }
}

/**
 * Proefbericht vanuit de beheeromgeving, om te controleren of de SMTP-gegevens
 * kloppen zonder dat er een echte aanvraag voor nodig is.
 */
export async function sendTestMail(
  to: string,
): Promise<{ status: MailStatus; detail: string }> {
  if (!isMailConfigured()) {
    return {
      status: "skipped",
      detail: "SMTP is nog niet ingesteld, dus er is niets verstuurd.",
    };
  }
  const status = await send(
    to,
    `Proefbericht van de website — ${site.name}`,
    [
      "Dit is een proefbericht vanuit de beheeromgeving van je website.",
      "",
      "Krijg je dit binnen, dan kan de site e-mail versturen en gaan",
      "bevestigingen naar klanten en meldingen naar jou vanzelf mee.",
      "",
      `Afzender: ${process.env.MAIL_FROM}`,
      `Server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`,
    ].join("\n"),
  );
  const laatste = recentMailLog(1)[0];
  return {
    status,
    detail: status === "failed" ? (laatste?.detail ?? "Onbekende fout.") : "",
  };
}

function bookingSummary(booking: Booking, locale: Locale): string {
  const t = copy(locale).mail;
  const scope = scopeLines(booking.scope, booking.location, copy(locale).scope);
  return [
    `${t.summaryReference}: ${booking.reference}`,
    `${t.summaryService}: ${booking.serviceName}`,
    `${t.summaryWhen}: ${formatTimestamp(booking.startUtc, locale)} (Europe/Amsterdam)`,
    `${t.summaryLocation}: ${booking.location || t.summaryNotGiven}`,
    `${t.summaryName}: ${booking.name}`,
    `${t.summaryEmail}: ${booking.email}`,
    `${t.summaryPhone}: ${booking.phone || t.summaryNotGiven}`,
    ...(scope.length > 0
      ? [
          "",
          t.summaryProject,
          ...scope.map(({ label, value }) => `${label}: ${value.replace(/\n/g, ", ")}`),
        ]
      : []),
    "",
    t.summaryDescription,
    booking.description || t.summaryNoDescription,
  ].join("\n");
}

/** Bevestiging naar de klant en melding naar de eigenaar. */
export async function sendBookingRequestMails(booking: Booking): Promise<{
  customer: MailStatus;
  owner: MailStatus;
}> {
  const locale = booking.locale;
  const t = copy(locale).mail;
  const naarJou = mailRecipients().bookings;

  const customer = await send(
    booking.email,
    t.requestSubject(booking.reference),
    [
      t.greeting(booking.name),
      "",
      t.requestBody,
      "",
      bookingSummary(booking, locale),
      "",
      ...t.requestNotice,
      "",
      t.requestReply,
      "",
      t.signature,
      site.bookingEmail,
    ].join("\n"),
    // Antwoorden van de klant horen in de boekingenmap, ook als de site vanaf
    // een ander adres verstuurt.
    site.bookingEmail,
  );

  // De melding aan de eigenaar is altijd Nederlands: die leest Kai zelf.
  const eigen = copy(DEFAULT_LOCALE).mail;
  const owner = await send(
    naarJou,
    eigen.ownerSubject(booking.reference, booking.name),
    [
      eigen.ownerBody,
      ...(locale === DEFAULT_LOCALE
        ? []
        : ["", "(De aanvraag is gedaan op de Engelse versie van de site.)"]),
      "",
      bookingSummary(booking, DEFAULT_LOCALE),
    ].join("\n"),
    // Zo kun je rechtstreeks op de melding antwoorden naar de klant.
    booking.email,
  );

  return { customer, owner };
}

export async function sendBookingConfirmedMail(
  booking: Booking,
): Promise<MailStatus> {
  const locale = booking.locale;
  const t = copy(locale).mail;
  return send(
    booking.email,
    t.confirmedSubject(booking.reference),
    [
      t.greeting(booking.name),
      "",
      t.confirmedBody,
      "",
      bookingSummary(booking, locale),
      "",
      t.confirmedNotice,
      "",
      t.signature,
      site.bookingEmail,
    ].join("\n"),
    site.bookingEmail,
  );
}

export async function sendBookingCancelledMail(
  booking: Booking,
  reason: "rejected" | "cancelled",
): Promise<MailStatus> {
  const locale = booking.locale;
  const t = copy(locale).mail;
  const what = reason === "rejected" ? t.rejectedBody : t.cancelledBody;
  return send(
    booking.email,
    t.cancelledSubject(booking.reference),
    [
      t.greeting(booking.name),
      "",
      what,
      "",
      bookingSummary(booking, locale),
      "",
      t.cancelledNotice,
      "",
      t.signature,
    ].join("\n"),
    site.bookingEmail,
  );
}

export async function sendContactMails(
  message: ContactMessage,
  locale: Locale = DEFAULT_LOCALE,
): Promise<{ customer: MailStatus; owner: MailStatus }> {
  const t = copy(locale).mail;
  const customer = await send(
    message.email,
    t.contactSubject,
    [
      t.greeting(message.name),
      "",
      t.contactBody,
      "",
      t.contactYours,
      message.message,
      "",
      t.signature,
    ].join("\n"),
    site.email,
  );

  // Een contactbericht is algemeen en gaat naar het algemene adres. De melding
  // aan de eigenaar blijft Nederlands.
  const eigen = copy(DEFAULT_LOCALE).mail;
  const owner = await send(
    mailRecipients().contact,
    eigen.contactOwnerSubject(message.subject),
    [
      `${eigen.contactFrom} ${message.name} <${message.email}>`,
      `${eigen.contactRe} ${message.subject}`,
      "",
      message.message,
    ].join("\n"),
    message.email,
  );
  return { customer, owner };
}
