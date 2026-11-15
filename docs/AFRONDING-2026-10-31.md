# Afronding staging — 31 oktober 2026

Deze controle volgt op Claude's oplevering van staging `778562d`. Het productievolume blijft 1 GB; opslagabonnementen, snapshots en productiecode zijn niet gewijzigd.

## Afgeronde controles

### Opslag en bedrijfsgegevens
- De stagingbeheerpagina is met een kortlevende beheersessie via HTTPS gecontroleerd: HTTP 200. De sessie bleef uitsluitend in servergeheugen en is niet bewaard of getoond.
- De paginagegevens bevatten het tabblad Opslag, de gebruiksmeter en de uitsplitsing. De meter meldde 78%; de onafhankelijke bestandssysteemmeting was 77,6%: 738.250.752 bytes gebruikt en 213.131.264 bytes vrij.
- `du` bevestigde dat vooral de opleverbestanden ruimte gebruiken (ongeveer 703 MiB). Er zijn geen bestanden verwijderd.
- Zonder beheersessie volgt HTTP 307 naar de inlogpagina.
- De beheerpagina meldt dat de bedrijfsgegevens compleet zijn. De eerdere oproep om adres, postcode, plaats en IBAN op staging nog in te vullen is achterhaald.
- VIES bevestigde via de officiële EU-dienst `valid: true` voor NL005579445B28 op 31 oktober 2026 om 17:18:29 UTC. Dit is een geldigheidscontrole; tenaamstelling is niet afzonderlijk bevestigd.
- De browserlay-out en het daadwerkelijk aanklikken van de clientknop zijn niet visueel getest. De servergegevens en de broncode van de verversknop zijn gecontroleerd.

### Werkelijke Mollie-testterugbetaling
- De eerder aangemaakte testrefund van EUR 1 is inmiddels verwerkt. Er is geen tweede terugbetaling aangemaakt.
- Mollie rapporteert een terugbetaald bedrag van EUR 1 in testmodus; de stagingfactuur staat op `refunded` (Terugbetaald).
- Nog geldige, ondertekende downloadlinks naar het testbestand en de ZIP geven beide HTTP 410.
- Een verlopen link geeft HTTP 303 terug naar de klantpagina; een link zonder ondertekening geeft HTTP 403.
- Het kleine herkenbare testbestand `codex-staging-downloadtest-20261031.png` blijft op staging aanwezig. Geen echte betaling of klantmail is verstuurd.

### Back-up buiten Fly
- Verse stagingback-up: `/data/backups/dagelijks/2026-10-31T1818`.
- Lokaal: `C:/Users/kaiko/Documents/Hoogbeeld-backups/staging-2026-10-31T1818/`.
- Zowel op Fly als na het downloaden geslaagde herstelcontrole: 2 boekingen, 2 uitgegeven facturen en 2 gecontroleerde PDF's.
- Ook van productie is een consistente databasekopie gemaakt door de bron alleen-lezen te openen. De integriteitscontrole gaf `ok`; er waren geen ongeldige foreign keys.
- Lokale productiekopie: `C:/Users/kaiko/Documents/Hoogbeeld-backups/productie-2026-10-31T1820/`.
- SHA256 van de productiedatabase komt overeen met de serverkopie: `cbdb49ea538d5f1fd85ed466bff1eba5e16dc453796309966ff547ce80963eb4`.
- Dit zijn handmatige kopieën van database en aanwezige factuur-PDF's, geen automatische externe back-updienst en geen media-archief.

## Aanvullend herstel van de Windows-tests

De nieuwe opslagtests gingen uit van Linuxgedrag: `ftruncate` maakt op Windows niet vanzelf een sparse bestand, en gewone symlinks vereisen daar extra rechten. De test maakt op Windows nu expliciet een sparse fixture met het ingebouwde `fsutil` en gebruikt directory-junctions voor de link-/lustest. De Linux-controles blijven bestaan. Applicatiecode is niet aangepast.

De volledige testset slaagt: **295 tests in 34 bestanden**. Typecheck, lint en productiebuild zijn eveneens opnieuw uitgevoerd en geslaagd.

## Grenzen van deze afronding

Er is geen merge naar main, productiedeploy, live-betaalsleutel, opslagvergroting of wijziging van snapshotinstellingen uitgevoerd. PR #22 blijft concept. Persistente afbeeldingscache en voorverwarmen waren optionele vervolgideeën en zijn niet toegevoegd.
