import type { Metadata } from "next";

import { ServicePage } from "@/components/pages/service";
import { copy } from "@/content/copy";
import { pageAlternates } from "@/lib/page-meta";
import { servicePagePath } from "@/lib/service-pages";

export const dynamic = "force-dynamic";

const page = copy("en").servicePages.bedrijven;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: pageAlternates(servicePagePath("bedrijven"), "en"),
};

export default function Page() {
  return <ServicePage pageKey="bedrijven" locale="en" />;
}
