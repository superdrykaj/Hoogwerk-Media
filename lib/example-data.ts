/**
 * ============================================================================
 *  FICTIEVE VOORBEELDGEGEVENS
 * ============================================================================
 *  Deze diensten, tijden en projecten zijn verzonnen en dienen als startpunt.
 *  Ze worden gebruikt door `npm run seed` en, op een verse server, bij de
 *  eerste keer opstarten. Bestaande gegevens worden nooit overschreven.
 *
 *  Vervang ze via de beheeromgeving door je eigen diensten en projecten.
 * ============================================================================
 */
import type { Database } from "better-sqlite3";

export const EXAMPLE_SERVICES = [
  {
    slug: "kennismaking",
    name: "Kennismaking",
    description:
      "Kort videogesprek over je locatie en wat je nodig hebt. Vrijblijvend.",
    duration_minutes: 20,
    price_label: "Gratis",
    name_en: "Intro call",
    description_en:
      "A short video call about your location and what you need. No obligation.",
    price_label_en: "Free",
    buffer_minutes: 15,
    bookable: 1,
    intro_only: 0,
    sort_order: 1,
    active: 1,
  },
  {
    slug: "dronefotografie",
    name: "Fotoreportage",
    description:
      "Eén object of terrein. Vijftien tot vijfentwintig bewerkte foto's, gebruiksrecht voor web en socials.",
    duration_minutes: 60,
    price_label: "vanaf € 195",
    name_en: "Photo shoot",
    description_en:
      "One building or site. Fifteen to twenty-five edited photos, usage rights for web and social.",
    price_label_en: "from € 195",
    buffer_minutes: 45,
    bookable: 1,
    intro_only: 0,
    sort_order: 2,
    active: 1,
  },
  {
    slug: "dronevideo",
    name: "Foto en korte film",
    description:
      "Dezelfde reportage, plus een gemonteerde clip van dertig tot vijfenveertig seconden.",
    duration_minutes: 90,
    price_label: "vanaf € 349",
    name_en: "Photos and short film",
    description_en:
      "The same shoot, plus an edited clip of thirty to forty-five seconds.",
    price_label_en: "from € 349",
    buffer_minutes: 45,
    bookable: 1,
    intro_only: 0,
    sort_order: 3,
    active: 1,
  },
  {
    slug: "bedrijfsfilm",
    name: "Bedrijfsfilm",
    description:
      "Sfeerfilm van zestig tot negentig seconden over je terrein of project. Muziek en voice-over in overleg.",
    duration_minutes: 120,
    price_label: "vanaf € 495",
    name_en: "Company film",
    description_en:
      "A sixty to ninety second film about your site or project. Music and voice-over by arrangement.",
    price_label_en: "from € 495",
    buffer_minutes: 60,
    bookable: 1,
    intro_only: 0,
    sort_order: 4,
    active: 1,
  },
  {
    slug: "bouwvordering",
    name: "Bouwvoortgang",
    description:
      "Vaste route en vaste hoogte, elke maand opnieuw. Vanaf vier bezoeken geldt een staffel.",
    duration_minutes: 45,
    price_label: "vanaf € 149 per bezoek",
    name_en: "Construction progress",
    description_en:
      "Fixed route and fixed altitude, every month. A discount applies from four visits.",
    price_label_en: "from € 149 per visit",
    buffer_minutes: 30,
    bookable: 1,
    intro_only: 0,
    sort_order: 5,
    active: 1,
  },
  {
    slug: "project-op-maat",
    name: "Project op maat",
    description:
      "Meerdere locaties of meerdere dagen. Je plant een kennismaking; in het formulier vraag ik alvast naar de locaties en de periode.",
    duration_minutes: 20,
    price_label: "In overleg",
    name_en: "Custom project",
    description_en:
      "Several locations or several days. You book an intro call; the form asks up front about the locations and the period.",
    price_label_en: "On request",
    buffer_minutes: 15,
    bookable: 1,
    intro_only: 1,
    sort_order: 6,
    active: 1,
  },
];


