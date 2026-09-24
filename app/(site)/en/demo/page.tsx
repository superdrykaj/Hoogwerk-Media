import type { Metadata } from "next";

import { DemoPage, demoMeta } from "@/components/pages/demo";
import { pageAlternates } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: demoMeta("en").metaTitle,
  description: demoMeta("en").metaDescription,
  robots: { index: false },
  alternates: pageAlternates("/demo", "en"),
};

export default function Page() {
  return <DemoPage locale="en" />;
}
