# Publicatie van de homepage-montages

De definitieve media staan op `codex/homepage-montages-20261001`. De website-integratie staat op `codex/homepage-montages-test-20261001`, gebaseerd op de actuele GitHub-stagingbranch.

De gebruiker heeft toestemming gegeven om zelf naar https://hoogbeeld-media-test.fly.dev/ te publiceren. Publicatie gebeurt uitsluitend via `staging` en de bestaande GitHub Actions-workflow `Deploy naar Fly.io`.

Voor publicatie zijn de volgende controles geslaagd:

- Volledige video- en posterdecodering, exacte duur/frames, afmetingen, 30 fps, kleurinformatie, geen audio en MP4-faststart.
- SHA-256-verificatie van alle vijf originelen.
- Optical flow per frame, visuele contactbladcontrole en controle van beide hero-lusovergangen.
- TypeScript-controle, ESLint zonder fouten of waarschuwingen in de gewijzigde bestanden en een volledige productiebuild.
- Browsercontrole in Chrome: desktop en mobiel, Nederlands en Engels, slechts één hero-videobron, juiste posters, hero-autoplay en loop, hoofdvideo pas na afspelen, reduced motion, databesparing, 2G en H.264-fallback.

Publicatiestatus: **geslaagd en na publicatie gecontroleerd**. [GitHub Actions-run 36926454674](https://github.com/superdrykaj/Hoogwerk-Media/actions/runs/36926454674) is succesvol afgerond op 1 oktober 2026 om 23:08:57 Nederlandse tijd (21:08:57 UTC).

Gepubliceerde codecommit: `9092c58078cb8cf5344fde44d67f91831a7cfa40`, op `staging`. Fly-testrelease v28 draait gezond met een geslaagde healthcheck. De productiebranch `main` blijft op `99f7149f05b06c2fc79fb5c5fd6dee0bf778c6b8`.

Op de gepubliceerde website zijn dezelfde acht browserscenario's geslaagd als lokaal. Alle acht mediabestanden zijn rechtstreeks van de website gelezen: bestandsgrootte en SHA-256 komen exact overeen met de gecontroleerde exports. De drie MP4's ondersteunen HTTP-rangeverzoeken (206) voor laden en zoeken tijdens het afspelen. `/api/health` antwoordt met HTTP 200.

Zie `browser-checks-live.json`, `published-asset-checks.json` en de websitebeelden in `review/`. Deze eindrapporten worden op de montagebranches opgeslagen; de documentatie-update veroorzaakt geen extra website-deploy.

De bestaande lokale wijzigingen zijn behouden. De eerdere voorbereide video-exports zijn tijdens het afronden apart bewaard.
