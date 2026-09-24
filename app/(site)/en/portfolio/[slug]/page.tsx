import type { Metadata } from "next";

import { ProjectPage } from "@/components/pages/project";
import { copy } from "@/content/copy";
import { pageAlternates } from "@/lib/page-meta";
import { projectText } from "@/lib/localised";
import { getProjectBySlug } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = copy("en");
  const project = getProjectBySlug(slug);
  if (!project || !project.published) {
    return { title: t.project.notFound };
  }
  const tekst = projectText(project, "en");
  return {
    title: tekst.title,
    description:
      tekst.summary || t.project.metaDescription(tekst.location || t.region.short),
    alternates: pageAlternates(`/portfolio/${project.slug}`, "en"),
    openGraph: {
      title: tekst.title,
      description: tekst.summary,
      images: project.coverUrl ? [{ url: project.coverUrl }] : undefined,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectPage slug={slug} locale="en" />;
}
