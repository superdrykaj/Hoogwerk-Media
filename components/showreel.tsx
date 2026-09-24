import type { Dictionary } from "@/content/copy";

/**
 * De showreel op de homepage.
 *
 * Geen client component: er valt niets te kiezen en niets te regelen. De
 * ingebouwde bediening van de browser is met het toetsenbord te gebruiken en
 * wordt door schermlezers begrepen — beter dan wat we er zelf omheen zouden
 * bouwen.
 *
 * Er wordt niets automatisch afgespeeld. Het bestand is groot; `preload` staat
 * daarom op "metadata", zodat de browser alleen de kop van het bestand ophaalt
 * en pas na een klik de rest. Het posterbeeld vult tot die tijd het kader.
 */
export function Showreel({ t }: { t: Dictionary }) {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-ink-700 bg-ink-950">
      {/* Vaste 16:9-verhouding, zodat het kader er al staat voordat er iets is
          geladen en de pagina niet verspringt. */}
      <video
        controls
        preload="metadata"
        playsInline
        poster="/media/hoogbeeldmedia-poster.webp"
        width={1920}
        height={1080}
        aria-label={t.home.showreelLabel}
        className="aspect-video h-auto w-full bg-ink-950"
      >
        <source src="/media/hoogbeeldmedia-portfolio.mp4" type="video/mp4" />
        <p className="p-6 text-sm text-mist-300">
          {t.home.showreelFallback}{" "}
          <a href="/media/hoogbeeldmedia-portfolio.mp4" className="link-quiet">
            {t.home.showreelDownload}
          </a>
          .
        </p>
      </video>
    </div>
  );
}
