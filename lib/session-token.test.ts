import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "./session-token";

const SECRET = "een-geheim-van-ruim-genoeg-lengte";

describe("sessiecookie", () => {
  it("herkent een cookie dat het zelf heeft gemaakt", () => {
    expect(verifySessionToken(createSessionToken(SECRET), SECRET)).toBe(true);
  });

  it("wijst een cookie af dat met een ander geheim is ondertekend", () => {
    const token = createSessionToken("een-heel-ander-geheim-hier");
    expect(verifySessionToken(token, SECRET)).toBe(false);
  });

  it("wijst een cookie af waarvan de inhoud is aangepast", () => {
    const [, signature] = createSessionToken(SECRET).split(".");
    const vervalst = Buffer.from(
      JSON.stringify({ sub: "admin", exp: Date.now() + 3600000, jti: "x" }),
    ).toString("base64url");
    expect(verifySessionToken(`${vervalst}.${signature}`, SECRET)).toBe(false);
  });

  it("wijst een verlopen cookie af", () => {
    // Zelfde opbouw als createSessionToken, maar met een moment in het verleden.
    const body = Buffer.from(
      JSON.stringify({ sub: "admin", exp: Date.now() - 1000, jti: "x" }),
    ).toString("base64url");
    const token = createSessionToken(SECRET);
    const [, signature] = token.split(".");
    expect(verifySessionToken(`${body}.${signature}`, SECRET)).toBe(false);
  });

  it("wijst onzin af zonder te crashen", () => {
    for (const onzin of ["", ".", "geen-punt", "a.b", "..."]) {
      expect(verifySessionToken(onzin, SECRET)).toBe(false);
    }
  });
});
