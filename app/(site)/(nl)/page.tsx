import { HomePage } from "@/components/pages/home";
import { pageAlternates } from "@/lib/page-meta";

// De boekingsmodule toont actuele beschikbaarheid, dus niets vooraf cachen.
export const dynamic = "force-dynamic";

export const metadata = { alternates: pageAlternates("/", "nl") };

export default function Page() {
  return <HomePage locale="nl" />;
}
