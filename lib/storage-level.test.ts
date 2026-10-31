import { describe, expect, it } from "vitest";

import {
  URGENT_PERCENT,
  WARN_PERCENT,
  decideUpload,
  defaultReserveBytes,
  formatBytes,
  usageLevel,
  usagePercent,
} from "./storage-level";

const MB = 1_000_000;
const GB = 1_000 * MB;

describe("drempels", () => {
  it("waarschuwt vanaf 80% en meldt dringend vanaf 90%", () => {
    expect(WARN_PERCENT).toBe(80);
    expect(URGENT_PERCENT).toBe(90);
    expect(usageLevel(0)).toBe("ok");
    expect(usageLevel(79.99)).toBe("ok");
    expect(usageLevel(80)).toBe("warn");
    expect(usageLevel(89.99)).toBe("warn");
    expect(usageLevel(90)).toBe("urgent");
    expect(usageLevel(100)).toBe("urgent");
  });
  it("rekent het percentage zoals df: gebruikt / (gebruikt + vrij)", () => {
    expect(usagePercent(800, 200)).toBe(80);
    expect(usagePercent(0, 0)).toBe(0);
    expect(usagePercent(1, 0)).toBe(100);
  });
});

describe("formatBytes", () => {
  it("gebruikt decimale eenheden en Nederlandse komma's", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(999)).toBe("999 B");
    expect(formatBytes(1_500)).toBe("1,5 kB");
    expect(formatBytes(1_048_576)).toBe("1,05 MB");
    expect(formatBytes(1_500_000_000)).toBe("1,5 GB");
    expect(formatBytes(250 * MB)).toBe("250 MB");
  });
});

describe("uploadcontrole op een volume van 1 GB", () => {
  const totaal = 1 * GB;
  it("houdt 10% (minimaal 64 MB) gereserveerd", () => {
    expect(defaultReserveBytes(1 * GB)).toBe(100 * MB);
    expect(defaultReserveBytes(100 * MB)).toBe(64 * MB);
    expect(defaultReserveBytes(40 * GB)).toBe(4 * GB);
  });
  it("laat een bestand toe dat past boven de reserve", () => {
    expect(decideUpload(600 * MB, totaal, 400 * MB).ok).toBe(true);
  });
  it("weigert een bestand dat in de reserve zou komen, met uitleg", () => {
    const r = decideUpload(600 * MB, totaal, 550 * MB);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message).toMatch(/Te weinig ruimte/);
      expect(r.message).toMatch(/550 MB/);
      expect(r.message).toMatch(/er is niets geüpload/);
    }
  });
  it("weigert een groot videobestand op een bijna leeg volume van 1 GB", () => {
    expect(decideUpload(900 * MB, totaal, 2 * GB).ok).toBe(false);
  });
  it("zonder bekende grootte: toestaan zolang er boven de reserve nog ruimte is", () => {
    expect(decideUpload(300 * MB, totaal, 0).ok).toBe(true);
    expect(decideUpload(80 * MB, totaal, 0).ok).toBe(false);
  });
  it("weigert alles op een volledig volume", () => {
    expect(decideUpload(0, totaal, 1).ok).toBe(false);
    expect(decideUpload(0, totaal, 0).ok).toBe(false);
  });
});
