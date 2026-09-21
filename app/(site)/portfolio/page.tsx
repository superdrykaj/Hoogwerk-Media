import type { Metadata } from "next";
import Link from "next/link";

import { PortfolioGrid } from "@/components/portfolio-grid";
import { site } from "@/content/site";
import { listProjects } from "@/lib/projects";
import { requireOpenSite } from "@/lib/site-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `Werk van ${site.name}: dronefoto's en korte films van vastgoed, bedrijfsterreinen, bouwprojecten en locaties in ${site.region}.`,
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  await requireOpenSite();

  const projects = listProjects({ onlyPublished: true, featuredFirst: true });

  return (
    <div className="container-page section">
      <header className="max-w-3xl">
        <p className="eyebrow">Werk</p>
        <h1 className="display-1 mt-4">Werk vanuit de lucht.</h1>
        <p className="lede mt-6">
          Opdrachten en eigen werk uit {site.region}. Filter op het soort
          opdracht.
        </p>
      </header>

      <div className="mt-14">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-600 px-6 py-20 text-center">
            <p className="text-mist-300">De eerste cases staan er binnenkort.</p>
            <Link href="/admin/projecten" className="btn btn-ghost mt-6">
              Naar de beheeromgeving
            </Link>
          </div>
        ) : (
          <PortfolioGrid projects={projects} />
        )}
      </div>

      <section className="mt-24 rounded-2xl border border-ink-700 bg-ink-900 px-6 py-14 text-center sm:px-12">
        <h2 className="display-2">Zoiets nodig?</h2>
        <p className="lede mx-auto mt-4">
          Een kennismaking van twintig minuten is gratis en vrijblijvend.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/#boeken" className="btn btn-primary">
            Plan een afspraak
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Stel een vraag
          </Link>
        </div>
      </section>
    </div>
  );
}