/** Standaardbeschikbaarheid: [weekdag, begin in minuten, eind in minuten]. */
export const EXAMPLE_WEEKLY: [number, number, number][] = [
  // Maandag tot en met vrijdag: 09:00-12:30 en 13:30-17:30.
  ...[1, 2, 3, 4, 5].flatMap(
    (weekday) =>
      [
        [weekday, 9 * 60, 12 * 60 + 30],
        [weekday, 13 * 60 + 30, 17 * 60 + 30],
      ] as [number, number, number][],
  ),
  // Zaterdag: 10:00-14:00.
  [6, 10 * 60, 14 * 60],
];

/**
 * De projecten waarmee een verse database begint.
 *
 * Twee soorten, te herkennen aan `is_example`:
 *
 *   - Echt werk (`is_example: 0`) staat gepubliceerd op de site.
 *   - De verzonnen voorbeelden (`is_example: 1`) komen erin als concept
 *     (`published: 0`). Ze staan dus wél in de beheeromgeving, als sjabloon om
 *     van te kopiëren, maar een bezoeker krijgt ze niet te zien. Een portfolio
 *     met verzonnen opdrachten erin is erger dan een klein portfolio.
 *
 * Zet je een voorbeeld in de beheeromgeving op gepubliceerd, dan verschijnt
 * het met het voorbeeldlabel erbij.
 */
