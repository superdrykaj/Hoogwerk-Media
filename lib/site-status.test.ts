import { describe, expect, it } from "vitest";

import { bepaalStatus } from "./site-status-rule";

describe("stand van de site", () => {
  it("volgt de database, ook als de omgeving iets anders zegt", () => {
    expect(bepaalStatus("live", "soon")).toBe("live");
    expect(bepaalStatus("soon", "live")).toBe("soon");
  });

  it("valt terug op de omgeving zolang de knop nooit is gebruikt", () => {
    expect(bepaalStatus(undefined, "live")).toBe("live");
    expect(bepaalStatus(undefined, "soon")).toBe("soon");
  });

  it("houdt de site dicht als nergens iets staat", () => {
    expect(bepaalStatus(undefined, undefined)).toBe("soon");
  });

  it("telt alleen het woord live als open", () => {
    for (const onzin of ["", "LIVE", "ja", "true", "1", "open", " live"]) {
      expect(bepaalStatus(onzin, undefined), onzin).toBe("soon");
    }
  });
});
