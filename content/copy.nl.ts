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

  meta: {
    tagline: "Dronefotografie en dronevideo in Zaandam en Noord-Holland",
    description:
      `${site.name} maakt dronefoto's en dronevideo's voor vastgoed, ` +
      `bedrijven, locaties en evenementen in Zaandam en Noord-Holland. ` +
      `Plan direct een afspraak.`,
    ogDescription:
      "Dronebeelden voor vastgoed, bedrijven, locaties en evenementen in " +
      "Zaandam en Noord-Holland.",
  },

  region: {
    short: "Zaandam en Noord-Holland",
    detail:
      "Zaandam en de hele Zaanstreek, en verder in Noord-Holland: Amsterdam, " +
      "Purmerend, Haarlem, Alkmaar, Hoorn, Beverwijk en alles daartussen. " +
      "Buiten de provincie in overleg.",
  },

  /* -- Kop en voettekst ---------------------------------------------------- */
  nav: {
    home: "Home",
    portfolio: "Portfolio",
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
    note: "Zelfstandig dronepiloot. Elke opname wordt vooraf besproken en bevestigd.",
    workArea: "Werkgebied:",
    rights: (jaar: number) =>
      `© ${jaar} ${site.name}. Alle bedrijfsgegevens en projecten op deze site zijn voorbeelden.`,
  },

  demoBanner: {
    label: "Demo",
    text: "De projecten, prijzen en foto's op deze site zijn nog",
    emphasis: "voorbeelden",
    link: "Wat betekent dat?",
  },

  /* -- Homepage ------------------------------------------------------------ */
  home: {
    heroTitle: "Een nieuw perspectief op jouw verhaal.",
    heroIntro:
      "Ik ben Kai, zelfstandig dronepiloot in Zaandam. Ik maak luchtfoto's en " +
      "luchtvideo's voor vastgoed, bedrijven, locaties en evenementen, in de " +
      "Zaanstreek en de rest van Noord-Holland. Van eerste gesprek tot " +
      "oplevering heb je één aanspreekpunt: ik.",
    heroWork: "Bekijk mijn werk",
    heroNote: "Voorbeeldbeeld — vervang public/images/hero.jpg door je eigen dronefoto.",

    servicesEyebrow: "Wat ik doe",
    servicesTitle: "Dronebeelden die laten zien wat er op de grond niet past.",
    highlights: [
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

    pricesTitle: "Diensten en tarieven",
    pricesNote: "Indicaties. De prijs spreken we vooraf samen af.",
    priceOnRequest: "In overleg",
    duration: (minuten: number) => `${minuten} min`,
    introDuration: (minuten: number) => `kennismaking van ${minuten} min`,
    chooseMoment: "Een moment kiezen →",

    workEyebrow: "Voorbeeldprojecten",
    workTitle: "Een selectie uit mijn werk.",
    workAll: "Alle projecten",
    workEmpty: "Er zijn nog geen projecten gepubliceerd.",
    workEmptyHint: "Voeg projecten toe via de beheeromgeving.",

    processEyebrow: "Zo werkt het",
    processTitle: "Van eerste gesprek tot opgeleverde beelden.",
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

    bookingEyebrow: "Plan een afspraak",
    bookingTitle: "Kies een moment dat jou uitkomt.",
    bookingDisclaimer:
      "Een opnamesessie is altijd eerst een aanvraag. Ik controleer de locatie, " +
      "de luchtruimregels en de weersverwachting en bevestig daarna per e-mail. " +
      "Je zit dus nergens aan vast tot je die bevestiging hebt.",
    timezoneNote: "Alle tijden staan in de Nederlandse tijdzone (Europe/Amsterdam).",
    timezoneAsk: "Liever eerst overleggen?",
    timezoneLink: "Stuur me een bericht",

    aboutEyebrow: "Over mij",
    aboutTitle: "Eén aanspreekpunt, van plan tot oplevering.",
    aboutImageAlt: "Voorbeeldbeeld van een dronevlucht boven een landschap",
    aboutBody: (regio: string, apparatuur: string) => [
      `Ik werk als zelfstandig dronepiloot in ${regio}. Je hebt dus geen ` +
        "tussenpersonen: we bespreken samen wat je nodig hebt, ik vlieg zelf " +
        "en ik lever de beelden zelf op.",
      `Ik vlieg met een ${apparatuur}. Dat is een compacte drone, waardoor ik ` +
        "ook op krappere locaties kan werken en snel kan inspelen op het licht " +
        "en het weer van dat moment.",
    ],
  },

  /* -- Portfolio ----------------------------------------------------------- */
  portfolio: {
    metaTitle: "Portfolio",
    metaDescription:
      `Voorbeeldprojecten van ${site.name}: dronefoto's en dronevideo's voor ` +
      "vastgoed, bedrijven, evenementen, natuur en locaties in Zaandam en " +
      "Noord-Holland.",
    eyebrow: "Portfolio",
    title: "Werk vanuit de lucht.",
    intro: (regio: string) =>
      `Hieronder staan voorbeeldprojecten uit ${regio}. Filter op het soort ` +
      "opdracht om te zien wat er mogelijk is.",
    noticeBefore: "Let op: dit zijn",
    noticeStrong: "fictieve voorbeeldprojecten",
    noticeAfter:
      "met tijdelijke afbeeldingen. Vervang ze in de beheeromgeving door je eigen werk.",
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
      evenementen: "Evenementen",
      natuur: "Natuur en locaties",
    } as Record<string, string>,
  },

  project: {
    notFound: "Project niet gevonden",
    metaDescription: (locatie: string) =>
      `Voorbeeldproject van ${site.name} in ${locatie}.`,
    breadcrumb: "Kruimelpad",
    exampleChip: "Voorbeeldproject",
    coverAlt: (titel: string) => `Voorbeeldbeeld van ${titel}`,
    cardLink: "Bekijk project",
    cardNoImage: "Nog geen afbeelding",
    asideTitle: "Ook zo'n project laten maken?",
    asideBody: "Vertel me over je locatie en je plannen. Ik denk graag mee.",
    asideAsk: "Eerst een vraag stellen",
    videoTitle: "Video",
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
    metaDescription: `Neem contact op met ${site.name} voor dronefoto's en dronevideo's in Zaandam en Noord-Holland.`,
    eyebrow: "Contact",
    title: "Even sparren?",
    intro:
      "Heb je een locatie, een gebouw of een evenement dat vanuit de lucht beter " +
      "tot zijn recht komt? Stuur me gerust een bericht. Ik denk graag mee over " +
      "wat er mogelijk is, en ik antwoord meestal binnen één werkdag.",
    emailLabel: "E-mail",
    phoneLabel: "Telefoon",
    areaLabel: "Werkgebied",
    bookLabel: "Liever meteen een moment prikken?",
    privacyBefore: "Alle gegevens op deze pagina zijn voorbeelden. Lees in de",
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
