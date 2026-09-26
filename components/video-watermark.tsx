/**
 * Logo, semi-transparant over een videospeler heen. Puur cosmetisch: dit is
 * geen kopieerbeveiliging (een schermopname neemt het gewoon mee), maar het
 * maakt een losse clip die ergens anders opduikt herkenbaar als ons werk.
 */
export function VideoWatermark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={160}
      height={160}
      className="pointer-events-none absolute right-3 top-3 h-9 w-9 opacity-60 drop-shadow-md sm:h-11 sm:w-11"
    />
  );
}
