# Wijzigingen

## September 2026 — twee echte projecten in het portfolio

- **De Zaan in Wormerveer** en **Knooppunt Zaandam bij zonsondergang** staan in
  het portfolio, in beide talen, elk met een eigen dronevideo en posterbeeld.
  De homepage licht precies deze twee uit, in die volgorde.
- Het verzonnen project *Veenweidegebied bij zonsopkomst* is verdwenen, met
  zijn galerijbeelden erbij.
- **Nieuw veld `is_example`.** Alleen verzonnen projecten dragen nog het label
  "Voorbeeldproject". De melding boven het portfolio beweert niet langer dat
  alles fictief is, maar zegt dat alleen gelabelde projecten dat zijn — en valt
  weg zodra er geen voorbeeld meer tussen staat. Standaard is een project
  *echt*: wat jij zelf aanmaakt krijgt nooit per ongeluk dat label.
- De projectpagina speelt een eigen videobestand nu zelf af met de ingebouwde
  speler: 16:9, posterbeeld, bediening, geen automatisch afspelen. Een
  YouTube- of Vimeo-link blijft werken zoals hij werkte. De portfoliokaart
  haalt alleen het posterbeeld op, niet de video van twintig megabyte.
- **Opgelost: een niet-bestaand project gaf status 200.** De 404-pagina
  verscheen wel, maar met de verkeerde statuscode, en zo'n "soft 404" wordt
  door Google gewoon geïndexeerd. Oorzaak was `app/(site)/loading.tsx`: die
  maakte een Suspense-grens, waardoor de status al verstuurd was voordat de
  pagina wist dat het project niet bestond. Dat laadskelet is weg; pagina's
  renderen in zo'n twintig milliseconde, dus het viel toch nauwelijks op.
- Posterbeelden uit `public/media` mogen door de beeldoptimalisatie van Next.
  Zonder dat gaf de portfoliokaart een 400 en bleef de afbeelding leeg.

Draai na het uitrollen eenmalig
`node scripts/onderhoud/echte-projecten-2026.cjs`: de projecten staan in de
database en komen daar niet vanzelf in.

## September 2026 — fly.dev stuurt door naar het eigen domein

Het adres `hoogbeeld-media.fly.dev` is niet weg te halen: dat krijgt elke
Fly-app automatisch. Wie het toch intikt, wordt nu blijvend (301) doorgestuurd
naar dezelfde pagina op `hoogbeeldmedia.nl`. Twee adressen die dezelfde inhoud
serveren telt voor Google als dubbele inhoud.

Twee paden gaan er niet in mee, allebei met opzet: `/api/` niet, want daar zit
de gezondheidscheck van Fly op, en `/admin` niet, zodat je er altijd nog bij
kunt als er iets mis is met je domein of certificaat.

Werkt alleen zolang `NEXT_PUBLIC_SITE_URL` op je eigen domein staat. Ontbreekt
die of wijst hij zelf naar fly.dev, dan gebeurt er niets — je kunt jezelf er
dus niet mee buitensluiten.

## September 2026 — correcties Engelse vertaling

- "short films of property" werd "short films for real estate, commercial sites
  and construction projects"; ook in de zoekresultaten en het deelbeeld.
- "Specific permit" was niet de officiële term. Nu "operational authorisation
  for the ‘specific’ category", conform EASA. Staat op twee plekken: bij de
  uitzonderingen op het tarief en in de vraag over evenementen.
- "shoot moments" overal vervangen door "shoot sessions".
- Losse verbeteringen: "For listings" → "For property listings, websites and
  sales brochures", "polder" → "polders", een sensor die nu "produces sharp
  images even at dusk" in plaats van "stays sharp", "Request refused" →
  "Request rejected", en het anglicisme "received it in good order" eruit.
- Natuurlijker Engels: Start → Home, Get acquainted → Introduction, From
  conversation to file → From first conversation to final files, en nog drie.
