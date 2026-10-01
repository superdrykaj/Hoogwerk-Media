# Definitieve montagecontrole — 1 oktober 2026

## Resultaat

De desktop- en mobiele hero duren exact 20,000 seconden (600 frames). De hoofdvideo duurt exact 43,800 seconden (1314 frames). Alle vijf video-exports zijn volledig gedecodeerd zonder fouten, op 30 fps, in yuv420p/BT.709 en zonder audio. De drie MP4's hebben hun moov-header vóór de videodata (faststart). De drie WebP-posters zijn volledig gedecodeerd en hebben de juiste afmetingen.

De eerdere desktophero en hoofdvideo waren één frame korter. Het renderscript begrenst nu expliciet het aantal frames, met maximaal een korte verlenging van het laatste frame. De shotkeuze, snelheid en uitsneden zijn behouden. De eerdere lokale exports zijn apart bewaard tijdens het afronden.

## Bronmateriaal en beweging

Alle vijf lokale originelen komen qua bestandsgrootte en SHA-256 exact overeen met `source-checksums.json`. Alleen de drie bronbestanden van 24 en 26 september worden in de montages gebruikt. Er is geen extern beeld, muziek of materiaal uit oude websitevideo's toegevoegd.

Naast de eerdere keyframe-analyse zijn alle opeenvolgende frames binnen de definitieve shots gecontroleerd met optical flow en een robuuste affine cameratransformatie. Bewuste dissolves en fades zijn hierbij uitgesloten: die mengen twee scènes en leveren geen zinvolle camerabewegingsmeting op. De cameraverplaatsing tussen twee frames is maximaal:

| Export | Gecontroleerde frameparen | Maximaal, als % van beeldbreedte | 95e percentiel |
| --- | ---: | ---: | ---: |
| Hero desktop | 488 | 0,0222% | 0,0153% |
| Hero mobiel | 488 | 0,0677% | 0,0416% |
| Hoofdvideo | 1118 | 0,0335% | 0,0164% |

De grootste rotatie per frame is respectievelijk 0,0254°, 0,0430° en 0,0243°. Dit zijn metingen, geen algemene certificeringsgrenzen. De contactbladen van de volledige montages zijn visueel bekeken op uitsneden, onderwerp, horizon, overgangen en ongewenste zwarte frames. De gekozen shots tonen stilstaande kaders of zeer rustige, gelijkmatige beweging; er zijn geen snelle pans, schokken of abrupte camerabewegingen aangetroffen.

Ook het laatste-naar-eerste framepaar is afzonderlijk gemeten: circa 0,0149% van de beeldbreedte voor desktop en 0,0148% voor mobiel. De lus loopt via een dissolve terug naar dezelfde molenopname. De eerste en laatste frames hoeven niet identiek te zijn: het zijn opeenvolgende momenten in die overgang. Er zijn geen zwarte frames in de hero's. De hoofdvideo heeft uitsluitend de geplande fade-in en fade-out.

## Controlebestanden

- `exports.json`: definitieve groottes, checksums, frames, codecs en technische checks.
- `source-verification.json`: verificatie van de vijf originelen.
- `motion-analysis.json`: camerabeweging per gecontroleerd framepaar.
- `review/`: contactbladen op circa één seconde interval en beide lusovergangen.
- `verify_montages.py`: herhaalbare technische controle (Python, Pillow, NumPy, FFmpeg).
- `check_motion.py`: herhaalbare bewegingsmeting (Python, NumPy, OpenCV, FFmpeg).

## Lokale editors

Genra: `GET http://127.0.0.1:9100/info` weigert de verbinding, ook na hercontrole. Er is in de gecontroleerde installatiemappen, registers en snelkoppelingen geen startbare Genra-app gevonden. Er zijn daarom geen Genra-bewerkingen of exports geclaimd.

Yaps: de officiële pluginrunner kan de lokale CLI/engine niet vinden. Er is geen afzonderlijke CLI geïnstalleerd en geen Auto Cut uitgevoerd. Deze stille beeldmontages vereisen geen spraak- of stiltebewerking.

## Website-integratie

De aparte testsitebranch is gebaseerd op GitHub `staging` op commit `0695918d15167db37d7fa8d2a51c3e5ac697c147`, passend bij de bestaande testrelease van 28 september. De bestaande lokale wijzigingen in de hoofdcheckout en andere werkmappen zijn niet overgenomen of teruggezet.

De integratie gebruikt een eigen hoofdvideoposter en een mobiele hero-poster, past de Nederlandse en Engelse poster-alttekst aan en geeft alle gewijzigde media-URL's `?v=20261001` om de bestaande weekcache te vernieuwen. Autoplay/muted/loop/playsInline, reduced motion, databesparing, slechts één gekozen hero-videobron en afspelen van de hoofdvideo na een klik blijven behouden.

De gebruiker heeft na de oorspronkelijke overdrachtsopdracht toestemming gegeven om zelf naar de testwebsite te deployen. Productie (`main` en de productie-Fly-app) valt buiten deze publicatie.
