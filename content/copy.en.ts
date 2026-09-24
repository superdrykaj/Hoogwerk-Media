/**
 * ============================================================================
 *  ENGLISH TEXTS
 * ============================================================================
 *  Same keys as copy.nl.ts. Miss one and `npm run typecheck` will say so.
 *  Company details (name, e-mail addresses, logo) live in content/site.ts,
 *  because they are the same in both languages.
 * ============================================================================
 */
import type { Dictionary } from "./copy.nl";
import { site } from "./site";

export const en: Dictionary = {
  /* -- General ------------------------------------------------------------- */
  taalnaam: "English",
  taalknop: "View this page in Dutch",
  taalknopKort: "NL",

  motto: "A higher perspective",

  soonLine:
    "Drone photography in Zaandam and North Holland. The site is being built " +
    "and opens shortly.",
  soonBadge: "Coming soon",

  meta: {
    tagline: "Drone photography in Zaandam and North Holland",
    description:
      `${site.name} makes aerial photos and short films for real estate, ` +
      `commercial sites and construction projects in Zaandam and North ` +
      `Holland. Book a slot online.`,
    ogDescription:
      "Aerial photos and short films for real estate, commercial sites and " +
      "construction projects in Zaandam and North Holland.",
  },

  region: {
    short: "Zaandam and North Holland",
    detail:
      "Zaandam and the Zaan region, and across North Holland: Amsterdam, " +
      "Purmerend, Haarlem, Alkmaar, Hoorn and Beverwijk. Beyond that by " +
      "arrangement.",
  },

  /* -- Header and footer --------------------------------------------------- */
  nav: {
    home: "Home",
    portfolio: "Work",
    contact: "Contact",
    privacy: "Privacy",
    book: "Book a slot",
    admin: "Admin",
    mainMenu: "Main menu",
    mobileMenu: "Mobile menu",
    footerMenu: "Footer menu",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    skipToContent: "Skip to main content",
    homeAria: `${site.name} — back to the homepage`,
    menuHeading: "Menu",
    contactHeading: "Contact",
  },

  footer: {
    note:
      "Freelance drone pilot in Zaandam. Every flight is checked and confirmed " +
      "beforehand.",
    workArea: "Working area:",
    complianceNote:
      "Registered as a drone operator and insured for liability. Proof sent on " +
      "request.",
    kvk: "Chamber of Commerce",
    vat: "VAT",
    operator: "Operator number",
    insurer: "Insured with",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    rights: (year: number) =>
      `© ${year} ${site.name}. All company details and projects on this site are examples.`,
  },

  /* -- Home ---------------------------------------------------------------- */
  home: {
    heroTitle: "Your location, professionally filmed from the air",
    heroIntro:
      "Drone photography and video for businesses, real estate and " +
      "construction projects in Zaandam and North Holland.",
    heroCta: "Discuss your project",
    heroWork: "See the work",
    heroPosterAlt:
      "Aerial view of characteristic buildings and boats on the water in the " +
      "Zaan region.",
    heroFacts: ["50 MP, 1-inch sensor", "4K HDR video", "Zaan region and North Holland"],

    servicesEyebrow: "What I do",
    servicesTitle: "Images that won't fit from the ground.",
    highlights: [
      {
        title: "Property",
        body: "Homes and commercial buildings in their surroundings. For property listings, websites and sales brochures.",
      },
      {
        title: "Business sites",
        body: "An overview of the grounds, storage and logistics. Ready for your site, socials and presentations.",
      },
      {
        title: "Construction progress",
        body: "The same route, every month. Fixed angles that make the progress visible.",
      },
      {
        title: "Locations and nature",
        body: "Recreation areas, marinas and polders, shot at the right hour of the day.",
      },
    ],

    pricesTitle: "Services and rates",
    pricesNote: "Indications. We agree the price before anything is booked.",
    priceOnRequest: "On request",
    duration: (minutes: number) => `${minutes} min`,
    introDuration: (minutes: number) => `${minutes} min intro call`,
    chooseMoment: "Pick a time →",

    workEyebrow: "Work",
    workTitle: "See our work",
    workIntro:
      "A selection of aerial footage over city, landscape and infrastructure.",
    showreelLabel:
      "Showreel with aerial footage over city, landscape and infrastructure",
    showreelFallback: "Your browser cannot play this video.",
    showreelDownload: "Download the showreel",
    workAll: "See everything",
    workEmpty: "The first cases are coming soon.",
    workEmptyHint: "You add projects in the admin area.",

    processEyebrow: "How it works",
    processTitle: "From first conversation to final files.",
    process: [
      {
        title: "Introduction",
        body: "A short call about the location and the images you're after.",
      },
      {
        title: "Check",
        body: "I check airspace, permits and weather, and confirm a date.",
      },
      {
        title: "Fly",
        body: "Sixty to ninety minutes on location. You don't have to be there.",
      },
      {
        title: "Deliver",
        body: "Edited images through a download link, within five working days.",
      },
    ],

    bookingEyebrow: "Book a slot",
    bookingTitle: "Pick a moment.",
    bookingDisclaimer:
      "A request is not an appointment yet. I check the location in GoDrone, " +
      "look at the weather and then confirm by e-mail.",
    timezoneNote: "All times in Dutch local time.",
    timezoneAsk: "Would you rather discuss it first?",
    timezoneLink: "Send a message",

    aboutEyebrow: "About me",
    aboutTitle: "One point of contact.",
    aboutImageAlt: "Drone flight over the North Holland landscape",
    pricingEyebrow: "Rates",
    pricingTitle: "Indications, with what's included.",
    pricingNote:
      "Prices are indications, excluding VAT. We agree exactly what you need " +
      "beforehand.",
    includedTitle: "What you get",
    included: [
      "Preparation: airspace check, weather and route",
      "Sixty to ninety minutes on location",
      "Selection and editing of the images",
      "Delivery within five working days",
      "Usage rights for your own website and social channels",
    ],
    excludedTitle: "Billed separately",
    excluded: [
      "Travel beyond 25 km: € 0.45 per kilometre",
      "Waiting time on location: € 65 per hour",
      "Use in print, advertising or campaigns: by arrangement",
      "Flights that require an operational authorisation for the ‘specific’ category",
    ],

    faqEyebrow: "Questions",
    faqTitle: "What's allowed, and what isn't.",
    faq: [
      {
        question: "Can you fly anywhere?",
        answer:
          "No. I check every location beforehand in GoDrone. Around Schiphol, " +
          "over Natura 2000 areas and on some industrial estates it is not " +
          "allowed, or only with permission. I fly up to 120 metres and always " +
          "within sight.",
      },
      {
        question: "Do you fly over events or crowds?",
        answer:
          "Not over people. I fly in the open category with a drone under 250 " +
          "grams, which means I may not fly over crowds. An event is only " +
          "possible if the site is empty, or with an operational authorisation " +
          "for the ‘specific’ category, which I do not hold at the moment.",
      },
      {
        question: "What about the neighbours' privacy?",
        answer:
          "I aim at the client's building and grounds, not at other people's " +
          "gardens or windows. For low shots in a residential street I would " +
          "rather fly ten metres higher than have someone feel watched.",
      },
      {
        question: "And if the weather is bad?",
        answer:
          "Then we rebook, at no cost. A light drone gets pushed off course in " +
          "strong wind, and that produces images you cannot use. I decide the " +
          "evening before at the latest.",
      },
      {
        question: "When do I get the images?",
        answer:
          "Within five working days, through a download link. Need them sooner? " +
          "Say so with your request; next-day often works.",
      },
      {
        question: "What may I do with the images?",
        answer:
          "You get the right to use them on your own website and social " +
          "channels. The copyright stays with me. For a billboard, an advert " +
          "or a campaign, we agree separate terms.",
      },
    ],

    aboutBody: (region: string, equipment: string) => [
      `I'm Kai, a freelance drone pilot in ${region}. No middlemen: I plan, I ` +
        "fly and I deliver.",
      `I fly a ${equipment} — compact enough for tight locations, with a ` +
        "sensor that produces sharp images even at dusk.",
    ],
  },

  /* -- Portfolio ----------------------------------------------------------- */
  portfolio: {
    metaTitle: "Portfolio",
    metaDescription:
      `Work by ${site.name}: aerial photography and video for real estate, ` +
      "commercial sites, construction and locations in Zaandam and North Holland.",
    eyebrow: "Portfolio",
    title: "Work from the air.",
    intro: (region: string) => `Work from ${region}. Filter by type of work.`,
    noticeBefore: "Projects labelled",
    noticeStrong: "Example project",
    noticeAfter:
      "are fictional demonstration projects with placeholder images. The other projects are real work.",
    empty: "No projects have been published yet.",
    emptyAction: "Go to the admin area",
    ctaTitle: "Want a project like this?",
    ctaBody:
      "Tell me what you have in mind. A twenty-minute intro call is free and " +
      "without obligation.",
    ctaAsk: "Ask a question",

    filterLabel: "Filter projects by category",
    filterAll: "All",
    count: (amount: number) => `${amount} ${amount === 1 ? "project" : "projects"}`,
    countEmpty: "No projects in this category.",
    categoryEmpty: "Nothing in this category yet.",
    showAll: "Show all projects",
    categories: {
      vastgoed: "Property",
      bedrijven: "Business",
      bouw: "Construction progress",
      natuur: "Nature and locations",
    },
  },

  project: {
    notFound: "Project not found",
    metaDescription: (location: string) => `Project by ${site.name} in ${location}.`,
    breadcrumb: "Breadcrumb",
    exampleChip: "Example project",
    coverAlt: (title: string) => `Placeholder image for ${title}`,
    cardLink: "View project",
    cardNoImage: "No image yet",
    asideTitle: "Want a project like this?",
    asideBody: "Tell me about your location and your plans. I'd be happy to help shape the idea.",
    asideAsk: "Ask a question first",
    videoTitle: "Video",
    videoFallback: "Your browser cannot play this video.",
    videoDownload: "Download the video",
    videoOf: (title: string) => `Video of ${title}`,
    videoEmpty: "The video for this project goes here.",
    videoEmptyHint: "Add a YouTube or Vimeo link to this project in the admin area.",
    galleryTitle: "Photo gallery",
    galleryEmpty: "No photos for this project yet.",
    moreTitle: "More work",
  },

  gallery: {
    open: (number: number) => `Enlarge photo ${number}`,
    close: "Close",
    previous: "Previous photo",
    next: "Next photo",
    counter: (current: number, total: number) => `Photo ${current} of ${total}`,
  },

  /* -- Contact ------------------------------------------------------------- */
  contact: {
    metaTitle: "Contact",
    metaDescription: `Get in touch with ${site.name} for aerial photos and short films in Zaandam and North Holland.`,
    eyebrow: "Contact",
    title: "Let's talk it through",
    intro:
      "A building, site or project that comes into its own from the air? Send a " +
      "message. I usually reply within one working day.",
    emailLabel: "E-mail",
    phoneLabel: "Phone",
    areaLabel: "Working area",
    bookLabel: "Rather pick a time straight away?",
    whatsappLabel: "WhatsApp",
    whatsappLink: "Send a message",
    privacyBefore: "The",
    privacyLink: "privacy statement",
    privacyAfter: "explains how your data is handled.",
    formTitle: "Send a message",
    formIntro: "Fill in the form and I'll usually reply within one working day.",
  },

  /* -- Error page ---------------------------------------------------------- */
  notFound: {
    title: "Page not found",
    body:
      "This page doesn't exist (any more). The link may be out of date, or " +
      "there's a typo in the address.",
    home: "Go to the homepage",
    portfolio: "Browse the portfolio",
  },

  /* -- Booking module ------------------------------------------------------ */
  booking: {
    steps: ["Service", "Date", "Time", "Details", "Review"],
    stepService: "What would you like made?",
    stepDate: "Pick a date",
    stepTime: "Pick a time",
    stepDetails: "Your details",
    stepReview: "Check your request",

    introService:
      "Choose the service that fits best. Not sure? Start with a free intro call.",
    introDate: "Only days with free slots can be selected. Times in Europe/Amsterdam.",
    introDateCustom:
      "Pick a day for the intro call. We'll plan the shoot days themselves during that call.",
    introDetails: "I only use these details to get in touch about this request.",
    introDetailsCustom:
      "Tell me briefly what the project involves, so I can prepare for our call.",
    introReview: "All correct? Then you can send the request.",

    introChip: "Starts with an intro call",
    minutes: (amount: number) => `${amount} min`,

    prev: "← Earlier",
    next: "Later →",
    loading: "Loading available times…",
    loadFailed: "Loading failed",
    loadError: "The available times could not be loaded. Please try again.",
    retry: "Try again",
    noDays: "No free days in this period",
    noDaysBody:
      "Look further ahead with the 'View later dates' button, or send me a " +
      "message if you have something specific in mind.",
    noDaysAction: "View later dates →",
    noTimes: "No free times on this day",
    noTimesBody: "Please pick another date.",
    backToDates: "Back to the dates",
    times: (amount: number) => `${amount} ${amount === 1 ? "slot" : "slots"}`,

    toReview: "To the summary",
    back: "Back",
    submit: "Send request",
    submitting: "Sending…",
    editDetails: "Change details",

    rowService: "Service",
    rowWhen: "When",
    rowIntro: "Intro call",
    rowDuration: "Duration",
    rowDurationValue: (minutes: number) => `${minutes} minutes`,
    rowPrice: "Indication",
    rowName: "Name",
    rowEmail: "E-mail",
    rowPhone: "Phone",
    rowLocation: "Location",
    rowLocations: (amount: number) => `Locations (${amount})`,
    rowSessions: "Shoot sessions",
    rowPeriod: "Preferred period",
    rowPreference: "Preference",
    rowProject: "Project",
    customDisclaimer:
      "You're booking the intro call here. In it we go through the locations, " +
      "the number of shoot days and the planning; after that I lock in the " +
      "shoot days themselves.",

    noServices: "There are no services available to book online at the moment.",
    mailDirect: "E-mail me directly",

    doneTitle: "Your request has been received",
    doneBody: (service: string, when: string) =>
      `I've received your request for ${service} on ${when}. I'll check the ` +
      "location, the airspace and the weather, and let you know as soon as " +
      "possible whether it can go ahead.",
    doneReference: "Reference",
    doneMailSent: "You'll get a confirmation e-mail at the address you gave.",
    doneMailFailed:
      "The confirmation e-mail could not be sent. Your request has been saved " +
      "and I've seen it; I'll get in touch myself.",
    doneMailOff:
      "Please note: sending e-mail has not been set up on this site yet, so you " +
      "won't get a confirmation e-mail now. Your request has been saved.",
    doneWork: "See my work",
    doneMailMore: "E-mail me an addition",
  },

  /* -- Forms and messages -------------------------------------------------- */
  forms: {
    required: "(required)",
    name: "Name",
    email: "E-mail address",
    phone: "Phone number",
    phoneHint: "Optional. Handy if the weather gets in the way.",
    location: "Shoot location",
    locationHint: "Address or description of the place.",
    locations: "Locations",
    locationsHint:
      "Address or description per place. Don't know them all yet? Fill in what you do know.",
    locationPlaceholder: "For example: Gedempte Gracht 12, Zaandam",
    locationNext: "Next location",
    locationAdd: "+ Add location",
    locationRemove: (number: number) => `Remove location ${number}`,
    locationNumber: (number: number) => `Location ${number}`,
    description: "Short project description",
    descriptionHint: "What is it about, and what will you use the images for?",
    subject: "Subject",
    message: "Message",

    errName: "Please fill in your name (at least 2 characters).",
    errEmail: "Please fill in a valid e-mail address.",
    errLocation: "Please fill in the shoot location.",
    errLocationCustom: "Please fill in at least one location.",
    errDescription: "Please describe your project in at least 10 characters.",
    errSubject: "Please fill in a subject.",
    errMessage: "Please write a message of at least 10 characters.",
    errService: "Please choose a service.",
    errMoment: "Please choose a date and time.",
    errCheck: "Please check the highlighted fields.",
    errRejected: "Request rejected.",
    errRejectedMessage: "Message rejected.",
    errTooMany:
      "Too many requests were sent from this address in a short period. Please try again in a few minutes.",
    errTooManyMessages:
      "Too many messages were sent from this address in a short period. Please try again in a few minutes.",
  },

  /* -- Slot messages ------------------------------------------------------- */
  slots: {
    serviceUnavailable: "This service is not available.",
    invalidMoment: "Please choose a valid date and time.",
    lead: (hours: number) =>
      `That time is too soon. Please book at least ${hours} hours ahead.`,
    advance: (days: number) => `You can book at most ${days} days ahead.`,
    outside: "That time falls outside the available hours.",
    taken: "That slot has just been taken. Please choose another moment.",
    bookingNotFound: "Booking not found.",
    serviceNotFound: "Service not found.",
  },

  /* -- Custom project ------------------------------------------------------ */
  scope: {
    intro:
      "A custom project often spans several days. These answers let me prepare " +
      "the planning before we speak.",
    sessionsLabel: "Number of shoot sessions",
    sessions: {
      "1": "One shoot session",
      "2": "Two shoot sessions",
      "3plus": "Three or more shoot sessions",
      onbekend: "Not sure yet",
    },
    periodLabel: "Preferred period",
    periodPlaceholder: "For example: the second half of May",
    periodHint:
      "A rough idea is fine. A week, a month or “as soon as the weather allows” is enough.",
    periodRequired:
      "Please say roughly when the project should take place. An approximation is fine.",
    preferenceLabel: "Preference for the shoots",
    preferenceHint: "You can pick more than one.",
    preferences: {
      ochtend: "Morning",
      middag: "Afternoon",
      "gouden-uur": "Last hour before sunset",
      doordeweeks: "Preferably on weekdays",
      weekend: "Preferably at the weekend",
      flexibel: "No preference",
    },
    summaryLocations: (amount: number) => `Locations (${amount})`,
    summarySessions: "Shoot sessions",
    summaryPeriod: "Preferred period",
    summaryPreference: "Preference",
  },

  /* -- Contact form -------------------------------------------------------- */
  contactForm: {
    messageHint: "Briefly tell me what it's about and where the location is.",
    submit: "Send message",
    privacyNote:
      "Your details are only used to reply to your message and are not visible " +
      "to other visitors.",
    doneStored:
      "Your message has been saved and is waiting in my admin area. I usually " +
      "reply within one working day.",
    send: "Send",
    sending: "Sending…",
    mailOffNotice:
      "Please note: e-mail has not been set up on this site yet. Your message " +
      "will be saved and read, but you won't get an automatic confirmation.",
    doneTitle: "Thanks for your message",
    doneBody: "I've received it and usually reply within one working day.",
    doneMailSent: "You'll also get a confirmation by e-mail.",
    doneMailFailed:
      "The confirmation e-mail could not be sent. Your message has been saved and will be read.",
    doneMailOff:
      "Please note: e-mail has not been set up on this site yet, so you won't get a confirmation e-mail now.",
  },

  /* -- E-mail -------------------------------------------------------------- */
  mail: {
    greeting: (name: string) => `Hi ${name},`,
    signature: `Kind regards, Kai — ${site.name}`,

    summaryReference: "Reference",
    summaryService: "Service",
    summaryWhen: "Date and time",
    summaryLocation: "Location",
    summaryName: "Name",
    summaryEmail: "E-mail",
    summaryPhone: "Phone",
    summaryNotGiven: "not given",
    summaryProject: "About the project:",
    summaryDescription: "Description:",
    summaryNoDescription: "(no description)",

    requestSubject: (reference: string) => `Request received (${reference}) — ${site.name}`,
    requestBody: `Thanks for your request to ${site.name}. I've received it.`,
    requestNotice: [
      "Please note: this is not a confirmed appointment yet. I first check the",
      "location, the airspace rules and the weather forecast, and then confirm",
      "by e-mail.",
    ],
    requestReply: "Questions? Just reply to this e-mail.",
    ownerSubject: (reference: string, name: string) => `New request ${reference} — ${name}`,
    ownerBody: "A new request has come in.",

    confirmedSubject: (reference: string) => `Appointment confirmed (${reference}) — ${site.name}`,
    confirmedBody: "Your appointment is confirmed. See you then!",
    confirmedNotice:
      "If anything changes about the weather or the location, I'll be in touch in good time.",

    cancelledSubject: (reference: string) => `Appointment ${reference} — ${site.name}`,
    rejectedBody: "Unfortunately I can't fit this request into the schedule.",
    cancelledBody: "This appointment has been cancelled.",
    cancelledNotice:
      "Want to try another moment? You can submit a new request through the website.",

    contactSubject: `Message received — ${site.name}`,
    contactBody: "Thanks for your message. I'll read it and usually reply within one working day.",
    contactYours: "Your message:",
    contactOwnerSubject: (subject: string) => `Contact form: ${subject}`,
    contactFrom: "From:",
    contactRe: "Subject:",
  },
};
