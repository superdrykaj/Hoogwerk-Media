/**
 * ============================================================================
 *  BEDRIJFSGEGEVENS EN WEBSITETEKSTEN
 * ============================================================================
 *  Dit bestand bevat alle vaste teksten en bedrijfsgegevens van de website.
 *  Pas hier aan en de wijziging is direct overal zichtbaar.
 *
 *  De diensten en tarieven staan NIET hier maar in de beheeromgeving, zodat je
 *  ze kunt wijzigen zonder de site opnieuw te bouwen. De startwaarden staan in
 *  lib/example-data.ts.
 * ============================================================================
 */

export const site = {
  /** Naam van het bedrijf, staat in het logo, de titels en de footer. */
  name: "Hoogbeeld Media",

  /** Regel uit het logo. Staat op de contactpagina en in de footer. */
  motto: "Een hoger perspectief",

  /** Korte zin onder het logo en in de zoekresultaten. */
  tagline: "Dronefotografie in Zaandam en Noord-Holland",

  /** Werkgebied, kort. Staat in de kop, de footer en de zoekresultaten. */
  region: "Zaandam en Noord-Holland",

  /**
   * De enige zin op de pagina "binnenkort online". Kort houden: zolang er nog
   * geen eigen werk staat, is elke extra belofte er één te veel.
   */
  soonLine:
    "Dronefotografie in Zaandam en Noord-Holland. De site is in aanbouw en " +
    "gaat binnenkort open.",

  /**
   * Werkgebied, uitgeschreven. Staat op de contactpagina, zodat bezoekers uit
   * de rest van de provincie zien dat ze ook bij je terechtkunnen.
   */
  regionDetail:
    "Zaandam en de Zaanstreek, en verder in Noord-Holland: Amsterdam, " +
    "Purmerend, Haarlem, Alkmaar, Hoorn en Beverwijk. Daarbuiten in overleg.",

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
    /** Regel over verzekering en bewijs van vakbekwaamheid, kort. */
    complianceNote:
      "Geregistreerd als drone-exploitant en verzekerd voor " +
      "aansprakelijkheid. Bewijzen stuur ik op verzoek mee.",
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

  /** Korte introductie op de homepage, onder de titel. */
  heroTitle: "Een hoger perspectief op jouw pand.",
  heroIntro:
    "Luchtfoto's en korte films van vastgoed, bedrijfsterreinen en bouw in de " +
    "Zaanstreek. Eén aanspreekpunt, oplevering binnen vijf werkdagen.",

  /** Harde feiten onder de hero. Kort, controleerbaar, geen marketing. */
  heroFacts: [
    "50 MP, 1-inch sensor",
    "4K HDR video",
    "Zaanstreek en Noord-Holland",
  ],

  /** Persoonlijke introductie op de contactpagina. */
  contactIntro:
    "Een pand, terrein of project dat vanuit de lucht beter tot zijn recht " +
    "komt? Stuur een bericht. Ik antwoord meestal binnen één werkdag.",

  /** Korte tekst in de footer. */
  footerNote:
    "Zelfstandig dronepiloot in Zaandam. Elke vlucht wordt vooraf getoetst " +
    "en bevestigd.",

  /**
   * Tekst die bezoekers uitlegt dat een boeking een aanvraag is.
   * Staat boven en onder de boekingsmodule.
   */
  bookingDisclaimer:
    "Een aanvraag is nog geen afspraak. Ik toets de locatie in GoDrone, kijk " +
    "naar het weer en bevestig daarna per e-mail.",

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

  /** Navigatie in de kop van de site. Volledig Nederlands. */
  nav: [
    { href: "/", label: "Start" },
    { href: "/portfolio", label: "Werk" },
    { href: "/contact", label: "Contact" },
  ],

  /**
   * Dienstenoverzicht op de homepage (alleen tekst; de prijzen staan bij de
   * diensten in de beheeromgeving).
   *
   * Evenementen staat er bewust niet bij. Met een C0-drone in de open
   * categorie mag je niet boven publiek vliegen, en een belofte die je moet
   * terugnemen kost meer dan de opdracht opbrengt. Bouwvordering staat er wel
   * bij: dezelfde route, elke maand opnieuw, en dus terugkerende omzet.
   */
  serviceHighlights: [
    {
      title: "Vastgoed",
      body: "Woningen en bedrijfspanden in hun omgeving. Voor Funda, website en verkoopbrochure.",
    },
    {
      title: "Bedrijfsterrein",
      body: "Overzicht van terrein, opslag en logistiek. Bruikbaar voor site, socials en presentaties.",
    },
    {
      title: "Bouwvordering",
      body: "Dezelfde route, elke maand opnieuw. Vaste beeldhoeken die de voortgang zichtbaar maken.",
    },
    {
      title: "Locaties en natuur",
      body: "Recreatieterreinen, jachthavens en polder, opgenomen op het juiste uur van de dag.",
    },
  ],

  /** Uitleg van de werkwijze op de homepage. Kort: vier stappen, vier regels. */
  process: [
    {
      title: "Kennismaken",
      body: "Kort gesprek over de locatie en het beeld dat je zoekt.",
    },
    {
      title: "Toetsen",
      body: "Ik check luchtruim, vergunning en weer, en bevestig een datum.",
    },
    {
      title: "Vliegen",
      body: "Zestig tot negentig minuten op locatie. Je hoeft er niet bij te zijn.",
    },
    {
      title: "Opleveren",
      body: "Bewerkte beelden via een downloadlink, binnen vijf werkdagen.",
    },
  ],

  /**
   * Wat er in een opdracht zit. Staat bij de tarieven, zodat een prijs nooit
   * los van zijn inhoud op de site staat.
   */
  included: [
    "Voorbereiding: luchtruimcheck, weer en route",
    "Zestig tot negentig minuten op locatie",
    "Selectie en nabewerking van de beelden",
    "Levering binnen vijf werkdagen",
    "Gebruiksrecht voor je eigen website en socials",
  ],

  /** Wat er niet standaard in zit. Voorkomt discussie achteraf. */
  excluded: [
    "Voorrijden buiten 25 km: € 0,45 per kilometer",
    "Wachttijd op locatie: € 65 per uur",
    "Gebruik voor print, advertenties of campagnes: in overleg",
    "Vluchten die alleen met een Specific-vergunning mogen",
  ],

  /**
   * Veelgestelde vragen. Bewust ook de lastige: wat je niet mag, telt zwaarder
   * dan wat je wel kunt. Pas dit aan zodra je papieren veranderen.
   */
  faq: [
    {
      question: "Mag je overal vliegen?",
      answer:
        "Nee. Ik toets elke locatie vooraf in GoDrone. Rond Schiphol, boven " +
        "Natura 2000-gebied en op sommige industrieterreinen mag het niet of " +
        "alleen met toestemming. Ik vlieg tot 120 meter en altijd in zicht.",
    },
    {
      question: "Vlieg je boven evenementen of drukte?",
      answer:
        "Niet boven publiek. Ik vlieg in de open categorie met een drone van " +
        "onder de 250 gram; daarmee mag ik niet over mensenmenigten. Een " +
        "evenement kan alleen als de locatie leeg is of met een " +
        "Specific-vergunning, en die heb ik nu niet.",
    },
    {
      question: "Hoe zit het met de privacy van de buren?",
      answer:
        "Ik richt op het pand en het terrein van de opdrachtgever, niet op " +
        "tuinen of ramen van anderen. Bij lage opnames in een woonwijk vlieg " +
        "ik liever tien meter hoger dan dat iemand zich bekeken voelt.",
    },
    {
      question: "En als het weer tegenzit?",
      answer:
        "Dan boeken we om, zonder kosten. Een lichte drone waait bij harde " +
        "wind weg van waar hij moet zijn; dat levert geen beeld op waar je " +
        "iets aan hebt. Ik beslis dat uiterlijk de avond ervoor.",
    },
    {
      question: "Wanneer heb ik de beelden?",
      answer:
        "Binnen vijf werkdagen, via een downloadlink. Heb je ze eerder nodig, " +
        "zeg het bij de aanvraag; vaak lukt de volgende dag ook.",
    },
    {
      question: "Wat mag ik met de beelden doen?",
      answer:
        "Je krijgt het recht ze te gebruiken op je eigen website en socials. " +
        "Het auteursrecht blijft bij mij. Wil je ze op een billboard, in een " +
        "advertentie of in een campagne, dan spreken we dat apart af.",
    },
  ],

  /**
   * Categorieën in het portfolio. De sleutel wordt in de database opgeslagen;
   * wijzig een bestaande sleutel dus niet zonder de projecten aan te passen.
   */
  categories: [
    { key: "vastgoed", label: "Vastgoed" },
    { key: "bedrijven", label: "Bedrijven" },
    { key: "bouw", label: "Bouwvordering" },
    { key: "natuur", label: "Natuur en locaties" },
  ],
} as const;

export type CategoryKey = (typeof site.categories)[number]["key"];

export function categoryLabel(key: string): string {
  return site.categories.find((c) => c.key === key)?.label ?? key;
}
