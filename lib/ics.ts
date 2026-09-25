/**
 * ============================================================================
 *  AGENDA-UITNODIGING (.ics)
 * ============================================================================
 *  Maakt van een boeking een agenda-afspraak in het iCalendar-formaat, zodat
 *  een bevestigde afspraak met één klik in Outlook, Apple Agenda of Google
 *  Agenda staat.
 *
 *  Twee dingen maken het verschil tussen een uitnodiging die werkt en een
 *  bijlage die niets doet:
 *
 *    - UID blijft hetzelfde zolang het om dezelfde boeking gaat. Een tweede
 *      bericht over die boeking werkt de bestaande afspraak dan bij in plaats
 *      van er een dubbele naast te zetten.
 *    - SEQUENCE moet bij elke wijziging omhoog. Agenda's negeren een bericht
 *      met een gelijk of lager nummer. We leiden het af van het moment waarop
 *      de boeking voor het laatst is gewijzigd, dus het loopt vanzelf op.
 *
 *  Dit bestand leest geen database en heeft geen omgevingsvariabelen nodig,
 *  zodat het los te testen is.
 * ============================================================================
 */
import { site } from "@/content/site";
import { scopeLines } from "./project-scope";
import { copy } from "@/content/copy";
import { DEFAULT_LOCALE } from "./locale";
import { formatTimestamp } from "./time";
import type { Booking } from "./types";

/** REQUEST zet de afspraak klaar, CANCEL haalt hem weer uit de agenda. */
export type IcsMethod = "REQUEST" | "CANCEL";

/** Tijdstempel in de basisvorm die iCalendar voorschrijft: 20260925T101500Z. */
function utcStempel(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Tekens die in iCalendar een betekenis hebben, onschadelijk maken.
 * De backslash gaat als eerste; anders ontsnapt hij de ontsnappingstekens die
 * we er daarna zelf in zetten.
 */
function ontsnap(waarde: string): string {
  return waarde
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Regels mogen hooguit 75 octetten lang zijn. Wat langer is, gaat door op de
 * volgende regel die met één spatie begint. We tellen in octetten en niet in
 * tekens, want een é telt voor twee.
 */
function vouw(regel: string): string {
  const bytes = Buffer.from(regel, "utf8");
  if (bytes.length <= 75) return regel;

  const stukken: string[] = [];
  let start = 0;
  let grens = 75;
  while (start < bytes.length) {
    let eind = Math.min(start + grens, bytes.length);
    // Niet midden in een teken afbreken: schuif terug tot het begin ervan.
    while (eind > start && eind < bytes.length && (bytes[eind] & 0xc0) === 0x80) {
      eind -= 1;
    }
    stukken.push(bytes.subarray(start, eind).toString("utf8"));
    start = eind;
    grens = 74; // de vervolgregel begint met een spatie
  }
  return stukken.join("\r\n ");
}

/** Het adres waarvandaan de uitnodiging komt, zonder de naam ervoor. */
function organisatorAdres(): string {
  const from = process.env.MAIL_FROM?.trim() ?? "";
  const tussenHaken = from.match(/<([^>]+)>/);
  if (tussenHaken) return tussenHaken[1].trim();
  return from.includes("@") ? from : site.bookingEmail;
}

/**
 * Het volgnummer van deze versie van de afspraak. Nul bij een boeking die nog
 * nooit is gewijzigd, en daarna het aantal seconden sinds het aanmaken. Dat
 * loopt bij elke wijziging op, wat precies is wat agenda's verlangen.
 */
function volgnummer(booking: Booking): number {
  const verschil = Math.floor((booking.updatedUtc - booking.createdUtc) / 1000);
  return verschil > 0 ? verschil : 0;
}

/** Wat er in de agenda-afspraak als omschrijving komt te staan. */
function omschrijving(booking: Booking): string {
  const t = copy(DEFAULT_LOCALE).mail;
  const scope = scopeLines(booking.scope, booking.location, copy(DEFAULT_LOCALE).scope);
  return [
    `${t.summaryReference}: ${booking.reference}`,
    `${t.summaryService}: ${booking.serviceName}`,
    `${t.summaryName}: ${booking.name}`,
    `${t.summaryEmail}: ${booking.email}`,
    `${t.summaryPhone}: ${booking.phone || t.summaryNotGiven}`,
    `${t.summaryWhen}: ${formatTimestamp(booking.startUtc, DEFAULT_LOCALE)} (Europe/Amsterdam)`,
    ...scope.map(({ label, value }) => `${label}: ${value.replace(/\n/g, ", ")}`),
    "",
    booking.description || t.summaryNoDescription,
  ].join("\n");
}

/** De naam van het bestand dat als bijlage meegaat. */
export function icsFilename(booking: Booking): string {
  return `afspraak-${booking.reference}.ics`;
}

/**
 * De agenda-afspraak zelf. `naar` is het adres dat de uitnodiging ontvangt; dat
 * adres komt als deelnemer in het bestand te staan, want zonder deelnemer
 * behandelt Outlook een uitnodiging als een gewone bijlage.
 */
export function bookingIcs(
  booking: Booking,
  method: IcsMethod,
  naar: string,
): string {
  const organisator = organisatorAdres();
  const titel =
    method === "CANCEL"
      ? `Geannuleerd: ${booking.serviceName} — ${booking.name}`
      : `${booking.serviceName} — ${booking.name}`;

  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Boekingen//NL`,
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${booking.reference.toLowerCase()}@hoogbeeldmedia.nl`,
    `SEQUENCE:${volgnummer(booking)}`,
    `DTSTAMP:${utcStempel(Date.now())}`,
    `DTSTART:${utcStempel(booking.startUtc)}`,
    `DTEND:${utcStempel(booking.endUtc)}`,
    `SUMMARY:${ontsnap(titel)}`,
    `DESCRIPTION:${ontsnap(omschrijving(booking))}`,
    ...(booking.location ? [`LOCATION:${ontsnap(booking.location)}`] : []),
    `ORGANIZER;CN=${ontsnap(site.name)}:mailto:${organisator}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${naar}`,
    `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // Afsluiten met CRLF: sommige agenda's slaan de laatste regel anders over.
  return regels.map(vouw).join("\r\n") + "\r\n";
}
