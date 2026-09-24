"use client";

import { useEffect, useRef } from "react";

/**
 * ============================================================================
 *  VIDEOBACKGROUND VAN DE HERO
 * ============================================================================
 *  Er zijn vier videobestanden: staand en liggend, elk als WebM en als MP4.
 *  Er mag er precies één worden opgehaald. Vandaar dat dit een client component
 *  is en dat de bron pas in de browser wordt gezet: op de server weten we niet
 *  hoe breed het scherm is, en met vier <source>-elementen in de HTML kan een
 *  browser er meer dan één proberen.
 *
 *  De <video> gaat dus zonder src de deur uit. Dat scheelt ook een
 *  hydratiefout: server en browser renderen precies hetzelfde.
 *
 *  Het posterbeeld staat er als gewone <img> onder. Blijft de video weg — geen
 *  netwerk, autoplay geweigerd, een bestand dat niet laadt, of iemand die
 *  minder beweging heeft ingesteld — dan valt daar dus altijd nog een beeld te
 *  zien, en blijft de hoogte van de hero gelijk.
 * ============================================================================
 */

const POSTER = "/media/hoogbeeldmedia-poster.webp";

/** Tot en met 767 px staand beeld, daarboven liggend. */
const MOBIEL = "(max-width: 767px)";
const MINDER_BEWEGING = "(prefers-reduced-motion: reduce)";

const BRONNEN = {
  mobiel: {
    webm: "/media/hoogbeeldmedia-hero-mobile.webm",
    mp4: "/media/hoogbeeldmedia-hero-mobile.mp4",
  },
  breed: {
    webm: "/media/hoogbeeldmedia-hero-desktop.webm",
    mp4: "/media/hoogbeeldmedia-hero-desktop.mp4",
  },
};

/**
 * Wat de browser ons vertelt over de verbinding.
 *
 * Alleen Chromium-browsers hebben dit; Safari en Firefox laten het weg. Weten
 * we niets, dan gaan we uit van een gewone verbinding en speelt de video
 * gewoon af.
 */
type Verbinding = {
  /** De bezoeker heeft databesparing aangezet. */
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

/**
 * Mag deze bezoeker een videobestand van een paar megabyte verwachten?
 *
 * Nee bij databesparing — dat is een uitgesproken wens, geen gok — en nee op
 * 2G, waar een hero-video de pagina alleen maar in de weg zit. Op een gewone
 * mobiele verbinding speelt hij wel.
 */
function zuinigOfTraag(): boolean {
  const verbinding = (navigator as Navigator & { connection?: Verbinding })
    .connection;
  if (!verbinding) return false;
  if (verbinding.saveData) return true;
  return (
    verbinding.effectiveType === "2g" || verbinding.effectiveType === "slow-2g"
  );
}

/**
 * Welke van de vier bestanden deze browser moet ophalen.
 * De WebM-bestanden zijn VP9 en ongeveer de helft kleiner dan de MP4's; kan de
 * browser daar niets mee, dan pakken we H.264.
 */
function kiesBron(video: HTMLVideoElement, mobiel: boolean): string {
  const set = mobiel ? BRONNEN.mobiel : BRONNEN.breed;
  const vp9 = video.canPlayType('video/webm; codecs="vp9"');
  return vp9 === "probably" || vp9 === "maybe" ? set.webm : set.mp4;
}

export function HeroVideo({ alt }: { alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  /**
   * Welke bron al is toegekend. Hiermee halen we hetzelfde bestand nooit twee
   * keer op: niet bij het dubbele effect van de strikte modus, en niet bij een
   * resize die de breekpuntgrens niet passeert.
   */
  const huidigeBron = useRef<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Minder beweging gevraagd: niets ophalen, niets afspelen. Het posterbeeld
    // eronder is dan het hele verhaal.
    if (window.matchMedia(MINDER_BEWEGING).matches) return;

    // Hetzelfde bij databesparing of een 2G-verbinding. Bewust niet alleen op
    // een klein scherm: databesparing is iets wat de bezoeker zelf aanzet, en
    // dat geldt net zo goed achter een laptop op een gedeelde hotspot.
    if (zuinigOfTraag()) return;

    const breekpunt = window.matchMedia(MOBIEL);

    const zetBron = () => {
      const bron = kiesBron(video, breekpunt.matches);
      if (huidigeBron.current === bron) return;

      huidigeBron.current = bron;
      video.src = bron;
      video.load();
      // Weigert de browser het automatisch afspelen, dan blijft het poster
      // staan. Dat is geen fout om de bezoeker mee lastig te vallen.
      void video.play().catch(() => {});
    };

    zetBron();
    breekpunt.addEventListener("change", zetBron);
    return () => breekpunt.removeEventListener("change", zetBron);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/*
        Bewust een gewone <img> en geen next/image: het beeld moet ongewijzigd
        vanuit public/media komen, en het moet exact dezelfde URL zijn als het
        poster hieronder, anders haalt de browser hem twee keer op.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={POSTER}
        alt={alt}
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <video
        ref={videoRef}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