- **De Engelse galerij had nog Nederlandse alt-teksten.** De kolom `alt_en`
  bestond wel, maar de voorbeeldgegevens vulden hem niet, waardoor een
  schermlezer op de Engelse site Nederlandse omschrijvingen voorlas. De zes
  galerijbeelden hebben nu een Engelse tekst, en
  `scripts/onderhoud/werkgebied-noord-holland.cjs` vult ze bij in een database
  die al draait.
- "Townhouse on the river Zaan" suggereert een geschakelde stadswoning. Nu
  "Detached house on the River Zaan".

## September 2026 — knoppen en navigatie

- Een pijltje bij "Plan een afspraak" en bij de knop in de hero, dat een klein
  stukje meeschuift als je erover zweeft. Alleen bij die twee: als elke knop
  een pijl heeft, zegt de pijl niets meer.
- De taalknop heeft een wereldbol gekregen naast EN/NL.
- **De footer markeert nu de pagina waar je al bent.** De link leidde wel
  degelijk ergens heen, maar stond je al op die pagina, dan gebeurde er niets
  zichtbaars en leek hij kapot. Nu staat er een streep onder en heeft hij geen
  linkkleur meer, net als in de kop.

## September 2026 — demomelding weg, wereldbol bij de taalknop

- De balk "Projecten en foto's zijn nog voorbeelden" is verdwenen, net als de
  uitlegpagina `/demo` waar hij naartoe wees. Daarmee vervalt ook de
  omgevingsvariabele `DEMO_MODE`.
- De taalknop heeft een wereldbol gekregen naast de EN/NL-aanduiding.

**Let op:** er staat nu niets meer op de site dat bezoekers vertelt dat het
portfolio nog voorbeeldprojecten bevat. Vervang die door eigen werk voordat je
de site openzet.

## September 2026 — vindbaarheid en beveiligingsheaders

Naar aanleiding van een crawl met Screaming Frog.

- **Opgelost: de site wees zoekmachines naar localhost.** Zonder de variabele
  `NEXT_PUBLIC_SITE_URL` viel het publieke adres terug op
  `http://localhost:3000`. Elke canonieke link, elke hreflang-verwijzing en de
  hele sitemap wezen daarheen — een adres dat voor de buitenwereld niet
  bestaat. Dat verklaarde in één klap vijf meldingen uit het rapport.
  Het adres staat nu vast in `fly.toml`, en als het er ooit niet is leidt de
  site het af uit het verzoek zelf, zodat er nooit meer localhost uit kan
  komen.