export const EXAMPLE_PROJECTS = [
  {
    slug: "de-zaan-in-wormerveer",
    title: "De Zaan in Wormerveer",
    category: "natuur",
    location: "Wormerveer",
    summary:
      "Een rustige drone-impressie van de Zaan, de karakteristieke bebouwing en het waterfront van Wormerveer.",
    body:
      "Voor deze locatie-impressie heb ik de Zaan en het waterfront van Wormerveer vanuit meerdere hoogtes en richtingen vastgelegd.\n\nDe rustige camerabewegingen laten het water, de bebouwing en de kade in samenhang zien. Vijf zorgvuldig gekozen dronepassages zijn samengebracht tot een compacte, filmische webvideo.",
    cover_url: "/media/wormerveer-de-zaan-poster.webp",
    cover_alt:
      "Dronebeeld van de Zaan en de bebouwing aan het waterfront in Wormerveer",
    title_en: "The River Zaan in Wormerveer",
    location_en: "Wormerveer",
    summary_en:
      "A calm aerial impression of the River Zaan, its distinctive waterfront buildings and the Wormerveer shoreline.",
    body_en:
      "For this location film, I captured the River Zaan and the Wormerveer waterfront from several heights and directions.\n\nThe calm camera movements show the relationship between the water, the buildings and the quay. Five carefully selected drone passes were combined into a concise, cinematic web video.",
    cover_alt_en:
      "Aerial view of the River Zaan and the waterfront buildings in Wormerveer",
    video_url: "/media/wormerveer-de-zaan-dronevideo.mp4",
    published: 1,
    featured: 1,
    sort_order: 1,
    is_example: 0,
    images: [
      [
        "/media/wormerveer-de-zaan-01.webp",
        "Karakteristieke bebouwing en woonboten langs de Zaan in Wormerveer",
        "Waterfront buildings and houseboats along the River Zaan in Wormerveer",
      ],
      [
        "/media/wormerveer-de-zaan-02.webp",
        "Uitzicht over de Zaan met bomen en kade in Wormerveer",
        "View across the River Zaan with trees and the quay in Wormerveer",
      ],
      [
        "/media/wormerveer-de-zaan-03.webp",
        "Hoog droneperspectief over Wormerveer en de Zaan",
        "High aerial view across Wormerveer and the River Zaan",
      ],
      [
        "/media/wormerveer-de-zaan-04.webp",
        "Bocht in de Zaan langs de kade van Wormerveer",
        "Bend in the River Zaan along the Wormerveer quay",
      ],
    ],
  },
  {
    slug: "knooppunt-zaandam-bij-zonsondergang",
    title: "Knooppunt Zaandam bij zonsondergang",
    category: "bedrijven",
    location: "Zaandam",
    summary:
      "Een dynamische drone-impressie van de snelweg bij knooppunt Zaandam tijdens de avondspits.",
    body:
      "Rond zonsondergang heb ik de snelweg bij knooppunt Zaandam vanuit verschillende hoogtes en richtingen vastgelegd.\n\nDe combinatie van verkeer, infrastructuur, water en avondlucht laat de schaal en dynamiek van de locatie zien. De montage blijft rustig en professioneel, terwijl de beweging van het verkeer voor visuele energie zorgt.",
    cover_url: "/media/knooppunt-zaandam-poster.webp",
    cover_alt:
      "Dronebeeld van de snelweg bij knooppunt Zaandam tijdens zonsondergang",
    title_en: "Zaandam interchange at sunset",
    location_en: "Zaandam",
    summary_en:
      "A dynamic aerial impression of the motorway near Zaandam interchange during the evening rush hour.",
    body_en:
      "Around sunset, I filmed the motorway near Zaandam interchange from several heights and directions.\n\nThe combination of traffic, infrastructure, water and the evening sky shows the scale and movement of the location. The edit remains calm and professional, while the traffic adds visual energy.",
    cover_alt_en:
      "Aerial view of the motorway near Zaandam interchange at sunset",
    video_url: "/media/knooppunt-zaandam-dronevideo.mp4",
    published: 1,
    featured: 1,
    sort_order: 2,
    is_example: 0,
    images: [
      [
        "/media/knooppunt-zaandam-01.webp",
        "Snelweg door het groene landschap bij knooppunt Zaandam in de avond",
        "Motorway through the green landscape near Zaandam interchange in the evening",
      ],
      [
        "/media/knooppunt-zaandam-02.webp",
        "Rijbanen en verkeer bij knooppunt Zaandam vanuit de lucht",
        "Aerial view of the carriageways and traffic near Zaandam interchange",
      ],
      [
        "/media/knooppunt-zaandam-03.webp",
        "Snelweg en watergang bij knooppunt Zaandam rond zonsondergang",
        "Motorway and waterway near Zaandam interchange around sunset",
      ],
      [
        "/media/knooppunt-zaandam-04.webp",
        "Avondverkeer op de snelweg richting Zaandam",
        "Evening traffic on the motorway towards Zaandam",
      ],
    ],
  },
  {
    slug: "herenhuis-aan-de-zaan",
    title: "Herenhuis aan de Zaan",
    category: "vastgoed",
    location: "Zaandam (voorbeeld)",
    summary:
      "Luchtfoto's van een vrijstaand herenhuis, gemaakt voor de verkoopbrochure van een makelaar.",
    body:
      "De makelaar wilde laten zien hoe het huis aan het water ligt en hoe diep de tuin doorloopt. Vanaf de grond is dat niet te vangen.\n\nIk heb gevlogen in het laatste uur voor zonsondergang, zodat het water rustig ligt en de gevel warm licht vangt. Er zijn twaalf foto's opgeleverd: een reeks overzichten en een paar detailopnames van het dak en de aanbouw.\n\nDe beelden zijn gebruikt in de brochure, op Funda en in de advertenties op sociale media.",
    cover_url: "/images/project-vastgoed-1.jpg",
    cover_alt:
      "Voorbeeldbeeld: luchtfoto van een vrijstaand huis met tuin aan het water",
    title_en:
      "Detached house on the River Zaan",
    location_en:
      "Zaandam (example)",
    summary_en:
      "Aerial photos of a detached house, made for an estate agent's brochure.",
    body_en:
      "The estate agent wanted to show how the house sits on the water and how far the garden runs back. You can't capture that from the ground.\n\nI flew in the last hour before sunset, so the water lies still and the façade catches warm light. Twelve photos were delivered: a series of overviews and a few detail shots of the roof and the extension.\n\nThe images were used in the brochure, on the property portal and in the social media ads.",
    cover_alt_en:
      "Example image: aerial photo of a detached house with a garden by the water",
    video_url: "",
    published: 0,
    featured: 0,
    sort_order: 11,
    is_example: 1,
    images: [
      [
        "/images/gallery-1.jpg",
        "Voorbeeldbeeld: overzicht van het perceel vanuit het zuiden",
        "Example image: overview of the plot from the south",
      ],
      [
        "/images/project-vastgoed-2.jpg",
        "Voorbeeldbeeld: het huis met de oprit in beeld",
        "Example image: the house with the driveway in view",
      ],
    ],
  },
  {
    slug: "nieuwbouwwijk-in-aanbouw",
    title: "Nieuwbouwwijk in aanbouw",
    category: "bouw",
    location: "Purmerend (voorbeeld)",
    summary:
      "Maandelijkse voortgangsopnames van een nieuwbouwproject, steeds vanaf hetzelfde punt.",
    body:
      "Een ontwikkelaar wilde de bouw van 48 woningen vastleggen, zodat kopers de voortgang konden volgen.\n\nElke maand vloog ik dezelfde route op dezelfde hoogte. Daardoor zijn de beelden onderling goed te vergelijken en ontstaat er vanzelf een reeks.\n\nDe foto's stonden op de projectwebsite en zijn aan het eind gebruikt voor een korte terugblikvideo.",
    cover_url: "/images/project-vastgoed-2.jpg",
    cover_alt: "Voorbeeldbeeld: luchtfoto van een nieuwbouwwijk in aanbouw",
    title_en:
      "New housing estate under construction",
    location_en:
      "Purmerend (example)",
    summary_en:
      "Monthly progress shots of a new-build project, always from the same point.",
    body_en:
      "A developer wanted the construction of 48 homes recorded, so buyers could follow the progress.\n\nEvery month I flew the same route at the same altitude. That makes the images easy to compare and a series builds up by itself.\n\nThe photos were on the project website and were used at the end for a short look-back video.",
    cover_alt_en:
      "Example image: aerial photo of a housing estate under construction",
    video_url: "",
    published: 0,
    featured: 0,
    sort_order: 12,
    is_example: 1,
    images: [
      [
        "/images/gallery-2.jpg",
        "Voorbeeldbeeld: overzicht van de bouwplaats",
        "Example image: overview of the construction site",
      ],
    ],
  },
  {
    slug: "bedrijventerrein-achtersluispolder",
    title: "Bedrijventerrein Achtersluispolder",
    category: "bedrijven",
    location: "Zaandam (voorbeeld)",
    summary:
      "Sfeer- en overzichtsbeelden van een logistiek terrein voor de nieuwe bedrijfswebsite.",
    body:
      "Het bedrijf verhuisde naar een groter pand en wilde daar beelden van voor de website en een investeerderspresentatie.\n\nWe hebben gevlogen op een rustige zaterdagochtend, zodat er geen vrachtverkeer op het terrein stond. Naast overzichten heb ik een paar lagere passages gemaakt langs de gevel.\n\nOpgeleverd: acht foto's en een montage van veertig seconden.",
    cover_url: "/images/project-bedrijven-1.jpg",
    cover_alt: "Voorbeeldbeeld: luchtfoto van een bedrijventerrein",
    title_en:
      "Achtersluispolder business park",
    location_en:
      "Zaandam (example)",
    summary_en:
      "Atmosphere and overview shots of a logistics site for the new company website.",
    body_en:
      "The company moved to a larger building and wanted images of it for the website and an investor presentation.\n\nWe flew on a quiet Saturday morning, so there was no lorry traffic on the site. Besides overviews I made a few lower passes along the façade.\n\nDelivered: eight photos and a forty-second edit.",
    cover_alt_en:
      "Example image: aerial photo of a business park",
    video_url: "",
    published: 0,
    featured: 0,
    sort_order: 13,
    is_example: 1,
    images: [
      [
        "/images/gallery-2.jpg",
        "Voorbeeldbeeld: het terrein vanuit het noorden",
        "Example image: the site from the north",
      ],
    ],
  },
  {
    slug: "productielocatie-in-bedrijf",
    title: "Productielocatie in bedrijf",
    category: "bedrijven",
    location: "Wormerveer (voorbeeld)",
    summary:
      "Beelden van een productielocatie, gebruikt in een wervingscampagne voor nieuwe collega's.",
    body:
      "Voor een wervingscampagne waren beelden nodig die laten zien hoe groot de locatie is en hoe er gewerkt wordt.\n\nWe hebben vooraf met de bedrijfsleiding afgestemd welke delen wel en niet in beeld mochten komen. Tijdens de vlucht hield een collega toezicht op de begane grond.\n\nDe beelden zijn gebruikt op de vacaturepagina en in korte video's voor sociale media.",
    cover_url: "/images/project-bedrijven-2.jpg",
    cover_alt: "Voorbeeldbeeld: luchtfoto van een productielocatie",
    title_en:
      "Production site at work",
    location_en:
      "Wormerveer (example)",
    summary_en:
      "Images of a production site, used in a recruitment campaign for new colleagues.",
    body_en:
      "A recruitment campaign needed images showing how large the site is and how the work is done.\n\nWe agreed in advance with management which parts could and could not be shown. During the flight a colleague kept watch on the ground.\n\nThe images were used on the vacancies page and in short videos for social media.",
    cover_alt_en:
      "Example image: aerial photo of a production site",
    video_url: "",
    published: 0,
    featured: 0,
    sort_order: 14,
    is_example: 1,
    images: [],
  },
];


