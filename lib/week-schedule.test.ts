import { describe, expect, it } from "vitest";
import { leesWeekschema, type WeekResultaat } from "./week-schedule";

/** Bouwt een leesfunctie uit een eenvoudige tabel: dag -> lijst van [van, tot]. */
function formulier(tabel: Record<number, [string, string][]>) {
  return (weekday: number, periode: number, kant: "from" | "to") => {
    const rij = tabel[weekday]?.[periode];
    if (!rij) return "";
    return kant === "from" ? rij[0] : rij[1];
  };
}

function melding(resultaat: WeekResultaat): string {
  return resultaat.ok ? "" : resultaat.melding;
}

describe("weekschema uit het formulier lezen", () => {
  it("leest een gewone dag met twee periodes", () => {
    const r = leesWeekschema(
      formulier({ 1: [["09:00", "12:30"], ["13:30", "17:30"]] }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.vensters).toEqual([
      { weekday: 1, startMinute: 540, endMinute: 750 },
      { weekday: 1, startMinute: 810, endMinute: 1050 },
    ]);
  });

  it("slaat lege rijen over", () => {
    const r = leesWeekschema(formulier({ 1: [["", ""], ["09:00", "10:00"]] }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.vensters).toHaveLength(1);
  });

  it("leest 00:00 tot 00:00 als een niet-gebruikte rij", () => {
    // Een tijdveld springt bij aanklikken soms op 00:00; dat is geen periode.
    const r = leesWeekschema(
      formulier({ 1: [["18:00", "21:00"], ["00:00", "00:00"]] }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.vensters).toEqual([
      { weekday: 1, startMinute: 1080, endMinute: 1260 },
    ]);
  });

  it("noemt de dag bij naam als de eindtijd niet later is", () => {
    const r = leesWeekschema(formulier({ 1: [["14:00", "12:00"]] }));
    expect(r.ok).toBe(false);
    expect(melding(r)).toContain("maandag");
    expect(melding(r)).not.toContain("dag 2");
  });

  it("wijst een halfingevulde periode af, met de dagnaam erbij", () => {
    const r = leesWeekschema(formulier({ 6: [["09:00", ""]] }));
    expect(r.ok).toBe(false);
    expect(melding(r)).toContain("zaterdag");
  });

  it("wijst een periode van nul minuten af", () => {
    const r = leesWeekschema(formulier({ 3: [["10:00", "10:00"]] }));
    expect(r.ok).toBe(false);
    expect(melding(r)).toContain("woensdag");
  });

  it("noemt zondag bij naam en niet als dag 1", () => {
    const r = leesWeekschema(formulier({ 0: [["12:00", "09:00"]] }));
    expect(r.ok).toBe(false);
    expect(melding(r)).toContain("zondag");
  });

  it("geeft een leeg schema terug als niets is ingevuld", () => {
    const r = leesWeekschema(() => "");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.vensters).toEqual([]);
  });
});
