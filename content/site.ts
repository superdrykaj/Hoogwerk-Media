/**
 * ============================================================================
 *  BEDRIJFSGEGEVENS EN WEBSITETEKSTEN
 * ============================================================================
 *  Dit bestand bevat alle vaste teksten en bedrijfsgegevens van de website.
 *  Pas hier aan en de wijziging is direct overal zichtbaar.
 *
 *  LET OP: alle gegevens hieronder zijn FICTIEF en bedoeld als voorbeeld.
 *  Vervang ze door je echte gegevens voordat je de site publiceert.
 * ============================================================================
 */

export const site = {
  /** Naam van het bedrijf, staat in het logo, de titels en de footer. */
  name: "Hoogbeeld Media",

  /** Korte zin onder het logo en in de zoekresultaten. */
  tagline: "Dronefotografie en dronevideo in Utrecht en omgeving",

  /** Werkgebied. */
  region: "Utrecht en omgeving",

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

  /** Korte introductie op de homepage, onder de titel. */
  heroTitle: "Een nieuw perspectief op jouw verhaal.",
  heroIntro:
    "Ik ben Kai, zelfstandig dronepiloot in Utrecht en omgeving. Ik maak lucht" +
    "foto's en luchtvideo's voor vastgoed, bedrijven, locaties en evenementen. " +
    "Van eerste gesprek tot oplevering heb je één aanspreekpunt: ik.",

  /** Persoonlijke introductie op de contactpagina. */
  contactIntro:
    "Heb je een locatie, een gebouw of een evenement dat vanuit de lucht beter " +
    "tot zijn recht komt? Stuur me gerust een bericht. Ik denk graag mee over " +
    "wat er mogelijk is, en ik antwoord meestal binnen één werkdag.",

  /** Korte tekst in de footer. */
  footerNote:
    "Zelfstandig dronepiloot. Elke opname wordt vooraf besproken en bevestigd.",

  /**
   * Tekst die bezoekers uitlegt dat een boeking een aanvraag is.
   * Staat boven en onder de boekingsmodule.
   */
  bookingDisclaimer:
    "Een opnamesessie is altijd eerst een aanvraag. Ik controleer de locatie, " +
    "de luchtruimregels en de weersverwachting en bevestig daarna per e-mail. " +
    "Je zit dus nergens aan vast tot je die bevestiging hebt.",

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

  /** Navigatie in de kop van de site. */
  nav: [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/contact", label: "Contact" },
  ],

  /** Dienstenoverzicht op de homepage (alleen tekst; prijzen staan bij de diensten). */
  serviceHighlights: [
    {
      title: "Vastgoed",
      body:
        "Woningen, bedrijfspanden en nieuwbouw vanuit de lucht. Beelden die " +
        "laten zien hoe een pand in zijn omgeving ligt.",
    },
    {
      title: "Bedrijven",
      body:
        "Sfeerbeelden van je terrein, productie of project. Bruikbaar voor je " +
        "website, socials en presentaties.",
    },
    {
      title: "Locaties en natuur",
      body:
        "Landschappen, recreatieterreinen en bijzondere plekken, opgenomen op " +
        "het juiste moment van de dag.",
    },
    {
      title: "Evenementen",
      body:
        "Een overzichtsbeeld van je evenement, in overleg en binnen de regels " +
        "die op de locatie gelden.",
    },
  ],

  /** Uitleg van de werkwijze op de homepage. */
  process: [
    {
      title: "Kennismaken",
      body:
        "In een kort gesprek bespreken we wat je nodig hebt, waar de locatie " +
        "ligt en welk beeld je voor ogen hebt.",
    },
    {
      title: "Plannen",
      body:
        "Ik controleer de locatie, de regels voor het luchtruim en de weers" +
        "verwachting en bevestig daarna een datum en tijd.",
    },
    {
      title: "Filmen",
      body:
        "Op locatie maak ik de opnames. Je kunt erbij zijn en meekijken, maar " +
        "dat hoeft niet.",
    },
    {
      title: "Opleveren",
      body:
        "Je ontvangt de bewerkte foto's en video's via een downloadlink, " +
        "meestal binnen vijf werkdagen.",
    },
  ],

  /** Categorieën in het portfolio. De sleutel wordt in de database opgeslagen. */
  categories: [
    { key: "vastgoed", label: "Vastgoed" },
    { key: "bedrijven", label: "Bedrijven" },
    { key: "evenementen", label: "Evenementen" },
    { key: "natuur", label: "Natuur en locaties" },
  ],
} as const;

export type CategoryKey = (typeof site.categories)[number]["key"];

export function categoryLabel(key: string): string {
  return site.categories.find((c) => c.key === key)?.label ?? key;
}
