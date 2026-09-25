import "server-only";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { getDb } from "./db";
import { bookingIcs, icsFilename, type IcsMethod } from "./ics";
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
 * Optioneel, voor de agenda-uitnodigingen:
 *   MAIL_TO_CALENDAR
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
 *
 * De agenda-uitnodiging is de uitzondering: die gaat naar het persoonlijke
 * adres, want daar hangt de agenda aan waar de afspraak in moet komen. MAIL_TO
 * trekt dat bewust niet mee; een verzamelpostvak is geen agenda.
 */
export function mailRecipients(): {
  bookings: string;
  contact: string;
  calendar: string;
} {
  const beide = process.env.MAIL_TO?.trim();
  return {
    bookings:
      process.env.MAIL_TO_BOOKINGS?.trim() || beide || site.bookingEmail,
    contact: process.env.MAIL_TO_CONTACT?.trim() || beide || site.email,
    calendar: process.env.MAIL_TO_CALENDAR?.trim() || site.personalEmail,
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

/**
 * De SMTP-verbinding, één keer opgezet en daarna hergebruikt.
 *
 * Twee dingen zijn hier belangrijk voor hoe snel het formulier reageert:
 *
 * 1. Eerder werd voor elk bericht een nieuwe verbinding opgetuigd. Bij een
 *    aanvraag gaan er twee berichten uit, dus gebeurde dat twee keer.
 * 2. Zonder tijdslimieten wacht nodemailer standaard minutenlang op een server
 *    die niet antwoordt. De bezoeker kijkt zolang naar "bezig met versturen".
 *    Met deze grenzen duurt een mislukte poging hooguit een paar seconden.
 *
 * De instellingen komen uit de omgeving en veranderen niet zolang de server
 * draait, dus het bewaren van de verbinding is veilig.
 */
let transportCache: Promise<import("nodemailer").Transporter> | null = null;

function getTransport() {
  if (!transportCache) {
    transportCache = import("nodemailer").then((mod) =>
      mod.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
        // Wachten op verbinding, op de begroeting van de server en op het
        // versturen zelf. In milliseconden.
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
      }),
    );
  }
  return transportCache;
}

/**
 * De fout van de mailserver als één regel tekst.
 *
 * De losse melding is vaak te mager om iets mee te kunnen: bij een tijdslimiet
 * staat er alleen "Connection timeout". De code (ETIMEDOUT, EAUTH) en het
 * antwoord van de server zeggen wél wat er aan de hand is, dus die gaan mee.
 * Op die tekst is de uitleg in lib/mail-error.ts gebouwd.
 */
function beschrijfFout(error: unknown): string {
  const delen: string[] = [];
  if (error && typeof error === "object") {
    const e = error as { code?: unknown; responseCode?: unknown; response?: unknown };
    if (typeof e.code === "string") delen.push(e.code);
    const antwoord = typeof e.response === "string" ? e.response : "";
    // De code staat meestal al vooraan in het antwoord; niet twee keer zetten.
    if (typeof e.responseCode === "number" && !antwoord.startsWith(String(e.responseCode))) {
      delen.push(String(e.responseCode));
    }
    if (antwoord) delen.push(antwoord);
  }
  delen.push(String(error));
  return delen.join(" ").slice(0, 500);
}

/** Een agenda-afspraak die als uitnodiging met het bericht meegaat. */
type Agendabijlage = { method: IcsMethod; filename: string; content: string };

async function send(
  to: string,
  subject: string,
  text: string,
  /** Adres waarop de ontvanger moet antwoorden, als dat niet de afzender is. */
  replyTo?: string,
  agenda?: Agendabijlage,
): Promise<MailStatus> {
  if (!isMailConfigured()) {
    logMail(to, subject, "skipped", "SMTP nog niet ingesteld; niets verzonden.");
    return "skipped";
  }
  try {
    const transport = await getTransport();
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to,
      replyTo,
      subject,
      text,
      // icalEvent, en niet een gewone bijlage: hiermee zet nodemailer het
      // juiste inhoudstype met de methode erin. Zonder dat toont Outlook een
      // bestandje in plaats van een afspraak met een knop erbij.
      icalEvent: agenda,
    });
    logMail(to, subject, "sent", "");
    return "sent";
  } catch (error) {
    logMail(to, subject, "failed", beschrijfFout(error));
    return "failed";
  }
}

/**
 * De agenda-uitnodiging voor een bevestigde afspraak.
 *
 * Gaat naar het persoonlijke adres, apart van de bevestiging aan de klant. Zo
 * belandt de afspraak in de agenda zonder dat de klant een uitnodiging krijgt
 * waarop hij kan antwoorden.
 */
