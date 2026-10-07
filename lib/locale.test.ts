import { describe, expect, it } from "vitest";

import { href, localeFromPath, stripLocale, switchPath } from "./locale";
import {
  SERVICE_PAGES,
  servicePageKeyForEnglishPath,
  servicePageKeyForPath,
} from "./service-pages";

describe("localeFromPath", () => {
  it("herkent de Engelse paden", () => {
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/en/portfolio")).toBe("en");
  });

  it("houdt de rest Nederlands", () => {
    expect(localeFromPath("/")).toBe("nl");
    expect(localeFromPath("/portfolio")).toBe("nl");
    // Een pad dat toevallig met "en" begint is geen Engelse pagina.
    expect(localeFromPath("/evenementen")).toBe("nl");
    expect(localeFromPath("/english-project")).toBe("nl");
  });
});

describe("href", () => {
  it("laat Nederlandse paden ongemoeid", () => {
    expect(href("/", "nl")).toBe("/");
    expect(href("/contact", "nl")).toBe("/contact");
  });

  it("zet /en voor de Engelse paden", () => {
    expect(href("/", "en")).toBe("/en");
    expect(href("/contact", "en")).toBe("/en/contact");
    expect(href("/portfolio/herenhuis-aan-de-zaan", "en")).toBe(
      "/en/portfolio/herenhuis-aan-de-zaan",
    );
  });
});

describe("stripLocale en switchPath", () => {
  it("haalt het voorvoegsel eraf", () => {
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/en/contact")).toBe("/contact");
    expect(stripLocale("/contact")).toBe("/contact");
  });

  it("wisselt heen en weer zonder het pad te verliezen", () => {
    expect(switchPath("/portfolio", "en")).toBe("/en/portfolio");
    expect(switchPath("/en/portfolio", "nl")).toBe("/portfolio");
    expect(switchPath("/en", "nl")).toBe("/");
    expect(switchPath("/", "en")).toBe("/en");
  });
});

describe("dienstpagina's met een eigen Engelse naam", () => {
  it("vertaalt het adres in beide richtingen", () => {
    expect(href("/dronevideo-bedrijven", "en")).toBe("/en/business-drone-video");
    expect(href("/dronefotografie-vastgoed", "nl")).toBe("/dronefotografie-vastgoed");
    expect(stripLocale("/en/real-estate-drone-photography")).toBe(
      "/dronefotografie-vastgoed",
    );
    expect(switchPath("/en/construction-progress-drone", "nl")).toBe("/bouwvoortgang-drone");
    expect(switchPath("/bouwvoortgang-drone", "en")).toBe("/en/construction-progress-drone");
  });

  it("laat andere paden ongemoeid", () => {
    expect(stripLocale("/en/contact")).toBe("/contact");
    expect(stripLocale("/en/onbekend")).toBe("/onbekend");
  });

  it("geeft elke dienstpagina een uniek en conflictvrij adres", () => {
    const paden = Object.values(SERVICE_PAGES).flatMap((p) => [p.nl, p.en]);
    expect(new Set(paden).size).toBe(paden.length);
    for (const pad of paden) {
      expect(pad).toMatch(/^\/[a-z0-9-]+$/);
      // Bestaande routes mogen niet worden overschaduwd.
      expect(["/portfolio", "/contact", "/privacy", "/admin", "/api", "/en", "/oplevering"]).not.toContain(pad);
    }
    for (const dienst of Object.values(SERVICE_PAGES)) {
      expect(servicePageKeyForPath(dienst.nl)).not.toBeNull();
      expect(servicePageKeyForEnglishPath(dienst.en)).not.toBeNull();
    }
  });
});
