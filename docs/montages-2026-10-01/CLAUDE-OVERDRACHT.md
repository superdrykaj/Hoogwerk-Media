# Nieuwe homepage-montages — 1 oktober 2026

De opdracht van Kai: twee nieuwe montages voor de hero en **Bekijk mijn werk**, uitsluitend uit de gedeelde OneDrive-beelden. Aanvullende harde eis: **alleen stabiel beeld**.

## Wat klaarstaat

| Bestand in `public/media/` | Gebruik | Duur | Formaat |
| --- | --- | --- | --- |
| `hoogbeeldmedia-hero-desktop.mp4` | Hero, H.264 fallback | 20 s | 1280 × 720, 30 fps |
| `hoogbeeldmedia-hero-desktop.webm` | Hero, VP9 | 20 s | 1280 × 720, 30 fps |
| `hoogbeeldmedia-hero-mobile.mp4` | Mobiele hero, H.264 fallback | 20 s | 720 × 1280, 30 fps |
| `hoogbeeldmedia-hero-mobile.webm` | Mobiele hero, VP9 | 20 s | 720 × 1280, 30 fps |
| `hoogbeeldmedia-portfolio.mp4` | Hoofdvideo bij Bekijk mijn werk | 43,8 s | 1920 × 1080, 30 fps |
| `hoogbeeldmedia-poster.webp` | Bestaande hero-poster URL | — | 1280 × 720 |
| `hoogbeeldmedia-hero-mobile-poster.webp` | Optionele eigen mobiele poster | — | 720 × 1280 |
| `hoogbeeldmedia-portfolio-poster.webp` | Eigen poster voor de hoofdvideo | — | 1920 × 1080 |

De twee inhoudelijk verschillende montages hebben geen audiospoor, titels of ingebakken logo. Er is geen extern materiaal of muziek toegevoegd. Het bestaande `VideoWatermark` van de site blijft bruikbaar. H.264 is in `yuv420p`, BT.709; de MP4-kop staat vooraan (`faststart`).

## Selectie: uitsluitend rustige passages

De bronopnamen zijn vooraf bekeken met contactbladen en camerabeweging is vergeleken met optical flow op de oorspronkelijke keyframes. Snelle horizontale pans, richtingswisselingen en de landing uit de lange opname zijn uitgesloten. De twee opnamen van 27 september bevatten voortdurend draaiend beeld en zijn **helemaal niet gebruikt**. De geselecteerde passages zijn stilstaande kaders of heel rustige, gelijkmatige stijgingen; slowmotion op 50% maakt de beweging nog rustiger. Er is geen kunstmatige pan, speed ramp, frame-interpolatie of beeld uit eerdere websitevideo's gebruikt.

| Bronbestand | Gebruikte starts in de showreel | Beeld |
| --- | --- | --- |
| `20260924_170936000_iOS.MP4` | 39,0 / 48,5 / 65,0 / 57,5 s | De Zaan, waterfront en toren |
| `20260926_125304000_iOS.MP4` | 27,5 / 53,5 s | Molen aan de Zaan en huizen op de Zaanse Schans |
| `20260924_170800000_iOS.MP4` | 15,0 / 26,5 s | Rustige rivierbeelden |

Elke showreelpassage gebruikt 3,0 seconden bronmateriaal en duurt 6,0 seconden op halve snelheid. Overgangen zijn 0,6 seconden zachte dissolve; de showreel krijgt een korte fade-in en fade-out. De hero gebruikt vijf passages van 2,3 seconden bronmateriaal, elk 4,6 seconden op halve snelheid. Ook de laatste-naar-eerste-overgang is een dissolve: de lus sluit via een dissolve aan op dezelfde opname rond hetzelfde brontijdpunt, zonder zwart frame. De mobiele export heeft per shot een gekozen 9:16-uitsnede rond het onderwerp.

Zie `edit-plan.json` voor de exacte montage, crop-centers en bronindexen; `source-checksums.json` legt de identiteit van alle vijf aangeboden originelen vast. Alleen de uiteindelijke webexports staan in Git. De grote originele bestanden blijven in OneDrive/lokaal.

## Voor Claude: overnemen op de testwebsite

Deze branch bevat assets en overdracht, geen wijzigingen aan de websitecode. De vijf video-URLs en bestaande hero-poster-URL komen overeen met de huidige componenten. Daardoor werkt de vervanging zodra je deze assets overneemt in de gewenste websitebranch.

1. Neem deze commit/assetbestanden over op de branch waaraan je voor de testwebsite werkt. Vermijd het terugzetten van andere websitewijzigingen; deze assetbranch is gebaseerd op `main` van 1 oktober.
2. Zet in `components/showreel.tsx` de poster op `/media/hoogbeeldmedia-portfolio-poster.webp`; anders krijgt de hoofdvideo de hero-poster van de molen.
3. Gebruik desgewenst de eigen mobiele poster in `components/hero-video.tsx`, met dezelfde breakpoints als de video. De bestaande liggende poster blijft beschikbaar als fallback.
4. Pas de poster-alttekst in Nederlands en Engels aan: de hero opent nu met een groene molen aan de Zaan op de Zaanse Schans.
5. Behoud autoplay + muted + loop + playsInline voor de hero, de regels voor reduced motion/databesparing en laden van slechts één hero-video. De hoofdvideo speelt uitsluitend na een klik af.
6. Controleer desktop, mobiel, beide talen, de hero-loopovergang en de showreel. Controleer ook dat browser/CDN-cache de nieuwe bestanden serveert; gebruik indien nodig versieparameters voor de gewijzigde asset-URLs.

De GitHub-deployworkflow publiceert `staging` naar `hoogbeeld-media-test.fly.dev` en `main` naar productie. Een push naar deze `codex/`-branch activeert die deploy niet. Deze assetbranch blijft beschikbaar voor overname. De gebruiker heeft aanvullend toestemming gegeven om de testwebsite zelf te publiceren; de afzonderlijke integratiebranch is gebaseerd op de actuele stagingbranch. Zie CONTROLE.md en DEPLOY.md voor de definitieve verificatie en publicatiestatus. Productie is niet onderdeel van deze oplevering.

## Reproduceren

Python 3 en FFmpeg 7.1 met `libx264`, `libvpx-vp9` en `libwebp` zijn voldoende; het renderscript gebruikt alleen de Python-standaardbibliotheek. Download de vijf bronbestanden naar één map en controleer de SHA-256-checksums.

```sh
python docs/montages-2026-10-01/render_montages.py --sources /pad/naar/originelen --output public/media --scratch /pad/naar/lege-renderwerkmap --ffmpeg /pad/naar/ffmpeg
```

Gebruik een lege scratchmap voor een nieuwe montage: segmenten worden binnen dezelfde render hergebruikt. `--only hero` en `--only showreel` renderen één van de twee montages. `exports.json` bevat de definitieve bestandsgroottes, checksums en technische controles. De reviewbeelden tonen verspreide frames van de definitieve exports en de eerste/laatste hero-frames.
