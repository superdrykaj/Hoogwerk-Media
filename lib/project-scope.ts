/**
 * ============================================================================
 *  EXTRA VRAGEN BIJ EEN PROJECT OP MAAT
 * ============================================================================
 *  Een project op maat beslaat vaak meerdere locaties en meerdere opname-
 *  momenten. Het tijdslot dat iemand op de website kiest is daarom niet de
 *  opname zelf, maar de kennismaking; de opnamedagen worden in dat gesprek
 *  gepland. Om dat gesprek nuttig te maken vraagt het boekingsformulier
 *  vooraf naar de omvang van het project.
 *
 *  Dit bestand bevat de regels die de browser en de server allebei gebruiken,
 *  zodat de vragen, de antwoorden en de meldingen overal gelijk zijn.
 *  Het draait aan beide kanten: gebruik hier geen database of node-modules.
 * ============================================================================
 */

/** Hoeveel losse opnamemomenten iemand verwacht. */
export const OPNAMEMOMENTEN = [
  { key: "1", label: "Eén opnamemoment" },
  { key: "2", label: "Twee opnamemomenten" },
  { key: "3plus", label: "Drie of meer opnamemomenten" },
  { key: "onbekend", label: "Weet ik nog niet" },
] as const;

/** Voorkeuren voor wanneer er gevlogen wordt. Meerdere antwoorden mogen. */
export const TIJDVOORKEUREN = [
  { key: "ochtend", label: "Ochtend" },
  { key: "middag", label: "Middag" },
  { key: "gouden-uur", label: "Laatste uur voor zonsondergang" },
  { key: "doordeweeks", label: "Liefst doordeweeks" },
  { key: "weekend", label: "Liefst in het weekend" },
  { key: "flexibel", label: "Maakt niet uit" },
] as const;

/** Hoeveel locaties iemand in het formulier kwijt kan. */
export const MAX_LOCATIES = 6;

export type ProjectScope = {
  /** Locaties naast de eerste. De eerste staat in `booking.location`. */
  extraLocations: string[];
  /** Sleutel uit OPNAMEMOMENTEN, of "" als er niets is gekozen. */
  sessionCount: string;
  /** Vrije tekst: in welke periode het project zou moeten vallen. */
  periodWish: string;
  /** Sleutels uit TIJDVOORKEUREN. */
  timePreferences: string[];
};

export const LEGE_SCOPE: ProjectScope = {
  extraLocations: [],
  sessionCount: "",
  periodWish: "",
  timePreferences: [],
};

export function isLegeScope(scope: ProjectScope): boolean {
  return (
    scope.extraLocations.length === 0 &&
    scope.sessionCount === "" &&
    scope.periodWish === "" &&
    scope.timePreferences.length === 0
  );
}

function label(
  list: readonly { key: string; label: string }[],
  key: string,
): string {
  return list.find((item) => item.key === key)?.label ?? key;
}

export function opnamemomentLabel(key: string): string {
  return label(OPNAMEMOMENTEN, key);
}

export function tijdvoorkeurLabel(key: string): string {
  return label(TIJDVOORKEUREN, key);
}

/**
 * Houdt alleen antwoorden over die we kennen en die ergens op slaan.
 * Onbekende sleutels (bijvoorbeeld van een oud formulier of een bot) worden
 * weggelaten in plaats van opgeslagen.
 */
export function normaliseScope(input: {
  extraLocations?: string[];
  sessionCount?: string;
  periodWish?: string;
  timePreferences?: string[];
}): ProjectScope {
  const extraLocations = (input.extraLocations ?? [])
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, MAX_LOCATIES - 1);

  const sessionCount = OPNAMEMOMENTEN.some((o) => o.key === input.sessionCount)
    ? (input.sessionCount as string)
    : "";

  const gekozen = new Set(input.timePreferences ?? []);
  const timePreferences = TIJDVOORKEUREN.filter((t) => gekozen.has(t.key)).map(
    (t) => t.key,
  );

  return {
    extraLocations,
    sessionCount,
    periodWish: (input.periodWish ?? "").trim(),
    timePreferences,
  };
}

/**
 * De projectopzet als leesbare regels, voor de bevestiging in het formulier,
 * de e-mail en de beheeromgeving. Lege antwoorden blijven weg.
 */
export function scopeLines(
  scope: ProjectScope,
  primaryLocation: string,
): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];

  if (scope.extraLocations.length > 0) {
    const alle = [primaryLocation, ...scope.extraLocations].filter(Boolean);
    lines.push({
      label: `Locaties (${alle.length})`,
      value: alle.join("\n"),
    });
  }
  if (scope.sessionCount) {
    lines.push({
      label: "Opnamemomenten",
      value: opnamemomentLabel(scope.sessionCount),
    });
  }
  if (scope.periodWish) {
    lines.push({ label: "Gewenste periode", value: scope.periodWish });
  }
  if (scope.timePreferences.length > 0) {
    lines.push({
      label: "Voorkeur",
      value: scope.timePreferences.map(tijdvoorkeurLabel).join(", "),
    });
  }

  return lines;
}

/** Melding bij een project op maat zonder gewenste periode. */
export const PERIODE_VERPLICHT =
  "Geef aan in welke periode het project zou moeten vallen. Bij benadering mag ook.";
