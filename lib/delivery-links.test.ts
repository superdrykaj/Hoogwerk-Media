import { describe, expect, it } from "vitest";

import { readSignature, signDownload, signedQuery, verifyDownload } from "./delivery-links";

const secret = "een-geheim-van-minstens-zestien-tekens";
const nu = Date.UTC(2026, 9, 24, 12, 0, 0);
const exp = Math.floor(nu / 1000) + 1800;

describe("ondertekende downloadlinks", () => {
  it("accepteert een correcte, niet verlopen link", () => {
    const s = signDownload("tokenA", { kind: "file", fileId: 7 }, exp, secret);
    expect(verifyDownload("tokenA", { kind: "file", fileId: 7 }, exp, s, secret, nu)).toBe("ok");
    const z = signDownload("tokenA", { kind: "zip" }, exp, secret);
    expect(verifyDownload("tokenA", { kind: "zip" }, exp, z, secret, nu)).toBe("ok");
  });

  it("meldt een verlopen link als verlopen, en niet als ongeldig", () => {
    const s = signDownload("tokenA", { kind: "zip" }, exp, secret);
    expect(verifyDownload("tokenA", { kind: "zip" }, exp, s, secret, nu + 1801 * 1000)).toBe("expired");
  });

  it("weigert een link voor een ander bestand, een andere soort of een ander token", () => {
    const s = signDownload("tokenA", { kind: "file", fileId: 7 }, exp, secret);
    expect(verifyDownload("tokenA", { kind: "file", fileId: 8 }, exp, s, secret, nu)).toBe("invalid");
    expect(verifyDownload("tokenA", { kind: "zip" }, exp, s, secret, nu)).toBe("invalid");
    expect(verifyDownload("tokenB", { kind: "file", fileId: 7 }, exp, s, secret, nu)).toBe("invalid");
  });

  it("weigert een verlengde verlooptijd en een andere sleutel", () => {
    const s = signDownload("tokenA", { kind: "zip" }, exp, secret);
    expect(verifyDownload("tokenA", { kind: "zip" }, exp + 86400, s, secret, nu)).toBe("invalid");
    expect(verifyDownload("tokenA", { kind: "zip" }, exp, s, "een-andere-sleutel-van-zestien", nu)).toBe("invalid");
  });

  it("weigert lege, afgekapte en geknoeide handtekeningen", () => {
    const s = signDownload("tokenA", { kind: "zip" }, exp, secret);
    for (const kapot of ["", "x", s.slice(0, -2), s + "a", s.replace(/.$/, s.endsWith("A") ? "B" : "A")]) {
      expect(verifyDownload("tokenA", { kind: "zip" }, exp, kapot, secret, nu)).toBe("invalid");
    }
    expect(verifyDownload("tokenA", { kind: "zip" }, Number.NaN, s, secret, nu)).toBe("invalid");
  });

  it("maakt een query die de route weer kan lezen", () => {
    const q = signedQuery("tokenA", { kind: "file", fileId: 3 }, secret, 30, nu);
    const params = new URLSearchParams(q);
    const lees = readSignature(params)!;
    expect(lees.expiresAtSec).toBe(exp);
    expect(verifyDownload("tokenA", { kind: "file", fileId: 3 }, lees.expiresAtSec, lees.signature, secret, nu)).toBe("ok");
    expect(readSignature(new URLSearchParams("e=abc&s=x"))).toBeNull();
    expect(readSignature(new URLSearchParams(""))).toBeNull();
  });
});