async function sendCalendarInvite(
  booking: Booking,
  method: IcsMethod,
): Promise<MailStatus> {
  const naar = mailRecipients().calendar;
  const eigen = copy(DEFAULT_LOCALE).mail;
  const wanneer = formatTimestamp(booking.startUtc, DEFAULT_LOCALE);
  const geannuleerd = method === "CANCEL";

  return send(
    naar,
    geannuleerd
      ? `Vervalt: ${booking.serviceName} — ${booking.name} (${booking.reference})`
      : `Agenda: ${booking.serviceName} — ${booking.name} (${booking.reference})`,
    [
      geannuleerd
        ? `Deze afspraak gaat niet door en verdwijnt uit je agenda:`
        : `Deze afspraak staat bevestigd. Open de bijlage om hem in je agenda te zetten:`,
      "",
      wanneer + " (Europe/Amsterdam)",
      "",
      bookingSummary(booking, DEFAULT_LOCALE),
      "",
      eigen.signature,
    ].join("\n"),
    // Antwoorden op de uitnodiging gaat rechtstreeks naar de klant.
    booking.email,
    {
      method,
      filename: icsFilename(booking),
      content: bookingIcs(booking, method, naar),
    },
  );
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

  // De melding aan de eigenaar is altijd Nederlands: die leest Kai zelf.
  const eigen = copy(DEFAULT_LOCALE).mail;

  // Tegelijk, niet na elkaar: de bezoeker wacht anders twee keer zo lang.
  const [customer, owner] = await Promise.all([
    send(
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
    ),
    send(
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
    ),
  ]);

  return { customer, owner };
}

/**
 * Bevestiging naar de klant, en tegelijk de agenda-uitnodiging naar jezelf.
 * De twee berichten gaan naast elkaar de deur uit; dat scheelt de helft van
 * de wachttijd in de beheeromgeving.
 */
export async function sendBookingConfirmedMail(booking: Booking): Promise<{
  customer: MailStatus;
  calendar: MailStatus;
}> {
  const locale = booking.locale;
  const t = copy(locale).mail;
  const [customer, calendar] = await Promise.all([
    send(
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
    ),
    sendCalendarInvite(booking, "REQUEST"),
  ]);
  return { customer, calendar };
}

/**
 * Een bevestigde afspraak is verplaatst. De uitnodiging gaat opnieuw uit met
 * hetzelfde UID en een hoger volgnummer, zodat de bestaande afspraak in de
 * agenda meeschuift in plaats van dat er een tweede naast komt te staan.
 */
export async function sendBookingMovedInvite(
  booking: Booking,
): Promise<MailStatus> {
  return sendCalendarInvite(booking, "REQUEST");
}

/**
 * Afwijzing of annulering naar de klant.
 *
 * Stond de afspraak al bevestigd, dan is er eerder een uitnodiging uitgegaan
 * en moet die ook weer worden ingetrokken; anders blijft er een afspraak in de
 * agenda staan die niet doorgaat. Was hij nog niet bevestigd, dan is er niets
 * in te trekken en blijft het bij het bericht aan de klant.
 */
export async function sendBookingCancelledMail(
  booking: Booking,
  reason: "rejected" | "cancelled",
  options: { withdrawInvite?: boolean } = {},
): Promise<{ customer: MailStatus; calendar: MailStatus | null }> {
  const locale = booking.locale;
  const t = copy(locale).mail;
  const what = reason === "rejected" ? t.rejectedBody : t.cancelledBody;
  const [customer, calendar] = await Promise.all([
    send(
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
    ),
    options.withdrawInvite
      ? sendCalendarInvite(booking, "CANCEL")
      : Promise.resolve(null),
  ]);
  return { customer, calendar };
}

export async function sendContactMails(
  message: ContactMessage,
  locale: Locale = DEFAULT_LOCALE,
): Promise<{ customer: MailStatus; owner: MailStatus }> {
  const t = copy(locale).mail;
  // De melding aan de eigenaar blijft Nederlands.
  const eigen = copy(DEFAULT_LOCALE).mail;

  // Tegelijk, niet na elkaar: de bezoeker wacht anders twee keer zo lang.
  const [customer, owner] = await Promise.all([
    send(
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
    ),
    // Een contactbericht is algemeen en gaat naar het algemene adres.
    send(
      mailRecipients().contact,
      eigen.contactOwnerSubject(message.subject),
      [
        `${eigen.contactFrom} ${message.name} <${message.email}>`,
        `${eigen.contactRe} ${message.subject}`,
        "",
        message.message,
      ].join("\n"),
      message.email,
    ),
  ]);
  return { customer, owner };
}
