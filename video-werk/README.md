# video-werk/

Vaste werkmap voor Luca (Videobewerker), per taak onder `video-werk/<TAAK-ID>/`.

## Wat hier wél in hoort

Uitsluitend tekstuele bestanden:
- montageplannen,
- shotlijsten,
- edit decision lists (EDL's),
- eventuele korte, tekstuele toelichtingen op exportvoorstellen.

## Wat hier nadrukkelijk niet automatisch in hoort of aan Git wordt toegevoegd

- Ruwe videobeelden en audio-opnamen (bronmateriaal).
- Grote, binaire montage-projectbestanden (bijvoorbeeld `.prproj`, `.fcpxml`,
  `.drp` of vergelijkbaar).
- Controle-exports (proefversies voor QA-review), ook niet in lage resolutie.

Deze categorieën horen op een door de gebruiker beheerde, persistente locatie
buiten deze repository en buiten deze (tijdelijke) sessie-omgeving. Een montageplan
verwijst er alleen naar (bestandsnaam, pad of omschrijving) — het materiaal zelf
wordt niet gekopieerd naar `video-werk/` en niet gecommit. Toevoeging van dergelijk
materiaal aan Git gebeurt nooit automatisch en alleen na expliciete instructie van
de gebruiker.

## Definitieve webmedia

Definitief goedgekeurde video's voor de website komen, pas ná goedkeuring van de
gebruiker, terecht in `public/media/**` — niet in `video-werk/`.

Zie `samenwerking/BELEID.md` voor het volledige beleid rond videomateriaal en de
samenwerking in het algemeen.
