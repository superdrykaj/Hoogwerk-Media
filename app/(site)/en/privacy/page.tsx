import type { Metadata } from "next";

import { PrivacyPage } from "@/components/pages/privacy";
import { site } from "@/content/site";
import { pageAlternates } from "@/lib/page-meta";

// Per verzoek renderen, niet vooraf: de publieke URL komt uit een
// omgevingsvariabele en is tijdens de build nog niet bekend.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Draft privacy statement of ${site.name}.`,
  alternates: pageAlternates("/privacy", "en"),
  robots: { index: false },
};

export default function Page() {
  return <PrivacyPage locale="en" />;
}
