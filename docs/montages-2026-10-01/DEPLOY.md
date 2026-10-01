# Publicatie van de homepage-montages

De definitieve media staan op `codex/homepage-montages-20261001`. De website-integratie staat op `codex/homepage-montages-test-20261001`, gebaseerd op de actuele GitHub-stagingbranch.

De gebruiker heeft toestemming gegeven om zelf naar https://hoogbeeld-media-test.fly.dev/ te publiceren. Publicatie gebeurt uitsluitend via `staging` en de bestaande GitHub Actions-workflow `Deploy naar Fly.io`.

Voor publicatie zijn de volgende controles geslaagd:

- Volledige video- en posterdecodering, exacte duur/frames, afmetingen, 30 fps, kleurinformatie, geen audio en MP4-faststart.
- SHA-256-verificatie van alle vijf originelen.
- Optical flow per frame, visuele contactbladcontrole en controle van beide hero-lusovergangen.
- TypeScript-controle, ESLint zonder fouten of waarschuwingen in de gewijzigde bestanden en een volledige productiebuild.
- Browsercontrole in Chrome: desktop en mobiel, Nederlands en Engels, slechts één hero-videobron, juiste posters, hero-autoplay en loop, hoofdvideo pas na afspelen, reduced motion, databesparing, 2G en H.264-fallback.

Publicatiestatus: voorbereid; GitHub Actions en de gepubliceerde website worden na de push opnieuw gecontroleerd. Er wordt niet naar `main` of de productie-Fly-app gepubliceerd.

De bestaande lokale wijzigingen zijn behouden. De eerdere voorbereide video-exports zijn tijdens het afronden apart bewaard.
