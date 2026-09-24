import Image from "next/image";
import Link from "next/link";

import { copy } from "@/content/copy";
import { href, type Locale } from "@/lib/locale";
import { projectText } from "@/lib/localised";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  locale,
  priority = false,
}: {
  project: Project;
  locale: Locale;
  priority?: boolean;
}) {
  const t = copy(locale);
  const tekst = projectText(project, locale);
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-800">
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={tekst.coverAlt || t.project.coverAlt(tekst.title)}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-mist-600">
            {t.project.cardNoImage}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        <span className="chip absolute left-4 top-4 bg-ink-950/70 backdrop-blur">
          {t.portfolio.categories[project.category] ?? project.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          <Link
            href={href(`/portfolio/${project.slug}`, locale)}
            className="after:absolute after:inset-0"
          >
            {tekst.title}
          </Link>
        </h3>
        {tekst.location && (
          <p className="mt-1 text-sm text-mist-500">{tekst.location}</p>
        )}
        {tekst.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mist-500">
            {tekst.summary}
          </p>
        )}
        <p className="mt-4 text-sm font-semibold text-haze-300">
          {t.project.cardLink}
          <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </p>
      </div>
    </article>
  );
}
