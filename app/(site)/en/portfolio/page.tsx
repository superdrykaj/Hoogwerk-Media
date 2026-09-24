import type { Metadata } from "next";

import { PortfolioPage } from "@/components/pages/portfolio";
import { copy } from "@/content/copy";
import { pageAlternates } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: copy("en").portfolio.metaTitle,
  description: copy("en").portfolio.metaDescription,
  alternates: pageAlternates("/portfolio", "en"),
};

export default function Page() {
  return <PortfolioPage locale="en" />;
}
