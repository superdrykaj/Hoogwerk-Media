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

  meta: {
    tagline: "Drone photography and video in Zaandam and North Holland",
    description:
      `${site.name} makes aerial photos and video for property, business, ` +
      `locations and events in Zaandam and North Holland. Book a slot online.`,
    ogDescription:
      "Aerial photography and video for property, business, locations and " +
      "events in Zaandam and North Holland.",
  },

  region: {
    short: "Zaandam and North Holland",
    detail:
      "Zaandam and the wider Zaan region, and across North Holland: Amsterdam, " +
      "Purmerend, Haarlem, Alkmaar, Hoorn, Beverwijk and everything in between. " +
      "Outside the province by arrangement.",
  },

  /* -- Header and footer --------------------------------------------------- */
  nav: {
    home: "Home",
    portfolio: "Portfolio",
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
    note: "Freelance drone pilot. Every shoot is discussed and confirmed beforehand.",
    workArea: "Working area:",
    rights: (year: number) =>
      `© ${year} ${site.name}. All company details and projects on this site are examples.`,
  },

  demoBanner: {
    label: "Demo",
    text: "The projects, prices and photos on this site are still",
    emphasis: "examples",
    link: "What does that mean?",
  },

  /* -- Home ---------------------------------------------------------------- */
  home: {
    heroTitle: "A new perspective on your story.",
    heroIntro:
      "I'm Kai, a freelance drone pilot based in Zaandam. I shoot aerial photos " +
      "and video for property, business, locations and events, across the Zaan " +
      "region and the rest of North Holland. From the first conversation to the " +
      "finished files, you deal with one person: me.",
    heroWork: "See my work",
    heroNote: "Placeholder image — replace public/images/hero.jpg with your own aerial photo.",

    servicesEyebrow: "What I do",
    servicesTitle: "Aerial images that show what won't fit from the ground.",
    highlights: [
      {
        title: "Property",
        body:
          "Homes, commercial buildings and new developments from above. Images " +
          "that show how a building sits in its surroundings.",
      },
      {
        title: "Business",
        body:
          "Your site, production or project in its best light. Ready for your " +
          "website, social channels and presentations.",
      },
      {
        title: "Locations and nature",
        body:
          "Landscapes, recreation areas and places worth seeing, shot at the " +
          "right time of day.",
      },
      {
        title: "Events",
        body:
          "An overview shot of your event, agreed in advance and within the " +
          "rules that apply at the venue.",
      },
    ],

    pricesTitle: "Services and rates",
    pricesNote: "Indications. We agree the price before anything is booked.",
    priceOnRequest: "On request",
    duration: (minutes: number) => `${minutes} min`,
    introDuration: (minutes: number) => `${minutes} min intro call`,
    chooseMoment: "Pick a time →",

    workEyebrow: "Example projects",
    workTitle: "A selection of my work.",
    workAll: "All projects",
    workEmpty: "No projects have been published yet.",
    workEmptyHint: "Add projects in the admin area.",

    processEyebrow: "How it works",
    processTitle: "From first conversation to finished images.",
    process: [
      {
        title: "Get acquainted",
        body:
          "A short call to go through what you need, where the location is and " +
          "what you have in mind.",
      },
      {
        title: "Plan",
        body:
          "I check the location, the airspace rules and the forecast, and then " +
          "confirm a date and time.",
      },
      {
        title: "Shoot",
        body:
          "I fly and record on location. You're welcome to join and watch, but " +
          "you don't have to.",
      },
      {
        title: "Deliver",
        body:
          "You get the edited photos and video through a download link, usually " +
          "within five working days.",
      },
    ],

    bookingEyebrow: "Book a slot",
    bookingTitle: "Pick a moment that suits you.",
    bookingDisclaimer:
      "A shoot always starts as a request. I check the location, the airspace " +
      "rules and the forecast, and then confirm by e-mail. Nothing is fixed " +
      "until you have that confirmation.",
    timezoneNote: "All times are in Dutch local time (Europe/Amsterdam).",
    timezoneAsk: "Rather talk it through first?",
    timezoneLink: "Send me a message",

    aboutEyebrow: "About me",
    aboutTitle: "One point of contact, from plan to delivery.",
    aboutImageAlt: "Placeholder image of a drone flight over a landscape",
    aboutBody: (region: string, equipment: string) => [
      `I work as a freelance drone pilot in ${region}. No middlemen: we discuss ` +
        "what you need together, I fly it myself and I deliver the files myself.",
      `I fly a ${equipment}. It's a compact drone, so I can work in tighter ` +
        "spots and respond quickly to the light and the weather on the day.",
    ],
  },

  /* -- Portfolio ----------------------------------------------------------- */
  portfolio: {
    metaTitle: "Portfolio",
    metaDescription:
      `Example projects by ${site.name}: aerial photography and video for ` +
      "property, business, events, nature and locations in Zaandam and North Holland.",
    eyebrow: "Portfolio",
    title: "Work from the air.",
    intro: (region: string) =>
      `Below are example projects from ${region}. Filter by type of work to see ` +
      "what's possible.",
    noticeBefore: "Please note: these are",
    noticeStrong: "fictional example projects",
    noticeAfter: "with placeholder images. Replace them with your own work in the admin area.",
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
      evenementen: "Events",
      natuur: "Nature and locations",
    },
  },

  project: {
    notFound: "Project not found",
    metaDescription: (location: string) => `Example project by ${site.name} in ${location}.`,
    breadcrumb: "Breadcrumb",
    exampleChip: "Example project",
    coverAlt: (title: string) => `Placeholder image for ${title}`,
    cardLink: "View project",
    cardNoImage: "No image yet",
    asideTitle: "Want a project like this?",
    asideBody: "Tell me about your location and your plans. I'm happy to think along.",
    asideAsk: "Ask a question first",
    videoTitle: "Video",
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
    metaDescription: `Get in touch with ${site.name} for aerial photography and video in Zaandam and North Holland.`,
    eyebrow: "Contact",
    title: "Let's talk it through",
    intro:
      "Got a location, a building or an event that comes into its own from the " +
      "air? Send me a message. I'm happy to think along about what's possible, " +
      "and I usually reply within one working day.",
    emailLabel: "E-mail",
    phoneLabel: "Phone",
    areaLabel: "Working area",
    bookLabel: "Rather pick a time straight away?",
    privacyBefore: "All details on this page are examples. The",
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
      "Look further ahead with the 'Later' button, or send me a message if you have something specific in mind.",
    noDaysAction: "Look later →",
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
    rowSessions: "Shoot moments",
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
    errRejected: "Request refused.",
    errRejectedMessage: "Message refused.",
    errTooMany:
      "Too many requests have just been sent from this address. Please try again in a few minutes.",
    errTooManyMessages:
      "Too many messages have just been sent from this address. Please try again in a few minutes.",
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
    sessionsLabel: "Number of shoot moments",
    sessions: {
      "1": "One shoot moment",
      "2": "Two shoot moments",
      "3plus": "Three or more shoot moments",
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
    summarySessions: "Shoot moments",
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
    requestBody: `Thanks for your request to ${site.name}. I've received it in good order.`,
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
