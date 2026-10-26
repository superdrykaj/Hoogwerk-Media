import { describe, expect, it } from "vitest";
import {
  getRedirectUrl,
  getRewrittenUrl,
  unstable_getResponseFromNextConfig,
} from "next/experimental/testing/server";
import nextConfig from "../next.config";

async function route(host: string, path: string) {
  return unstable_getResponseFromNextConfig({
    url: `https://${host}${path}`,
    headers: { host },
    nextConfig,
  });
}

describe("KwijtCalc op een eigen domein", () => {
  it.each(["/", "/berekening", "/beroep"])("serveert %s uit de statische export", async (path) => {
    const response = await route("www.kwijtcalc.nl", path);
    expect(getRewrittenUrl(response)).toBe(
      `https://www.kwijtcalc.nl/kwijtcalc${path === "/" ? "" : path}/index.html`,
    );
  });

  it.each(["/_next/static/chunks/app.js", "/pdf.worker.min.mjs", "/robots.txt", "/sitemap.xml", "/berekening/index.txt"])("houdt %s bij KwijtCalc", async (path) => {
    expect(getRewrittenUrl(await route("www.kwijtcalc.nl", path))).toBe(
      `https://www.kwijtcalc.nl/kwijtcalc${path}`,
    );
  });

  it("stuurt oude links door met behoud van queryparameters", async () => {
    const response = await route("hoogbeeldmedia.nl", "/kwijtcalc/beroep?bron=oud");
    expect(response.status).toBe(308);
    expect(getRedirectUrl(response)).toBe("https://www.kwijtcalc.nl/beroep?bron=oud");
  });

  it("stuurt het adres zonder www door", async () => {
    expect(getRedirectUrl(await route("kwijtcalc.nl", "/berekening"))).toBe(
      "https://www.kwijtcalc.nl/berekening",
    );
  });

  it.each(["/", "/admin", "/api/health", "/_next/static/chunks/app.js", "/robots.txt"])("laat Hoogbeeldmedia %s ongemoeid", async (path) => {
    const response = await route("hoogbeeldmedia.nl", path);
    expect(getRewrittenUrl(response)).toBeNull();
    expect(getRedirectUrl(response)).toBeNull();
  });
});
