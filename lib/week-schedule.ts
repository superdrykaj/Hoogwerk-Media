import { parseMinutes, WEEKDAY_LABELS } from "./time";

/**
 * De regels voor het weekschema in de beheeromgeving.
 *
 * Staat los van de server action, zodat het formulier in de browser en de
 * server dezelfde controle doen en je een fout ziet vóór het opslaan.
 */

export const PERIODES_PER_DAG = 4;

export type WeekVenster = {
  weekday: number;
  startMinute: number;
  endMinute: number;
};

/** Waarom een periode niet klopt. */
export type PeriodeFout = "onvolledig" | "ongeldig" | "omgekeerd";

export type PeriodeResultaat =
  | { soort: "leeg" }
  | { soort: "fout"; reden: PeriodeFout }
  | { soort: "ok"; start: number; eind: number };

/** Eén periode nakijken, los van welke dag het is. */
export function leesPeriode(van: string, tot: string): PeriodeResultaat {
  const vanTekst = van.trim();
  const totTekst = tot.trim();

  // Niets ingevuld: deze periode wordt niet gebruikt.
  if (!vanTekst && !totTekst) return { soort: "leeg" };

  const start = parseMinutes(vanTekst);
  const eind = parseMinutes(totTekst);

  // Een tijdveld in de browser springt bij aanklikken op 00:00. Twee keer
  // middernacht is geen periode, dus dat lezen we als niet ingevuld.
  if (start === 0 && eind === 0) return { soort: "leeg" };

  if (!vanTekst || !totTekst) return { soort: "fout", reden: "onvolledig" };
  if (start === null || eind === null) return { soort: "fout", reden: "ongeldig" };
  if (eind <= start) return { soort: "fout", reden: "omgekeerd" };

  return { soort: "ok", start, eind };
}

/** Korte uitleg bij een periode, voor onder het invoerveld. */
export function periodeMelding(reden: PeriodeFout): string {
  switch (reden) {
    case "onvolledig":
      return "Vul een begintijd en een eindtijd in, of laat beide leeg.";
    case "ongeldig":
      return "Gebruik het formaat 09:00.";
    case "omgekeerd":
      return "De eindtijd moet later zijn dan de begintijd.";
  }
}

/** Dezelfde uitleg, maar met de dag erbij, voor de melding boven het formulier. */
export function dagMelding(weekday: number, reden: PeriodeFout): string {
  const dag = WEEKDAY_LABELS[weekday].toLowerCase();
  switch (reden) {
    case "onvolledig":
      return `Vul op ${dag} zowel een begintijd als een eindtijd in, of laat beide leeg.`;
    case "ongeldig":
      return `Ongeldige tijd op ${dag}. Gebruik het formaat 09:00.`;
    case "omgekeerd":
      return `Op ${dag} moet de eindtijd later zijn dan de begintijd.`;
  }
}

export type WeekResultaat =
  | { ok: true; vensters: WeekVenster[] }
  | { ok: false; melding: string; weekday: number; periode: number };

/**
 * Het hele weekschema lezen.
 *
 * @param lees geeft de ingevulde waarde terug voor een dag, een periode en
 *             de begin- of eindkant ervan.
 */
export function leesWeekschema(
  lees: (weekday: number, periode: number, kant: "from" | "to") => string,
): WeekResultaat {
  const vensters: WeekVenster[] = [];

  for (let weekday = 0; weekday < 7; weekday++) {
    for (let periode = 0; periode < PERIODES_PER_DAG; periode++) {
      const resultaat = leesPeriode(
        lees(weekday, periode, "from"),
        lees(weekday, periode, "to"),
      );
      if (resultaat.soort === "leeg") continue;
      if (resultaat.soort === "fout") {
        return {
          ok: false,
          melding: dagMelding(weekday, resultaat.reden),
          weekday,
          periode,
        };
      }
      vensters.push({
        weekday,
        startMinute: resultaat.start,
        endMinute: resultaat.eind,
      });
    }
  }

  return { ok: true, vensters };
}
