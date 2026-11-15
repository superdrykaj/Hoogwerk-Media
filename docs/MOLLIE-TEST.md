# Mollie testen op de testomgeving

Doel: de volledige betaalflow een keer echt doorlopen met Mollies **testmodus**,
zonder echt geld, zonder echte klantmails en zonder productie aan te raken.
Geen sleutels of wachtwoorden delen met anderen: je zet de sleutel zelf als
geheim op Fly.

## 1. Testsleutel instellen (eenmalig)

Mollie Dashboard → Developers → API keys → **Test API key** (begint met `test_`).
Voer lokaal in je terminal uit; de sleutel verschijnt niet op het scherm en komt
niet in de shellgeschiedenis:

```bash
read -s -p "Mollie TEST key: " K; echo
case "$K" in test_*) ;; *) echo "Dit is geen testsleutel, stop."; unset K; false;; esac \
  && fly secrets set MOLLIE_API_KEY="$K" -a hoogbeeld-media-test
unset K
fly secrets list -a hoogbeeld-media-test   # toont naam en digest, nooit de waarde
```

Alleen `hoogbeeld-media-test`. De productie-app heet `hoogbeeld-media`; daar zet
je pas een sleutel na akkoord, en dan een `live_`-sleutel.

## 2. Bedrijfsgegevens op de testomgeving

Beheer → Instellingen → Bedrijfsgegevens voor facturen. Een factuur wordt alleen
uitgegeven bij echte, geldige gegevens (adres, postcode, plaats, KvK van 8
cijfers, geldig IBAN en btw-identificatienummer, of 0% bij de
kleineondernemersregeling). Voor een test mag dit een geldig testnummer zijn,
bijvoorbeeld IBAN `NL91ABNA0417164300`.

## 3. De test

Gebruik een boeking met **je eigen e-mailadres** als klant (niet een echte klant).

1. Beheer → Boekingen → open de boeking → **Bevestigen**.
2. "Oplevering & factuur": vul bedrag (bijv. 1,00), omschrijving, klantnaam,
   adres, postcode, plaats, leverdatum in → **Opslaan** (concept).
3. **Betaalverzoek versturen**. Verwacht: melding "Het betaalverzoek is
   verstuurd", factuurnummer `JJJJ-0001`, velden vergrendeld, mail met PDF-bijlage.
4. Open de betaallink uit de mail (of de opleveringslink → **Nu betalen**).
   Mollie toont een testpagina met een keuze van status.
5. Kies **Failed**. Verwacht: factuur blijft "Verstuurd"; op de opleveringspagina
   kun je opnieuw betalen (nieuwe betaling).
6. Kies bij de volgende poging **Paid**. Verwacht: je komt terug op de
   opleveringspagina, de factuur staat op **Betaald** (via de webhook, of
   direct doordat de pagina de status zelf opvraagt).
7. Controleer in de beheeromgeving: status Betaald en betaaldatum. Het PDF is
   hetzelfde als vóór de betaling.
8. Controleer de webhook: `fly logs -a hoogbeeld-media-test` toont een POST op
   `/api/mollie/webhook` met status 200; in Mollie → Developers → Payments staat
   de betaling als `paid`.

Aanvullende gevallen: **Canceled** en **Expired** kiezen (factuur blijft open,
nieuwe betaling mogelijk); op **Status verversen** klikken terwijl al is betaald
(verandert niets).

## 3b. De klantworkflow (voorbeelden, betalen, downloaden)

Doe dit met fictieve bestanden (een paar eigen testfoto's en een korte clip).

1. Upload bij de boeking twee foto's en een video. Verwacht: bij de foto's
   "Voorbeeld ✓", bij de video "Geen voorbeeld". Maak voor de video een voorbeeld
   met `scripts/maak-voorbeeld.sh film.mp4` en upload dat via "Voorbeeld uploaden".
2. **Project afronden & opleveren**. Open de klantlink in een privévenster.
   Verwacht: voorbeelden met watermerk (foto's verkleind, video speelt), geen
   downloadknop, wel "Nu betalen".
3. Kijk in de browser-ontwikkelaarstools (Netwerk) mee: er mag alleen
   `/voorbeeld/…` voorbijkomen, geen originele bestanden of bestandsnamen.
4. Betaal in de Mollie-testmodus met **Paid**. Verwacht: terug op de pagina,
   direct downloadknoppen en een ZIP-knop; de originelen zijn identiek aan wat je
   uploadde.
5. Herlaad de pagina later: de downloadlinks zijn vernieuwd, je betaalt niet opnieuw.
6. Plak een gekopieerde downloadlink na meer dan 30 minuten in een nieuw venster:
   je komt op de pagina met de melding dat de link verlopen was.
7. Terugbetalen in het Mollie-dashboard (testmodus): binnen enkele seconden
   staat de factuur op "Terugbetaald" en geven de links geen bestanden meer.

## 4. Opruimen

Niets verplicht. Wil je de testsleutel weghalen: `fly secrets unset MOLLIE_API_KEY -a hoogbeeld-media-test`.
