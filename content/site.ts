/**
 * ============================================================================
 *  BEDRIJFSGEGEVENS
 * ============================================================================
 *  Hier staan de gegevens die in beide talen hetzelfde zijn: de bedrijfsnaam,
 *  de e-mailadressen, de apparatuur, het logo en de categorieën.
 *
 *  De teksten van de website staan per taal in content/copy.nl.ts en
 *  content/copy.en.ts. Zoek je een zin die op de site staat, dan staat die
 *  daar en niet hier.
 *
 *  LET OP: alle gegevens hieronder zijn FICTIEF en bedoeld als voorbeeld.
 *  Vervang ze door je echte gegevens voordat je de site publiceert.
 * ============================================================================
 */

export const site = {
  /** Naam van het bedrijf, staat in het logo, de titels en de footer. */
  name: "Hoogbeeld Media",

  /**
   * Algemeen e-mailadres. Dit staat op de site: in de footer, op de
   * contactpagina en in de privacyverklaring.
   */
  email: "info@hoogbeeldmedia.nl",

  /**
   * Adres voor aanvragen en afspraken. Hiernaartoe gaat de melding van een
   * nieuwe boeking, en hiervandaan komt de bevestiging naar de klant.
   * De omgevingsvariabele MAIL_TO gaat hierop voor.
   */
  bookingEmail: "boekingen@hoogbeeldmedia.nl",

  /**
   * Persoonlijk adres. Staat bewust niet op de site, zodat het niet door
   * spamverzamelaars wordt opgepikt. Gebruik het in je eigen correspondentie.
   */
  personalEmail: "kai@hoogbeeldmedia.nl",

  /**
   * Administratie: facturen en offertes. Staat niet op de site en wordt door
   * de website niet gebruikt; het staat hier zodat alle bedrijfsgegevens op
   * één plek te vinden zijn.
   */
  invoiceEmail: "facturen@hoogbeeldmedia.nl",

  /**
   * Telefoonnummer. Laat leeg ("") als je geen nummer wilt tonen.
   * Voorbeeld: "+31 6 12 34 56 78"
   */
  phone: "" as string,

  /**
   * Publieke URL van de website. Wordt gebruikt voor metadata en de sitemap.
   * Stel in productie NEXT_PUBLIC_SITE_URL in; die waarde gaat voor.
   *
   * Deze waarde wordt alleen op de server gelezen (layout, sitemap, robots),
   * en dus pas bij het draaien bepaald. Gebruik `site.url` niet in een
   * component met "use client": in die bundel wordt de waarde tijdens de
   * build vastgelegd en klopt hij na een wijziging niet meer.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** Apparatuur, genoemd op de over-sectie. */
  equipment: "DJI Mini 5 Pro",

  /**
   * Logo in de kop van de site.
   *
   * Zolang dit `null` is, wordt het ingebouwde beeldmerk getoond. Zet hier
   * het pad naar je eigen bestand zodra dat in `public/` staat, bijvoorbeeld:
   *
   *   logo: { src: "/logo-mark.png", width: 36, height: 36 },
   *
   * Gebruik een variant die leesbaar is op een donkere achtergrond, met een
   * doorzichtige rand. De naam ernaast blijft gewone tekst, zodat die
   * scherp blijft en door zoekmachines gelezen wordt.
   */
  logo: { src: "/logo-mark.png", width: 160, height: 160 } as
    | { src: string; width: number; height: number }
    | null,

  /**
   * Categorieën in het portfolio. De sleutel wordt in de database opgeslagen
   * en verandert dus niet mee met de taal; de woorden erbij staan per taal in
   * content/copy.nl.ts en content/copy.en.ts onder `portfolio.categories`.
   */
  categories: [
    { key: "vastgoed" },
    { key: "bedrijven" },
    { key: "evenementen" },
    { key: "natuur" },
  ],
} as const;

export type CategoryKey = (typeof site.categories)[number]["key"];