- **Beveiligingsheaders toegevoegd**: HSTS, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy:
  strict-origin-when-cross-origin` en een Content-Security-Policy. Alles wat de
  site laadt komt van de site zelf, dus de policy mag streng: geen enkele
  externe bron is toegestaan.
- De link naar de beheeromgeving in de footer staat op `nofollow`. Die pagina
  staat op disallow in robots.txt, maar crawlers liepen er toch op af.

## September 2026 — hero-video en de verbinding

De hero-video blijft weg bij databesparing en op 2G. Op een gewone mobiele
verbinding speelt hij gewoon af.

- `Save-Data` aan, of een verbinding die de browser als 2G of trager meldt: er
  wordt geen videobestand opgehaald en het posterbeeld blijft staan. Dat
  scheelt ruim 3 MB bij het laden.
- Dit geldt op elk schermformaat, niet alleen op een telefoon: databesparing is
  iets wat de bezoeker zelf aanzet, en dat geldt net zo goed achter een laptop
  op een gedeelde hotspot.
- Browsers zonder deze informatie (Safari, Firefox) spelen de video gewoon af.
- De hoogte van de hero en de positie van de tekst veranderen in geen enkel
  geval.

## September 2026 — toegankelijkheid

Naar aanleiding van een Lighthouse-meting. Toegankelijkheid ging van 84 naar
100; de opmaak op het scherm verandert nauwelijks.

- **Ongeldige opmaak hersteld.** De werkwijze-lijst had `<div>`-elementen als
  directe kinderen van de `<ol>`, en de vragenlijst had er een laag te veel
  tussen de `<dl>` en de vraag-en-antwoordparen. Dat kwam door het element dat
  de inhoud laat verschijnen bij het scrollen; dat staat nu op de juiste plek
  in de nesting. Een schermlezer kondigde daardoor geen lijst aan.
- **De lichtste grijstint was te donker voor tekst.** `mist-600` haalde als
  tekst van 12 px maar 3,7:1, onder de norm van 4,5:1. Nu 5,1:1. Dat raakt de
  kleine regels onder de boekingsmodule, in de footer en in de beheeromgeving.

## September 2026 — eigen dronebeelden

De aangeleverde video's staan nu in de site. De bestanden zelf zijn ongewijzigd
gebleven en worden rechtstreeks vanuit `public/media` geserveerd.

### Hero

- De hero heeft een videoachtergrond in plaats van het voorbeeldbeeld. Staand
  beeld tot 767 px, liggend daarboven; WebM waar de browser dat aankan, anders
  MP4.
- Er wordt altijd precies één van de vier bestanden opgehaald. De `<video>`
  vertrekt zonder bron van de server en krijgt er pas in de browser een
  toegewezen — met vier `<source>`-elementen zou een browser er meer dan één
  kunnen proberen, en zonder dat uitstel zouden server en browser verschillend
  renderen.
- `prefers-reduced-motion: reduce`: er wordt geen video opgehaald en niets
  gestart. Alleen het posterbeeld, op dezelfde hoogte.
- Laadt de video niet, dan blijft het posterbeeld staan en werken kop en knop
  gewoon. De hoogte van de hero verandert nooit.
- **Opgelost onderweg:** de eerste regel van de kop haalde 2,91:1 tegenover de
  lichte lucht in het beeld, onder de toegankelijkheidsnorm. De sluier over de
  video loopt nu naar onderen toe op: bovenin blijft het beeld licht, achter de
  tekst is het donker genoeg. Gemeten: 4,5:1 en hoger.

### Showreel

- Nieuwe showreel in de werk-sectie op de homepage, boven de projecten.
- Speelt niet vanzelf af, heeft de ingebouwde bediening van de browser en een
  vast 16:9-kader, zodat de pagina niet verspringt.
- Van de 56 MB wordt bij het laden van de pagina 0,37 MB opgehaald: alleen de
  kop van het bestand. De rest komt pas na een klik.
- **Opgelost onderweg:** een videospeler staat in de tabvolgorde, maar `video`
  ontbrak in de focusregel van de site. De standaardring van de browser is een
  donkere lijn van één pixel en viel op deze achtergrond weg.

### Overig

- De video's en het poster krijgen een cache van een week mee. Ze stonden op
  `max-age=0`, waardoor de browser bij elk bezoek opnieuw navroeg of ze nog
  klopten.
- De hero-teksten en de showreel staan in beide talen in `content/copy.nl.ts`
  en `content/copy.en.ts`.

## September 2026 — Engelse versie

De site staat nu in twee talen online. Nederlands houdt zijn adressen, Engels
komt erbij op `/en`.

### Twee talen

- Nederlands op `/`, `/portfolio`, `/contact`; Engels op `/en`,
  `/en/portfolio`, `/en/contact`. Bestaande links en zoekresultaten blijven dus
  werken.
- Geen omleiding op de browsertaal. De bezoeker kiest zelf met de knop `EN` /
  `NL` in de kop; zoekmachines krijgen `hreflang` in de kop van elke pagina en
  in de sitemap.
- Ook de pagina **binnenkort online** heeft beide talen, en `/en/…` stuurt terug
  naar `/en` in plaats van naar de Nederlandse voorpagina.

### Wat er meevertaalt

- Alle pagina's, knoppen en formulieren, inclusief de boekingsmodule en de
  foutmeldingen die de server teruggeeft.
- Datums: "za 26 september" wordt "Sat 26 September".
- De bevestigingsmails aan de klant. De taal wordt bij de boeking opgeslagen,
  dus ook een latere bevestiging of annulering komt in de juiste taal. De
  meldingen aan jou blijven Nederlands, met een regel erbij als de aanvraag via
  de Engelse site kwam.

### Opzet

- De teksten staan per taal in `content/copy.nl.ts` en `content/copy.en.ts`. Het
  type komt uit het Nederlands, dus een vergeten Engelse tekst is een typefout
  en geen lege pagina. `content/site.ts` houdt alleen wat in beide talen gelijk
  is.
- Elke pagina bestaat één keer in `components/pages/` en krijgt de taal mee. De
  bestanden onder `app/` zijn alleen nog route en metadata.
- De controle op tijdsloten geeft een reden terug in plaats van een zin, zodat
  dezelfde controle een Nederlandse melding in het beheer en een Engelse melding
  op `/en` kan opleveren.

### Diensten en projecten

- Engelse velden in de beheeromgeving bij diensten, projecten en galerijfoto's.
  Laat je een veld leeg, dan toont de Engelse site de Nederlandse tekst.
- De voorbeelddiensten en -projecten zijn vertaald. In een bestaande database
  vul je die vertalingen aan met `scripts/onderhoud/werkgebied-noord-holland.cjs`;
  dat raakt alleen velden aan die nog leeg zijn.

## September 2026 — herziening na de audit

Doorgevoerd naar aanleiding van de website-audit en de ondernemersgids.
De boekingsmodule, de beheeromgeving en de e-mailafhandeling zijn ongemoeid
gebleven; er is niets opnieuw opgebouwd.

### De site gaat op slot tot hij af is

- Nieuwe schakelaar `SITE_STATUS`. Staat die niet op `"live"`, dan krijgt een
  bezoeker alleen de pagina **binnenkort online**: naam, beeldmerk en één zin.
- Alle andere pagina's sturen we terug naar die voorpagina. Dat gebeurt in
  `proxy.ts`, dus vóór het opbouwen van de pagina — er gaat niets de deur uit.
- `robots.txt` vraagt zoekmachines weg te blijven en de sitemap is leeg zolang
  de site dicht is. Elke pagina krijgt bovendien `noindex` mee.
- Ben je ingelogd via `/admin`, dan zie je de volledige site, met een balk
  bovenin die eraan herinnert dat niemand anders meekijkt.

### Vormgeving en typografie

- **Lettertype:** Inter en Sora eruit, Geist en Geist Mono erin. Het monospace
  zusje draagt nu de kleine labels, de stapnummers en de prijzen, zodat die zich
  vanzelf onderscheiden van de koppen.
- **Opgelost:** de site draaide tot nu toe in het lettertype van het
  besturingssysteem. `--font-sans` verwees naar een variabele die alleen op
  `<body>` bestond, terwijl Tailwind hem op `:root` zet; daarmee was de waarde
  ongeldig. De variabelen staan nu op `<html>`.
- **Opgelost:** Tailwind laat thema-variabelen weg die het nergens als
  utility-klasse terugziet. Daardoor ontbraken enkele kleuren die alleen in de
  handgeschreven CSS worden gebruikt. Het thema staat nu op `static`.
- **Kleur:** het blauwe accent is vervangen door een gedempte staalblauwe tint,
  en de grijzen zijn neutraal gemaakt. Het logo is monochroom leisteengrijs; de
  site volgt dat nu in plaats van er een fel blauw naast te zetten.
- **Koppen** zijn groter en strakker gespatieerd, met een kortere regelafstand.
  Alinea's zijn begrensd op zo'n 65 tekens.
- **Cijfers** staan in tabelcijfers, zodat prijzen en tijden onder elkaar
  uitlijnen.
- Fijne ruis over de achtergrond, tegen het vlakke van een egaal donker vlak.
- Knoppen reageren nu ook op indrukken, en de schaduw heeft de kleur van de knop
  in plaats van zwart.
- **Opgelost:** `Reveal` rekende op de server en in de browser verschillend,
  wat bij elke paginaweergave een hydratiefout opleverde. De tekst staat nu ook
  gewoon in de HTML, voor bezoekers zonder JavaScript en voor zoekmachines.

### Indeling en tekst

- Navigatie volledig Nederlands: **Start, Werk, Contact**.
- De diensten staan niet meer als vier gelijke kaartjes naast elkaar maar als
  lijst met de kop ernaast. Zonder beeld per dienst zijn kaarten lege dozen.
- Nieuwe sectie **Tarieven** met per dienst het bedrag, en ernaast wat er wel en
  niet in zit — inclusief voorrijkosten, wachttijd en gebruiksrecht.
- Nieuwe sectie **Vragen**: luchtruim, evenementen, privacy van de buren, weer,
  levertijd en wat je met de beelden mag doen. Twee kolommen, geen uitklapmenu:
  wie zich afvraagt of dit wel mag, hoeft niet te klikken.
- Teksten overal ingekort. De hero heeft nog één zin en een regel met harde
  feiten in plaats van een tweede alinea.
- De regel "vervang `public/images/hero.jpg`" is weg, en de tekst stond ook in
  de voorbeeldafbeelding zelf gebakken; die is opnieuw gegenereerd.
- Footer toont KvK, BTW, RDW-operatornummer en verzekeraar zodra die in
  `content/site.ts` staan. Wat leeg is, laat de footer weg.
- Velden voor telefoon, WhatsApp en Instagram toegevoegd; ook die verschijnen
  alleen als ze zijn ingevuld.

### Diensten, tarieven en aanbod

- Evenementen is van de site af. Met een C0-drone in de open categorie mag je
  niet boven publiek vliegen, en dat is geen belofte om te doen. In de vragen
  staat nu waarom.
- **Bouwvordering** is ervoor in de plaats gekomen: dezelfde route, elke maand
  opnieuw, en dus terugkerende omzet.
- Tarieven herzien volgens de ondernemersgids:

  | Dienst | Was | Nu |
  | --- | --- | --- |
  | Fotoreportage | € 149 | vanaf € 195 |
  | Foto en korte film | € 249 | vanaf € 349 |
  | Bedrijfsfilm | — | vanaf € 495 |
  | Bouwvordering | — | vanaf € 149 per bezoek |

- Bestaande installaties werk je bij met
  `node scripts/onderhoud/tarieven-2026.cjs`. Diensten die je zelf hebt
  aangepast, blijven staan.

### Zoekmachines

- Paginatitels en omschrijvingen in het Nederlands, met de dienst vooraan.
- De omschrijving van het portfolio noemt niet langer evenementen.

### Onderhoud

- De controle van het inlogcookie staat nu in `lib/session-token.ts`, zodat
  `proxy.ts` hem kan gebruiken. Vijf tests erbij; in totaal 45.

## September 2026 — contactformulier

- **Opgelost: het versturen duurde minuten.** Voor elk bericht werd een nieuwe
  SMTP-verbinding opgezet, zonder tijdslimiet, en de twee berichten (bevestiging
  naar de bezoeker, melding naar jou) gingen na elkaar de deur uit. Antwoordde
  de mailserver niet, dan wachtte nodemailer standaard twee minuten per
  bericht — vier minuten "bezig met versturen" in totaal. De verbinding wordt nu
  hergebruikt, de twee berichten gaan tegelijk, en er staat een grens op het
  wachten: maximaal acht seconden. Hetzelfde geldt voor de boekingsaanvragen.
- **Opgelost: het formulier liep leeg bij een foutmelding.** React maakt een
  formulier na het versturen automatisch leeg. Werd een veld afgekeurd — een
  bericht korter dan tien tekens, bijvoorbeeld — dan begon je weer helemaal
  opnieuw. De ingevulde tekst komt nu mee terug en staat er weer in.
- De foutmelding krijgt de aandacht van de schermlezer en van de cursor, zodat
  op een mobiel duidelijk is waaróm er niets gebeurde.

## Nog te doen — dit kan de website niet voor je oplossen

- Acht tot twaalf **eigen** dronefoto's, en minstens drie echte cases.
- Een portretfoto voor de over-sectie. Daar staat nu een abstract verloop, en
  een gezicht wekt meer vertrouwen.
- KvK, BTW, RDW-operatornummer en verzekering invullen in `content/site.ts`.
- Algemene voorwaarden en een echte privacyverklaring.
- Pas daarna `DEMO_MODE="false"` en `SITE_STATUS="live"`.
