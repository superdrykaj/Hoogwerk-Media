import { describe, expect, it } from "vitest";

import { copy } from "@/content/copy";
import { LOCALES } from "./locale";
import { SERVICE_PAGE_KEYS } from "./service-pages";

/** De sitenaam komt er automatisch achter: " | Hoogbeeld Media". */
const SUFFIX = " | Hoogbeeld Media".length;

describe("teksten van de dienstpagina's", () => {
  for (const locale of LOCALES) {
    describe(locale, () => {
      const pagina = (key: (typeof SERVICE_PAGE_KEYS)[number]) => copy(locale).servicePages[key];

      it("heeft titels en omschrijvingen van bruikbare lengte", () => {
        for (const key of SERVICE_PAGE_KEYS) {
          const p = pagina(key);
          expect(p.metaTitle.length + SUFFIX, `${key} titel`).toBeLessThanOrEqual(65);
          expect(p.metaTitle.length, `${key} titel`).toBeGreaterThan(20);
          expect(p.metaDescription.length, `${key} omschrijving`).toBeGreaterThanOrEqual(100);
          expect(p.metaDescription.length, `${key} omschrijving`).toBeLessThanOrEqual(160);
        }
      });

      it("heeft unieke titels, omschrijvingen en koppen", () => {
        const velden = ["metaTitle", "metaDescription", "h1", "lede"] as const;
        for (const veld of velden) {
          const waarden = SERVICE_PAGE_KEYS.map((key) => pagina(key)[veld]);
          expect(new Set(waarden).size, veld).toBe(waarden.length);
        }
      });

      it("heeft op elke pagina vragen, stappen en doelgroepen", () => {
        for (const key of SERVICE_PAGE_KEYS) {
          const p = pagina(key);
          expect(p.faq.length, `${key} vragen`).toBeGreaterThanOrEqual(4);
          expect(p.process.length, `${key} stappen`).toBe(4);
          expect(p.audience.length, `${key} doelgroepen`).toBe(3);
          expect(p.delivery.length, `${key} oplevering`).toBeGreaterThanOrEqual(2);
          expect(new Set(p.faq.map((f) => f.question)).size, `${key} dubbele vraag`).toBe(p.faq.length);
        }
      });

      it("belooft geen vergunningen, certificaten of resultaten", () => {
        const alles = JSON.stringify(SERVICE_PAGE_KEYS.map((key) => pagina(key))).toLowerCase();
        for (const woord of ["gecertificeerd", "certified", "garantie", "guarantee", "#1", "beste van", "recensie", "review"]) {
          expect(alles, woord).not.toContain(woord);
        }
      });
    });
  }

  it("heeft in beide talen evenveel onderdelen", () => {
    for (const key of SERVICE_PAGE_KEYS) {
      const nl = copy("nl").servicePages[key];
      const en = copy("en").servicePages[key];
      expect(en.faq.length, `${key} vragen`).toBe(nl.faq.length);
      expect(en.process.length, `${key} stappen`).toBe(nl.process.length);
      expect(en.audience.length, `${key} doelgroepen`).toBe(nl.audience.length);
      expect(en.delivery.length, `${key} oplevering`).toBe(nl.delivery.length);
      expect(en.limits.length, `${key} vliegen`).toBe(nl.limits.length);
      expect(en.intro.length, `${key} inleiding`).toBe(nl.intro.length);
    }
  });

  it("noemt dezelfde getallen in beide talen", () => {
    const getallen = (tekst: string) => (tekst.match(/\d+/g) ?? []).sort().join(",");
    for (const key of SERVICE_PAGE_KEYS) {
      const nl = copy("nl").servicePages[key];
      const en = copy("en").servicePages[key];
      expect(getallen(JSON.stringify([nl.process, nl.delivery, nl.limits, nl.faq])), key).toBe(
        getallen(JSON.stringify([en.process, en.delivery, en.limits, en.faq])),
      );
    }
  });

  it("verwijst vanaf de homepage naar een bestaande dienstpagina", () => {
    for (const locale of LOCALES) {
      for (const item of copy(locale).home.highlights) {
        if (item.page) expect(SERVICE_PAGE_KEYS).toContain(item.page);
      }
      const gelinkt = copy(locale).home.highlights.flatMap((i) => (i.page ? [i.page] : []));
      for (const key of SERVICE_PAGE_KEYS) expect(gelinkt, `${locale} ${key}`).toContain(key);
    }
  });

  it("heeft een homepage-kop met de hoofdzoektermen", () => {
    expect(copy("nl").home.heroTitle.toLowerCase()).toContain("dronefotografie");
    expect(copy("nl").home.heroTitle.toLowerCase()).toContain("dronevideo");
    expect(copy("nl").home.heroTitle).toContain("Zaandam");
    expect(copy("en").home.heroTitle.toLowerCase()).toContain("drone photography");
  });
});
