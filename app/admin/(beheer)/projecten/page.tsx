import Link from "next/link";

import { EmptyState, PageHeading } from "@/components/admin/ui";
import { ProjectReorderList } from "@/components/admin/project-reorder-list";
import { listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  const projects = listProjects();

  return (
    <>
      <PageHeading
        title="Projecten"
        intro="Voeg projecten toe, bewerk ze en bepaal wat er op de website staat."
        action={
          <Link href="/admin/projecten/nieuw" className="btn btn-primary">
            Nieuw project
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Nog geen projecten"
          body="Voeg je eerste project toe zodat bezoekers je werk kunnen zien."
          href="/admin/projecten/nieuw"
          linkLabel="Project toevoegen"
        />
      ) : (
        <ProjectReorderList projects={projects} />
      )}
    </>
  );
}
