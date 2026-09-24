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
import type { Dictionary } from "@/content/copy";

/**
 * Hoeveel losse opnamemomenten iemand verwacht, en de voorkeuren voor wanneer
 * er gevlogen wordt. Hier staan alleen de sleutels; de woorden erbij staan per
 * taal in content/copy.nl.ts en content/copy.en.ts.
 */
export const OPNAMEMOMENTEN = ["1", "2", "3plus", "onbekend"] as const;

export const TIJDVOORKEUREN = [
  "ochtend",
  "middag",
  "gouden-uur",
  "doordeweeks",
  "weekend",
  "flexibel",
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

  const sessionCount = (OPNAMEMOMENTEN as readonly string[]).includes(
    input.sessionCount ?? "",
  )
    ? (input.sessionCount as string)
    : "";

  const gekozen = new Set(input.timePreferences ?? []);
  const timePreferences = TIJDVOORKEUREN.filter((key) => gekozen.has(key));

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
  t: Dictionary["scope"],
): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];

  if (scope.extraLocations.length > 0) {
    const alle = [primaryLocation, ...scope.extraLocations].filter(Boolean);
    lines.push({
      label: t.summaryLocations(alle.length),
      value: alle.join("\n"),
    });
  }
  if (scope.sessionCount) {
    lines.push({
      label: t.summarySessions,
      value: t.sessions[scope.sessionCount] ?? scope.sessionCount,
    });
  }
  if (scope.periodWish) {
    lines.push({ label: t.summaryPeriod, value: scope.periodWish });
  }
  if (scope.timePreferences.length > 0) {
    lines.push({
      label: t.summaryPreference,
      value: scope.timePreferences
        .map((key) => t.preferences[key] ?? key)
        .join(", "),
    });
  }

  return lines;
}
