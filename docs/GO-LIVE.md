# Livegang: stappen in volgorde

Productie is `hoogbeeld-media` (hoogbeeldmedia.nl). Niets hieronder is al gedaan.
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
Gaat er iets mis na de merge: zet de vorige versie terug door `main` terug te zetten
naar `c73c343` (de huidige productiestand) via een revert-commit. De database
blijft werken: de nieuwe kolommen en beschermingen zijn alleen toegevoegd en
bestaande gegevens zijn niet gewijzigd. Een vergrendelde, uitgegeven factuur blijft
vergrendeld, ook onder de oude code.
