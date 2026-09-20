import { parseMinutes, WEEKDAY_LABELS } from "./time";

/**
 * Het weekschema uit het beheerformulier lezen en nakijken.
 *
 * Staat los van de server action, zodat de regels te testen zijn zonder een
 * formulier na te bootsen.
 */

export const PERIODES_PER_DAG = 4;

export type WeekVenster = {
  weekday: number;
  startMinute: number;
  endMinute: number;
};

export type WeekResultaat =
  | { ok: true; vensters: WeekVenster[] }
  | { ok: false; melding: string };

/** "maandag", voor gebruik midden in een zin. */
function dagnaam(weekday: number): string {
  return WEEKDAY_LABELS[weekday].toLowerCase();
}

/**
 * @param lees geeft de ingevulde waarde terug voor een dag, een periode en
 *             de begin- of eindkant ervan.
 */
export function leesWeekschema(
  lees: (weekday: number, periode: number, kant: "from" | "to") => string,
): WeekResultaat {
  const vensters: WeekVenster[] = [];

  for (let weekday = 0; weekday < 7; weekday++) {
    for (let periode = 0; periode < PERIODES_PER_DAG; periode++) {
      const vanTekst = lees(weekday, periode, "from").trim();
      const totTekst = lees(weekday, periode, "to").trim();

      // Helemaal niet ingevuld: deze periode wordt niet gebruikt.
      if (!vanTekst && !totTekst) continue;

      const van = parseMinutes(vanTekst);
      const tot = parseMinutes(totTekst);

      // Een tijdveld in de browser springt bij aanklikken soms op 00:00.
      // Twee keer middernacht is geen periode, dus dat lezen we als leeg.
      if (van === 0 && tot === 0) continue;

      if (!vanTekst || !totTekst) {
        return {
          ok: false,
          melding: `Vul op ${dagnaam(weekday)} zowel een begintijd als een eindtijd in, of laat beide leeg.`,
        };
      }
      if (van === null || tot === null) {
        return {
          ok: false,
          melding: `Ongeldige tijd op ${dagnaam(weekday)}. Gebruik het formaat 09:00.`,
        };
      }
      if (tot <= van) {
        return {
          ok: false,
          melding: `Op ${dagnaam(weekday)} moet de eindtijd later zijn dan de begintijd.`,
        };
      }

      vensters.push({ weekday, startMinute: van, endMinute: tot });
    }
  }

  return { ok: true, vensters };
}