/**
 * Zet de voorbeeldgegevens klaar. Diensten en projecten die al bestaan blijven
 * ongemoeid, en de beschikbaarheid wordt alleen ingevuld als die nog leeg is.
 * Geeft terug hoeveel rijen er daadwerkelijk zijn toegevoegd.
 */
export function installExampleData(db: Database): {
  services: number;
  projects: number;
  weekly: number;
} {
  const insertService = db.prepare(
    `INSERT INTO services
      (slug, name, description, name_en, description_en, price_label_en,
       duration_minutes, price_label, buffer_minutes,
       bookable, intro_only, sort_order, active)
     VALUES (@slug, @name, @description, @name_en, @description_en,
             @price_label_en, @duration_minutes, @price_label,
             @buffer_minutes, @bookable, @intro_only, @sort_order, @active)
     ON CONFLICT(slug) DO NOTHING`,
  );
  const insertProject = db.prepare(
    `INSERT INTO projects
      (slug, title, category, location, summary, body, cover_url, cover_alt,
       title_en, location_en, summary_en, body_en, cover_alt_en, is_example,
       video_url, published, featured, sort_order, created_utc)
     VALUES (@slug, @title, @category, @location, @summary, @body, @cover_url,
             @cover_alt, @title_en, @location_en, @summary_en, @body_en,
             @cover_alt_en, @is_example, @video_url, @published, @featured,
             @sort_order, @created_utc)
     ON CONFLICT(slug) DO NOTHING`,
  );
  const insertImage = db.prepare(
    "INSERT INTO project_images (project_id, url, alt, alt_en, sort_order) VALUES (?, ?, ?, ?, ?)",
  );
  const insertWindow = db.prepare(
    "INSERT INTO weekly_availability (weekday, start_minute, end_minute) VALUES (?, ?, ?)",
  );

  const counts = { services: 0, projects: 0, weekly: 0 };

  const run = db.transaction(() => {
    for (const service of EXAMPLE_SERVICES) {
      counts.services += insertService.run(service).changes;
    }

    const existingWeekly = db
      .prepare("SELECT COUNT(*) AS n FROM weekly_availability")
      .get() as { n: number };
    if (existingWeekly.n === 0) {
      for (const [weekday, start, end] of EXAMPLE_WEEKLY) {
        insertWindow.run(weekday, start, end);
        counts.weekly += 1;
      }
    }

    for (const project of EXAMPLE_PROJECTS) {
      const { images, ...row } = project;
      const result = insertProject.run({ ...row, created_utc: Date.now() });
      if (result.changes === 0) continue; // bestond al
      counts.projects += 1;
      const id = Number(result.lastInsertRowid);
      images.forEach(([url, alt, altEn], index) =>
        insertImage.run(id, url, alt, altEn, index),
      );
    }
  });
  run();

  return counts;
}

/** Verwijdert alle inhoud, inclusief echte boekingen en berichten. */
export function wipeAllData(db: Database): void {
  db.exec(`
    DELETE FROM project_images;
    DELETE FROM projects;
    DELETE FROM bookings;
    DELETE FROM contact_messages;
    DELETE FROM mail_log;
    DELETE FROM services;
    DELETE FROM weekly_availability;
    DELETE FROM date_overrides;
    DELETE FROM settings;
  `);
}
