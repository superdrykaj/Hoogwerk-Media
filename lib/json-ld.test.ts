import { describe, expect, it } from "vitest";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import {
  breadcrumbJsonLd,
  jsonLdString,
  organizationId,
  organizationJsonLd,
  serviceJsonLd,
} from "./json-ld";
import { videoObjectJsonLd } from "./video-schema";

const ORIGIN = "https://hoogbeeldmedia.nl";

describe("organizationJsonLd", () => {
  const org = organizationJsonLd({ origin: ORIGIN, description: "Test", locale: "nl" });

  it("bevat alleen gegevens die in content/site.ts staan", () => {
    expect(org["@type"]).toBe("Organization");
    expect(org["@id"]).toBe(organizationId(ORIGIN));
    expect(org.name).toBe(site.name);
    expect(org.url).toBe(`${ORIGIN}/`);
    expect(org.email).toBe(site.email);
    expect((org.logo as { url: string }).url).toBe(`${ORIGIN}/icon.png`);
  });

  it("verzint geen adres, telefoonnummer, kvk of profielen", () => {
    const json = JSON.stringify(org);
    expect(json).not.toContain("address");
    expect(json).not.toContain("streetAddress");
    expect(json).not.toContain("vatID");
    expect(json).not.toContain("taxID");
    if (!site.phone) expect(json).not.toContain("telephone");
    if (!site.instagram) expect(json).not.toContain("sameAs");
    // Het privéadres en de interne adressen staan er nooit in.
    expect(json).not.toContain(site.personalEmail);
    expect(json).not.toContain(site.invoiceEmail);
    expect(json).not.toContain(site.bookingEmail);
  });

  it("noemt het werkgebied zoals de tekst op de site dat doet", () => {
    const detail = copy("nl").region.detail;
    for (const plaats of site.workArea.filter((p) => p.type === "City")) {
      expect(detail, plaats.name).toContain(plaats.name);
      expect(copy("en").region.detail, plaats.name).toContain(plaats.name);
    }
    expect(detail).toContain("Zaanstreek");
    expect(detail).toContain("Noord-Holland");
    const gebieden = (org.areaServed as { name: string }[]).map((a) => a.name);
    expect(gebieden).toEqual(site.workArea.map((p) => p.name));
  });
});

describe("breadcrumbJsonLd en serviceJsonLd", () => {
  it("telt de posities op vanaf 1", () => {
    const lijst = breadcrumbJsonLd([
      { name: "Start", url: `${ORIGIN}/` },
      { name: "Vastgoed", url: `${ORIGIN}/dronefotografie-vastgoed` },
    ]);
    const items = lijst.itemListElement as { position: number; name: string; item: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1].item).toBe(`${ORIGIN}/dronefotografie-vastgoed`);
  });

  it("verwijst naar dezelfde organisatie als de homepage", () => {
    const dienst = serviceJsonLd({
      origin: ORIGIN,
      url: `${ORIGIN}/dronevideo-bedrijven`,
      name: "Dronevideo",
      description: "Test",
      locale: "nl",
    });
    expect((dienst.provider as { "@id": string })["@id"]).toBe(organizationId(ORIGIN));
    // Geen prijzen of beoordelingen in de markup: die staan op de pagina zelf.
    expect(JSON.stringify(dienst)).not.toMatch(/offers|aggregateRating|review|price/i);
  });
});

describe("jsonLdString", () => {
  it("laat geen tag sluiten vanuit de gegevens", () => {
    const tekst = jsonLdString({ name: "</script><script>alert(1)</script>" });
    expect(tekst).not.toContain("</script>");
    expect(JSON.parse(tekst).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("videoObjectJsonLd", () => {
  it("geeft niets terug zonder video", () => {
    expect(
      videoObjectJsonLd({ name: "x", description: "", thumbnailUrl: "", uploadDate: 0 }),
    ).toBeNull();
  });

  it("toont de gegevens van de zichtbare video", () => {
    const video = videoObjectJsonLd({
      name: "De Zaan in Wormerveer",
      description: "Beschrijving",
      thumbnailUrl: `${ORIGIN}/media/wormerveer-de-zaan-poster.webp`,
      uploadDate: Date.UTC(2026, 9, 1),
      contentUrl: `${ORIGIN}/media/wormerveer-de-zaan-dronevideo.mp4`,
    })!;
    expect(video["@type"]).toBe("VideoObject");
    expect(video.uploadDate).toBe("2026-10-01T00:00:00.000Z");
    expect(video.contentUrl).toBe(`${ORIGIN}/media/wormerveer-de-zaan-dronevideo.mp4`);
  });
});
