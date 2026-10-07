/**
 * ============================================================================
 *  NEDERLANDSE TEKSTEN
 * ============================================================================
 *  Alle zichtbare tekst van de website staat hier. De Engelse versie staat in
 *  copy.en.ts en heeft precies dezelfde sleutels; vergeet je er daar een, dan
 *  geeft `npm run typecheck` een foutmelding.
 *
 *  Bedrijfsgegevens (naam, e-mailadressen, logo) staan niet hier maar in
 *  content/site.ts, want die zijn in beide talen hetzelfde.
 * ============================================================================
 */
import type { ServicePageKey } from "@/lib/service-pages";

import { site } from "./site";

/** De tekst van één dienstpagina. Zie `servicePages` hieronder. */
export type ServicePageCopy = {
  metaTitle: string;
  metaDescription: string;
  /** Korte naam: kruimelpad, footer en koppelingen. */
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  /** Eén zin voor de verwijzing vanaf andere pagina's. */
  teaser: string;
  lede: string;
  intro: string[];
  audienceTitle: string;
  audience: { title: string; body: string }[];
  offerTitle: string;
  offerIntro: string;
  processTitle: string;
  process: { title: string; body: string }[];
  deliveryTitle: string;
  delivery: string[];
  limitsTitle: string;
  limits: string[];
  workTitle: string;
  workIntro: string;
  workNote: string;
  termsTitle: string;
  faqTitle: string;
  faq: { question: string; answer: string }[];
  ctaTitle: string;
  ctaBody: string;
};

