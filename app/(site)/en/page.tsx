import { HomePage } from "@/components/pages/home";
import { pageAlternates } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export const metadata = { alternates: pageAlternates("/", "en") };

export default function Page() {
  return <HomePage locale="en" />;
}
