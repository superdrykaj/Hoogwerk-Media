/**
 * ============================================================================
 *  BEDRIJFSGEGEVENS
 * ============================================================================
 *  Hier staat wat in beide talen hetzelfde is: de bedrijfsnaam, de
 *  e-mailadressen, de KvK-gegevens, het logo en de categoriesleutels.
 *
 *  De teksten van de website staan per taal in content/copy.nl.ts en
 *  content/copy.en.ts. Zoek je een zin die op de site staat, dan staat die
 *  daar en niet hier.
 *
 *  De diensten en tarieven staan NIET hier maar in de beheeromgeving, zodat je
 *  ze kunt wijzigen zonder de site opnieuw te bouwen. De startwaarden staan in
 *  lib/example-data.ts.
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
   * Zakelijk WhatsApp-nummer, in internationale notatie zonder plus of spaties
   * (bijvoorbeeld "31612345678"). Laat leeg om de knop te verbergen.
   * Veel lokale opdrachtgevers appen liever dan dat ze mailen.
   */
  whatsapp: "" as string,

  /**
   * --------------------------------------------------------------------
   *  BEDRIJFSGEGEVENS
   * --------------------------------------------------------------------
   *  Vul in zodra je ze hebt. Wat leeg blijft, toont de site niet: je ziet
   *  dus nooit een lege regel of een placeholder staan.
   *
   *  Opdrachtgevers, en zeker gemeenten en aannemers, kijken hiernaar. Zonder
   *  KvK-nummer en verzekering kom je bij hen de poort niet door.
   */
  business: {
    /** KvK-nummer van de eenmanszaak. Voorbeeld: "12345678". */
    kvk: "" as string,
    /** BTW-identificatienummer. Laat leeg als je de KOR gebruikt. */
    vat: "" as string,
    /** Operatornummer van de RDW, begint met NLD. */
    droneOperator: "" as string,
    /** Naam van de verzekeraar voor de aansprakelijkheidsverzekering. */
    insurer: "" as string,
  },

  /** Instagram. Laat leeg om de link te verbergen. */
  instagram: "" as string,

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
   * Categorieën in het portfolio. De sleutel wordt in de database opgeslagen;
   * wijzig een bestaande sleutel dus niet zonder de projecten aan te passen.
   */
  categories: [
    { key: "vastgoed" },
    { key: "bedrijven" },
    { key: "bouw" },
    { key: "natuur" },
  ],
} as const;

export type CategoryKey = (typeof site.categories)[number]["key"];
