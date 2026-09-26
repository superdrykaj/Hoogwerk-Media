"use client";

import { useEffect, type RefObject } from "react";

/**
 * Niet elke browser biedt dezelfde manier om een audiospoor te herkennen:
 * Firefox heeft `mozHasAudio`, Safari `audioTracks`, en Chrome/Safari samen
 * `webkitAudioDecodedByteCount` (die pas een waarde krijgt zodra er echt
 * gedecodeerd is, dus niet meteen bij het laden).
 */
type VideoMetGeluidsinfo = HTMLVideoElement & {
  mozHasAudio?: boolean;
  webkitAudioDecodedByteCount?: number;
  audioTracks?: { length: number };
};

/**
 * Zet `muted` op true zodra vaststaat dat de video geen audiospoor heeft.
 *
 * Blijft dat onduidelijk (geen van de browser-specifieke eigenschappen
 * beschikbaar, of nog te vroeg in het afspelen om het te weten), dan raken we
 * `muted` niet aan. Liever per ongeluk geluid dan een video die per ongeluk
 * stil blijft terwijl hij wel degelijk geluid heeft.
 */
export function useMuteIfSilent(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = ref.current as VideoMetGeluidsinfo | null;
    if (!video) return;

    const controleer = (): boolean => {
      if (typeof video.mozHasAudio === "boolean") {
        video.muted = !video.mozHasAudio;
        return true;
      }
      if (video.audioTracks) {
        video.muted = video.audioTracks.length === 0;
        return true;
      }
      if (typeof video.webkitAudioDecodedByteCount === "number") {
        if (video.webkitAudioDecodedByteCount > 0) return true; // heeft geluid
        if (video.currentTime > 1) {
          // Een seconde spelen zonder één gedecodeerde geluidsbyte: geen audiospoor.
          video.muted = true;
          return true;
        }
        return false; // nog te vroeg om het te weten
      }
      return false;
    };

    if (controleer()) return;

    const opTimeUpdate = () => {
      if (controleer()) video.removeEventListener("timeupdate", opTimeUpdate);
    };
    video.addEventListener("loadedmetadata", controleer);
    video.addEventListener("timeupdate", opTimeUpdate);
    return () => {
      video.removeEventListener("loadedmetadata", controleer);
      video.removeEventListener("timeupdate", opTimeUpdate);
    };
  }, [ref]);
}
