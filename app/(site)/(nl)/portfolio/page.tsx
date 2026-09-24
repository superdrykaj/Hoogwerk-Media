import type { Metadata } from "next";

import { PortfolioPage } from "@/components/pages/portfolio";
import { copy } from "@/content/copy";
import { pageAlternates } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: copy("nl").portfolio.metaTitle,
  description: copy("nl").portfolio.metaDescription,
  alternates: pageAlternates("/portfolio", "nl"),
};

export default function Page() {
  return <PortfolioPage locale="nl" />;
}
