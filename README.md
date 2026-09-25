# Hoogbeeld Media — website met online boekingsmodule

Een complete website voor een zelfstandige dronepiloot: portfolio, contactpagina
en een boekingsmodule op de homepage, met een beveiligde beheeromgeving op
`/admin`.

> **De site staat standaard dicht.** Bezoekers zien alleen een pagina met de
> mededeling dat hij binnenkort opengaat; als ingelogde beheerder zie je alles.
> Zie [De site open- en dichtzetten](#de-site-open--en-dichtzetten).
>
> **Alle bedrijfsgegevens, projecten en prijzen in dit project zijn fictief.**
> Ze staan er als voorbeeld en zijn bedoeld om vervangen te worden.

## Inhoud

1. [Starten en publiceren](#1-starten-en-publiceren)
2. [Toegang tot de beheeromgeving](#2-toegang-tot-de-beheeromgeving)
3. [Beschikbaarheid aanpassen](#3-beschikbaarheid-aanpassen)
4. [Fictieve inhoud vervangen](#4-fictieve-inhoud-vervangen)
5. [Nederlands en Engels](#5-nederlands-en-engels)
6. [Koppelingen die je nog moet instellen](#6-koppelingen-die-je-nog-moet-instellen)
7. [Technische opzet](#technische-opzet)

---

## 1. Starten en publiceren

### Lokaal starten

```bash
npm install

# Wachtwoord voor de beheeromgeving aanmaken
npm run hash-password -- 'kies-hier-een-lang-wachtwoord'
# Zet de twee regels uit de uitvoer in .env.local (zie .env.example)

npm run seed      # vult de database met de fictieve voorbeeldgegevens
npm run dev       # http://localhost:3000
```

| Commando                  | Doel                                                  |
| ------------------------- | ----------------------------------------------------- |
| `npm run dev`             | Ontwikkelserver                                       |
| `npm run build`           | Productiebuild                                        |
| `npm start`               | Productieserver (na `build`)                          |
| `npm test`                | Unittests (tijdzone, tijdvakken, wachtwoorden)        |
| `npm run typecheck`       | TypeScript-controle                                   |
| `npm run lint`            | ESLint                                                |
| `npm run seed`            | Voorbeeldgegevens toevoegen                           |
| `npm run seed -- --reset` | Alles wissen en opnieuw vullen                        |
| `npm run demo-data`       | Voorbeeldboekingen en een voorbeeldbericht toevoegen   |
| `npm run hash-password`   | Wachtwoord-hash en sessiesleutel maken                |
| `npm run placeholders`    | De tijdelijke voorbeeldafbeeldingen opnieuw genereren |

### Publiceren

De site slaat alles op de schijf op: de database met je boekingen en berichten,
en de foto's die je uploadt. Kies daarom hosting met een **schijf die blijft
bestaan**. Een omgeving die bij elke nieuwe versie de schijf leeggooit, zoals de
standaard serverless hosting van Vercel, werkt niet zonder aanpassing.

In de repository staan een `Dockerfile` en een `fly.toml`, zodat je met een van
onderstaande routes kunt publiceren.

#### Route A — Fly.io (aanbevolen)

Je hebt een Fly.io-account nodig, inclusief betaalgegevens. Een enkele kleine
machine met een schijf van 1 GB valt in de goedkoopste categorie.

In `fly.toml` staat `min_machines_running = 0`: de machine gaat slapen als er
niemand op de site is, en wordt door het eerste bezoek weer gewekt. Dat scheelt
kosten, maar die ene bezoeker wacht een paar seconden langer. Wil je dat niet,
zet hem dan op `1`; de machine draait dan altijd door.

Op macOS en Linux:

```bash
# eenmalig: installeren en inloggen
curl -L https://fly.io/install.sh | sh
fly auth login

# in de projectmap. De appnaam moet wereldwijd uniek zijn op Fly; is
# "hoogbeeld-media" bezet, kies dan een andere en zet die ook in fly.toml.
fly launch --no-deploy --copy-config --name hoogbeeld-media
fly volumes create hoogbeeld_media_data --size 1 --region ams

# geheimen instellen (deze komen NOOIT in de repository)
npm run hash-password -- 'kies-hier-een-lang-wachtwoord'
fly secrets set ADMIN_PASSWORD_HASH="scrypt:..." AUTH_SECRET="..."
fly secrets set NEXT_PUBLIC_SITE_URL="https://hoogbeeld-media.fly.dev"

fly deploy
fly open
```

Op Windows werkt PowerShell prima. Alleen het installeren gaat anders; de rest
van de commando's is hetzelfde:

```powershell
# eenmalig installeren, daarna PowerShell opnieuw openen
winget install --id Fly.Flyctl
fly auth login
```

Drie dingen om op te letten in PowerShell:

- Knip regels niet af met een backslash. In PowerShell is het vervolgteken een
  backtick (`` ` ``). De commando's hierboven passen allemaal op één regel, dus
  meestal speelt dit niet.
- `fly secrets set KEY="waarde"` werkt zoals verwacht. De wachtwoord-hash en de
  sessiesleutel bevatten geen dollarteken, juist omdat PowerShell en
  .env-bestanden dat als een verwijzing zouden lezen.
- Gebruik PowerShell 7 of nieuwer als je uitvoer naar een bestand wegschrijft,
  bijvoorbeeld bij de back-up verderop. De oude Windows PowerShell 5.1 schrijft
  standaard UTF-16 weg, waardoor zo'n bestand onbruikbaar wordt.

Let op: pas in `fly.toml` de regel `app = "hoogbeeld-media"` aan naar de naam die je
zelf kiest, en houd `[mounts]` ongewijzigd. Zonder die schijf is na een herstart
alles weg.

> **Draai precies één machine.** Bij twee machines krijgt elke machine een eigen
> schijf, en dus een eigen database. Boekingen belanden dan willekeurig in de
> ene of de andere, zonder foutmelding. Controleer na het publiceren met
> `fly status` dat er één machine draait, en schaal zo nodig terug met
> `fly scale count 1`.

#### Je eigen domein koppelen

Doe dit nadat de site op `https://hoogbeeld-media.fly.dev` werkt.

```bash
# 1. Kijk welke adressen je app heeft
fly ips list

# 2. Vraag een certificaat aan voor je domein
fly certs add hoogbeeldmedia.nl
fly certs add www.hoogbeeldmedia.nl

# 3. Fly toont nu precies welke DNS-records je moet aanmaken
fly certs show hoogbeeldmedia.nl
```

Die laatste opdracht is de bron van waarheid: hij noemt per domein het type
record, de naam en de waarde die je bij je domeinregistrar moet invullen. Neem
die over zoals ze er staan, in plaats van ze zelf te bedenken.

DNS-wijzigingen zijn niet meteen overal doorgevoerd. Volg met:

```bash
fly certs check hoogbeeldmedia.nl
```

Zodra het certificaat geldig is, zet je de publieke URL goed en publiceer je
opnieuw, zodat de paginatitels, het deelbeeld en de sitemap naar je eigen
domein wijzen in plaats van naar het adres op fly.dev:

```bash
fly secrets set NEXT_PUBLIC_SITE_URL="https://hoogbeeldmedia.nl"
```

Het zetten van een secret start de app automatisch opnieuw op. Controleer
daarna dat `https://hoogbeeldmedia.nl/sitemap.xml` je eigen domein noemt.

#### Route B — eigen server met Docker

```bash
docker build -t hoogbeeld-media .
docker volume create hoogbeeld-media-data

docker run -d --name hoogbeeld-media \
  -p 3000:3000 \
  -v hoogbeeld-media-data:/data \
  -e ADMIN_PASSWORD_HASH="scrypt:..." \
  -e AUTH_SECRET="..." \
  -e NEXT_PUBLIC_SITE_URL="https://hoogbeeldmedia.nl" \
  --restart unless-stopped \
  hoogbeeld-media
```

Zet er een reverse proxy met HTTPS voor (nginx of Caddy). Het inlogcookie wordt
in productie alleen over HTTPS verstuurd, dus zonder HTTPS kun je niet inloggen.

#### Route C — zonder Docker

```bash
npm ci
npm run build
DATA_DIR=/var/lib/hoogbeeld-media NODE_ENV=production npm start
```

Draai dit onder een procesbeheerder zoals systemd of pm2, zodat de site na een
herstart van de server vanzelf weer opkomt.

### Omgevingsvariabelen

| Variabele | Verplicht | Waarvoor |
| --- | --- | --- |
| `ADMIN_PASSWORD_HASH` | ja | Zonder deze kun je niet in de beheeromgeving. Maken met `npm run hash-password`. |
| `AUTH_SECRET` | ja | Ondertekent het inlogcookie. Komt uit hetzelfde commando. |
| `NEXT_PUBLIC_SITE_URL` | ja | Paginatitels, deelbeeld, `robots.txt` en `sitemap.xml`. |
| `DATA_DIR` | in productie | Map voor de database en de uploads. In Docker staat die al op `/data`. |
| `SITE_STATUS` | nee | Alleen de beginstand van een verse installatie. Daarna bepaalt de knop in Beheer → Instellingen of de site open staat. |
| `SEED_ON_EMPTY` | nee | Staat standaard aan: een lege database wordt bij de eerste start met de voorbeelden gevuld. Zet op `"false"` als je leeg wilt beginnen. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_TO` | nee | Nodig voor bevestigingsmails. Zonder deze gegevens gaat er geen mail uit, en zegt de site dat er ook bij. |

Geheimen horen in de instellingen van je hosting, nooit in de repository.

### De site open- en dichtzetten

De site staat standaard **dicht**. Een bezoeker krijgt dan één pagina te zien:
naam, beeldmerk en de mededeling dat de site binnenkort opengaat. Alle andere
pagina's sturen we terug naar die voorpagina, en zoekmachines vragen we via
`robots.txt` om helemaal weg te blijven. Zo staat er geen half afgebouwde site
in Google voordat je er klaar voor bent.

Ben je ingelogd via `/admin`, dan zie je de volledige site gewoon, met een balk
bovenin die eraan herinnert dat niemand anders dit ziet. Je kunt dus alles
rustig nakijken terwijl de deur dicht blijft.

Open- en dichtzetten doe je met de knop in **Beheer → Instellingen →
Zichtbaarheid van de site**. Dat werkt direct; je hoeft er niets voor uit te
rollen. De stand staat in de database.

Bij een verse installatie, als er nog nooit op die knop is gedrukt, geldt de
omgevingsvariabele `SITE_STATUS` als beginstand. Die staat in `fly.toml` op
`"soon"`, zodat een nieuwe installatie altijd dicht begint. Zodra je de knop
één keer gebruikt, telt alleen de database nog.

Zet de site pas open als de lijst onder *Voor je opengaat* hieronder
afgevinkt is.

### Voor je opengaat

- Eigen domein werkt, en e-mail op dat domein komt echt binnen.
- Minimaal acht eigen dronefoto's staan in het portfolio, geen voorbeelden meer.
- `content/site.ts`: KvK, BTW, RDW-operatornummer en verzekeraar ingevuld.
- Privacyverklaring en algemene voorwaarden nagelopen.
- Tarieven kloppen met wat je daadwerkelijk rekent.
- Contactformulier getest: er komt echt een mailtje binnen.
- Geen voorbeeldprojecten meer in het portfolio; die waarschuwden bezoekers
  voorheen via een balk bovenaan, en die balk is er niet meer.
- Als sluitstuk: de site openzetten met de knop in Beheer → Instellingen.

### Wat er na publicatie gebeurt

De eerste keer dat de site opstart met een lege database, worden de fictieve
diensten, beschikbaarheid en voorbeeldprojecten geplaatst. Dat gebeurt alleen
als er nog geen enkele dienst bestaat, dus bestaande gegevens raak je nooit
kwijt. Vervang ze via de beheeromgeving door je eigen werk voordat je de site
openzet: er staat geen waarschuwing meer boven de pagina die bezoekers vertelt
dat het voorbeelden zijn.

Controleer na het publiceren zelf even deze punten:

- `https://hoogbeeldmedia.nl/api/health` geeft `{"status":"ok"}`.
- De homepage laadt en de boekingsmodule toont vrije tijden.
- Een proefaanvraag komt binnen onder Beheer → Boekingen.
- Na `fly apps restart` of een herstart van de container staat die aanvraag er nog.

### Back-up

In `DATA_DIR` staat alles wat je niet kunt missen. Maak daar regelmatig een
kopie van:

```bash
# Fly.io
fly ssh console -C "sqlite3 /data/kai-aerials.db .dump" > backup.sql
# Het databasebestand heet nog kai-aerials.db, van vóór de naamswijziging.

# Docker
docker run --rm -v hoogbeeld-media-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/hoogbeeld-media-data.tar.gz -C /data .
```

## 2. Toegang tot de beheeromgeving

De beheeromgeving zit op `/admin` en is alleen toegankelijk na inloggen.

1. Maak een wachtwoord aan:

   ```bash
   npm run hash-password -- 'jouw-lange-wachtwoord'
   ```

2. Zet de twee regels uit de uitvoer in `.env.local`:

   ```
   ADMIN_PASSWORD_HASH="scrypt:…"
   AUTH_SECRET="…"
   ```

3. Start de server opnieuw en ga naar `/admin`.

Hoe het werkt:

- Alleen de **hash** van je wachtwoord staat in het bestand, nooit het wachtwoord
  zelf. De hash is gemaakt met scrypt.
- `AUTH_SECRET` ondertekent het inlogcookie. Verander je deze waarde, dan zijn
  alle sessies meteen ongeldig.
- Je blijft twaalf uur ingelogd. Het cookie is `httpOnly`, dus JavaScript in de
  browser kan er niet bij.
- Na acht mislukte pogingen binnen tien minuten wordt inloggen tijdelijk
  geblokkeerd.
- Elke beheerpagina én elke bewerking controleert op de server opnieuw of je
  bent ingelogd.

Zet `.env.local` **nooit** in je repository. Het bestand staat al in
`.gitignore`.

---

## 3. Beschikbaarheid aanpassen

Alles staat onder **Beheer → Beschikbaarheid**. Wijzigingen zijn direct zichtbaar
in de boekingsmodule op de homepage.

**Standaardweek.** Per weekdag maximaal vier periodes, bijvoorbeeld 09:00–12:30
en 13:30–17:30. Een dag zonder periodes is niet boekbaar.

**Uitzonderingen op losse datums.**

- *Blokkeren* haalt tijd weg: een hele dag (vakantie) of een dagdeel (andere
  afspraak).
- *Extra beschikbaarheid* voegt tijd toe buiten je standaardweek.

**Boekingsregels** staan onder **Beheer → Instellingen**:

| Instelling             | Betekenis                                              |
| ---------------------- | ------------------------------------------------------ |
| Tijdsloten om de …     | Raster waarop afspraken beginnen (bijvoorbeeld elke 30 minuten) |
| Standaard buffertijd   | Rust tussen twee afspraken; per dienst te overschrijven |
| Minimaal … uur vooraf  | Hoe kort van tevoren iemand nog mag boeken             |
| Maximaal … dagen vooruit | Hoe ver vooruit de agenda openstaat                  |

**Duur per dienst** stel je in onder **Beheer → Diensten**.

Goed om te weten:

- Bestaande boekingen verdwijnen nooit als je je beschikbaarheid aanpast. Vallen
  ze erbuiten, dan krijg je een waarschuwing op het overzicht en bij de
  boekingen, zodat je ze zelf kunt verplaatsen of annuleren.
- Alle tijden gelden in **Europe/Amsterdam**. Zomer- en wintertijd worden
  automatisch verwerkt. Het uur dat in het voorjaar wordt overgeslagen, wordt
  nooit aangeboden.
- Een openstaande aanvraag houdt het tijdslot bezet. Wijs je hem af of annuleer
  je hem, dan komt het slot meteen weer vrij.

---

## 4. Fictieve inhoud vervangen

### Teksten en bedrijfsgegevens

De teksten en de bedrijfsgegevens staan uit elkaar, omdat de site twee talen
heeft:

| Bestand | Wat erin staat |
| --- | --- |
| `content/site.ts` | Wat in beide talen hetzelfde is: bedrijfsnaam, e-mailadressen, apparatuur, logo, categoriesleutels |
| `content/copy.nl.ts` | Alle Nederlandse tekst van de site |
| `content/copy.en.ts` | Alle Engelse tekst, met precies dezelfde sleutels |

Zoek je een zin die op de site staat, dan staat die in een van de twee
`copy`-bestanden. Vergeet je een Engelse tekst, dan zegt `npm run typecheck`
dat meteen: de Engelse versie moet dezelfde sleutels hebben als de Nederlandse.

Het werkgebied staat er twee keer in: `region.short` is de korte versie (kop,
footer, zoekresultaten) en `region.detail` de uitgeschreven versie met
plaatsnamen, die alleen op de contactpagina staat.

### Voorbeeldprojecten in een bestaande database bijwerken

De voorbeeldprojecten worden alleen in een **lege** database gezet. Ze
veranderen dus niet mee als de teksten in `lib/example-data.ts` wijzigen: dat is
met opzet, zodat je eigen projecten nooit worden overschreven.

Bij de overstap van Utrecht naar Noord-Holland is daar een eenmalig script voor.
Het werkt alleen rijen bij die nog exact de oude voorbeeldtekst bevatten, laat
alles wat je zelf hebt aangepast met rust, en is zonder gevolgen nog eens te
draaien:

```bash
# lokaal
node scripts/onderhoud/werkgebied-noord-holland.cjs

# op de server, nadat de nieuwe versie is uitgerold
fly ssh console -C "node scripts/onderhoud/werkgebied-noord-holland.cjs"
```

Het script noemt per project wat het heeft gedaan. Je kunt hetzelfde met de hand
doen via **Beheer → Projecten**.

Hetzelfde script vult ook de **Engelse voorbeeldteksten** aan, en ook daar
alleen waar het Engelse veld nog leeg is. Heb je zelf al iets ingevuld, dan
blijft dat staan.

### Echte projecten in een bestaande database zetten

De twee echte projecten (De Zaan in Wormerveer en Knooppunt Zaandam) staan in
de database, niet in de code. Een site die al draait krijgt ze dus niet vanzelf.

```bash
# lokaal
node scripts/onderhoud/echte-projecten-2026.cjs

# op de server, nadat de nieuwe versie is uitgerold
fly ssh console -C "node scripts/onderhoud/echte-projecten-2026.cjs"
```

Het script voegt beide projecten toe of werkt ze bij, verwijdert het verzonnen
veenweideproject met zijn galerijbeelden, en geeft de overgebleven
voorbeeldprojecten het label `Voorbeeldproject`. Wat jij zelf hebt aangemaakt
blijft ongemoeid. Nog een keer draaien verandert niets meer.

### Fotogalerijen bij de echte projecten

Bij beide echte projecten horen vier foto's. Die staan, net als de projecten
zelf, in de database.

```bash
# lokaal
node scripts/onderhoud/projectgalerijen-2026.cjs

# op de server, nadat de nieuwe versie is uitgerold
fly ssh console -C "node scripts/onderhoud/projectgalerijen-2026.cjs"
```

| Project | Foto's |
| --- | --- |
| De Zaan in Wormerveer | `/media/wormerveer-de-zaan-01…04.webp` |
| Knooppunt Zaandam bij zonsondergang | `/media/knooppunt-zaandam-01…04.webp` |

Het script werkt per foto op de bestandsnaam: staat hij er nog niet, dan komt
hij erbij; staat hij er al, dan worden alleen een afwijkend bijschrift of een
afwijkende volgorde bijgewerkt. Eigen foto's die je zelf hebt geüpload blijven
staan. Nog een keer draaien verandert niets meer, dus er komt nooit een dubbele
regel bij — ook niet na een nieuwe uitrol.

Ontbreekt een bestand in `public/media`, dan slaat het script die regel over en
zegt dat erbij. Zet het bestand erbij en draai het script opnieuw; liever geen
galerij dan een galerij met gebroken afbeeldingen.

De posterbeelden blijven de omslagafbeelding van het project; die staan los van
de galerij. De galerij en de lichtbak zijn dezelfde als bij de andere
projecten — er is geen apart component voor.

### Diensten en tarieven in een bestaande database bijwerken

Hetzelfde geldt voor de diensten: die staan in de database en veranderen niet
mee met `lib/example-data.ts`. Voor de herziening van de tarieven is er een
tweede script. Het hernoemt de fotografie- en videodienst, zet de nieuwe
bedragen erin, voegt *Bedrijfsfilm* en *Bouwvoortgang* toe (en hernoemt een
bestaande *Bouwvordering* naar *Bouwvoortgang*), haalt het voorbeeldproject
over een festival van de site en verplaatst het nieuwbouwproject naar de
categorie bouwvordering.

```bash
# lokaal
node scripts/onderhoud/tarieven-2026.cjs

# op de server, nadat de nieuwe versie is uitgerold
fly ssh console -C "node scripts/onderhoud/tarieven-2026.cjs"
```

Een dienst die je zelf al hebt aangepast, blijft staan; het script zegt dat er
per regel bij. Nog een keer draaien verandert niets meer.

### E-mailadressen

Alle adressen staan in `content/site.ts`. Ze worden zo gebruikt:

| Adres | Waar |
| --- | --- |
| `info@` | Op de site: footer, contactpagina, privacyverklaring. Contactformulier komt hier binnen. |
| `boekingen@` | Aanvragen en afspraken. Meldingen van nieuwe boekingen en de bevestiging aan de klant. |
| `kai@` | Persoonlijk. Staat bewust niet op de site, zodat spamverzamelaars het niet oppikken. |
| `facturen@` | Administratie. Staat niet op de site en wordt door de website niet gebruikt. |

`MAIL_TO` in je omgevingsvariabelen gaat voor op wat hier staat.

### Logo

Het originele logo staat in `brand/logo-origineel.png`. Daaruit worden de
varianten gemaakt die de site gebruikt:

```bash
npm run logo
```

Dat script snijdt het beeldmerk los van de woordmerk en keert de tinten om,
zodat de vorm licht op donker staat. Nodig, want het origineel is donker op
wit en de site is donker. Het schrijft:

| Bestand | Waarvoor |
| --- | --- |
| `public/logo-mark.png` | Beeldmerk in de kop van de site |
| `app/icon.png` | Pictogram op het browsertabblad |
| `app/apple-icon.png` | Pictogram voor een snelkoppeling op iOS |

Vervang je het logo, zet dan het nieuwe bestand op dezelfde plek en draai het
script opnieuw. Het zoekt zelf waar het beeldmerk ophoudt en de tekst begint,
dus een andere indeling is geen probleem, zolang het een donkere vorm op een
lichte achtergrond is.

De bedrijfsnaam naast het beeldmerk blijft gewone tekst. Dat blijft scherp op
elk scherm en is leesbaar voor zoekmachines, wat bij een afbeelding niet zo
is. Wil je toch het hele logo als beeld, zet dan in `content/site.ts` een
ander bestand bij `logo` en haal de naam uit `components/site-header.tsx`.

Staat `logo` op `null`, dan valt de kop terug op een ingebouwd beeldmerk.

### Afbeeldingen

De tijdelijke beelden staan in **`public/images/`**:

| Bestand                   | Waar het staat                    |
| ------------------------- | --------------------------------- |
| `hero.jpg`                | Grote afbeelding op de homepage   |
| `project-*.jpg`           | Hoofdafbeeldingen van de voorbeeldprojecten |
| `gallery-*.jpg`           | Foto's in de projectgalerijen     |

Het echte materiaal staat in **`public/media/`**: de video's, de posterbeelden
van de projecten, het portret bij "Over mij" en de deelbeelden.

| Bestand                          | Waar het staat                              |
| -------------------------------- | ------------------------------------------- |
| `about-kai-torso.png`            | Portret bij "Over mij" op de homepage       |
| `og-hoogbeeld-media-nl.jpg`      | Voorvertoning bij een gedeelde link (NL)    |
| `og-hoogbeeld-media-en.jpg`      | Voorvertoning bij een gedeelde link (EN)    |

De deelbeelden zijn 1200 × 630 en hebben de zin in het beeld staan, vandaar een
bestand per taal. Maak je een nieuwe, geef hem dan een andere naam: WhatsApp en
LinkedIn onthouden een afbeelding per adres en halen dezelfde naam niet opnieuw
op.

Vervang de bestanden en houd dezelfde namen aan, dan hoef je verder niets te
wijzigen. Gebruik liefst JPG of WebP van ongeveer 1600 × 1000 pixels of groter.
Foto's worden automatisch geoptimaliseerd en in moderne formaten geserveerd.

### Projecten

Ga naar **Beheer → Projecten**. Daar kun je projecten toevoegen, bewerken,
publiceren en verwijderen, foto's uploaden met een alternatieve tekst, en een
YouTube- of Vimeo-link invoeren. Geüploade foto's komen in `DATA_DIR/uploads` te
staan en worden geserveerd via `/api/uploads/…`.

Zet **Gepubliceerd** uit om een project van de site te halen zonder het te
verwijderen. **Uitgelicht** bepaalt welke drie projecten op de homepage komen.

### Diensten en prijzen

**Beheer → Diensten**: naam, omschrijving, duur, buffertijd, prijsindicatie en
volgorde. De prijsindicatie is vrije tekst, dus "Gratis", "Indicatie vanaf € 149"
of "Prijs in overleg" kan allemaal.

#### Project op maat: extra vragen bij het boeken

Een dienst met het vinkje **Via kennismaking** (in de database `intro_only`)
werkt anders dan de andere. Het tijdslot dat de bezoeker kiest is dan niet de
opname, maar het kennismakingsgesprek: de opnamedagen plan je daarna zelf in.
Omdat zo'n project vaak over meerdere plekken en meerdere dagen gaat, vraagt het
formulier daar meteen naar:

| Vraag                 | Verplicht | Wat je ermee kunt                              |
| --------------------- | --------- | ---------------------------------------------- |
| Locaties              | Ja, minstens één | Tot zes plekken; extra regels voeg je toe met "+ Locatie toevoegen" |
| Aantal opnamemomenten | Nee       | Eén, twee, drie of meer, of "weet ik nog niet"  |
| Gewenste periode      | Ja        | Vrije tekst, bij benadering mag ook             |
| Voorkeur              | Nee       | Ochtend, middag, gouden uur, doordeweeks, weekend |

De antwoorden staan bij de boeking onder **Over het project** in de
beheeromgeving, en in de aanvraagmail. In de lijst zie je achter de locatie
staan hoeveel extra plekken er zijn.

Zet je het vinkje **Via kennismaking** bij een andere dienst aan, dan krijgt die
dienst dezelfde vragen. Zet je het uit, dan verdwijnen ze; antwoorden die al bij
bestaande boekingen staan blijven bewaard.

### Privacyverklaring

`app/(site)/privacy/page.tsx` bevat een **concept**. De plekken die je nog moet
invullen zijn geel gemarkeerd, zoals je vestigingsplaats, KvK-nummer,
bewaartermijn en hostingpartij. Laat de tekst controleren voordat je publiceert.

### Voorbeeldboekingen om mee te oefenen

Wil je de beheeromgeving met gevulde schermen bekijken, voeg dan een paar
voorbeeldaanvragen en een voorbeeldbericht toe:

```bash
npm run demo-data
```

Alles wat dit script aanmaakt begint met `DEMO` of `DEMOGEGEVENS`, zodat je het
altijd herkent en er nooit iets echts tussen kan komen te staan.

### Alle voorbeeldgegevens wissen

```bash
npm run seed -- --reset   # verwijdert álles, ook de demoboekingen, en zet
                          # alleen de voorbeeldprojecten en -diensten terug
```

---

## 5. Nederlands en Engels

De site staat in twee talen online:

| | Adres |
| --- | --- |
| Nederlands | `/`, `/portfolio`, `/contact`, `/privacy` |
| Engels | `/en`, `/en/portfolio`, `/en/contact`, `/en/privacy` |

Nederlands staat bewust zonder voorvoegsel, zodat bestaande links en
zoekresultaten blijven werken. Er wordt **niet** automatisch omgeleid op de taal
van de browser: de bezoeker kiest zelf met de knop `EN` / `NL` in de kop. Dat is
voorspelbaarder, en een gedeelde link opent bij iedereen dezelfde pagina.

Zoekmachines krijgen via `hreflang` te horen welke Nederlandse en Engelse pagina
bij elkaar horen. Dat staat in de `<head>` van elke pagina én in de sitemap.

Staat de site nog dicht (`SITE_STATUS` niet op `"live"`), dan geldt dat voor
beide talen: `/` en `/en` tonen allebei de pagina "binnenkort online", in de
eigen taal, en `/en/…` stuurt terug naar `/en`.

### Wat er meevertaald is

- Alle pagina's, knoppen en formulieren.
- De boekingsmodule, inclusief de foutmeldingen die de server teruggeeft.
- De datums: "za 26 september" wordt "Sat 26 September".
- De bevestigingsmails aan de klant. Boekt iemand via `/en`, dan is de
  bevestiging Engels, en ook een latere bevestigings- of annuleringsmail. De
  taal wordt bij de boeking opgeslagen.
- De meldingen aan jóú blijven Nederlands, met de regel "(De aanvraag is gedaan
  op de Engelse versie van de site.)" erbij. In **Beheer → Boekingen** staat een
  `EN`-merkteken bij zo'n aanvraag.
- De beheeromgeving zelf is en blijft Nederlands.

### Diensten en projecten vertalen

Die teksten staan in de database, dus die vertaal je zelf in de
beheeromgeving. Bij **Diensten** en bij **Projecten** staat een kader *Engelse
versie*:

| Onderdeel | Engelse velden |
| --- | --- |
| Dienst | Naam, omschrijving, prijsindicatie |
| Project | Titel, locatie, korte beschrijving, uitgebreide tekst, alt-tekst |
| Galerijfoto | Alternatieve tekst |

**Laat je een veld leeg, dan toont de Engelse site de Nederlandse tekst.** Er
ontstaat dus nooit een gat; je kunt rustig stap voor stap vertalen. In de
dienstenlijst staat een `EN`-merkteken bij de diensten die al een Engelse naam
hebben.

De zes voorbeeldprojecten en de vier voorbeelddiensten zijn al vertaald. Staat
je database er al (zoals op de server), dan vul je die vertalingen aan met het
onderhoudsscript uit hoofdstuk 4; dat raakt alleen velden aan die nog leeg zijn.

---

## 6. Koppelingen die je nog moet instellen

### E-mail (nodig voor bevestigingsmails)

Zolang de SMTP-gegevens ontbreken, wordt er **geen e-mail verstuurd**. De site
doet daar niet geheimzinnig over: bezoekers zien na het aanvragen dat er geen
bevestigingsmail is verstuurd, en in de beheeromgeving staat een waarschuwing.
Aanvragen en berichten worden wél gewoon opgeslagen.

#### Welke waarden je instelt

| Variabele | Nodig | Waarvoor |
| --- | --- | --- |
| `SMTP_HOST` | ja | Mailserver, bij Microsoft 365 `smtp.office365.com` |
| `SMTP_PORT` | ja | `587` (STARTTLS) of `465` (directe TLS) |
| `SMTP_USER` | meestal | Het postvak waarmee wordt ingelogd |
| `SMTP_PASSWORD` | meestal | Wachtwoord of app-wachtwoord van dat postvak |
| `MAIL_FROM` | ja | Afzender. Moet een adres zijn dat het postvak mág gebruiken |
| `MAIL_TO_BOOKINGS` | nee | Waar meldingen van aanvragen heen gaan; standaard `boekingen@` |
| `MAIL_TO_CONTACT` | nee | Waar contactberichten heen gaan; standaard `info@` |
| `MAIL_TO` | nee | Eén adres voor allebei, als je ze niet wilt scheiden |

Laat je de drie `MAIL_TO`-regels weg, dan gebruikt de site de adressen uit
`content/site.ts`. Dat is meestal precies goed.

#### Microsoft 365 (Exchange Online)

```bash
fly secrets set \
  SMTP_HOST="smtp.office365.com" \
  SMTP_PORT="587" \
  SMTP_USER="kai@hoogbeeldmedia.nl" \
  SMTP_PASSWORD="het wachtwoord of app-wachtwoord" \
  MAIL_FROM="Hoogbeeld Media <kai@hoogbeeldmedia.nl>"
```

Drie dingen die bij Microsoft 365 misgaan als je ze overslaat:

1. **Authenticated SMTP staat per postvak uit.** Zet hem aan in het
   Microsoft 365-beheercentrum: *Gebruikers → Actieve gebruikers → het account
   → Mail → E-mail-apps beheren → Geverifieerde SMTP*.
2. **Beveiligingsstandaarden blokkeren SMTP AUTH voor de hele tenant**, ook als
   het postvak het wel mag. Staan ze aan, dan kun je ook geen app-wachtwoord
   maken. Je moet dan overstappen op voorwaardelijke toegang, of een aparte
   verzenddienst gebruiken.
3. **Je mag standaard alleen versturen vanaf het hoofdadres.** `info@`,
   `boekingen@` en `facturen@` zijn aliassen van hetzelfde postvak; versturen
   als alias moet apart worden aangezet
   (`Set-OrganizationConfig -SendFromAliasEnabled $true`). Daarom staat
   `MAIL_FROM` hierboven op het hoofdadres. De site zet in elke mail een
   **antwoordadres**, zodat een klant tóch bij `boekingen@` of `info@`
   uitkomt.

Let op de houdbaarheid: Microsoft schakelt basisauthenticatie voor SMTP AUTH
eind december 2026 standaard uit (een beheerder kan het daarna nog aanzetten),
en stapt daarna over op OAuth. Reken erop dat je dit binnen afzienbare tijd
vervangt door OAuth of door een aparte verzenddienst.

#### Controleren of het werkt

In **Beheer → Instellingen** staat onder *E-mail* precies welk bericht naar
welk adres gaat, en een knop om een **proefbericht** te sturen. Mislukt het,
dan staat de foutmelding van de mailserver er letterlijk bij — dat is meestal
genoeg om te zien wat er scheelt. Op het beheeroverzicht zie je van de laatste
vijf e-mails of ze zijn verzonden, overgeslagen of mislukt.

#### Wat er verstuurd wordt

| Bericht | Naar | Antwoordadres |
| --- | --- | --- |
| Bevestiging van de aanvraag, met kenmerk | de klant | `boekingen@` |
| Melding van een nieuwe aanvraag | jou | de klant |
| Bevestigen, afwijzen of annuleren | de klant | `boekingen@` |
| Betaalverzoek voor een factuur | de klant | `boekingen@` |
| Project afgerond, met opleveringslink | de klant | `boekingen@` |
| Wijziging aangevraagd op een oplevering | jou | de klant |
| Ontvangstbevestiging contactformulier | de afzender | `info@` |
| Het contactbericht zelf | jou | de afzender |

Je kunt dus rechtstreeks op een melding antwoorden; die reactie komt bij de
klant terecht, niet bij jezelf.

#### SPF, DKIM en DMARC

Het SPF-record van `hoogbeeldmedia.nl` eindigt op `-all` en staat alleen
Microsoft toe. Verstuur je via Microsoft 365, dan klopt dat en hoef je niets te
doen. Ga je via een andere dienst versturen, dan moet die eerst in het
SPF-record, anders worden je mails geweigerd in plaats van in de spammap gezet.

### Betalen en opleveren (optioneel)

Bij een **bevestigde boeking** kun je in **Beheer → Boekingen** de sectie
"Oplevering & factuur" openklappen om een bedrag vast te leggen, eindproducten
te uploaden en die naar de klant te versturen. Twee momenten om te betalen:

- **Betaalverzoek versturen** — kan meteen na het bevestigen van de boeking,
  los van de oplevering. Handig als je (een deel van) het bedrag vooraf wilt
  ontvangen.
- **Project afronden & opleveren** — verstuurt de eindproducten via een
  beveiligde link. Staat de paywall aan (standaard) en is er nog niet betaald,
  dan ziet de klant eerst een betaalscherm; de bestanden komen vrij zodra de
  betaling binnen is. Vanaf dezelfde link kan de klant ook een wijziging
  aanvragen als de eerste editing niet bevalt.

Betalen loopt via [Mollie](https://www.mollie.com/), in testmodus zolang je
een testsleutel gebruikt:

```
MOLLIE_API_KEY="test_..."
```

Voor een Mollie-account heb je een **KvK-nummer** nodig. Heb je dat nog niet,
dan werkt de rest van de oplevering gewoon: zet de paywall-toggle per factuur
uit, dan zijn de bestanden direct te downloaden zonder dat er een betaling aan
te pas komt. Zodra je wél een (test)sleutel hebt, vul je die in — er hoeft
verder niets aan de code te veranderen.

De eindproducten (foto's, video's, zip's) staan op dezelfde schijf als de
database en de projectfoto's (zie **Opslaglocatie** hieronder), in een eigen,
niet-publieke map. Ze zijn alleen te downloaden via de beveiligde link, nooit
rechtstreeks.

**Uploads zijn beperkt tot 300 MB per bestand.** Dat komt niet alleen door
`DELIVERY_MAX_UPLOAD_MB`, maar vooral door `serverActions.bodySizeLimit` in
`next.config.ts`: de uploadknop in de beheeromgeving is een Server Action, en
die houdt de hele upload in het geheugen van de machine vast. De Fly-machine
heeft standaard maar 512 MB. Wil je grotere video's kunnen opleveren, dan moet
je zowel `next.config.ts` als het geheugen ophogen:

```bash
fly scale memory 2048   # bijvoorbeeld, op de betreffende app
```

```
# DELIVERY_MAX_UPLOAD_MB="300"
```

### Publieke adres van de site

```
NEXT_PUBLIC_SITE_URL="https://hoogbeeldmedia.nl"
```

Dit adres wordt gebruikt voor de paginatitels, het deelbeeld op sociale media,
`robots.txt` en `sitemap.xml`.

### Opslaglocatie (aanbevolen in productie)

```
DATA_DIR="/var/lib/hoogbeeld-media"
```

### Wat er níét nodig is

Er zit geen betaalsysteem in en dat is ook niet nodig: klanten vragen een
afspraak aan, jij bevestigt. Er zijn geen accounts voor bezoekers en er worden
geen trackingcookies geplaatst.

---

## Technische opzet

- **Next.js 16** (App Router, React Server Components, Turbopack) met
  **TypeScript** en **Tailwind CSS v4**.
- **SQLite** via `better-sqlite3`, met WAL en een schema dat bij het opstarten
  wordt aangemaakt of bijgewerkt.
- **Server actions** voor alle bewerkingen, met validatie via **Zod** op de
  server. Formulieren werken ook zonder JavaScript waar dat kan.
- **Eigen sessiebeheer**: scrypt-hash voor het wachtwoord, een HMAC-ondertekend
  `httpOnly`-cookie voor de sessie. Geen sleutels in de frontend.
- **Nodemailer** voor e-mail, alleen actief als de SMTP-gegevens zijn ingevuld.

### Hoe dubbele boekingen worden voorkomen

Een aanvraag wordt aangemaakt binnen één exclusieve transactie
(`BEGIN IMMEDIATE`). Binnen diezelfde transactie wordt de beschikbaarheid nog
één keer volledig opnieuw gecontroleerd: openingstijden, uitzonderingen,
buffertijd en bestaande boekingen. Twee bezoekers die op hetzelfde moment
hetzelfde tijdslot aanvragen, kunnen dus niet allebei slagen — de tweede krijgt
netjes te zien dat het slot net bezet is geraakt.

Te controleren met:

```bash
npx tsx scripts/test-concurrency.ts <startUtc> A &
npx tsx scripts/test-concurrency.ts <startUtc> B &
wait
```

### Privacy en beveiliging

- Gegevens van klanten zijn alleen zichtbaar na inloggen. De publieke API
  (`/api/slots`) geeft uitsluitend vrije tijdstippen terug, nooit namen of
  omschrijvingen.
- Elke server action controleert zelf of je bent ingelogd; een pagina-check
  alleen is niet genoeg.
- Formulieren hebben een spamval (een verborgen veld dat leeg moet blijven) en
  een snelheidsbegrenzing per IP-adres. Het IP-adres wordt alleen kortdurend in
  het werkgeheugen gebruikt en niet opgeslagen.
- Uploads accepteren alleen JPG, PNG, WebP en AVIF tot 12 MB en krijgen een
  nieuwe, willekeurige bestandsnaam.
- `/admin` en `/api` staan in `robots.txt` uitgesloten van indexering.

### Toegankelijkheid

Alle velden hebben een zichtbaar label, foutmeldingen zijn aan hun veld
gekoppeld via `aria-describedby`, en de hele site is met het toetsenbord te
bedienen met een duidelijke focusrand. Er is een "naar de hoofdinhoud"-link, en
animaties worden uitgezet als het systeem om minder beweging vraagt.

### Mappen

```
app/
  (site)/
    (nl)/          Nederlandse pagina's op /, /portfolio, /contact …
    en/            dezelfde pagina's op /en, /en/portfolio …
  admin/           inlogpagina en beveiligde beheeromgeving (Nederlands)
  actions/         server actions (publiek en beheer)
  api/             tijdsloten en het serveren van uploads
proxy.ts           geeft het pad door, zodat <html lang> klopt
components/
  pages/           de pagina's zelf; de routes hierboven zijn drie regels
  booking/         de boekingsmodule
  admin/           schermen van de beheeromgeving
content/
  site.ts          ← bedrijfsgegevens (beide talen hetzelfde)
  copy.nl.ts       ← alle Nederlandse tekst
  copy.en.ts       ← alle Engelse tekst
lib/               database, beschikbaarheid, boekingen, tijdzone, validatie
  locale.ts        de twee talen en de paden erbij
scripts/           seed, wachtwoord-hash, voorbeeldafbeeldingen
  onderhoud/       eenmalige scripts voor een bestaande database
public/images/     tijdelijke voorbeeldafbeeldingen
data/              database en uploads (niet in de repository)
```

Elke pagina bestaat één keer, in `components/pages/`, en krijgt de taal als
`locale`-eigenschap mee. De bestanden onder `app/` zijn alleen nog de route en
de metadata. Zo kan de Engelse versie niet achterlopen op de Nederlandse.
