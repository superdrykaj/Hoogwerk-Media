"use client";

import { useRef } from "react";

import { VideoWatermark } from "@/components/video-watermark";
import { useMuteIfSilent } from "@/lib/use-mute-if-silent";

/**
 * De video bij een project.
 *
 * Twee soorten bronnen. Een bestand uit public/media (of een upload) spelen
 * we zelf af met de ingebouwde speler van de browser: die is met het
 * toetsenbord te bedienen en schermlezers begrijpen hem. Een YouTube- of
 * Vimeo-link gaat in een iframe (zie components/pages/project.tsx).
 *
 * Er wordt niets automatisch afgespeeld en `preload` staat op "none", dus er
 * gaat pas iets over de lijn zodra iemand op afspelen drukt. Het posterbeeld
 * vult het kader tot die tijd.
 *
 * Downloaden via de eigen bediening van de browser staat uit
 * (`controlsList="nodownload"`). Heeft de video geen audiospoor, dan wordt
 * hij tijdens het afspelen alsnog gemute — zie useMuteIfSilent: dat is een
 * echte controle, geen aanname over welk bestand wel of geen geluid heeft.
 *
 * Neemt alleen kant-en-klare tekst aan (geen hele `Dictionary`): dit is een
 * client component, en een woordenboek vol functies kan niet over de
 * server/client-grens.
 */
export function ProjectVideo({
  src,
  poster,
  ariaLabel,
  fallbackText,
}: {
  src: string;
  poster: string;
  ariaLabel: string;
  fallbackText: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useMuteIfSilent(videoRef);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-950">
      {/* Vaste 16:9-verhouding, zodat het kader er staat voordat er iets is
          geladen en de pagina niet verspringt. */}
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        preload="none"
        playsInline
        poster={poster || undefined}
        width={1920}
        height={1080}
        aria-label={ariaLabel}
        className="aspect-video h-auto w-full bg-ink-950"
      >
        <source src={src} type="video/mp4" />
        <p className="p-6 text-sm text-mist-300">{fallbackText}</p>
      </video>
      <VideoWatermark />
    </div>
  );
}
