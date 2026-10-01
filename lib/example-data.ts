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
      "Vrijblijvend videogesprek van maximaal 20 minuten over locatie en wensen.",
    duration_minutes: 20,
    price_label: "Gratis",
    name_en: "Intro call",
    description_en:
      "A no-obligation video call of up to 20 minutes about the location and your wishes.",
    price_label_en: "Free",
    buffer_minutes: 15,
    bookable: 1,
    intro_only: 0,
    sort_order: 1,
    active: 1,
  },
  {
    slug: "dronefotografie",
    name: "Dronefotoreportage",
    description:
      "Eén object of terrein, 10–15 bewerkte luchtfoto's.\nTot 60 minuten op locatie.",
    duration_minutes: 60,
    price_label: "vanaf € 235,95 incl. btw · € 195 excl. btw",
    name_en: "Drone photo shoot",
    description_en:
      "One building or site, 10–15 edited aerial photos.\nUp to 60 minutes on location.",
    price_label_en: "from € 235.95 incl. VAT · € 195 excl. VAT",
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
      "10–15 bewerkte luchtfoto's plus een gemonteerde droneclip van 30–45 seconden.\nTot 90 minuten op locatie, passende muziek met gebruikslicentie en één correctieronde.",
    duration_minutes: 90,
    price_label: "vanaf € 422,29 incl. btw · € 349 excl. btw",
    name_en: "Photos and short film",
    description_en:
      "10–15 edited aerial photos plus an edited drone clip of 30–45 seconds.\nUp to 90 minutes on location, fitting licensed music and one round of corrections.",
    price_label_en: "from € 422.29 incl. VAT · € 349 excl. VAT",
    buffer_minutes: 45,
    bookable: 1,
    intro_only: 0,
    sort_order: 3,
    active: 1,
  },
  {
    // De slug blijft "bedrijfsfilm": bestaande boekingen en verwijzingen
    // hangen eraan. Alleen de zichtbare naam is veranderd.
    slug: "bedrijfsfilm",
    name: "Drone-sfeerfilm",
    description:
      "Film van 60–90 seconden over één terrein, locatie of project, gemaakt met dronebeelden.\nTot 90 minuten op locatie, passende muziek met gebruikslicentie en één correctieronde.",
    duration_minutes: 90,
    price_label: "vanaf € 598,95 incl. btw · € 495 excl. btw",
    name_en: "Drone atmosphere film",
    description_en:
      "A 60–90 second film about one site, location or project, made with drone footage.\nUp to 90 minutes on location, fitting licensed music and one round of corrections.",
    price_label_en: "from € 598.95 incl. VAT · € 495 excl. VAT",
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
      "Vaste standpunten, 5–10 bewerkte beelden per bezoek en maximaal 45 minuten op locatie.\nHet eerste bezoek omvat de eerste voorbereiding.",
    duration_minutes: 45,
    price_label:
      "eerste vanaf € 235,95 / vervolg vanaf € 180,29 incl. btw (€ 195 / € 149 excl.)",
    name_en: "Construction progress",
    description_en:
      "Fixed viewpoints, 5–10 edited images per visit and up to 45 minutes on location.\nThe first visit includes the initial preparation.",
    price_label_en:
      "first from € 235.95 / follow-up from € 180.29 incl. VAT (€ 195 / € 149 excl.)",
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
      "Meerdere locaties, opnamedagen of een uitgebreidere productie worden vooraf geoffreerd.",
    duration_minutes: 20,
    price_label: "Op aanvraag",
    name_en: "Custom project",
    description_en:
      "Multiple locations, shooting days or a more extensive production are quoted beforehand.",
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
    slug: "ijburg-vanuit-de-lucht",
    title: "IJburg vanuit de lucht",
    category: "vastgoed",
    location: "IJburg, Amsterdam",
    summary:
      "Een drone-impressie van IJburg, met moderne waterfrontarchitectuur, waterwoningen en de jachthaven.",
    body:
      "Vanuit de lucht komen de moderne woonblokken, waterwoningen en de jachthaven van IJburg samen in één overzicht van het stadsdeel. De rustige camerabewegingen laten zien hoe de architectuur en het water het karakter van deze Amsterdamse wijk bepalen.",
    cover_url: "/media/ijburg-poster.webp",
    cover_alt: "Luchtbeeld van de waterwoningen en jachthaven in IJburg.",
    title_en: "IJburg from the air",
    location_en: "IJburg, Amsterdam",
    summary_en:
      "An aerial impression of IJburg, featuring modern waterfront architecture, waterside homes and the marina.",
    body_en:
      "From above, IJburg's modern apartment blocks, waterside homes and marina come together in a single overview of the district. The calm camera movements show how architecture and water shape the character of this Amsterdam neighbourhood.",
    cover_alt_en: "Aerial view of IJburg's waterside homes and marina.",
    video_url: "/media/ijburg-dronevideo.mp4",
    published: 1,
    featured: 1,
    sort_order: 2,
    is_example: 0,
    images: [
      [
        "/media/ijburg-01.webp",
        "Moderne woningen en water in IJburg, gefilmd vanuit de lucht.",
        "Modern homes and waterways in IJburg, filmed from the air.",
      ],
      [
        "/media/ijburg-02.webp",
        "De jachthaven en open water rond IJburg.",
        "The marina and open water around IJburg.",
      ],
      [
        "/media/ijburg-03.webp",
        "Waterwoningen aan een kanaal in IJburg.",
        "Waterside homes along a canal in IJburg.",
      ],
      [
        "/media/ijburg-04.webp",
        "Woonarchitectuur en waterwegen in IJburg.",
        "Residential architecture and waterways in IJburg.",
      ],
    ],
  },
  {
    slug: "de-zaanse-schans-vanuit-de-lucht",
    title: "De Zaanse Schans vanuit de lucht",
    category: "natuur",
    location: "Zaanstad",
    summary:
      "Een weids dronebeeld van de molens, waterwegen en het dorp op de Zaanse Schans.",
    body:
      "Voor deze locatie-impressie legde ik de molens, waterwegen en karakteristieke houten huizen van de Zaanse Schans vast.\n\nDe montage beweegt van dichtbij langs de molens naar een breder overzicht van het dorp en het omliggende landschap.",
    cover_url: "/media/zaanse-schans-poster.webp",
    cover_alt:
      "Dronebeeld van een groene molen, water en houten huizen op de Zaanse Schans",
    title_en: "Zaanse Schans from Above",
    location_en: "Zaanstad",
    summary_en:
      "A sweeping aerial view of the windmills, waterways and village at Zaanse Schans.",
    body_en:
      "This location film captures the windmills, waterways and distinctive wooden houses of Zaanse Schans.\n\nThe edit moves from closer views of the mills to a wider view of the village and surrounding landscape.",
    cover_alt_en:
      "Aerial view of a green windmill, water and wooden houses at Zaanse Schans",
    video_url: "/media/zaanse-schans-dronevideo-v3.mp4",
    published: 1,
    featured: 1,
    sort_order: 3,
    is_example: 0,
    images: [
      [
        "/media/zaanse-schans-01.webp",
        "Molens en waterwegen op de Zaanse Schans vanuit de lucht",
        "Aerial view of windmills and waterways at Zaanse Schans",
      ],
      [
        "/media/zaanse-schans-02.webp",
        "Uitzicht over het water en de molens van de Zaanse Schans",
        "View across the water towards the windmills of Zaanse Schans",
      ],
      [
        "/media/zaanse-schans-03.webp",
        "Houten huizen en groen landschap rond de Zaanse Schans",
        "Wooden houses and green landscape around Zaanse Schans",
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
