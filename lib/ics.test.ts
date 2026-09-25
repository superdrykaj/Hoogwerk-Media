import { describe, expect, it } from "vitest";

import { bookingIcs, icsFilename } from "./ics";
import { normaliseScope } from "./project-scope";
import type { Booking } from "./types";

const AGENDA = "kai@hoogbeeldmedia.nl";

function boeking(overrides: Partial<Booking> = {}): Booking {
  const start = Date.UTC(2026, 9, 14, 8, 30); // 14 oktober 2026, 10:30 in NL
  return {
    id: 1,
    reference: "HM-7F3QD2",
    serviceId: 2,
    serviceName: "Dronefotografie",
    startUtc: start,
    endUtc: start + 90 * 60 * 1000,
    status: "confirmed",
    locale: "nl",
    name: "Bakker Vastgoed",
    email: "info@bakkervastgoed.nl",
    phone: "06 12345678",
    location: "Zaandam, Westzijde 1",
    description: "Luchtfoto's voor de verkoopbrochure.",
    scope: normaliseScope({
      extraLocations: [],
      sessionCount: "",
      periodWish: "",
      timePreferences: [],
    }),
    adminNote: "",
    createdUtc: start - 86_400_000,
    updatedUtc: start - 86_400_000,
    ...overrides,
  };
}

/** De losse regels, met de vervolgregels weer aan hun eigen regel geplakt. */
function regels(ics: string): string[] {
  return ics.replace(/\r\n /g, "").split("\r\n").filter(Boolean);
}

function waarde(ics: string, naam: string): string | undefined {
  const regel = regels(ics).find((r) => r.startsWith(`${naam}:`) || r.startsWith(`${naam};`));
  return regel?.slice(regel.indexOf(":") + 1);
}

describe("agenda-uitnodiging", () => {
  it("levert een geldig omhulsel met precies één afspraak", () => {
    const r = regels(bookingIcs(boeking(), "REQUEST", AGENDA));
    expect(r[0]).toBe("BEGIN:VCALENDAR");
    expect(r.at(-1)).toBe("END:VCALENDAR");
    expect(r.filter((x) => x === "BEGIN:VEVENT")).toHaveLength(1);
    expect(r.filter((x) => x === "END:VEVENT")).toHaveLength(1);
    expect(r).toContain("VERSION:2.0");
  });

  it("gebruikt overal regeleindes met CR erin", () => {
    const ics = bookingIcs(boeking(), "REQUEST", AGENDA);
    // Geen enkele losse \n zonder \r ervoor; agenda's struikelen daarover.
    expect(/[^\r]\n/.test(ics)).toBe(false);
    expect(ics.endsWith("\r\n")).toBe(true);
  });

  it("zet begin en eind in UTC, in de basisvorm", () => {
    const ics = bookingIcs(boeking(), "REQUEST", AGENDA);
    expect(waarde(ics, "DTSTART")).toBe("20261014T083000Z");
    expect(waarde(ics, "DTEND")).toBe("20261014T100000Z");
  });

  it("houdt hetzelfde UID aan voor dezelfde boeking", () => {
    const eerst = bookingIcs(boeking(), "REQUEST", AGENDA);
    const later = bookingIcs(
      boeking({ startUtc: Date.UTC(2026, 9, 15, 8, 30) }),
      "REQUEST",
      AGENDA,
    );
    expect(waarde(eerst, "UID")).toBe(waarde(later, "UID"));
  });

  it("verhoogt het volgnummer zodra de boeking is gewijzigd", () => {
    const start = boeking();
    const gewijzigd = boeking({ updatedUtc: start.updatedUtc + 60_000 });
    expect(waarde(bookingIcs(start, "REQUEST", AGENDA), "SEQUENCE")).toBe("0");
    expect(waarde(bookingIcs(gewijzigd, "REQUEST", AGENDA), "SEQUENCE")).toBe("60");
  });

  it("trekt de afspraak in bij een annulering", () => {
    const ics = bookingIcs(boeking(), "CANCEL", AGENDA);
    expect(regels(ics)).toContain("METHOD:CANCEL");
    expect(waarde(ics, "STATUS")).toBe("CANCELLED");
    expect(waarde(ics, "SUMMARY")).toMatch(/^Geannuleerd: /);
  });

  it("zet de ontvanger als deelnemer in de afspraak", () => {
    const ics = bookingIcs(boeking(), "REQUEST", AGENDA);
    expect(ics).toContain(`mailto:${AGENDA}`);
  });

  it("ontsnapt komma's en puntkomma's in de locatie", () => {
    const ics = bookingIcs(boeking({ location: "Zaandam, Westzijde 1" }), "REQUEST", AGENDA);
    expect(waarde(ics, "LOCATION")).toBe("Zaandam\\, Westzijde 1");
  });

  it("zet regeleindes in de omschrijving om naar \\n", () => {
    const ics = bookingIcs(
      boeking({ description: "Eerste regel\nTweede regel" }),
      "REQUEST",
      AGENDA,
    );
    const omschrijving = waarde(ics, "DESCRIPTION") ?? "";
    expect(omschrijving).toContain("Eerste regel\\nTweede regel");
  });

  it("laat de locatieregel weg als er geen locatie is", () => {
    const ics = bookingIcs(boeking({ location: "" }), "REQUEST", AGENDA);
    expect(regels(ics).some((r) => r.startsWith("LOCATION"))).toBe(false);
  });

  it("houdt elke regel binnen 75 octetten", () => {
    const lang = "Aannemersbedrijf Van der Zaanstreek & Partners B.V. te Wormerveer";
    const ics = bookingIcs(
      boeking({ name: lang, description: lang.repeat(4) }),
      "REQUEST",
      AGENDA,
    );
    for (const regel of ics.split("\r\n")) {
      expect(Buffer.byteLength(regel, "utf8"), `te lang: ${regel}`).toBeLessThanOrEqual(75);
    }
  });

  it("breekt een gevouwen regel niet midden in een teken af", () => {
    const ics = bookingIcs(
      boeking({ description: "é".repeat(200) }),
      "REQUEST",
      AGENDA,
    );
    // Terugvouwen moet exact dezelfde tekens opleveren, zonder vervangtekens.
    expect(ics).not.toContain("�");
    expect(waarde(ics, "DESCRIPTION")).toContain("é".repeat(200));
  });

  it("noemt het bestand naar het kenmerk van de boeking", () => {
    expect(icsFilename(boeking())).toBe("afspraak-HM-7F3QD2.ics");
  });
});
