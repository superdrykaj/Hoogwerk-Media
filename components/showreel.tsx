"use client";

import { useRef } from "react";

import { VideoWatermark } from "@/components/video-watermark";
import { useMuteIfSilent } from "@/lib/use-mute-if-silent";

/**
 * De showreel op de homepage.
 *
 * De ingebouwde bediening van de browser is met het toetsenbord te gebruiken
 * en wordt door schermlezers begrepen — beter dan wat we er zelf omheen
 * zouden bouwen. Downloaden via die bediening staat uit
 * (`controlsList="nodownload"`).
 *
 * Er wordt niets automatisch afgespeeld en `preload` staat op "none": pas na
 * een klik op afspelen haalt de browser iets van dit grote bestand op. Het
 * posterbeeld vult tot die tijd het kader.
 *
 * Heeft de video geen audiospoor, dan wordt hij tijdens het afspelen alsnog
 * gemute — zie useMuteIfSilent.
 *
 * Neemt alleen kant-en-klare tekst aan (geen hele `Dictionary`): dit is een
 * client component, en een woordenboek vol functies kan niet over de
 * server/client-grens.
 */
export function Showreel({
  ariaLabel,
  fallbackText,
}: {
  ariaLabel: string;
  fallbackText: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useMuteIfSilent(videoRef);

  // Media-bestanden in public/media/ krijgen een week Cache-Control
  // (next.config.ts). Vervang je het bestand, dan blijft een bezoeker zonder
  // dit versienummer de oude, gecachte versie zien. Ophogen bij elke nieuwe
  // montage van de showreel.
  const showreelSrc = "/media/hoogbeeldmedia-portfolio.mp4?v=2";

  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl border border-ink-700 bg-ink-950">
      {/* Vaste 16:9-verhouding, zodat het kader er al staat voordat er iets is
          geladen en de pagina niet verspringt. */}
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        preload="none"
        playsInline
        poster="/media/hoogbeeldmedia-poster.webp"
        width={1920}
        height={1080}
        aria-label={ariaLabel}
        className="aspect-video h-auto w-full bg-ink-950"
      >
        <source src={showreelSrc} type="video/mp4" />
        <p className="p-6 text-sm text-mist-300">{fallbackText}</p>
      </video>
      <VideoWatermark />
    </div>
  );
}
