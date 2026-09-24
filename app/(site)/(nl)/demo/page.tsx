import type { Metadata } from "next";

import { DemoPage, demoMeta } from "@/components/pages/demo";
import { pageAlternates } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: demoMeta("nl").metaTitle,
  description: demoMeta("nl").metaDescription,
  robots: { index: false },
  alternates: pageAlternates("/demo", "nl"),
};

export default function Page() {
  return <DemoPage locale="nl" />;
}
