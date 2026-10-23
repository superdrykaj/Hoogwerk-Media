import { jsonLdString } from "@/lib/json-ld";

/** Eén JSON-LD-blok in de pagina. Zie lib/json-ld.ts voor wat erin mag. */
export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
