import type { Metadata } from "next";

import { ContactPage } from "@/components/pages/contact";
import { copy } from "@/content/copy";
import { pageAlternates } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: copy("en").contact.metaTitle,
  description: copy("en").contact.metaDescription,
  alternates: pageAlternates("/contact", "en"),
};

export default function Page() {
  return <ContactPage locale="en" />;
}
