import { SiteShell } from "@/components/site-shell";

/** The English website, served from /en, /en/portfolio, … */
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
