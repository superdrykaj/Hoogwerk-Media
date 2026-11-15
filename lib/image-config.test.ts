import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

describe("afbeeldingsbreedtes", () => {
  const sizes = nextConfig.images?.deviceSizes ?? [];
  it("gaat niet verder dan de breedte van onze bronbeelden (1920 px)", () => {
    expect(Math.max(...sizes)).toBeLessThanOrEqual(1920);
  });
  it("heeft een stap op de breedte van de meeste foto's (1600 px) en kleine stappen voor telefoons", () => {
    expect(sizes).toContain(1600);
    expect(sizes).toContain(640);
  });
});
