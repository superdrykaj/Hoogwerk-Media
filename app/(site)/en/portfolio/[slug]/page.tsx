import type { Metadata } from "next";

import { ProjectPage } from "@/components/pages/project";
import { projectMetadata } from "@/lib/project-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return projectMetadata(slug, "en");
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectPage slug={slug} locale="en" />;
}
