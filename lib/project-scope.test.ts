import { describe, expect, it } from "vitest";

import {
  LEGE_SCOPE,
  MAX_LOCATIES,
  isLegeScope,
  normaliseScope,
  scopeLines,
} from "./project-scope";

describe("normaliseScope", () => {
  it("houdt lege invoer leeg", () => {
    expect(isLegeScope(normaliseScope({}))).toBe(true);
    expect(isLegeScope(LEGE_SCOPE)).toBe(true);
  });

  it("laat lege en spatie-locaties weg", () => {
    const scope = normaliseScope({
      extraLocations: ["Zaandam", "   ", "", " Purmerend "],
    });
    expect(scope.extraLocations).toEqual(["Zaandam", "Purmerend"]);
  });

  it("begrenst het aantal extra locaties", () => {
    const veel = Array.from({ length: 20 }, (_, i) => `Locatie ${i}`);
    expect(normaliseScope({ extraLocations: veel }).extraLocations).toHaveLength(
      MAX_LOCATIES - 1,
    );
  });

  it("weigert een onbekend aantal opnamemomenten", () => {
    expect(normaliseScope({ sessionCount: "3plus" }).sessionCount).toBe("3plus");
    expect(normaliseScope({ sessionCount: "<script>" }).sessionCount).toBe("");
  });

  it("houdt alleen bekende voorkeuren over, in vaste volgorde", () => {
    const scope = normaliseScope({
      timePreferences: ["weekend", "onzin", "ochtend"],
    });
    expect(scope.timePreferences).toEqual(["ochtend", "weekend"]);
  });

  it("haalt spaties rond de gewenste periode weg", () => {
    expect(normaliseScope({ periodWish: "  in mei " }).periodWish).toBe("in mei");
  });
});

describe("scopeLines", () => {
  it("geeft niets terug als er niets is ingevuld", () => {
    expect(scopeLines(LEGE_SCOPE, "Zaandam")).toEqual([]);
  });

  it("telt de hoofdlocatie mee bij de locaties", () => {
    const scope = normaliseScope({ extraLocations: ["Wormerveer"] });
    const regels = scopeLines(scope, "Zaandam");
    expect(regels[0].label).toBe("Locaties (2)");
    expect(regels[0].value).toBe("Zaandam\nWormerveer");
  });

  it("schrijft de antwoorden uit in gewone taal", () => {
    const scope = normaliseScope({
      sessionCount: "2",
      periodWish: "in mei",
      timePreferences: ["gouden-uur"],
    });
    const regels = scopeLines(scope, "Zaandam");
    expect(regels).toEqual([
      { label: "Opnamemomenten", value: "Twee opnamemomenten" },
      { label: "Gewenste periode", value: "in mei" },
      { label: "Voorkeur", value: "Laatste uur voor zonsondergang" },
    ]);
  });
});
