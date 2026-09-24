# Wijzigingen

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

## Nog te doen — dit kan de website niet voor je oplossen

- Acht tot twaalf **eigen** dronefoto's, en minstens drie echte cases.
- Een portretfoto voor de over-sectie. Daar staat nu een abstract verloop, en
  een gezicht wekt meer vertrouwen.
- KvK, BTW, RDW-operatornummer en verzekering invullen in `content/site.ts`.
- Algemene voorwaarden en een echte privacyverklaring.
- Pas daarna `DEMO_MODE="false"` en `SITE_STATUS="live"`.
