import { SiteShell } from "@/components/site-shell";

/** De Nederlandse website. Staat zonder taalvoorvoegsel op /, /portfolio, … */
export default function DutchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell locale="nl">{children}</SiteShell>;
}
