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

## 1. Hoeveel ruimte is er echt? (controleer dit vóór livegang)

De README noemt een volume van 1 GB. Dat is voor video's veel te weinig.

```bash
fly volumes list -a hoogbeeld-media                          # kolom SIZE
fly ssh console -a hoogbeeld-media -C "df -h /data"          # echt gebruikt en vrij
fly ssh console -a hoogbeeld-media -C "du -sh /data/deliveries /data/invoices /data/backups /data/kai-aerials.db"
```

Vergroten kan, verkleinen niet:

```bash
fly volumes extend <volume-id> -s 40 -a hoogbeeld-media      # naar 40 GB
```

**Reken zo:** 4K-dronevideo is ongeveer 0,5–1 GB per minuut; een foto van een
drone ongeveer 8–20 MB. Een opdracht met twee minuten film en 30 foto's is dan
1,5–3 GB. Tien van zulke opdrachten per maand is 15–30 GB, en zonder opruimen
loopt dat in een jaar op tot 200–350 GB. Begin met **40 GB**, kijk elke maand naar
`df -h`, en vergroot bij 70% vol. Er is nog geen automatische opruiming: verwijder
bestanden per opdracht in Beheer (knop "Verwijderen" bij het bestand) als de
bewaartermijn voorbij is, bijvoorbeeld 12 maanden na betaling. Een boeking met
een uitgegeven factuur kan niet worden verwijderd (bewaarplicht); de bestanden
eronder wel.

## 2. Is de huidige privéopslag geschikt voor langdurig gebruik?

Voor het volume van een eenmanszaak: **ja, mits** (a) het volume groot genoeg is,
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
| 40 GB | ±6 | ±0,25–0,80 |
| 300 GB | ±45 | ±2–6 |
| Downloadverkeer | via de server (512 MB-machine) | rechtstreeks van de opslag, zonder tussenstap |
| Duurzaamheid | één schijf + snapshots | gespiegeld en zeer duurzaam |
| Extra werk | geen | upload, voorbeelden, ZIP en opruimen aanpassen; bestaande bestanden verhuizen |

\* Richtprijzen uit mijn geheugen, zonder dat ik ze kan nakijken; controleer de
actuele tarieven bij Fly, Tigris, Cloudflare R2 en Backblaze.

**Advies:** nu niet bouwen. Met 40 GB, een bewaartermijn en dagelijkse
back-ups is het volume eenvoudiger en goedkoop genoeg (±6 dollar). Overweeg
objectopslag als het totaal boven ±100–150 GB uitkomt, als je een tweede kopie
van de media buiten Fly wilt, of als klanten vaak tegelijk grote video's
downloaden. Het bestaande model van korte ondertekende links past er goed op
(vooraf ondertekende opslag-URL's), dus de stap later is een gerichte
aanpassing en geen herbouw.