export const nl = {
  /* -- Algemeen ------------------------------------------------------------ */
  taalnaam: "Nederlands",
  taalknop: "Bekijk deze pagina in het Engels",
  taalknopKort: "EN",

  /** Regel uit het logo. Staat op de contactpagina en in de footer. */
  motto: "Een hoger perspectief",

  /** De enige zin op de pagina "binnenkort online". */
  soonLine:
    "Dronefotografie in Zaandam en Noord-Holland. Binnenkort online.",
  soonBadge: "Binnenkort online",

  meta: {
    tagline: "Dronefotografie in Zaandam en Noord-Holland",
    description:
      `${site.name} maakt luchtfoto's en korte films van vastgoed, ` +
      `bedrijfsterreinen en bouw in Zaandam en Noord-Holland. ` +
      `Plan direct een afspraak.`,
    ogDescription:
      "Luchtfoto's en korte films van vastgoed, bedrijfsterreinen en bouw in " +
      "Zaandam en Noord-Holland.",
  },

  region: {
    short: "Zaandam en Noord-Holland",
    detail:
      "Zaandam en de Zaanstreek, en verder in Noord-Holland: Amsterdam, " +
      "Purmerend, Haarlem, Alkmaar, Hoorn en Beverwijk. Daarbuiten in overleg.",
  },

  /* -- Kop en voettekst ---------------------------------------------------- */
  nav: {
    home: "Start",
    portfolio: "Werk",
    contact: "Contact",
    privacy: "Privacy",
    book: "Plan een afspraak",
    admin: "Beheer",
    mainMenu: "Hoofdmenu",
    mobileMenu: "Mobiel menu",
    footerMenu: "Footermenu",
    menuOpen: "Menu openen",
    menuClose: "Menu sluiten",
    skipToContent: "Naar de hoofdinhoud",
    homeAria: `${site.name} — naar de homepage`,
    menuHeading: "Menu",
    servicesHeading: "Diensten",
    contactHeading: "Contact",
  },

  footer: {
    note:
      "Zelfstandig dronepiloot in Zaandam. Elke vlucht wordt vooraf getoetst en bevestigd.",
    workArea: "Werkgebied:",
    complianceNote:
      "Geregistreerd als drone-exploitant en verzekerd voor aansprakelijkheid. Bewijzen stuur ik op verzoek mee.",
    kvk: "KvK",
    vat: "BTW",
    operator: "Operatornummer",
    insurer: "Verzekerd bij",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    rights: (jaar: number) => `© ${jaar} ${site.name}`,
  },

  /* -- Homepage ------------------------------------------------------------ */
  home: {
    heroTitle: "Dronefotografie en dronevideo in Zaandam en Noord-Holland",
    /** De slogan van het bedrijf, als ondersteunende tekst onder de kop. */
    heroIntro:
      "Je locatie professioneel vanuit de lucht: luchtbeelden voor vastgoed, bedrijven en bouw.",
    heroCta: "Bespreek je project",
    heroWork: "Bekijk het werk",
    /**
     * Beschrijving van het achtergrondbeeld van de hero, voor wie de video
     * niet te zien krijgt.
     */
    heroPosterAlt:
      "Dronebeeld van een groene molen aan de Zaan op de Zaanse Schans.",
    /** Harde feiten onder de hero. Kort, controleerbaar, geen marketing. */
    heroFacts: ["50 MP, 1-inch sensor", "4K HDR video", "Zaanstreek en Noord-Holland"],

    servicesEyebrow: "Wat ik doe",
    servicesTitle: "Beeld dat op de grond niet past",
    /** `page` verwijst naar de dienstpagina (lib/service-pages.ts), zo die er is. */
    highlights: [
      { title: "Vastgoed", body: "Woningen en bedrijfspanden in hun omgeving. Voor Funda, website en verkoopbrochure.", page: "vastgoed" },
      { title: "Bedrijfsterrein", body: "Overzicht van terrein, opslag en logistiek. Bruikbaar voor site, socials en presentaties.", page: "bedrijven" },
      { title: "Bouwvoortgang", body: "Dezelfde route, elke maand opnieuw. Vaste beeldhoeken die de voortgang zichtbaar maken.", page: "bouw" },
      { title: "Locaties en natuur", body: "Recreatieterreinen, jachthavens en polder, opgenomen op het juiste uur van de dag.", page: "bedrijven" },
    ] as { title: string; body: string; page?: ServicePageKey }[],

    pricesTitle: "Diensten en tarieven",
    pricesNote: "Indicaties. De prijs spreken we vooraf samen af.",
    priceOnRequest: "Op aanvraag",
    duration: (minuten: number) => `${minuten} min`,
    introDuration: (minuten: number) => `kennismaking van ${minuten} min`,
    chooseMoment: "Een moment kiezen →",

    workEyebrow: "Werk",
    workTitle: "Bekijk mijn werk",
    workIntro:
      "Een selectie van dronebeelden boven stad, landschap en infrastructuur.",
    /** Wat een schermlezer van de videospeler te horen krijgt. */
    showreelLabel:
      "Showreel met dronebeelden boven stad, landschap en infrastructuur",
    showreelFallback: "Je browser kan deze video niet afspelen.",
    workAll: "Alles bekijken",
    workEmpty: "De eerste cases staan er binnenkort.",
    workEmptyHint: "De eerste cases komen hier te staan.",

    processEyebrow: "Zo werkt het",
    processTitle: "Van gesprek tot bestand",
    process: [
      { title: "Kennismaken", body: "Kort gesprek over de locatie en het beeld dat je zoekt." },
      { title: "Bevestiging", body: "Je krijgt datum en tijd per e-mail, met wat we hebben afgesproken." },
      { title: "Vliegen", body: "Zestig tot negentig minuten op locatie. Je hoeft er niet bij te zijn." },
      { title: "Opleveren", body: "Bewerkte beelden via een downloadlink, binnen vijf werkdagen." },
    ],

    bookingEyebrow: "Plan een afspraak",
    bookingTitle: "Kies een moment dat jou uitkomt",
    bookingDisclaimer:
      "Kies een dag en tijd, vertel kort waar het om gaat, en je krijgt een bevestiging per e-mail. Zit het weer tegen, dan verzetten we de afspraak zonder kosten.",
    timezoneNote: "Alle tijden in de Nederlandse tijdzone.",
    timezoneAsk: "Liever eerst overleggen?",
    timezoneLink: "Stuur een bericht",

    aboutEyebrow: "Over mij",
    aboutTitle: "Eén aanspreekpunt",
    aboutImageAlt:
      "Portret van Kai Koster, dronefotograaf van Hoogbeeld Media",
    /* -- Tarieven en vragen ------------------------------------------- */
    pricingEyebrow: "Tarieven",
    pricingTitle: "Tarieven voor foto en video",
    /** Staat direct onder de titel, vóór het overzicht. */
    pricingIntro:
      "Vanafprijzen inclusief 21% btw. De prijs exclusief btw staat eronder. De definitieve prijs en eventuele extra kosten spreken we vooraf samen af.",
    /** Korte variant, bij de prijzen in de boekingsmodule. */
    vatNote: "Prijzen zijn inclusief 21% btw; de prijs exclusief btw staat erbij.",
    /**
     * Hoofdprijs incl. btw met de excl.-btw-prijs eronder, per dienst-slug.
     * Alleen voor diensten met een vast startbedrag; "Kennismaking" (gratis)
     * en "Project op maat" (in overleg) staan hier bewust niet in.
     */
    packagePricing: {
      dronefotografie: [{ prefix: "Vanaf", amount: "€ 235,95", excl: "€ 195 excl. btw" }],
      dronevideo: [{ prefix: "Vanaf", amount: "€ 422,29", excl: "€ 349 excl. btw" }],
      bedrijfsfilm: [{ prefix: "Vanaf", amount: "€ 598,95", excl: "€ 495 excl. btw" }],
      bouwvordering: [
        { prefix: "Vervolgbezoek vanaf", amount: "€ 180,29", unit: "per bezoek", excl: "€ 149 excl. btw" },
        { prefix: "Eerste bezoek vanaf", amount: "€ 235,95", excl: "€ 195 excl. btw" },
      ],
    } as Record<string, { prefix: string; amount: string; unit?: string; excl: string }[]>,
    /** Staat achter het bedrag. */
    priceInclVat: "incl. btw",
    includedTitle: "Altijd inbegrepen",
    included: [
      "Voorbereiding en afstemming vooraf",
      "Selectie en nabewerking van de beelden",
      "Levering binnen vijf werkdagen",
      "Gebruiksrecht voor je eigen website en socials, en — bij vastgoed — voor Funda en de verkoopbrochure",
    ],
    excludedTitle: "Eventuele extra kosten",
    excluded: [
      {
        text: "Reiskosten: de eerste 25 km enkele reis vanuit Zaandam zijn inbegrepen. Extra kilometers worden voor heen én terug berekend tegen € 0,45 excl. btw per km.",
        detailsLabel: "Rekenvoorbeeld",
        details: "40 km enkele reis → 15 extra km × 2 × € 0,45 = € 13,50 excl. btw (€ 16,34 incl. btw). Gerekend wordt met de wegafstand; de btw wordt over het totaalbedrag berekend en afgerond op centen.",
      },
      { text: "Uitbreidingen zoals extra montage, correctierondes, een tweede videoformaat of voice-over: op aanvraag" },
      { text: "Wachttijd op locatie: € 78,65 incl. btw per uur", sub: "€ 65 excl. btw" },
      { text: "Gebruik in print, advertenties en grotere campagnes: vooraf in overleg" },
      { text: "Vluchten die een vergunning voor de categorie 'specific' vereisen: bied ik op dit moment niet aan" },
    ] as { text: string; sub?: string; detailsLabel?: string; details?: string }[],

    faqEyebrow: "Vragen",
    faqTitle: "Wat mag wel, en wat niet",
    faq: [
      { question: "Mag je overal vliegen?", answer: "Nee, en dat zoek ik vooraf voor je uit. Rond Schiphol, boven Natura 2000-gebied en op sommige industrieterreinen mag het niet of alleen met toestemming. Ik vlieg tot 120 meter en altijd in zicht." },
      { question: "Vlieg je boven evenementen of drukte?", answer: "Niet boven publiek. Ik vlieg in de open categorie met een drone van onder de 250 gram; daarmee mag ik niet over mensenmenigten. Een evenement kan alleen als de locatie leeg is of met een Specific-vergunning, en die heb ik nu niet." },
      { question: "Hoe zit het met de privacy van de buren?", answer: "Ik richt op het pand en het terrein van de opdrachtgever, niet op tuinen of ramen van anderen. Bij lage opnames in een woonwijk vlieg ik liever tien meter hoger dan dat iemand zich bekeken voelt." },
      { question: "En als het weer tegenzit?", answer: "Dan boeken we om, zonder kosten. Een lichte drone waait bij harde wind weg van waar hij moet zijn; dat levert geen beeld op waar je iets aan hebt. Ik beslis dat uiterlijk de avond ervoor." },
      { question: "Wanneer heb ik de beelden?", answer: "Binnen vijf werkdagen, via een downloadlink. Heb je ze eerder nodig, zeg het bij de aanvraag; vaak lukt de volgende dag ook." },
      { question: "Wat mag ik met de beelden doen?", answer: "Je krijgt het recht ze te gebruiken op je eigen website en socials. Het auteursrecht blijft bij mij. Wil je ze op een billboard, in een advertentie of in een campagne, dan spreken we dat apart af." },
    ],

    aboutBody: (regio: string, apparatuur: string) => [
      `Ik ben Kai, zelfstandig dronepiloot in ${regio}. Geen tussenpersonen: ` + "ik plan, ik vlieg en ik lever op.",
      `Ik vlieg met een ${apparatuur} — compact genoeg voor krappe locaties, ` + "met een sensor die ook in de schemering scherp blijft.",
    ],
  },

  /* -- Dienstpagina's ------------------------------------------------------ */
  /**
   * Eén blok per dienstpagina (zie lib/service-pages.ts voor de adressen). De
   * prijzen en voorwaarden staan hier bewust NIET: die komen uit
   * `home.packagePricing`, `home.included` en `home.excluded` en uit de diensten
   * in de beheeromgeving, zodat ze op alle pagina's gelijk blijven.
   */
  servicePageUi: {
    startLabel: "Start",
    breadcrumbLabel: "Kruimelpad",
    offerEyebrow: "Aanbod",
    processEyebrow: "Werkwijze",
    deliveryEyebrow: "Oplevering",
    limitsEyebrow: "Vliegen",
    workEyebrow: "Portfolio",
    termsEyebrow: "Tarieven",
    faqEyebrow: "Vragen",
    audienceEyebrow: "Voor wie",
    relatedTitle: "Andere diensten",
    allRates: "Alle tarieven en voorwaarden",
    workAll: "Bekijk het hele portfolio",
    asideTitle: "Plan een vlucht",
    asideBody:
      "Kies een moment in de agenda, of stel eerst een vraag. Een kennismaking van twintig minuten is gratis.",
    asideAsk: "Eerst een vraag stellen",
    moreAbout: "Lees meer",
  },
  servicePages: {
    vastgoed: {
      metaTitle: "Dronefotografie voor vastgoed in Zaandam",
      metaDescription:
        "Luchtfoto's van woningen en bedrijfspanden voor Funda, je website en de verkoopbrochure. Dronepiloot in Zaandam, werkgebied Noord-Holland.",
      breadcrumb: "Vastgoed",
      eyebrow: "Vastgoed",
      h1: "Dronefotografie voor vastgoed",
      teaser: "Luchtfoto's van woningen en bedrijfspanden in hun omgeving.",
      lede: "Een woning of bedrijfspand is op de grond nooit helemaal te vangen. Vanuit de lucht zie je de ligging, het perceel en de omgeving in één beeld.",
      intro: [
        "Ik ben Kai, zelfstandig dronepiloot in Zaandam. Voor vastgoed maak ik luchtfoto's van één object of terrein: het pand zelf, maar vooral hoe het in zijn omgeving ligt. Dat is vaak precies wat een kijker op een gewone foto mist.",
        "De beelden zijn bedoeld voor Funda, je eigen website en de verkoopbrochure. Ik kies de beste hoeken en werk de foto's na, zodat je een selectie ontvangt en geen bak losse opnames.",
      ],
      audienceTitle: "Voor wie is dit?",
      audience: [
        {
          title: "Makelaars en verkopers",
          body: "Een woning of pand waarvan de ligging een argument is: aan het water, met een diepe tuin of in een groene omgeving.",
        },
        {
          title: "Verhuurders en beleggers",
          body: "Bedrijfspanden, kantoren en complexen waarbij parkeren, bereikbaarheid en omgeving ertoe doen.",
        },
        {
          title: "Eigenaren en beheerders",
          body: "Een overzicht van je eigen pand of terrein voor je website, een brochure of een presentatie.",
        },
      ],
      offerTitle: "Wat je krijgt",
      offerIntro:
        "Twee pakketten passen bij vastgoed. Kies alleen de foto's, of voeg een korte film toe voor je website of social media. Wat erbij hoort en wat het kost, staat hieronder.",
      processTitle: "Zo werkt het",
      process: [
        { title: "Kennismaken", body: "Je vertelt me over het object en waar de beelden voor zijn. Dat kan in een gratis videogesprek van maximaal 20 minuten, of via het boekingsformulier." },
        { title: "Voorbereiding", body: "Ik controleer de locatie, de regels voor het luchtruim en de weersverwachting. Daarna bevestig ik datum en tijd per e-mail; pas dan is de afspraak definitief." },
        { title: "Vliegen", body: "Tot 60 minuten op locatie voor de fotoreportage, tot 90 minuten als er ook een film bij zit. Je hoeft er niet bij te zijn. Ik richt op het pand en het perceel, niet op de tuinen en ramen van de buren." },
        { title: "Opleveren", body: "Je krijgt de bewerkte beelden via een downloadlink, binnen vijf werkdagen." },
      ],
      deliveryTitle: "Oplevering en gebruik",
      delivery: [
        "Je ontvangt een link waarmee je de beelden downloadt. Heb je ze eerder nodig, bijvoorbeeld omdat een woning binnenkort op de markt komt, zeg het dan bij je aanvraag; vaak lukt het de volgende dag ook.",
        "Gebruik op je eigen website en social media is inbegrepen, en bij vastgoed ook op Funda en in de verkoopbrochure. Het auteursrecht blijft bij mij. Wil je de beelden in advertenties, print of een grotere campagne gebruiken, dan spreken we dat vooraf apart af.",
        "Via de downloadlink kun je een wijziging aanvragen. Bij het pakket met korte film is één correctieronde inbegrepen; extra correctierondes zijn een uitbreiding op aanvraag.",
      ],
      limitsTitle: "Waar ik kan vliegen",
      limits: [
        "Niet overal mag een drone vliegen. Rond Schiphol, boven Natura 2000-gebied en op sommige industrieterreinen mag het niet of alleen met toestemming. Ik zoek dat vooraf voor je uit en laat je weten of en hoe het kan. Ik vlieg tot 120 meter hoogte en altijd binnen zicht.",
        "In een woonwijk of bij een pand tussen andere bebouwing blijf ik uit de buurt van tuinen en ramen van anderen. Bij een lage opname vlieg ik liever wat hoger dan dat iemand zich bekeken voelt.",
      ],
      workTitle: "Een voorbeeld uit mijn portfolio",
      workIntro:
        "Zo kijken mijn luchtbeelden van een woonomgeving eruit: een film en foto's van IJburg in Amsterdam.",
      workNote:
        "Dit is een vrije portfolio-opname van de wijk, geen opdracht van een verkoper of makelaar.",
      termsTitle: "Tarieven en voorwaarden",
      faqTitle: "Veelgestelde vragen over vastgoedfotografie",
      faq: [
        { question: "Hoeveel foto's krijg ik van een woning?", answer: "Bij de dronefotoreportage zijn dat 10 tot 15 bewerkte luchtfoto's van één object of terrein, met tot 60 minuten op locatie. Heb je meer nodig, bijvoorbeeld voor meerdere panden, dan bespreken we dat vooraf." },
        { question: "Kan ik de foto's op Funda plaatsen?", answer: "Ja. Gebruik op Funda en in de verkoopbrochure zit bij vastgoed in de prijs, net als gebruik op je eigen website en social media. Het auteursrecht blijft bij mij. Voor advertenties, print of grotere campagnes maken we vooraf aparte afspraken." },
        { question: "Moet ik erbij zijn tijdens de vlucht?", answer: "Nee. Het is wel prettig als de bewoner of verkoper weet dat ik kom, zodat niemand schrikt van een drone boven het huis. De toegang tot de locatie stemmen we vooraf af." },
        { question: "Kan er ook gevlogen worden bij een woning vlak bij Schiphol of in een natuurgebied?", answer: "Dat hangt af van de precieze locatie. Rond Schiphol en boven Natura 2000-gebied mag het niet of alleen met toestemming. Ik controleer dat vooraf; kan het niet, dan hoor je dat voordat ik kom en bespreken we wat wel mogelijk is." },
        { question: "Wat is het beste moment om te fotograferen?", answer: "Dat hangt van het object af. We kiezen samen een moment, en ik kijk de dagen ervoor naar het weer. Is het te winderig of te nat, dan boeken we zonder kosten om. Ik beslis dat uiterlijk de avond ervoor." },
        { question: "Wat kost een fotoreportage?", answer: "De prijzen staan in het overzicht hierboven, met en zonder btw. De eerste 25 km enkele reis vanuit Zaandam zijn inbegrepen; extra kilometers reken ik door." },
      ],
      ctaTitle: "Een pand in beeld brengen?",
      ctaBody: "Plan direct een moment, of stuur me eerst een bericht met wat je zoekt.",
    },

    bedrijven: {
      metaTitle: "Dronevideo voor bedrijven en locaties",
      metaDescription:
        "Korte dronefilms van bedrijfsterreinen, jachthavens en andere locaties, voor je website, socials en presentaties. Zaandam en Noord-Holland.",
      breadcrumb: "Dronevideo",
      eyebrow: "Bedrijven en locaties",
      h1: "Dronevideo voor bedrijven en locaties",
      teaser: "Korte films van terreinen, jachthavens en andere locaties.",
      lede: "Met een korte film vanuit de lucht laat je zien hoe een terrein, haven of bedrijfspand in elkaar zit en hoe het in zijn omgeving ligt.",
      intro: [
        "Ik ben Kai, zelfstandig dronepiloot in Zaandam. Ik film bedrijfsterreinen, recreatieterreinen, jachthavens en andere locaties en monteer er een korte film van die je op je website, socials en in presentaties kunt gebruiken.",
        "Het gaat om één terrein, locatie of project per film. Zo blijft het verhaal helder: wat is dit voor plek, hoe groot is het en wat ligt er omheen.",
      ],
      audienceTitle: "Voor wie is dit?",
      audience: [
        {
          title: "Bedrijven met een terrein",
          body: "Opslag, logistiek of een bedrijfspand met veel buitenruimte: een overzicht dat op de grond niet te maken is.",
        },
        {
          title: "Jachthavens en recreatieterreinen",
          body: "Locaties waar ligging en omgeving het verhaal zijn, opgenomen op het juiste uur van de dag.",
        },
        {
          title: "Organisaties en projecten",
          body: "Een project of locatie die je wilt laten zien aan klanten, bewoners of relaties.",
        },
      ],
      offerTitle: "Wat je krijgt",
      offerIntro:
        "Twee pakketten, afhankelijk van hoeveel film je nodig hebt. Gaat het om meerdere locaties of opnamedagen, dan is een project op maat beter; dat begint met een gratis kennismaking.",
      processTitle: "Zo werkt het",
      process: [
        { title: "Kennismaken", body: "We bespreken de locatie, wat je wilt laten zien en waar de film voor dient. Dat kan in een gratis videogesprek van maximaal 20 minuten." },
        { title: "Voorbereiding", body: "Ik controleer de locatie, de regels voor het luchtruim en de weersverwachting, en kies de route en het moment van de dag. Je krijgt een bevestiging per e-mail." },
        { title: "Filmen", body: "Tot 90 minuten op locatie. Je hoeft er niet bij te zijn. Ik vlieg niet boven mensen, dus op een terrein waar gewerkt wordt, stemmen we het moment vooraf af." },
        { title: "Monteren en opleveren", body: "Ik selecteer de beste fragmenten en monteer ze met passende muziek met gebruikslicentie. Je krijgt de film via een downloadlink, binnen vijf werkdagen." },
      ],
      deliveryTitle: "Oplevering en gebruik",
      delivery: [
        "De film duurt 30 tot 45 seconden bij het pakket foto en korte film, en 60 tot 90 seconden bij de drone-sfeerfilm. Je ontvangt hem met een downloadlink; heb je hem eerder nodig, zeg het dan bij je aanvraag.",
        "Bij beide filmpakketten is één correctieronde inbegrepen. Extra montage, nog een correctieronde, een tweede videoformaat (bijvoorbeeld staand voor social media) of een voice-over zijn uitbreidingen die ik op aanvraag offreer.",
        "Gebruik op je eigen website en social media is inbegrepen. Wil je de film in advertenties, print of een grotere campagne inzetten, laat het me dan vooraf weten; dan spreken we de voorwaarden apart af.",
      ],
      limitsTitle: "Wat wel en niet kan",
      limits: [
        "Ik vlieg in de open categorie met een drone van onder de 250 gram, tot 120 meter hoogte en altijd binnen zicht. Daarmee vlieg ik niet boven mensenmenigten. Een evenement, open dag of drukte op het terrein kan dus alleen als het gebied tijdens de opname leeg is. Vluchten die een vergunning voor de categorie 'specific' vereisen, bied ik op dit moment niet aan.",
        "Rond Schiphol, boven Natura 2000-gebied en op sommige industrieterreinen mag het niet of alleen met toestemming. Ik zoek dat vooraf voor je uit en laat je weten wat wel kan.",
      ],
      workTitle: "Dronefilms uit mijn portfolio",
      workIntro:
        "Drie locatiefilms uit de Zaanstreek en Amsterdam. Zo kijk je mee met mijn camerawerk en montage.",
      workNote:
        "Dit zijn vrije portfolio-opnames van locaties, geen betaalde opdrachten van bedrijven.",
      termsTitle: "Tarieven en voorwaarden",
      faqTitle: "Veelgestelde vragen over dronevideo",
      faq: [
        { question: "Hoe lang duurt de film?", answer: "Bij foto en korte film krijg je een clip van 30 tot 45 seconden, bij de drone-sfeerfilm een film van 60 tot 90 seconden. Het gaat steeds om één terrein, locatie of project." },
        { question: "Zit er muziek in de film?", answer: "Ja, passende muziek met gebruikslicentie. Wil je de film voor meer gebruiken dan je eigen website en social media, laat dat dan weten voordat je boekt." },
        { question: "Kan ik een film van meerdere locaties laten maken?", answer: "Dat is een project op maat. Het begint met een gratis kennismaking waarin we de locaties, het aantal opnamedagen en de planning bespreken. Daarna krijg je een offerte." },
        { question: "Kun je filmen terwijl er gewerkt wordt of een evenement is?", answer: "Niet boven publiek of drukte; daarvoor is mijn drone niet bedoeld. Voor beeld van het terrein zelf plannen we de vlucht liever op een moment dat het rustig is of het gebied vrij is." },
        { question: "Kan ik ook alleen foto's laten maken?", answer: "Ja. Bij de dronefotoreportage krijg je 10 tot 15 bewerkte luchtfoto's van één object of terrein, zonder film." },
        { question: "Wat kost een dronefilm?", answer: "De prijzen staan in het overzicht hierboven, met en zonder btw. De eerste 25 km enkele reis vanuit Zaandam zijn inbegrepen; extra kilometers reken ik door." },
      ],
      ctaTitle: "Een locatie in beweging brengen?",
      ctaBody: "Plan een kennismaking van twintig minuten, gratis en vrijblijvend, of stuur me een bericht over je locatie.",
    },

    bouw: {
      metaTitle: "Bouwvoortgang vastleggen met dronebeelden",
      metaDescription:
        "Dronebeelden van je bouwproject vanaf vaste standpunten, bezoek na bezoek vergelijkbaar. Voor aannemers, ontwikkelaars en opdrachtgevers in Noord-Holland.",
      breadcrumb: "Bouwvoortgang",
      eyebrow: "Bouwvoortgang",
      h1: "Bouwvoortgang met dronebeelden",
      teaser: "Dezelfde standpunten, bezoek na bezoek, voor een duidelijke reeks.",
      lede: "Dezelfde standpunten, bezoek na bezoek. Zo zie je naast elkaar wat er sinds de vorige keer is gebouwd.",
      intro: [
        "Ik ben Kai, zelfstandig dronepiloot in Zaandam. Bij bouwvoortgang vlieg ik periodiek hetzelfde project en neem ik telkens op vanaf dezelfde standpunten en hoogtes. Zo krijg je een reeks beelden die je eenvoudig naast elkaar legt.",
        "Het ritme bepaal je zelf, bijvoorbeeld elke maand of bij belangrijke bouwfasen. Het eerste bezoek bevat de eerste voorbereiding en het vastleggen van de standpunten; de vervolgbezoeken zijn daardoor voordeliger.",
      ],
      audienceTitle: "Voor wie is dit?",
      audience: [
        {
          title: "Aannemers en uitvoerders",
          body: "Een vast beeld van de voortgang voor je dossier, je rapportage of je eigen website.",
        },
        {
          title: "Projectontwikkelaars en opdrachtgevers",
          body: "Laat kopers, investeerders of bewoners zien hoe het project vordert.",
        },
        {
          title: "Communicatie rond het project",
          body: "Beelden voor nieuwsbrieven, socials of een projectpagina, zonder dat je zelf een drone hoeft te regelen.",
        },
      ],
      offerTitle: "Wat je krijgt",
      offerIntro:
        "De dienst bestaat uit een eerste bezoek en vervolgbezoeken. Bij elk bezoek krijg je 5 tot 10 bewerkte beelden. Gaat het om meerdere bouwlocaties of een uitgebreider plan, dan is een project op maat beter.",
      processTitle: "Zo werkt het",
      process: [
        { title: "Eerste bezoek", body: "We kiezen samen de standpunten en hoogtes, in overleg met wie op de bouwplaats de leiding heeft. De eerste voorbereiding zit in dit bezoek." },
        { title: "Voorbereiding", body: "Voor elk bezoek controleer ik het luchtruim, de weersverwachting en wat er op de bouwplaats staat, zoals kranen en bouwverkeer. Je krijgt een bevestiging per e-mail." },
        { title: "Vliegen", body: "Maximaal 45 minuten op locatie. Ik vlieg tot 120 meter, altijd binnen zicht en niet boven groepen mensen. Op een bouwplaats stemmen we het moment daarom af op het werk." },
        { title: "Opleveren", body: "Je krijgt 5 tot 10 bewerkte beelden per bezoek, via een downloadlink, binnen vijf werkdagen." },
      ],
      deliveryTitle: "Oplevering en gebruik",
      delivery: [
        "Na elk bezoek ontvang je de bewerkte beelden via een downloadlink. Omdat de standpunten vastliggen, zijn de beelden van verschillende bezoeken zo goed mogelijk met elkaar te vergelijken.",
        "Gebruik op je eigen website en social media is inbegrepen. Wil je de beelden in print, advertenties of een grotere campagne gebruiken, dan spreken we dat vooraf apart af.",
      ],
      limitsTitle: "Wat je moet weten over vliegen boven een bouwplaats",
      limits: [
        "Voor het opstijgen heb ik toestemming nodig van de opdrachtgever of de beheerder van het terrein. Kranen, hijswerk en bouwverkeer neem ik mee in de voorbereiding.",
        "Rond Schiphol, boven Natura 2000-gebied en op sommige industrieterreinen mag het niet of alleen met toestemming. Ik zoek dat vooraf voor je uit. Ik vlieg in de open categorie met een drone van onder de 250 gram; daarmee vlieg ik niet boven mensenmenigten.",
      ],
      workTitle: "Zo zien mijn luchtbeelden eruit",
      workIntro:
        "Een bouwreeks staat nog niet in mijn portfolio. Wil je zien hoe ik een wijk vanuit de lucht vastleg, bekijk dan dit voorbeeld.",
      workNote:
        "Dit is een vrije portfolio-opname van IJburg in Amsterdam, geen opdracht en geen bouwvoortgangsreeks.",
      termsTitle: "Tarieven en voorwaarden",
      faqTitle: "Veelgestelde vragen over bouwvoortgang",
      faq: [
        { question: "Hoe vaak komt de drone langs?", answer: "Dat bepaal je zelf, bijvoorbeeld elke maand of bij belangrijke bouwfasen. We spreken het ritme af bij het eerste bezoek." },
        { question: "Zijn de beelden van verschillende bezoeken echt te vergelijken?", answer: "We leggen de standpunten en hoogtes bij het eerste bezoek vast en ik vlieg ze daarna opnieuw. De hoeken komen zo dicht mogelijk bij elkaar. Op de centimeter exact hangt een drone nooit twee keer op dezelfde plek; voor het volgen van de voortgang is dat ook niet nodig." },
        { question: "Wat kost een vervolgbezoek?", answer: "Het eerste bezoek en het vervolgbezoek hebben elk een eigen vanafprijs; je vindt ze in het overzicht hierboven, met en zonder btw. De eerste voorbereiding zit in het eerste bezoek, daarom zijn vervolgbezoeken voordeliger." },
        { question: "Kan er gevlogen worden terwijl er gewerkt wordt?", answer: "Ja, maar niet boven groepen mensen. Ik stem het moment af met de uitvoerder, bijvoorbeeld tijdens de pauze of wanneer het gebied onder de drone vrij is." },
        { question: "Heb ik toestemming nodig om op een bouwplaats te vliegen?", answer: "Voor het opstijgen heb ik toestemming nodig van de opdrachtgever of de beheerder van het terrein. Op sommige plekken mag het niet of alleen met toestemming van een autoriteit, zoals rond Schiphol; dat zoek ik vooraf uit." },
        { question: "En als het weer tegenzit?", answer: "Dan verzetten we het bezoek zonder kosten. Ik beslis dat uiterlijk de avond ervoor." },
      ],
      ctaTitle: "Een bouwproject in beeld houden?",
      ctaBody: "Plan een kennismaking van twintig minuten, gratis en vrijblijvend, of stuur me een bericht over je project.",
    },
  } satisfies Record<ServicePageKey, ServicePageCopy>,

  /* -- Portfolio ----------------------------------------------------------- */
  portfolio: {
    metaTitle: "Portfolio dronefoto's en dronevideo's",
    metaDescription:
      `Werk van ${site.name}: dronefoto's en dronevideo's voor vastgoed, bedrijven, evenementen, natuur en locaties in Zaandam en Noord-Holland.`,
    eyebrow: "Portfolio",
    title: "Werk vanuit de lucht",
    /** Alleen voor schermlezers en zoekmachines: de kop boven de projectkaarten. */
    listTitle: "Alle projecten",
    intro: (regio: string) =>
      `Werk uit ${regio}. Filter op het soort opdracht.`,
    noticeBefore: "Een deel van het werk is ter illustratie.",
    noticeStrong: "",
    noticeAfter:
      "",
    empty: "Er zijn nog geen projecten gepubliceerd.",
    emptyAction: "Neem contact op",
    ctaTitle: "Ook zo'n project laten maken?",
    ctaBody:
      "Vertel me wat je voor ogen hebt. Een kennismaking van twintig minuten is gratis en vrijblijvend.",
    ctaAsk: "Stel een vraag",

    filterLabel: "Filter projecten op categorie",
    filterAll: "Alles",
    count: (aantal: number) =>
      `${aantal} ${aantal === 1 ? "project" : "projecten"}`,
    countEmpty: "Geen projecten in deze categorie.",
    categoryEmpty: "Nog niets in deze categorie.",
    showAll: "Toon alle projecten",
    categories: { vastgoed: "Vastgoed", bedrijven: "Bedrijven", bouw: "Bouwvoortgang", natuur: "Natuur en locaties" } as Record<string, string>,
    previewOpen: (titel: string) => `Voorbeeld van ${titel} bekijken`,
    previewClose: "Voorbeeld sluiten",
  },

  project: {
    notFound: "Project niet gevonden",
    metaDescription: (locatie: string) =>
      `Project van ${site.name} in ${locatie}.`,
    breadcrumb: "Kruimelpad",
    exampleChip: "Illustratie",
    coverAlt: (titel: string) => `Beeld van ${titel}`,
    cardLink: "Bekijk project",
    cardNoImage: "Nog geen afbeelding",
    asideTitle: "Ook zo'n project laten maken?",
    asideBody: "Vertel me over je locatie en je plannen. Ik denk graag mee.",
    asideAsk: "Eerst een vraag stellen",
    videoTitle: "Video",
    videoFallback: "Je browser kan deze video niet afspelen.",
    videoOf: (titel: string) => `Video van ${titel}`,
    videoEmpty: "Hier komt de video van dit project.",
    videoEmptyHint:
      "Voeg in de beheeromgeving een YouTube- of Vimeo-link toe bij dit project.",
    galleryTitle: "Fotogalerij",
    moreTitle: "Meer werk",
  },

  gallery: {
    open: (nummer: number) => `Foto ${nummer} vergroten`,
    close: "Sluiten",
    previous: "Vorige foto",
    next: "Volgende foto",
    counter: (huidig: number, totaal: number) => `Foto ${huidig} van ${totaal}`,
  },

  /* -- Contact ------------------------------------------------------------- */
  contact: {
    metaTitle: "Contact met je dronepiloot in Zaandam",
    metaDescription: `Neem contact op met ${site.name} voor dronefoto's en korte films in Zaandam en Noord-Holland. Stuur een bericht of plan een kennismaking.`,
    eyebrow: "Contact",
    title: "Even sparren?",
    intro:
      "Een pand, terrein of project dat vanuit de lucht beter tot zijn recht komt? Stuur een bericht. Ik antwoord meestal binnen één werkdag.",
    emailLabel: "E-mail",
    phoneLabel: "Telefoon",
    areaLabel: "Werkgebied",
    bookLabel: "Liever meteen een moment prikken?",
    whatsappLabel: "WhatsApp",
    whatsappLink: "Stuur een bericht",
    privacyBefore: "Lees in de",
    privacyLink: "privacyverklaring",
    privacyAfter: "hoe met je gegevens wordt omgegaan.",
    formTitle: "Stuur een bericht",
    formIntro: "Vul het formulier in en ik reageer meestal binnen één werkdag.",
  },

  /* -- Foutpagina ---------------------------------------------------------- */
  notFound: {
    title: "Pagina niet gevonden",
    body:
      "Deze pagina bestaat niet (meer). Misschien is de link verouderd of is er een typefout in het adres geslopen.",
    home: "Naar de homepage",
    portfolio: "Bekijk het portfolio",
  },

  /* -- Boekingsmodule ------------------------------------------------------ */
  booking: {
    steps: ["Dienst", "Datum", "Tijd", "Gegevens", "Controle"],
    stepService: "Wat wil je laten maken?",
    stepDate: "Kies een datum",
    stepTime: "Kies een tijd",
    stepDetails: "Jouw gegevens",
    stepReview: "Controleer je aanvraag",

    introService:
      "Kies de dienst die het beste past. Twijfel je? Begin met een gratis kennismaking.",
    introDate: "Alleen dagen met vrije tijden zijn te kiezen. Tijden in Europe/Amsterdam.",
    introDateCustom:
      "Kies een dag voor de kennismaking. De opnamedagen zelf plannen we in dat gesprek.",
    introDetails:
      "Ik gebruik deze gegevens alleen om contact met je op te nemen over deze aanvraag.",
    introDetailsCustom:
      "Vertel me kort waar het project uit bestaat, dan kan ik me op het gesprek voorbereiden.",
    introReview: "Klopt alles? Dan kun je de aanvraag versturen.",

    introChip: "Begint met een kennismaking",
    minutes: (aantal: number) => `${aantal} min`,

    prev: "← Eerder",
    next: "Later →",
    loading: "Beschikbare tijden worden geladen…",
    loadFailed: "Laden mislukt",
    loadError: "De beschikbare tijden konden niet worden geladen. Probeer het opnieuw.",
    retry: "Opnieuw proberen",
    noDays: "Geen vrije dagen in deze periode",
    noDaysBody:
      "Kijk verder vooruit met de knop 'Later', of stuur me een bericht als je iets specifieks zoekt.",
    noDaysAction: "Later kijken →",
    noTimes: "Geen vrije tijden op deze dag",
    noTimesBody: "Kies een andere datum.",
    backToDates: "Terug naar de datums",
    times: (aantal: number) => `${aantal} ${aantal === 1 ? "tijd" : "tijden"}`,

    toReview: "Naar het overzicht",
    back: "Terug",
    submit: "Aanvraag versturen",
    submitting: "Bezig met versturen…",
    editDetails: "Gegevens aanpassen",

    rowService: "Dienst",
    rowWhen: "Wanneer",
    rowIntro: "Kennismaking",
    rowDuration: "Duur",
    rowDurationValue: (minuten: number) => `${minuten} minuten`,
    rowPrice: "Indicatie",
    rowName: "Naam",
    rowEmail: "E-mail",
    rowPhone: "Telefoon",
    rowLocation: "Opnamelocatie",
    rowLocations: (aantal: number) => `Locaties (${aantal})`,
    rowSessions: "Opnamemomenten",
    rowPeriod: "Gewenste periode",
    rowPreference: "Voorkeur",
    rowProject: "Project",
    customDisclaimer:
      "Je plant hiermee de kennismaking. Daarin bespreken we de locaties, het aantal opnamedagen en de planning; daarna leg ik de opnamedagen vast.",

    noServices: "Er zijn op dit moment geen diensten beschikbaar om online te boeken.",
    mailDirect: "Mail me rechtstreeks",

    doneTitle: "Je aanvraag is ontvangen",
    doneBody: (dienst: string, wanneer: string) => `Aanvraag voor ${dienst} op ${wanneer} is binnen. Je hoort of het doorgaat.`,
    doneReference: "Kenmerk",
    doneMailSent: "Je ontvangt een bevestigingsmail op het opgegeven adres.",
    doneMailFailed:
      "De bevestigingsmail is niet verstuurd. Je aanvraag staat wel binnen; ik neem contact op.",
    doneMailOff:
      "Je krijgt nu geen mail. De aanvraag is wel ontvangen.",
    doneWork: "Bekijk mijn werk",
    doneMailMore: "Mail me een aanvulling",
  },

  /* -- Formulieren en meldingen -------------------------------------------- */
  forms: {
    required: "(verplicht)",
    name: "Naam",
    email: "E-mailadres",
    phone: "Telefoonnummer",
    phoneHint: "Optioneel. Handig als het weer roet in het eten gooit.",
    location: "Opnamelocatie",
    locationHint: "Adres of omschrijving van de plek.",
    locations: "Locaties",
    locationsHint:
      "Adres of omschrijving per plek. Weet je nog niet alles? Vul in wat je wel weet.",
    locationPlaceholder: "Bijvoorbeeld: Gedempte Gracht 12, Zaandam",
    locationNext: "Volgende locatie",
    locationAdd: "+ Locatie toevoegen",
    locationRemove: (nummer: number) => `Locatie ${nummer} verwijderen`,
    locationNumber: (nummer: number) => `Locatie ${nummer}`,
    description: "Korte projectomschrijving",
    descriptionHint: "Waar gaat het om, en waarvoor ga je de beelden gebruiken?",
    subject: "Onderwerp",
    message: "Bericht",

    errName: "Vul je naam in (minimaal 2 tekens).",
    errEmail: "Vul een geldig e-mailadres in.",
    errLocation: "Vul de opnamelocatie in.",
    errLocationCustom: "Vul minstens één locatie in.",
    errDescription: "Beschrijf je project in minimaal 10 tekens.",
    errSubject: "Vul een onderwerp in.",
    errMessage: "Schrijf een bericht van minimaal 10 tekens.",
    errService: "Kies een dienst.",
    errMoment: "Kies een datum en tijd.",
    errCheck: "Controleer de gemarkeerde velden.",
    errRejected: "Aanvraag geweigerd.",
    errRejectedMessage: "Bericht geweigerd.",
    errTooMany:
      "Er zijn net te veel aanvragen vanaf dit adres verstuurd. Probeer het over een paar minuten opnieuw.",
    errTooManyMessages:
      "Er zijn net te veel berichten vanaf dit adres verstuurd. Probeer het over een paar minuten opnieuw.",
  },

  /* -- Meldingen over tijdsloten ------------------------------------------- */
  slots: {
    serviceUnavailable: "Deze dienst is niet beschikbaar.",
    invalidMoment: "Kies een geldige datum en tijd.",
    lead: (uren: number) =>
      `Dit tijdstip ligt te dichtbij. Boek minimaal ${uren} uur van tevoren.`,
    advance: (dagen: number) => `Je kunt maximaal ${dagen} dagen vooruit boeken.`,
    outside: "Dit tijdstip valt buiten de beschikbare tijden.",
    taken: "Dit tijdslot is net bezet geraakt. Kies een ander moment.",
    bookingNotFound: "Boeking niet gevonden.",
    serviceNotFound: "Dienst niet gevonden.",
  },

  /* -- Project op maat ------------------------------------------------------ */
  scope: {
    intro:
      "Een project op maat beslaat vaak meerdere dagen. Met deze antwoorden kan ik de planning voorbereiden voordat we elkaar spreken.",
    sessionsLabel: "Aantal opnamemomenten",
    sessions: { "1": "Eén opnamemoment", "2": "Twee opnamemomenten", "3plus": "Drie of meer opnamemomenten", onbekend: "Weet ik nog niet" } as Record<string, string>,
    periodLabel: "Gewenste periode",
    periodPlaceholder: "Bijvoorbeeld: in de tweede helft van mei",
    periodHint:
      "Bij benadering mag ook. Een week, een maand of \u201Czodra het weer het toelaat\u201D is genoeg.",
    periodRequired:
      "Geef aan in welke periode het project zou moeten vallen. Bij benadering mag ook.",
    preferenceLabel: "Voorkeur voor de opnames",
    preferenceHint: "Meerdere antwoorden mogen.",
    preferences: {
      ochtend: "Ochtend",
      middag: "Middag",
      "gouden-uur": "Laatste uur voor zonsondergang",
      doordeweeks: "Liefst doordeweeks",
      weekend: "Liefst in het weekend",
      flexibel: "Maakt niet uit",
    } as Record<string, string>,
    summaryLocations: (aantal: number) => `Locaties (${aantal})`,
    summarySessions: "Opnamemomenten",
    summaryPeriod: "Gewenste periode",
    summaryPreference: "Voorkeur",
  },

  /* -- Contactformulier ----------------------------------------------------- */
  contactForm: {
    messageHint: "Vertel kort waar het om gaat en waar de locatie ligt.",
    submit: "Bericht versturen",
    privacyNote:
      "Je gegevens worden alleen gebruikt om op je bericht te reageren en zijn niet zichtbaar voor andere bezoekers.",
    doneStored:
      "Je bericht is opgeslagen. Ik reageer meestal binnen één werkdag.",
    send: "Versturen",
    sending: "Bezig met versturen\u2026",
    mailOffNotice:
      "Je bericht wordt opgeslagen en gelezen, maar je krijgt geen automatische bevestiging.",
    doneTitle: "Bedankt voor je bericht",
    doneBody: "Binnen. Ik reageer meestal binnen één werkdag.",
    doneMailSent: "Je krijgt ook een bevestiging per mail.",
    doneMailFailed:
      "De bevestigingsmail is niet verstuurd. Je bericht is wel binnen.",
    doneMailOff:
      "Je krijgt nu geen mail. Het bericht is wel ontvangen.",
  },

  /* -- E-mail --------------------------------------------------------------- */
  mail: {
    greeting: (naam: string) => `Hoi ${naam},`,
    signature: `Groet, Kai \u2014 ${site.name}`,

    summaryReference: "Kenmerk",
    summaryService: "Dienst",
    summaryWhen: "Datum en tijd",
    summaryLocation: "Locatie",
    summaryName: "Naam",
    summaryEmail: "E-mail",
    summaryPhone: "Telefoon",
    summaryNotGiven: "niet opgegeven",
    summaryProject: "Over het project:",
    summaryDescription: "Omschrijving:",
    summaryNoDescription: "(geen omschrijving)",

    requestSubject: (kenmerk: string) => `Aanvraag ontvangen (${kenmerk}) \u2014 ${site.name}`,
    requestBody: `Bedankt voor je aanvraag bij ${site.name}. Ik heb hem in goede orde ontvangen.`,
    requestNotice: [
      "Let op: dit is nog geen definitieve afspraak. Ik controleer eerst de",
      "locatie, de regels voor het luchtruim en de weersverwachting en",
      "bevestig daarna per e-mail.",
    ],
    requestReply: "Vragen? Antwoord gerust op deze mail.",
    ownerSubject: (kenmerk: string, naam: string) => `Nieuwe aanvraag ${kenmerk} \u2014 ${naam}`,
    ownerBody: "Er is een nieuwe aanvraag binnengekomen.",

    confirmedSubject: (kenmerk: string) => `Afspraak bevestigd (${kenmerk}) \u2014 ${site.name}`,
    confirmedBody: "Je afspraak is bevestigd. Tot dan!",
    confirmedNotice:
      "Verandert er iets aan het weer of de locatie, dan neem ik op tijd contact op.",

    cancelledSubject: (kenmerk: string) => `Afspraak ${kenmerk} \u2014 ${site.name}`,
    rejectedBody: "Helaas kan ik deze aanvraag niet inplannen.",
    cancelledBody: "Deze afspraak is geannuleerd.",
    cancelledNotice:
      "Wil je een ander moment proberen? Je kunt een nieuwe aanvraag doen via de website.",

    contactSubject: `Bericht ontvangen \u2014 ${site.name}`,
    contactBody: "Bedankt voor je bericht. Ik lees het en reageer meestal binnen één werkdag.",
    contactYours: "Je bericht:",
    contactOwnerSubject: (onderwerp: string) => `Contactformulier: ${onderwerp}`,
    contactFrom: "Van:",
    contactRe: "Onderwerp:",

    paymentRequestSubject: (kenmerk: string) => `Betaalverzoek (${kenmerk}) — ${site.name}`,
    paymentRequestBody: (bedrag: string) =>
      `Bedankt voor de opdracht! Bij dit project hoort een factuur van ${bedrag}, die je ` +
      `eenvoudig en veilig online kunt betalen via de onderstaande link.`,
    invoiceNumberLabel: "Factuurnummer",
    invoiceLinkLabel: "Bekijk of download de factuur:",
    paymentRequestPayLabel: "Betaal deze factuur online:",
    paymentRequestNotice:
      "Liever pas betalen bij oplevering? Dat kan ook — deze link blijft geldig tot dan.",
    paymentRequestReply: "Heb je een vraag over deze factuur? Antwoord gerust op deze mail.",

    deliverySubject: (kenmerk: string) => `Project afgerond (${kenmerk}) — ${site.name}`,
    deliveryBodyReady:
      "Goed nieuws: je project is afgerond! Ik heb met plezier aan deze opdracht gewerkt " +
      "en hoop dat je net zo blij bent met het resultaat. De eindproducten staan voor je " +
      "klaar via onderstaande link.",
    deliveryBodyUnpaid: (bedrag: string) =>
      `Goed nieuws: je project is afgerond! Voordat de eindproducten vrijkomen, staat er ` +
      `nog een factuur van ${bedrag} open; zodra die betaald is, komen ze automatisch ` +
      `beschikbaar via onderstaande link.`,
    deliveryLinkLabel: "Bekijk en download je bestanden:",
    deliveryRevisionNotice:
      "Ben je niet helemaal tevreden over de eerste editing? Laat het gerust weten via " +
      "dezelfde link — ik denk graag met je mee voor een wijziging.",
    deliveryReply: "Vragen over de oplevering? Antwoord gerust op deze mail.",

    revisionOwnerSubject: (kenmerk: string, naam: string) => `Wijziging aangevraagd (${kenmerk}) — ${naam}`,
    revisionOwnerBody: "Er is een wijziging aangevraagd op een oplevering.",
  },

  /* -- Opleveringspagina ------------------------------------------------------ */
  delivery: {
    invalidTitle: "Deze link is niet (meer) geldig",
    invalidBody:
      "Controleer of je de volledige link uit de e-mail hebt gebruikt, of neem contact op als je denkt dat dit niet klopt.",
    heading: (kenmerk: string) => `Oplevering — ${kenmerk}`,
    invoiceNumberLabel: "Factuurnummer",
    viewInvoiceLabel: "Bekijk of download je factuur (PDF)",
    payTitle: "Betaling vereist",
    payIntro: (bedrag: string) =>
      `Voor dit project staat een factuur van ${bedrag} open. Zodra deze betaald is, komen de bestanden hieronder automatisch vrij.`,
    payButton: "Nu betalen",
    payError: "Betalen lukte net niet. Probeer het nog eens of neem contact op.",
    paidNotice: (wanneer: string) => `Betaald op ${wanneer}.`,
    filesTitle: "Jouw bestanden",
    filesIntro: "Klik op een bestand om het te downloaden.",
    downloadLabel: "Downloaden",
    revisionTitle: "Niet helemaal tevreden?",
    revisionIntro: "Laat weten wat je anders zou willen zien; ik neem het met je door.",
    revisionPlaceholder:
      "Bijvoorbeeld: kun je de kleuren in het tweede fragment iets warmer maken?",
    revisionSubmit: "Wijziging aanvragen",
    revisionSuccess: "Bedankt, je verzoek is verstuurd. Ik neem snel contact op.",
    revisionError: "Vul een bericht van minstens 10 tekens in.",
  },
};

/**
 * De vorm van het woordenboek. De Engelse versie moet hier precies op passen,
 * anders geeft de typecontrole een fout — zo kan er geen tekst ontbreken.
 */
export type Dictionary = typeof nl;
