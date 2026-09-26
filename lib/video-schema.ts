/**
 * JSON-LD (schema.org VideoObject) voor de video bij een project, zodat
 * zoekmachines hem als video kunnen tonen in de zoekresultaten.
 *
 * `uploadDate` moet een geldige datum zijn; we gebruiken het aanmaakmoment
 * van het project, want een echte publicatiedatum van de video zelf houden
 * we niet bij.
 */
export function videoObjectJsonLd(input: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: number;
  contentUrl?: string | null;
  embedUrl?: string | null;
}): Record<string, unknown> | null {
  if (!input.contentUrl && !input.embedUrl) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description || input.name,
    thumbnailUrl: input.thumbnailUrl ? [input.thumbnailUrl] : undefined,
    uploadDate: new Date(input.uploadDate).toISOString(),
    ...(input.contentUrl ? { contentUrl: input.contentUrl } : {}),
    ...(input.embedUrl ? { embedUrl: input.embedUrl } : {}),
  };
}
