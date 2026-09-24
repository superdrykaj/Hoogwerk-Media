import type { Dictionary } from "@/content/copy";

/**
 * De video bij een project.
 *
 * Twee soorten bronnen. Een bestand uit public/media spelen we zelf af met de
 * ingebouwde speler van de browser: die is met het toetsenbord te bedienen en
 * schermlezers begrijpen hem. Een YouTube- of Vimeo-link gaat in een iframe.
 *
 * Er wordt niets automatisch afgespeeld en `preload` staat op "metadata", dus
 * van een bestand van twintig megabyte komt alleen de kop binnen tot iemand op
 * afspelen drukt. Het posterbeeld vult het kader tot die tijd.
 *
 * De volumeknop regelen we niet zelf weg: deze video's hebben geen audiospoor,
 * en dan laat de browser die knop vanzelf achterwege.
 */
export function ProjectVideo({
  t,
  src,
  poster,
  title,
}: {
  t: Dictionary;
  src: string;
  poster: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-950">
      {/* Vaste 16:9-verhouding, zodat het kader er staat voordat er iets is
          geladen en de pagina niet verspringt. */}
      <video
        controls
        preload="metadata"
        playsInline
        poster={poster || undefined}
        width={1920}
        height={1080}
        aria-label={t.project.videoOf(title)}
        className="aspect-video h-auto w-full bg-ink-950"
      >
        <source src={src} type="video/mp4" />
        <p className="p-6 text-sm text-mist-300">
          {t.project.videoFallback}{" "}
          <a href={src} className="link-quiet">
            {t.project.videoDownload}
          </a>
          .
        </p>
      </video>
    </div>
  );
}
