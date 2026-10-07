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
    "Drone photography in Zaandam and North Holland. Opening soon.",
  soonBadge: "Coming soon",

  meta: {
    tagline: "Drone photography in Zaandam and North Holland",
    description:
      `${site.name} makes aerial photos and short films for real estate, ` +
      `commercial sites and construction in Zaandam and North Holland. ` +
      `Book a slot online.`,
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
    servicesHeading: "Services",
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
    rights: (year: number) => `© ${year} ${site.name}`,
  },

  /* -- Home ---------------------------------------------------------------- */
  home: {
    heroTitle: "Drone photography and video in Zaandam and North Holland",
    /** The company slogan, as supporting text under the heading. */
    heroIntro:
      "Your location, professionally filmed from the air: aerial work for real estate, businesses and construction.",
    heroCta: "Discuss your project",
    heroWork: "See the work",
    heroPosterAlt:
      "Aerial view of a green windmill beside the Zaan at Zaanse Schans.",
    heroFacts: ["50 MP, 1-inch sensor", "4K HDR video", "Zaan region and North Holland"],

    servicesEyebrow: "What I do",
    servicesTitle: "Images that won't fit from the ground",
    highlights: [
      { title: "Property", body: "Homes and commercial buildings in their surroundings. For property listings, websites and sales brochures.", page: "vastgoed" },
      { title: "Business sites", body: "An overview of the grounds, storage and logistics. Ready for your site, socials and presentations.", page: "bedrijven" },
      { title: "Construction progress", body: "The same route, every month. Fixed angles that make the progress visible.", page: "bouw" },
      { title: "Locations and nature", body: "Recreation areas, marinas and polders, shot at the right hour of the day.", page: "bedrijven" },
    ],

    pricesTitle: "Services and rates",
    pricesNote: "Indications. We agree the price before anything is booked.",
    priceOnRequest: "On request",
    duration: (minutes: number) => `${minutes} min`,
    introDuration: (minutes: number) => `${minutes} min intro call`,
    chooseMoment: "Pick a time →",

    workEyebrow: "Work",
    workTitle: "See my work",
    workIntro:
      "A selection of aerial footage over city, landscape and infrastructure.",
    showreelLabel:
      "Showreel with aerial footage over city, landscape and infrastructure",
    showreelFallback: "Your browser cannot play this video.",
    workAll: "See everything",
    workEmpty: "The first cases are coming soon.",
    workEmptyHint: "The first cases will appear here.",

    processEyebrow: "How it works",
    processTitle: "From first conversation to final files",
    process: [
      { title: "Introduction", body: "A short call about the location and the images you're after." },
      { title: "Confirmation", body: "You get the date and time by e-mail, with what we agreed on." },
      { title: "Fly", body: "Sixty to ninety minutes on location. You don't have to be there." },
      { title: "Deliver", body: "Edited images through a download link, within five working days." },
    ],

    bookingEyebrow: "Book a slot",
    bookingTitle: "Pick a moment that suits you",
    bookingDisclaimer:
      "Choose a day and time, tell me briefly what it is about, and you will " +
      "get a confirmation by e-mail. If the weather turns, we move the " +
      "appointment at no cost.",
    timezoneNote: "All times in Dutch local time.",
    timezoneAsk: "Would you rather discuss it first?",
    timezoneLink: "Send a message",

    aboutEyebrow: "About me",
    aboutTitle: "One point of contact",
    aboutImageAlt:
      "Portrait of Kai Koster, drone photographer at Hoogbeeld Media",
    pricingEyebrow: "Rates",
    pricingTitle: "Rates for photo and video",
    /** Sits directly under the title, before the overview. */
    pricingIntro:
      "From-prices include 21% VAT. The price excluding VAT is shown underneath. We agree the final price and any extra costs beforehand.",
    /** Short version, next to the prices in the booking module. */
    vatNote: "Prices include 21% VAT; the price excluding VAT is shown alongside.",
    /**
     * Headline price including VAT, with the price excluding VAT underneath,
     * per service slug. Only for services with a fixed starting amount;
     * "Intro call" (free) and "Custom project" (on request) are deliberately
     * not included here.
     */
    packagePricing: {
      dronefotografie: [{ prefix: "From", amount: "€ 235.95", excl: "€ 195 excl. VAT" }],
      dronevideo: [{ prefix: "From", amount: "€ 422.29", excl: "€ 349 excl. VAT" }],
      bedrijfsfilm: [{ prefix: "From", amount: "€ 598.95", excl: "€ 495 excl. VAT" }],
      bouwvordering: [
        { prefix: "Follow-up visit from", amount: "€ 180.29", unit: "per visit", excl: "€ 149 excl. VAT" },
        { prefix: "First visit from", amount: "€ 235.95", excl: "€ 195 excl. VAT" },
      ],
    } as Record<string, { prefix: string; amount: string; unit?: string; excl: string }[]>,
    /** Sits after the amount. */
    priceInclVat: "incl. VAT",
    includedTitle: "Always included",
    included: [
      "Preparation and coordination beforehand",
      "Selection and editing of the images",
      "Delivery within five working days",
      "Usage rights for your own website and social channels, and — for property — for the listing portal and the sales brochure",
    ],
    excludedTitle: "Possible extra costs",
    excluded: [
      {
        text: "Travel: the first 25 km one-way from Zaandam are included. Extra kilometres are charged for both the outbound and return trip at € 0.45 excl. VAT per km.",
        detailsLabel: "Worked example",
        details: "40 km one-way → 15 extra km × 2 × € 0.45 = € 13.50 excl. VAT (€ 16.34 incl. VAT). Road distance is used; VAT is calculated on the total and rounded to the nearest cent.",
      },
      { text: "Extensions such as extra editing, correction rounds, a second video format or voice-over: on request" },
      { text: "Waiting time on location: € 78.65 incl. VAT per hour", sub: "€ 65 excl. VAT" },
      { text: "Use in print, advertising and larger campaigns: agreed beforehand" },
      { text: "Flights that require an operational authorisation for the ‘specific’ category: not offered at the moment" },
    ] as { text: string; sub?: string; detailsLabel?: string; details?: string }[],

    faqEyebrow: "Questions",
    faqTitle: "What's allowed, and what isn't",
    faq: [
      { question: "Can you fly anywhere?", answer: "No, and I sort that out for you beforehand. Around Schiphol, over Natura 2000 areas and on some industrial estates it is not allowed, or only with permission. I fly up to 120 metres and always within sight." },
      { question: "Do you fly over events or crowds?", answer: "Not over people. I fly in the open category with a drone under 250 grams, which means I may not fly over crowds. An event is only possible if the site is empty, or with an operational authorisation for the ‘specific’ category, which I do not hold at the moment." },
      { question: "What about the neighbours' privacy?", answer: "I aim at the client's building and grounds, not at other people's gardens or windows. For low shots in a residential street I would rather fly ten metres higher than have someone feel watched." },
      { question: "And if the weather is bad?", answer: "Then we rebook, at no cost. A light drone gets pushed off course in strong wind, and that produces images you cannot use. I decide the evening before at the latest." },
      { question: "When do I get the images?", answer: "Within five working days, through a download link. Need them sooner? Say so with your request; next-day often works." },
      { question: "What may I do with the images?", answer: "You get the right to use them on your own website and social channels. The copyright stays with me. For a billboard, an advert or a campaign, we agree separate terms." },
    ],

    aboutBody: (region: string, equipment: string) => [
      `I'm Kai, a freelance drone pilot in ${region}. No middlemen: I plan, I ` + "fly and I deliver.",
      `I fly a ${equipment} — compact enough for tight locations, with a ` + "sensor that produces sharp images even at dusk.",
    ],
  },

  /* -- Service pages ------------------------------------------------------- */
  /**
   * One block per service page (see lib/service-pages.ts for the addresses).
   * Prices and terms are deliberately NOT here: they come from
   * `home.packagePricing`, `home.included` and `home.excluded` and from the
   * services in the admin area, so they stay identical on every page.
   */
  servicePageUi: {
    startLabel: "Home",
    breadcrumbLabel: "Breadcrumb",
    offerEyebrow: "Services",
    processEyebrow: "How it works",
    deliveryEyebrow: "Delivery",
    limitsEyebrow: "Flying",
    workEyebrow: "Portfolio",
    termsEyebrow: "Rates",
    faqEyebrow: "Questions",
    audienceEyebrow: "Who it is for",
    relatedTitle: "Other services",
    allRates: "All rates and terms",
    workAll: "See the full portfolio",
    asideTitle: "Book a flight",
    asideBody:
      "Pick a time in the calendar, or ask a question first. A twenty-minute intro call is free.",
    asideAsk: "Ask a question first",
    moreAbout: "Read more",
  },
  servicePages: {
    vastgoed: {
      metaTitle: "Real estate drone photography in Zaandam",
      metaDescription:
        "Aerial photos of homes and commercial buildings for property listings, your website and sales brochure. Drone pilot in Zaandam, working across North Holland.",
      breadcrumb: "Real estate",
      eyebrow: "Real estate",
      h1: "Drone photography for real estate",
      teaser: "Aerial photos of homes and commercial buildings in their surroundings.",
      lede: "A home or commercial building can never be fully captured from the ground. From the air you see the location, the plot and the surroundings in a single image.",
      intro: [
        "I'm Kai, a freelance drone pilot in Zaandam. For real estate I take aerial photos of a single building or site: the property itself, but above all how it sits in its surroundings. That is often exactly what a viewer misses in an ordinary photo.",
        "The images are meant for the property portal, your own website and the sales brochure. I choose the best angles and edit the photos, so you receive a selection rather than a pile of loose shots.",
      ],
      audienceTitle: "Who is this for?",
      audience: [
        {
          title: "Estate agents and sellers",
          body: "A home or building whose location is a selling point: on the water, with a deep garden or in a green setting.",
        },
        {
          title: "Landlords and investors",
          body: "Commercial buildings, offices and complexes where parking, accessibility and surroundings matter.",
        },
        {
          title: "Owners and managers",
          body: "An overview of your own building or site for your website, a brochure or a presentation.",
        },
      ],
      offerTitle: "What you get",
      offerIntro:
        "Two packages suit real estate. Choose the photos alone, or add a short film for your website or social media. What each includes and what it costs is shown below.",
      processTitle: "How it works",
      process: [
        { title: "Getting acquainted", body: "You tell me about the property and what the images are for. That can be a free video call of up to 20 minutes, or through the booking form." },
        { title: "Preparation", body: "I check the location, the airspace rules and the weather forecast. Then I confirm the date and time by e-mail; only then is the appointment final." },
        { title: "Flying", body: "Up to 60 minutes on location for the photo shoot, up to 90 minutes if a film is included. You don't need to be there. I aim at the building and the plot, not at the gardens and windows of the neighbours." },
        { title: "Delivery", body: "You receive the edited images through a download link, within five working days." },
      ],
      deliveryTitle: "Delivery and use",
      delivery: [
        "You receive a link to download the images. Need them sooner, for instance because a home is about to go on the market? Say so with your request; next-day often works.",
        "Use on your own website and social media is included, and for real estate also on the property portal and in the sales brochure. The copyright stays with me. If you want to use the images in adverts, print or a larger campaign, we agree separate terms beforehand.",
        "You can request a change through the download link. With the photos-and-short-film package, one round of corrections is included; further rounds are an extension on request.",
      ],
      limitsTitle: "Where I can fly",
      limits: [
        "A drone may not fly everywhere. Around Schiphol, over Natura 2000 areas and on some industrial estates it is not allowed, or only with permission. I sort that out for you beforehand and tell you whether and how it can be done. I fly up to 120 metres and always within sight.",
        "In a residential area, or at a building among other buildings, I keep away from other people's gardens and windows. For a low shot I would rather fly a little higher than have someone feel watched.",
      ],
      workTitle: "An example from my portfolio",
      workIntro:
        "This is what my aerial images of a residential area look like: a film and photos of IJburg in Amsterdam.",
      workNote:
        "This is a free portfolio recording of the district, not an assignment for a seller or estate agent.",
      termsTitle: "Rates and terms",
      faqTitle: "Frequently asked questions about real estate photography",
      faq: [
        { question: "How many photos do I get of a home?", answer: "With the drone photo shoot you get 10 to 15 edited aerial photos of a single building or site, with up to 60 minutes on location. Need more, for instance for several buildings? We discuss that beforehand." },
        { question: "Can I put the photos on the property portal?", answer: "Yes. For real estate, use on the property portal and in the sales brochure is included in the price, as is use on your own website and social media. The copyright stays with me. For adverts, print or larger campaigns we agree separate terms beforehand." },
        { question: "Do I need to be there during the flight?", answer: "No. It helps if the resident or seller knows I'm coming, so nobody is startled by a drone above the house. We agree access to the location beforehand." },
        { question: "Can you fly at a home close to Schiphol or in a nature reserve?", answer: "That depends on the exact location. Around Schiphol and over Natura 2000 areas it is not allowed, or only with permission. I check that beforehand; if it can't be done, you hear before I come and we discuss what is possible." },
        { question: "What is the best moment to take the photos?", answer: "That depends on the property. We choose a moment together, and I check the weather in the days before. If it is too windy or too wet, we rebook at no cost. I decide that the evening before at the latest." },
        { question: "What does a photo shoot cost?", answer: "The prices are in the overview above, with and without VAT. The first 25 km one-way from Zaandam are included; I charge for extra kilometres." },
      ],
      ctaTitle: "Want to show a property from above?",
      ctaBody: "Book a time straight away, or send me a message first with what you have in mind.",
    },

    bedrijven: {
      metaTitle: "Drone video for businesses and locations",
      metaDescription:
        "Short drone films of business sites, marinas and other locations, for your website, socials and presentations. Zaandam and North Holland.",
      breadcrumb: "Drone video",
      eyebrow: "Businesses and locations",
      h1: "Drone video for businesses and locations",
      teaser: "Short films of sites, marinas and other locations.",
      lede: "A short film from the air shows how a site, marina or commercial building fits together and how it sits in its surroundings.",
      intro: [
        "I'm Kai, a freelance drone pilot in Zaandam. I film business sites, recreation areas, marinas and other locations and edit them into a short film you can use on your website, socials and in presentations.",
        "Each film is about one site, location or project. That keeps the story clear: what kind of place is this, how big is it and what is around it.",
      ],
      audienceTitle: "Who is this for?",
      audience: [
        {
          title: "Businesses with a site",
          body: "Storage, logistics or a commercial building with a lot of outdoor space: an overview you cannot make from the ground.",
        },
        {
          title: "Marinas and recreation areas",
          body: "Locations where position and surroundings are the story, filmed at the right hour of the day.",
        },
        {
          title: "Organisations and projects",
          body: "A project or location you want to show to customers, residents or relations.",
        },
      ],
      offerTitle: "What you get",
      offerIntro:
        "Two packages, depending on how much film you need. If it involves several locations or shooting days, a custom project is a better fit; that starts with a free intro call.",
      processTitle: "How it works",
      process: [
        { title: "Getting acquainted", body: "We discuss the location, what you want to show and what the film is for. That can be a free video call of up to 20 minutes." },
        { title: "Preparation", body: "I check the location, the airspace rules and the weather forecast, and choose the route and the time of day. You receive a confirmation by e-mail." },
        { title: "Filming", body: "Up to 90 minutes on location. You don't need to be there. I don't fly over people, so on a site where work is going on, we agree the moment beforehand." },
        { title: "Editing and delivery", body: "I select the best clips and edit them with fitting licensed music. You receive the film through a download link, within five working days." },
      ],
      deliveryTitle: "Delivery and use",
      delivery: [
        "The film runs 30 to 45 seconds with the photos-and-short-film package, and 60 to 90 seconds with the drone atmosphere film. You receive it with a download link; need it sooner? Say so with your request.",
        "Both film packages include one round of corrections. Extra editing, another round of corrections, a second video format (for example vertical for social media) or a voice-over are extensions I quote on request.",
        "Use on your own website and social media is included. If you want to use the film in adverts, print or a larger campaign, let me know beforehand and we agree the terms separately.",
      ],
      limitsTitle: "What is and isn't possible",
      limits: [
        "I fly in the open category with a drone under 250 grams, up to 120 metres and always within sight. That means I do not fly over crowds. An event, open day or a busy site is therefore only possible if the area is empty during the shoot. Flights that require an operational authorisation for the ‘specific’ category are not offered at the moment.",
        "Around Schiphol, over Natura 2000 areas and on some industrial estates it is not allowed, or only with permission. I sort that out for you beforehand and tell you what is possible.",
      ],
      workTitle: "Drone films from my portfolio",
      workIntro:
        "Three location films from the Zaan region and Amsterdam. A look at my camera work and editing.",
      workNote:
        "These are free portfolio recordings of locations, not paid assignments from businesses.",
      termsTitle: "Rates and terms",
      faqTitle: "Frequently asked questions about drone video",
      faq: [
        { question: "How long is the film?", answer: "With photos and short film you get a clip of 30 to 45 seconds; with the drone atmosphere film, a film of 60 to 90 seconds. Each film is about one site, location or project." },
        { question: "Is there music in the film?", answer: "Yes, fitting music with a usage licence. If you want to use the film for more than your own website and social media, let me know before you book." },
        { question: "Can I have a film made of several locations?", answer: "That is a custom project. It starts with a free intro call in which we discuss the locations, the number of shooting days and the planning. After that you receive a quote." },
        { question: "Can you film while work is going on or during an event?", answer: "Not over crowds or busy areas; my drone is not meant for that. For footage of the site itself, I prefer to plan the flight at a quiet moment or when the area is clear." },
        { question: "Can I have photos only?", answer: "Yes. With the drone photo shoot you get 10 to 15 edited aerial photos of a single building or site, without a film." },
        { question: "What does a drone film cost?", answer: "The prices are in the overview above, with and without VAT. The first 25 km one-way from Zaandam are included; I charge for extra kilometres." },
      ],
      ctaTitle: "Want to bring a location to life?",
      ctaBody: "Book a free, no-obligation intro call of twenty minutes, or send me a message about your location.",
    },

    bouw: {
      metaTitle: "Construction progress with drone footage",
      metaDescription:
        "Drone images of your construction project from fixed viewpoints, comparable visit after visit. For contractors, developers and clients in North Holland.",
      breadcrumb: "Construction progress",
      eyebrow: "Construction progress",
      h1: "Construction progress with drone footage",
      teaser: "The same viewpoints, visit after visit, for a clear series.",
      lede: "The same viewpoints, visit after visit. That way you can see side by side what has been built since the last time.",
      intro: [
        "I'm Kai, a freelance drone pilot in Zaandam. For construction progress I fly the same project periodically and record from the same viewpoints and heights every time. That gives you a series of images you can easily lay side by side.",
        "You set the rhythm, for instance every month or at key construction phases. The first visit includes the initial preparation and fixing the viewpoints; follow-up visits are therefore cheaper.",
      ],
      audienceTitle: "Who is this for?",
      audience: [
        {
          title: "Contractors and site managers",
          body: "A consistent record of progress for your file, your reporting or your own website.",
        },
        {
          title: "Developers and clients",
          body: "Show buyers, investors or residents how the project is coming along.",
        },
        {
          title: "Project communication",
          body: "Images for newsletters, socials or a project page, without having to arrange a drone yourself.",
        },
      ],
      offerTitle: "What you get",
      offerIntro:
        "The service consists of a first visit and follow-up visits. At each visit you receive 5 to 10 edited images. If it involves several construction sites or a more extensive plan, a custom project is a better fit.",
      processTitle: "How it works",
      process: [
        { title: "First visit", body: "Together we choose the viewpoints and heights, in consultation with whoever is in charge on site. The initial preparation is part of this visit." },
        { title: "Preparation", body: "Before every visit I check the airspace, the weather forecast and what is on the site, such as cranes and construction traffic. You receive a confirmation by e-mail." },
        { title: "Flying", body: "Up to 45 minutes on location. I fly up to 120 metres, always within sight and not over groups of people. On a construction site we therefore agree the moment around the work." },
        { title: "Delivery", body: "You receive 5 to 10 edited images per visit, through a download link, within five working days." },
      ],
      deliveryTitle: "Delivery and use",
      delivery: [
        "After every visit you receive the edited images through a download link. Because the viewpoints are fixed, the images from different visits can be compared as closely as possible.",
        "Use on your own website and social media is included. If you want to use the images in print, adverts or a larger campaign, we agree separate terms beforehand.",
      ],
      limitsTitle: "What to know about flying over a construction site",
      limits: [
        "Before take-off I need permission from the client or the manager of the site. I include cranes, lifting operations and construction traffic in the preparation.",
        "Around Schiphol, over Natura 2000 areas and on some industrial estates it is not allowed, or only with permission. I sort that out for you beforehand. I fly in the open category with a drone under 250 grams; that means I do not fly over crowds.",
      ],
      workTitle: "What my aerial images look like",
      workIntro:
        "A construction series is not in my portfolio yet. To see how I capture a district from the air, take a look at this example.",
      workNote:
        "This is a free portfolio recording of IJburg in Amsterdam, not an assignment and not a construction progress series.",
      termsTitle: "Rates and terms",
      faqTitle: "Frequently asked questions about construction progress",
      faq: [
        { question: "How often does the drone come by?", answer: "You decide, for instance every month or at key construction phases. We agree the rhythm at the first visit." },
        { question: "Can images from different visits really be compared?", answer: "We fix the viewpoints and heights at the first visit and I fly them again afterwards. The angles end up as close as possible. A drone never hovers in exactly the same spot twice to the centimetre; for following progress, that isn't necessary." },
        { question: "What does a follow-up visit cost?", answer: "The first visit and the follow-up visit each have their own from-price; you will find them in the overview above, with and without VAT. The initial preparation is part of the first visit, which is why follow-up visits are cheaper." },
        { question: "Can you fly while work is going on?", answer: "Yes, but not over groups of people. I agree the moment with the site manager, for instance during a break or when the area below the drone is clear." },
        { question: "Do I need permission to fly over a construction site?", answer: "Before take-off I need permission from the client or the manager of the site. In some places flying is not allowed, or only with permission from an authority, such as around Schiphol; I sort that out beforehand." },
        { question: "And if the weather is bad?", answer: "Then we rebook the visit at no cost. I decide that the evening before at the latest." },
      ],
      ctaTitle: "Want to keep track of a construction project?",
      ctaBody: "Book a free, no-obligation intro call of twenty minutes, or send me a message about your project.",
    },
  },

  /* -- Portfolio ----------------------------------------------------------- */
  portfolio: {
    metaTitle: "Drone photo and video portfolio",
    metaDescription:
      `Work by ${site.name}: aerial photography and video for real estate, ` +
      "commercial sites, construction and locations in Zaandam and North Holland.",
    eyebrow: "Portfolio",
    title: "Work from the air",
    /** For screen readers and search engines only: the heading above the project cards. */
    listTitle: "All projects",
    intro: (region: string) => `Work from ${region}. Filter by type of work.`,
    noticeBefore: "Some of this work is shown as illustration.",
    noticeStrong: "",
    noticeAfter:
      "",
    empty: "No projects have been published yet.",
    emptyAction: "Get in touch",
    ctaTitle: "Want a project like this?",
    ctaBody:
      "Tell me what you have in mind. A twenty-minute intro call is free and without obligation.",
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
    previewOpen: (title: string) => `View preview of ${title}`,
    previewClose: "Close preview",
  },

  project: {
    notFound: "Project not found",
    metaDescription: (location: string) => `Project by ${site.name} in ${location}.`,
    breadcrumb: "Breadcrumb",
    exampleChip: "Illustration",
    coverAlt: (title: string) => `Placeholder image for ${title}`,
    cardLink: "View project",
    cardNoImage: "No image yet",
    asideTitle: "Want a project like this?",
    asideBody: "Tell me about your location and your plans. I'd be happy to help shape the idea.",
    asideAsk: "Ask a question first",
    videoTitle: "Video",
    videoFallback: "Your browser cannot play this video.",
    videoOf: (title: string) => `Video of ${title}`,
    videoEmpty: "The video for this project goes here.",
    videoEmptyHint: "Add a YouTube or Vimeo link to this project in the admin area.",
    galleryTitle: "Photo gallery",
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
    metaTitle: "Contact your drone pilot in Zaandam",
    metaDescription: `Get in touch with ${site.name} for aerial photos and short films in Zaandam and North Holland. Send a message or book an intro call.`,
    eyebrow: "Contact",
    title: "Let's talk it through",
    intro:
      "A building, site or project that comes into its own from the air? Send a message. I usually reply within one working day.",
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
      "This page doesn't exist (any more). The link may be out of date, or there's a typo in the address.",
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
      "Look further ahead with the 'View later dates' button, or send me a message if you have something specific in mind.",
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
      "You're booking the intro call here. In it we go through the locations, the number of shoot days and the planning; after that I lock in the shoot days themselves.",

    noServices: "There are no services available to book online at the moment.",
    mailDirect: "E-mail me directly",

    doneTitle: "Your request has been received",
    doneBody: (service: string, when: string) =>
      `Request for ${service} on ${when} received. I'll let you know if it can go ahead.`,
    doneReference: "Reference",
    doneMailSent: "You'll get a confirmation e-mail at the address you gave.",
    doneMailFailed:
      "The confirmation e-mail was not sent. Your request is in; I'll contact you.",
    doneMailOff:
      "You won't get an e-mail just now. The request has been received.",
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
      "A custom project often spans several days. These answers let me prepare the planning before we speak.",
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
      "A rough idea is fine. A week, a month or \u201cas soon as the weather allows\u201d is enough.",
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
      "Your details are only used to reply to your message and are not visible to other visitors.",
    doneStored:
      "Your message has been saved and is waiting in my admin area. I usually reply within one working day.",
    send: "Send",
    sending: "Sending\u2026",
    mailOffNotice:
      "Please note: e-mail has not been set up on this site yet. Your message will be saved and read, but you won't get an automatic confirmation.",
    doneTitle: "Thanks for your message",
    doneBody: "It's in. I usually reply within one working day.",
    doneMailSent: "You'll also get a confirmation by e-mail.",
    doneMailFailed:
      "The confirmation e-mail was not sent. Your message is in.",
    doneMailOff:
      "You won't get an e-mail just now. The message has been received.",
  },

  /* -- E-mail -------------------------------------------------------------- */
  mail: {
    greeting: (name: string) => `Hi ${name},`,
    signature: `Kind regards, Kai \u2014 ${site.name}`,

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

    requestSubject: (reference: string) => `Request received (${reference}) \u2014 ${site.name}`,
    requestBody: `Thanks for your request to ${site.name}. I've received it.`,
    requestNotice: [
      "Please note: this is not a confirmed appointment yet. I first check the",
      "location, the airspace rules and the weather forecast, and then confirm",
      "by e-mail.",
    ],
    requestReply: "Questions? Just reply to this e-mail.",
    ownerSubject: (reference: string, name: string) => `New request ${reference} \u2014 ${name}`,
    ownerBody: "A new request has come in.",

    confirmedSubject: (reference: string) => `Appointment confirmed (${reference}) \u2014 ${site.name}`,
    confirmedBody: "Your appointment is confirmed. See you then!",
    confirmedNotice:
      "If anything changes about the weather or the location, I'll be in touch in good time.",

    cancelledSubject: (reference: string) => `Appointment ${reference} \u2014 ${site.name}`,
    rejectedBody: "Unfortunately I can't fit this request into the schedule.",
    cancelledBody: "This appointment has been cancelled.",
    cancelledNotice:
      "Want to try another moment? You can submit a new request through the website.",

    contactSubject: `Message received \u2014 ${site.name}`,
    contactBody: "Thanks for your message. I'll read it and usually reply within one working day.",
    contactYours: "Your message:",
    contactOwnerSubject: (subject: string) => `Contact form: ${subject}`,
    contactFrom: "From:",
    contactRe: "Subject:",

    paymentRequestSubject: (reference: string) => `Payment request (${reference}) — ${site.name}`,
    paymentRequestBody: (amount: string) =>
      `Thanks for the job! This project comes with an invoice of ${amount}, which you can ` +
      `pay easily and securely online via the link below.`,
    invoiceNumberLabel: "Invoice number",
    invoiceLinkLabel: "View or download the invoice:",
    paymentRequestPayLabel: "Pay this invoice online:",
    paymentRequestNotice:
      "Prefer to pay on delivery instead? That's fine too — this link stays valid until then.",
    paymentRequestReply: "Have a question about this invoice? Just reply to this e-mail.",

    deliverySubject: (reference: string) => `Project completed (${reference}) — ${site.name}`,
    deliveryBodyReady:
      "Good news: your project is finished! I enjoyed working on it and hope you're just " +
      "as happy with the result. The final files are ready for you via the link below.",
    deliveryBodyUnpaid: (amount: string) =>
      `Good news: your project is finished! Before the files become available, there's ` +
      `still an invoice of ${amount} open; once it's paid, they'll automatically become ` +
      `available via the link below.`,
    deliveryLinkLabel: "View and download your files:",
    deliveryRevisionNotice:
      "Not fully happy with the first edit? Let me know via the same link — I'm happy to " +
      "go over a change with you.",
    deliveryReply: "Questions about the delivery? Just reply to this e-mail.",

    revisionOwnerSubject: (reference: string, name: string) => `Change requested (${reference}) — ${name}`,
    revisionOwnerBody: "A change has been requested on a delivery.",
  },

  /* -- Delivery page --------------------------------------------------------- */
  delivery: {
    invalidTitle: "This link is no longer valid",
    invalidBody:
      "Check that you used the full link from the e-mail, or get in touch if you think this isn't right.",
    heading: (reference: string) => `Delivery — ${reference}`,
    invoiceNumberLabel: "Invoice number",
    viewInvoiceLabel: "View or download your invoice (PDF)",
    payTitle: "Payment required",
    payIntro: (amount: string) =>
      `An invoice of ${amount} is open for this project. Once it's paid, the files below will automatically become available.`,
    payButton: "Pay now",
    payError: "Payment didn't go through just now. Please try again or get in touch.",
    paidNotice: (when: string) => `Paid on ${when}.`,
    filesTitle: "Your files",
    filesIntro: "Click a file to download it.",
    downloadLabel: "Download",
    revisionTitle: "Not fully happy?",
    revisionIntro: "Let me know what you'd like changed; I'll go through it with you.",
    revisionPlaceholder: "For example: could the colours in the second clip be a bit warmer?",
    revisionSubmit: "Request a change",
    revisionSuccess: "Thanks, your request has been sent. I'll be in touch soon.",
    revisionError: "Please enter a message of at least 10 characters.",
  },
};
