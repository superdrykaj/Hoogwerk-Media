"use client";

import { useEffect, useRef } from "react";

import { VideoWatermark } from "@/components/video-watermark";
import { useMuteIfSilent } from "@/lib/use-mute-if-silent";

const POSTER = "/media/hoogbeeldmedia-portfolio-poster.webp?v=20261001";

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
 * Het posterbeeld (ruim 200 kB) staat onder de vouw en wordt pas opgehaald
 * als de bezoeker er bijna is; de vaste 16:9-verhouding houdt het kader tot
 * die tijd op zijn plek, dus er verspringt niets.
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const zetPoster = () => {
      video.poster = POSTER;
    };
    if (typeof IntersectionObserver === "undefined") {
      zetPoster();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          zetPoster();
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Media-bestanden in public/media/ krijgen een week Cache-Control
  // (next.config.ts). Vervang je het bestand, dan blijft een bezoeker zonder
  // dit versienummer de oude, gecachte versie zien. Ophogen bij elke nieuwe
  // montage van de showreel.
  const showreelSrc = "/media/hoogbeeldmedia-portfolio.mp4?v=20261001";

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
