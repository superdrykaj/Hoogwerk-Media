import "server-only";

import { site } from "@/content/site";
import { getDb } from "./db";
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

function bookingSummary(booking: Booking): string {
  const scope = scopeLines(booking.scope, booking.location);
  return [
    `Kenmerk: ${booking.reference}`,
    `Dienst: ${booking.serviceName}`,
    `Datum en tijd: ${formatTimestamp(booking.startUtc)} (Europe/Amsterdam)`,
    `Locatie: ${booking.location || "niet opgegeven"}`,
    `Naam: ${booking.name}`,
    `E-mail: ${booking.email}`,
    `Telefoon: ${booking.phone || "niet opgegeven"}`,
    ...(scope.length > 0
      ? ["", "Over het project:", ...scope.map(({ label, value }) => `${label}: ${value.replace(/\n/g, ", ")}`)]
      : []),
    "",
    "Omschrijving:",
    booking.description || "(geen omschrijving)",
  ].join("\n");
}

/** Bevestiging naar de klant en melding naar de eigenaar. */
export async function sendBookingRequestMails(booking: Booking): Promise<{
  customer: MailStatus;
  owner: MailStatus;
}> {
  const naarJou = mailRecipients().bookings;

  const customer = await send(
    booking.email,
    `Aanvraag ontvangen (${booking.reference}) — ${site.name}`,
    [
      `Hoi ${booking.name},`,
      "",
      `Bedankt voor je aanvraag bij ${site.name}. Ik heb hem in goede orde ontvangen.`,
      "",
      bookingSummary(booking),
      "",
      "Let op: dit is nog geen definitieve afspraak. Ik controleer eerst de",
      "locatie, de regels voor het luchtruim en de weersverwachting en",
      "bevestig daarna per e-mail.",
      "",
      "Vragen? Antwoord gerust op deze mail.",
      "",
      `Groet, Kai — ${site.name}`,
      site.bookingEmail,
    ].join("\n"),
    // Antwoorden van de klant horen in de boekingenmap, ook als de site vanaf
    // een ander adres verstuurt.
    site.bookingEmail,
  );

  // Melding van een nieuwe aanvraag gaat naar het boekingenadres.
  const owner = await send(
    naarJou,
    `Nieuwe aanvraag ${booking.reference} — ${booking.name}`,
    ["Er is een nieuwe aanvraag binnengekomen.", "", bookingSummary(booking)].join(
      "\n",
    ),
    // Zo kun je rechtstreeks op de melding antwoorden naar de klant.
    booking.email,
  );

  return { customer, owner };
}

export async function sendBookingConfirmedMail(
  booking: Booking,
): Promise<MailStatus> {
  return send(
    booking.email,
    `Afspraak bevestigd (${booking.reference}) — ${site.name}`,
    [
      `Hoi ${booking.name},`,
      "",
      "Je afspraak is bevestigd. Tot dan!",
      "",
      bookingSummary(booking),
      "",
      "Verandert er iets aan het weer of de locatie, dan neem ik op tijd contact op.",
      "",
      `Groet, Kai — ${site.name}`,
      site.bookingEmail,
    ].join("\n"),
    site.bookingEmail,
  );
}

export async function sendBookingCancelledMail(
  booking: Booking,
  reason: "rejected" | "cancelled",
): Promise<MailStatus> {
  const what =
    reason === "rejected"
      ? "Helaas kan ik deze aanvraag niet inplannen."
      : "Deze afspraak is geannuleerd.";
  return send(
    booking.email,
    `Afspraak ${booking.reference} — ${site.name}`,
    [
      `Hoi ${booking.name},`,
      "",
      what,
      "",
      bookingSummary(booking),
      "",
      "Wil je een ander moment proberen? Je kunt een nieuwe aanvraag doen via de website.",
      "",
      `Groet, Kai — ${site.name}`,
    ].join("\n"),
    site.bookingEmail,
  );
}

export async function sendContactMails(
  message: ContactMessage,
): Promise<{ customer: MailStatus; owner: MailStatus }> {
  const customer = await send(
    message.email,
    `Bericht ontvangen — ${site.name}`,
    [
      `Hoi ${message.name},`,
      "",
      "Bedankt voor je bericht. Ik lees het en reageer meestal binnen één werkdag.",
      "",
      "Je bericht:",
      message.message,
      "",
      `Groet, Kai — ${site.name}`,
    ].join("\n"),
    site.email,
  );
  // Een contactbericht is algemeen en gaat naar het algemene adres.
  const owner = await send(
    mailRecipients().contact,
    `Contactformulier: ${message.subject}`,
    [
      `Van: ${message.name} <${message.email}>`,
      `Onderwerp: ${message.subject}`,
      "",
      message.message,
    ].join("\n"),
    message.email,
  );
  return { customer, owner };
}
