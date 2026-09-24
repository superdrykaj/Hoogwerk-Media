import type { Metadata } from "next";

import { PrivacyPage } from "@/components/pages/privacy";
import { site } from "@/content/site";
import { pageAlternates } from "@/lib/page-meta";

// Per verzoek renderen, niet vooraf: de publieke URL komt uit een
// omgevingsvariabele en is tijdens de build nog niet bekend.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Concept-privacyverklaring van ${site.name}.`,
  alternates: pageAlternates("/privacy", "nl"),
  robots: { index: false },
};

export default function Page() {
  return <PrivacyPage locale="nl" />;
}
