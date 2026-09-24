import type { Metadata } from "next";

import { ContactPage } from "@/components/pages/contact";
import { copy } from "@/content/copy";
import { pageAlternates } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: copy("nl").contact.metaTitle,
  description: copy("nl").contact.metaDescription,
  alternates: pageAlternates("/contact", "nl"),
};

export default function Page() {
  return <ContactPage locale="nl" />;
}
