# Livegang: stappen in volgorde

Productie is `hoogbeeld-media` (hoogbeeldmedia.nl). De controles hieronder moeten
per omgeving worden bevestigd; code en lokale tests bewijzen geen uitgevoerde
Mollie-testbetaling of gewijzigde productieopslag.
Een merge naar `main` start automatisch de productiedeployment, dus de merge
komt pas na stap 1 t/m 5, en alleen na expliciet akkoord.

## Vooraf (nog zonder merge)
1. **Staging volledig getest:** Mollie-testbetaling (Failed en Paid), voorbeelden,
   downloads, ZIP, terugbetaling, verlopen link; zie `docs/MOLLIE-TEST.md`.
2. **Schijfruimte op productie:** `fly volumes list -a hoogbeeld-media` en
   `fly ssh console -a hoogbeeld-media -C "df -h /data"`. Vergroot naar 40 GB:
   `fly volumes extend <volume-id> -s 40 -a hoogbeeld-media`.
3. **Snapshots:** bewaartermijn verhogen
   (`fly volumes update <volume-id> --snapshot-retention 30 -a hoogbeeld-media`) en
   controleren met `fly volumes snapshots list`.
4. **Btw:** btw-identificatienummer NL005579445B28 staat in `content/site.ts` en
   is de beginwaarde bij de factuurinstellingen. Het percentage is **21%** (bevestigd
   door de eigenaar; geen KOR). Vul daarnaast in Beheer → Instellingen →
   Bedrijfsgegevens in: adres, postcode, plaats en IBAN, en controleer het nummer in VIES.
5. **Mollie productiesleutel:** pas ná het akkoord, een **Live API-key** (zelfde
   profiel) als secret op `hoogbeeld-media` (nooit op de testomgeving):
   `fly secrets set MOLLIE_API_KEY=live_... -a hoogbeeld-media`. Voor live betalingen
   moet je Mollie-account volledig geverifieerd zijn en de betaalmethoden in je
   profiel aanstaan.

## Livegang
6. PR #22 van concept naar "klaar voor review", laatste controle van de diff, merge.
   De deployment loopt automatisch (±2 minuten); `min_machines_running = 1` gaat
   dan ook in.
7. **Direct na de deploy controleren:** `https://hoogbeeldmedia.nl/api/health`,
   inloggen in Beheer, bij Instellingen staan de bedrijfsgegevens op "compleet",
   een bestaande factuur-PDF opent nog onveranderd.
8. **Eerste echte transactie:** een kleine eigen opdracht (bijvoorbeeld € 1,00 naar
   jezelf) met een eigen e-mailadres als klant; betaal echt via iDEAL, controleer
   de volledige flow, en betaal het bedrag in Mollie weer terug (dat test ook de
   terugbetaling live).
9. **Back-up:** de eerste nachtelijke back-up verschijnt na 03:00 in
   `/data/backups/dagelijks/`; controleer met
   `fly ssh console -a hoogbeeld-media -C "node scripts/onderhoud/back-up.cjs controleer"`.
10. **Kopie buiten Fly:** minstens maandelijks de nieuwste back-up ophalen (zie `docs/BACKUP.md`).

## Terugdraaien
Leg vóór de merge de daadwerkelijk gedeployde Fly-release en image vast met
`fly releases -a hoogbeeld-media` en bewaar een gecontroleerde databaseback-up.
Gebruik die release als referentie voor herstel; een Git-commit alleen bewijst
niet welke versie op Fly draait.

`main` bevat sinds 26 oktober ook `2b101b7` (KwijtCalc onder `/kwijtcalc`).
`c73c343` is daarom geen actuele terugvalversie. Draai bij problemen uitsluitend
de livegang-merge terug met een revert-commit op de dan actuele `main`; behoud
KwijtCalc en eventuele latere wijzigingen. Controleer de revert-diff vóór push,
want een push naar `main` deployt automatisch naar productie.

De database-uitbreidingen zijn additief, maar herstel is pas bevestigd na een
test met de gekozen applicatieversie en een kopie van de actuele database.
Controleer bestaande factuur-PDF's en de vergrendeling van uitgegeven facturen.
Zet de productiedatabase niet terug zonder de gevolgen voor nieuwe boekingen,
betalingen en facturen apart te beoordelen.
