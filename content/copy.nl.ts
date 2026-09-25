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
import { site } from "./site";

export const nl = {
  /* -- Algemeen ------------------------------------------------------------ */
  taalnaam: "Nederlands",
  taalknop: "Bekijk deze pagina in het Engels",
  taalknopKort: "EN",

  /** Regel uit het logo. Staat op de contactpagina en in de footer. */
  motto: "Een hoger perspectief",

  /** De enige zin op de pagina "binnenkort online". */
  soonLine:
    "Dronefotografie in Zaandam en Noord-Holland. De site is in aanbouw en " +
    "gaat binnenkort open.",
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
    contactHeading: "Contact",
  },

  footer: {
    note:
      "Zelfstandig dronepiloot in Zaandam. Elke vlucht wordt vooraf getoetst " +
      "en bevestigd.",
    workArea: "Werkgebied:",
    complianceNote:
      "Geregistreerd als drone-exploitant en verzekerd voor " +
      "aansprakelijkheid. Bewijzen stuur ik op verzoek mee.",
    kvk: "KvK",
    vat: "BTW",
    operator: "Operatornummer",
    insurer: "Verzekerd bij",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    rights: (jaar: number) =>
      `© ${jaar} ${site.name}. Alle bedrijfsgegevens en projecten op deze site zijn voorbeelden.`,
  },

  /* -- Homepage ------------------------------------------------------------ */
  home: {
    heroTitle: "Uw locatie professioneel vanuit de lucht",
    heroIntro:
      "Dronefotografie en dronevideo voor bedrijven, vastgoed en projecten in " +
      "Zaandam en Noord-Holland.",
    heroCta: "Bespreek uw project",
    heroWork: "Bekijk het werk",
    /**
     * Beschrijving van het achtergrondbeeld van de hero, voor wie de video
     * niet te zien krijgt.
     */
    heroPosterAlt:
      "Dronebeeld van karakteristieke bebouwing en boten aan het water in de " +
      "Zaanstreek.",
    /** Harde feiten onder de hero. Kort, controleerbaar, geen marketing. */
    heroFacts: ["50 MP, 1-inch sensor", "4K HDR video", "Zaanstreek en Noord-Holland"],

    servicesEyebrow: "Wat ik doe",
    servicesTitle: "Beeld dat op de grond niet past",
    highlights: [
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
      {
        title: "Bruiloften",
        body: "Sfeerbeelden van de trouwlocatie en de aankomst, vanuit de lucht. Nooit een shot boven de gasten.",
      },
    ],

    pricesTitle: "Diensten en tarieven",
    pricesNote: "Indicaties. De prijs spreken we vooraf samen af.",
    priceOnRequest: "In overleg",
    duration: (minuten: number) => `${minuten} min`,
    introDuration: (minuten: number) => `kennismaking van ${minuten} min`,
    chooseMoment: "Een moment kiezen →",

    workEyebrow: "Werk",
    workTitle: "Bekijk ons werk",
    workIntro:
      "Een selectie van dronebeelden boven stad, landschap en infrastructuur.",
    /** Wat een schermlezer van de videospeler te horen krijgt. */
    showreelLabel:
      "Showreel met dronebeelden boven stad, landschap en infrastructuur",
    showreelFallback: "Je browser kan deze video niet afspelen.",
    showreelDownload: "Download de showreel",
    workAll: "Alles bekijken",
    workEmpty: "De eerste cases staan er binnenkort.",
    workEmptyHint: "Projecten voeg je toe via de beheeromgeving.",

    processEyebrow: "Zo werkt het",
    processTitle: "Van gesprek tot bestand",
    process: [
      {
        title: "Kennismaken",
        body: "Kort gesprek over de locatie en het beeld dat je zoekt.",
      },
      {
        title: "Bevestiging",
        body: "Je krijgt datum en tijd per e-mail, met wat we hebben afgesproken.",
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

    bookingEyebrow: "Plan een afspraak",
    bookingTitle: "Kies een moment dat jou uitkomt",
    bookingDisclaimer:
      "Kies een dag en tijd, vertel kort waar het om gaat, en je krijgt een " +
      "bevestiging per e-mail. Zit het weer tegen, dan verzetten we de " +
      "afspraak zonder kosten.",
    timezoneNote: "Alle tijden in de Nederlandse tijdzone.",
    timezoneAsk: "Liever eerst overleggen?",
    timezoneLink: "Stuur een bericht",

    aboutEyebrow: "Over mij",
    aboutTitle: "Eén aanspreekpunt",
    aboutImageAlt:
      "Portret van Kai Koster, dronefotograaf van Hoogbeeld Media",
    /* -- Tarieven en vragen ------------------------------------------- */
    pricingEyebrow: "Tarieven",
    pricingTitle: "Indicaties, met de inhoud erbij",
    /** Staat onder de tarieven. De btw-regel hoort voorop. */
    pricingNote:
      "Alle genoemde prijzen zijn exclusief btw. Het zijn indicaties; wat je " +
      "precies nodig hebt, spreken we vooraf samen af.",
    /** Korte variant, bij de prijzen in de boekingsmodule. */
    vatNote: "Alle prijzen zijn exclusief btw.",
    includedTitle: "Wat je krijgt",
    included: [
      "Zestig tot negentig minuten op locatie",
      "Selectie en nabewerking van de beelden",
      "Levering binnen vijf werkdagen",
      "Gebruiksrecht voor je eigen website en socials",
    ],
    excludedTitle: "Apart afgerekend",
    excluded: [
      "Voorrijden buiten 25 km: € 0,45 per kilometer",
      "Wachttijd op locatie: € 65 per uur",
      "Gebruik voor print, advertenties of campagnes: in overleg",
      "Vluchten die alleen met een Specific-vergunning mogen",
    ],

    faqEyebrow: "Vragen",
    faqTitle: "Wat mag wel, en wat niet",
    faq: [
      {
        question: "Mag je overal vliegen?",
        answer:
          "Nee, en dat zoek ik vooraf voor je uit. Rond Schiphol, boven " +
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
        question: "Vlieg je ook boven de bruiloft zelf, tijdens de ceremonie of receptie?",
        answer:
          "Nee, dat mag ten alle tijden niet — ook niet als alle gasten dat " +
          "vooraf weten en ermee instemmen. Zodra mensen samen op één plek " +
          "staan, geldt dat als een menigte, en daar mag in de open categorie " +
          "nooit overheen gevlogen worden. Ik leg de bruiloft daarom vast van " +
          "buitenaf: de locatie, de aankomst, het gebouw en de omgeving, en " +
          "nooit een shot recht boven de samengekomen gasten.",
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

    aboutBody: (regio: string, apparatuur: string) => [
      `Ik ben Kai, zelfstandig dronepiloot in ${regio}. Geen tussenpersonen: ` +
        "ik plan, ik vlieg en ik lever op.",
      `Ik vlieg met een ${apparatuur} — compact genoeg voor krappe locaties, ` +
        "met een sensor die ook in de schemering scherp blijft.",
    ],
  },

  /* -- Portfolio ----------------------------------------------------------- */
  portfolio: {
    metaTitle: "Portfolio",
    metaDescription:
      `Werk van ${site.name}: dronefoto's en dronevideo's voor ` +
      "vastgoed, bedrijven, evenementen, natuur en locaties in Zaandam en " +
      "Noord-Holland.",
    eyebrow: "Portfolio",
    title: "Werk vanuit de lucht",
    intro: (regio: string) =>
      `Werk uit ${regio}. Filter op het soort opdracht.`,
    noticeBefore: "Projecten met het label",
    noticeStrong: "Voorbeeldproject",
    noticeAfter:
      "zijn fictieve demonstratieprojecten met tijdelijke afbeeldingen. De overige projecten zijn echt werk.",
    empty: "Er zijn nog geen projecten gepubliceerd.",
    emptyAction: "Naar de beheeromgeving",
    ctaTitle: "Ook zo'n project laten maken?",
    ctaBody:
      "Vertel me wat je voor ogen hebt. Een kennismaking van twintig minuten " +
      "is gratis en vrijblijvend.",
    ctaAsk: "Stel een vraag",

    filterLabel: "Filter projecten op categorie",
    filterAll: "Alles",
    count: (aantal: number) =>
      `${aantal} ${aantal === 1 ? "project" : "projecten"}`,
    countEmpty: "Geen projecten in deze categorie.",
    categoryEmpty: "Nog niets in deze categorie.",
    showAll: "Toon alle projecten",
    categories: {
      vastgoed: "Vastgoed",
      bedrijven: "Bedrijven",
      bouw: "Bouwvordering",
      natuur: "Natuur en locaties",
    } as Record<string, string>,
  },

  project: {
    notFound: "Project niet gevonden",
    metaDescription: (locatie: string) =>
      `Project van ${site.name} in ${locatie}.`,
    breadcrumb: "Kruimelpad",
    exampleChip: "Voorbeeldproject",
    coverAlt: (titel: string) => `Beeld van ${titel}`,
    cardLink: "Bekijk project",
    cardNoImage: "Nog geen afbeelding",
    asideTitle: "Ook zo'n project laten maken?",
    asideBody: "Vertel me over je locatie en je plannen. Ik denk graag mee.",
    asideAsk: "Eerst een vraag stellen",
    videoTitle: "Video",
    videoFallback: "Je browser kan deze video niet afspelen.",
    videoDownload: "Download de video",
    videoOf: (titel: string) => `Video van ${titel}`,
    videoEmpty: "Hier komt de video van dit project.",
    videoEmptyHint:
      "Voeg in de beheeromgeving een YouTube- of Vimeo-link toe bij dit project.",
    galleryTitle: "Fotogalerij",
    galleryEmpty: "Nog geen foto's bij dit project.",
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
    metaTitle: "Contact",
    metaDescription: `Neem contact op met ${site.name} voor dronefoto's en korte films in Zaandam en Noord-Holland.`,
    eyebrow: "Contact",
    title: "Even sparren?",
    intro:
      "Een pand, terrein of project dat vanuit de lucht beter tot zijn recht " +
      "komt? Stuur een bericht. Ik antwoord meestal binnen één werkdag.",
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
      "Deze pagina bestaat niet (meer). Misschien is de link verouderd of is er " +
      "een typefout in het adres geslopen.",
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
      "Je plant hiermee de kennismaking. Daarin bespreken we de locaties, het " +
      "aantal opnamedagen en de planning; daarna leg ik de opnamedagen vast.",

    noServices: "Er zijn op dit moment geen diensten beschikbaar om online te boeken.",
    mailDirect: "Mail me rechtstreeks",

    doneTitle: "Je aanvraag is ontvangen",
    doneBody: (dienst: string, wanneer: string) =>
      `Ik heb je aanvraag voor ${dienst} op ${wanneer} binnengekregen. Ik ` +
      "controleer de locatie, het luchtruim en het weer en laat je zo snel " +
      "mogelijk weten of het doorgaat.",
    doneReference: "Kenmerk",
    doneMailSent: "Je ontvangt een bevestigingsmail op het opgegeven adres.",
    doneMailFailed:
      "Het versturen van de bevestigingsmail is niet gelukt. Je aanvraag is wél " +
      "opgeslagen en ik heb hem gezien; ik neem zelf contact met je op.",
    doneMailOff:
      "Let op: het versturen van e-mail is op deze site nog niet ingesteld, dus " +
      "je krijgt nu geen bevestigingsmail. Je aanvraag is wél opgeslagen.",
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
      "Een project op maat beslaat vaak meerdere dagen. Met deze antwoorden kan " +
      "ik de planning voorbereiden voordat we elkaar spreken.",
    sessionsLabel: "Aantal opnamemomenten",
    sessions: {
      "1": "Eén opnamemoment",
      "2": "Twee opnamemomenten",
      "3plus": "Drie of meer opnamemomenten",
      onbekend: "Weet ik nog niet",
    } as Record<string, string>,
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
      "Je gegevens worden alleen gebruikt om op je bericht te reageren en zijn " +
      "niet zichtbaar voor andere bezoekers.",
    doneStored:
      "Je bericht is opgeslagen en staat klaar in mijn beheeromgeving. Ik " +
      "reageer meestal binnen één werkdag.",
    send: "Versturen",
    sending: "Bezig met versturen…",
    mailOffNotice:
      "Let op: e-mail is op deze site nog niet ingesteld. Je bericht wordt wél " +
      "opgeslagen en gelezen, maar je krijgt geen automatische bevestiging.",
    doneTitle: "Bedankt voor je bericht",
    doneBody: "Ik heb het ontvangen en reageer meestal binnen één werkdag.",
    doneMailSent: "Je ontvangt ook een bevestiging per e-mail.",
    doneMailFailed:
      "Het versturen van de bevestigingsmail is niet gelukt. Je bericht is wél " +
      "opgeslagen en wordt gelezen.",
    doneMailOff:
      "Let op: e-mail is op deze site nog niet ingesteld, dus je krijgt nu geen " +
      "bevestigingsmail.",
  },

  /* -- E-mail --------------------------------------------------------------- */
  mail: {
    greeting: (naam: string) => `Hoi ${naam},`,
    signature: `Groet, Kai — ${site.name}`,

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

    requestSubject: (kenmerk: string) => `Aanvraag ontvangen (${kenmerk}) — ${site.name}`,
    requestBody: `Bedankt voor je aanvraag bij ${site.name}. Ik heb hem in goede orde ontvangen.`,
    requestNotice: [
      "Let op: dit is nog geen definitieve afspraak. Ik controleer eerst de",
      "locatie, de regels voor het luchtruim en de weersverwachting en",
      "bevestig daarna per e-mail.",
    ],
    requestReply: "Vragen? Antwoord gerust op deze mail.",
    ownerSubject: (kenmerk: string, naam: string) => `Nieuwe aanvraag ${kenmerk} — ${naam}`,
    ownerBody: "Er is een nieuwe aanvraag binnengekomen.",

    confirmedSubject: (kenmerk: string) => `Afspraak bevestigd (${kenmerk}) — ${site.name}`,
    confirmedBody: "Je afspraak is bevestigd. Tot dan!",
    confirmedNotice:
      "Verandert er iets aan het weer of de locatie, dan neem ik op tijd contact op.",

    cancelledSubject: (kenmerk: string) => `Afspraak ${kenmerk} — ${site.name}`,
    rejectedBody: "Helaas kan ik deze aanvraag niet inplannen.",
    cancelledBody: "Deze afspraak is geannuleerd.",
    cancelledNotice:
      "Wil je een ander moment proberen? Je kunt een nieuwe aanvraag doen via de website.",

    contactSubject: `Bericht ontvangen — ${site.name}`,
    contactBody: "Bedankt voor je bericht. Ik lees het en reageer meestal binnen één werkdag.",
    contactYours: "Je bericht:",
    contactOwnerSubject: (onderwerp: string) => `Contactformulier: ${onderwerp}`,
    contactFrom: "Van:",
    contactRe: "Onderwerp:",
  },
};

/**
 * De vorm van het woordenboek. De Engelse versie moet hier precies op passen,
 * anders geeft de typecontrole een fout — zo kan er geen tekst ontbreken.
 */
export type Dictionary = typeof nl;
