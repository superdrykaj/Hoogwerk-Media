import { describe, expect, it } from "vitest";

import { href, localeFromPath, stripLocale, switchPath } from "./locale";

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
