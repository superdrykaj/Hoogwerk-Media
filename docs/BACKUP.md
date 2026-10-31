# Opslag, back-ups en herstel

Alles staat op één schijf (Fly-volume) die aan de app hangt: `/data`.

| Wat | Waar | Grootte | Verlies is… |
|---|---|---|---|
| Database (boekingen, klanten, facturen) | `/data/kai-aerials.db` | klein (MB's) | onvervangbaar |
| Factuur-PDF's | `/data/invoices/` | klein (±5 kB per factuur) | herstelbaar uit de database (vastlegging) |
| Opleverbestanden (originelen) | `/data/deliveries/` | **groot (GB's)** | herstelbaar uit jouw eigen archief |
| Voorbeelden met watermerk | `/data/deliveries/previews/` | klein | opnieuw te maken |
| Back-ups | `/data/backups/dagelijks/` | klein | — |

De fiscale bewaarplicht (7 jaar) geldt voor de database en de factuur-PDF's. Die
zijn klein en dus eenvoudig dubbel te bewaren. De originelen zijn zwaar maar ook
op jouw eigen computer of archief aanwezig.

## 1. Hoeveel ruimte is er? Het volume blijft 1 GB

**Besluit:** het productievolume blijft op **1 GB**; er worden geen abonnementen of
snapshotinstellingen gewijzigd. Vergroten tot 40 GB is **geen vereiste voor
livegang**. Wat dat betekent en hoe je het in de gaten houdt:

**Opslagoverzicht in Beheer** (Instellingen → tabblad **Opslag**, alleen voor de
beheerder): totale, gebruikte en vrije ruimte van het echte datavolume met een
gebruiksbalk, en een uitsplitsing naar opleverbestanden, voorbeelden, facturen,
database, back-ups en website-uploads. Vanaf **80%** een waarschuwing, vanaf
**90%** een dringende melding; de knop "Meting vernieuwen" meet opnieuw. Alles komt
uit het bestandssysteem zelf; lukt een meting niet, dan staat er een foutmelding en
geen getal. Het overzicht verwijdert of vergroot nooit iets.

**Bescherming van de database:** een vol volume blokkeert ook boekingen en
facturen. Daarom weigert de upload van opleverbestanden een bestand dat de vrije
ruimte onder een reserve zou brengen (10% van het volume, minimaal 64 MB; op 1 GB
dus ±100 MB), met een duidelijke melding en zonder iets te schrijven.
`OPSLAG_RESERVE_MB` past de reserve aan.

**Wat past er op 1 GB?** Reken met ±870 MB voor opleverbestanden (1 GB min de
reserve, de database, back-ups en de website-uploads):

| Opdracht | Grootte (orde) | Past op 1 GB? |
|---|---|---|
| 20–40 foto's van een drone (JPEG, 8–20 MB) | 0,2–0,8 GB | ja, één tegelijk |
| Korte clip, 30 s 4K (H.264/H.265) | 0,1–0,4 GB | ja |
| Film van 2 minuten, 4K (100 Mbps) | ±1,5 GB | **nee** |
| Film van 2 minuten, 4K (H.265, ±40 Mbps) | ±0,6 GB | ja, krap |

Praktisch: met 1 GB past ongeveer één gemiddelde opdracht tegelijk. Verwijder
bestanden zodra de klant ze heeft gedownload (Beheer → Boekingen → Verwijderen bij
het bestand). Een boeking met een uitgegeven factuur kan niet worden verwijderd
(bewaarplicht); de bestanden eronder wel. Past een opdracht niet, dan zijn er drie
uitwegen, in volgorde van voorkeur: (1) een kleinere export maken (H.265 of lagere
bitrate), (2) de video buiten het systeem leveren en alleen de foto's en de
factuur via de klantpagina, (3) het volume op dat moment vergroten (kan zonder
downtime, maar niet terug verkleinen; richtprijs ±€0,15 per GB per maand, controleer
de actuele prijs):

```bash
fly volumes list -a hoogbeeld-media                          # kolom SIZE
fly ssh console -a hoogbeeld-media -C "df -h /data"          # echt gebruikt en vrij
fly volumes extend <volume-id> -s 5 -a hoogbeeld-media       # alleen als je dit besluit; bijvoorbeeld naar 5 GB
```

De drie opdrachten bovenaan zijn alleen-lezen; alleen de laatste wijzigt iets en
gebruik je pas na een eigen besluit.

## 2. Is de huidige privéopslag geschikt voor langdurig gebruik?

Voor het volume van een eenmanszaak: **ja, mits** (a) het volume groot genoeg is voor de opdrachten die je levert (op 1 GB: geen zware 4K-video's),
(b) er een bewaartermijn is voor de zware bestanden en (c) er back-ups buiten het
volume zijn. De bestanden zijn niet publiek bereikbaar (eigen map buiten
`public/`), downloads lopen via ondertekende links en de betaalstatus, en het
streamen kost nauwelijks geheugen.

**Beperkingen:** het volume zit op één server en is niet gespiegeld. Valt de
hardware uit, dan is alleen een snapshot je vangnet. Er kan precies één machine
draaien (SQLite op één schijf); dat is nu geen probleem.

## 3. Back-ups

**Automatisch, elke nacht (nieuw):** de server maakt na 03:00 (tijd van
Amsterdam) een back-up van de database en alle factuur-PDF's in
`/data/backups/dagelijks/<datum>T<tijd>/`, met een manifest. De nieuwste 14
blijven staan. Consistent, ook terwijl de site draait (`VACUUM INTO`). Uitzetten
kan met `DAGELIJKSE_BACKUP="uit"`. Handmatig:

```bash
fly ssh console -a hoogbeeld-media -C "node scripts/onderhoud/back-up.cjs"            # maken
fly ssh console -a hoogbeeld-media -C "node scripts/onderhoud/back-up.cjs lijst"      # tonen
fly ssh console -a hoogbeeld-media -C "node scripts/onderhoud/back-up.cjs controleer" # nieuwste controleren
```

Dit beschermt tegen een foutje of een kapotte database, **niet** tegen verlies
van het volume zelf. Daarvoor:

**Fly-snapshots van het volume (controleer in jouw account):** Fly maakt
standaard dagelijks een snapshot van elk volume en bewaart die enkele dagen. Zet de
bewaartermijn op het maximum dat je plan toestaat en controleer dat ze er zijn:

```bash
fly volumes snapshots list <volume-id> -a hoogbeeld-media
fly volumes update <volume-id> --snapshot-retention 30 -a hoogbeeld-media
```

**Een kopie buiten Fly (aanbevolen, nog niet ingesteld):** haal minstens maandelijks
de nieuwste back-upmap naar je eigen computer of een cloudmap. Handmatig:

```bash
fly ssh sftp shell -a hoogbeeld-media      # daarna: get -r /data/backups/dagelijks/<nieuwste> .
```

Wil je dit automatiseren, dan kan een nachtelijke upload naar een
S3-compatibele bucket (zie 5) met een paar regels code; daarvoor is een keuze van
aanbieder en een toegangssleutel van jou nodig.

## 4. Herstel testen (doe dit een keer, vóór livegang)

De controle wijzigt niets aan de live gegevens.

1. **Back-up controleren:** `node scripts/onderhoud/back-up.cjs controleer` meldt of
   de database heel is, elke uitgegeven factuur zijn PDF heeft en elk PDF
   byte-voor-byte gelijk is aan wat bij uitgifte is vastgelegd.
2. **Echt herstellen in een proefmap (zoals gedaan op een testkopie):** kopieer
   `kai-aerials.db` en `invoices/` uit de back-up naar een lege map, start de app
   daarop met `DATA_DIR=<proefmap>` en open een factuur-PDF met de klantlink: die
   moet identiek zijn aan het origineel.
3. **Volume-herstel uit een snapshot (op staging oefenen):**
   ```bash
   fly volumes snapshots list <volume-id> -a hoogbeeld-media-test
   fly volumes create hoogbeeld_media_test_herstel --snapshot-id <snapshot-id> --size 10 -a hoogbeeld-media-test
   ```
   Koppel het herstelde volume aan een proefmachine (of vervang het volume na
   `fly machine stop`) en controleer dat de site start en facturen openen.

**Echt herstel in een noodgeval** (database kapot, volume intact): stop de machine
(`fly machine stop`), zet `kai-aerials.db` uit de nieuwste goede back-up terug (en
verwijder eventuele `kai-aerials.db-wal` en `-shm`), start de machine en controleer
de nieuwste facturen. Zet het bestand terug met dezelfde eigenaar als de rest van
`/data` (de server draait als gebruiker `nextjs`).

## 5. Aparte objectopslag voor de grote bestanden?

| | Volume (nu) | Objectopslag (S3-compatibel) |
|---|---|---|
| Prijs per GB per maand\* | ±0,15 | ±0,006 (Backblaze B2) tot ±0,02 (Tigris, Cloudflare R2: 0,015) |
| 40 GB (ter vergelijking) | ±6 | ±0,25–0,80 |
| 300 GB | ±45 | ±2–6 |
| Downloadverkeer | via de server (512 MB-machine) | rechtstreeks van de opslag, zonder tussenstap |
| Duurzaamheid | één schijf + snapshots | gespiegeld en zeer duurzaam |
| Extra werk | geen | upload, voorbeelden, ZIP en opruimen aanpassen; bestaande bestanden verhuizen |

\* Richtprijzen uit mijn geheugen, zonder dat ik ze kan nakijken; controleer de
actuele tarieven bij Fly, Tigris, Cloudflare R2 en Backblaze.

**Advies:** nu niet bouwen. Met het huidige volume van 1 GB, het opslagoverzicht
met waarschuwingen, een bewaartermijn en dagelijkse back-ups is het volume
eenvoudiger en goedkoop genoeg; vergroot pas als de opdrachten dat vragen. Overweeg
objectopslag als het totaal boven ±100–150 GB uitkomt, als je een tweede kopie
van de media buiten Fly wilt, of als klanten vaak tegelijk grote video's
downloaden. Het bestaande model van korte ondertekende links past er goed op
(vooraf ondertekende opslag-URL's), dus de stap later is een gerichte
aanpassing en geen herbouw.
