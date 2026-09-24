/**
 * Pijltje bij een knop die de bezoeker een stap verder brengt.
 *
 * Staat alleen bij "Plan een afspraak" en bij de knop in de hero, niet bij
 * elke knop: als alles een pijl heeft, zegt de pijl niets meer. Bij het zweven
 * schuift hij een klein stukje mee, zodat de richting ook voelbaar is. De
 * beweging volgt de systeeminstelling voor minder beweging (zie globals.css).
 */
export function Arrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="btn-arrow shrink-0"
    >
      <path
        d="M2.5 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
