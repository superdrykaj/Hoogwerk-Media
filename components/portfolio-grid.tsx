"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/project-card";
import { copy } from "@/content/copy";
import { site } from "@/content/site";
import type { Locale } from "@/lib/locale";
import type { Project } from "@/lib/types";

const ALL = "alle";

export function PortfolioGrid({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const t = copy(locale);
  const [filter, setFilter] = useState<string>(ALL);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      map.set(project.category, (map.get(project.category) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  const shown =
    filter === ALL ? projects : projects.filter((p) => p.category === filter);

  // Een categorie zonder projecten is niets om op te filteren; die knop
  // benadrukt alleen wat er nog ontbreekt.
  const filledCategories = site.categories.filter(
    (category) => (counts.get(category.key) ?? 0) > 0,
  );

  return (
    <div>
      <div
        role="group"
        aria-label={t.portfolio.filterLabel}
        className="flex flex-wrap gap-2"
      >
        <FilterButton
          active={filter === ALL}
          onClick={() => setFilter(ALL)}
          label={t.portfolio.filterAll}
          count={projects.length}
        />
        {filledCategories.map((category) => (
          <FilterButton
            key={category.key}
            active={filter === category.key}
            onClick={() => setFilter(category.key)}
            label={t.portfolio.categories[category.key] ?? category.key}
            count={counts.get(category.key) ?? 0}
          />
        ))}
      </div>

      <p aria-live="polite" className="mt-5 text-sm text-mist-500">
        {shown.length === 0
          ? t.portfolio.countEmpty
          : t.portfolio.count(shown.length)}
      </p>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-600 px-6 py-16 text-center">
          <p className="text-mist-300">{t.portfolio.categoryEmpty}</p>
          <button
            type="button"
            className="btn btn-ghost mt-5"
            onClick={() => setFilter(ALL)}
          >
            {t.portfolio.showAll}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={count === 0}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-haze-500 bg-haze-600/15 text-haze-300"
          : count === 0
            ? "cursor-not-allowed border-ink-800 text-mist-600"
            : "border-ink-600 text-mist-300 hover:border-haze-500/60 hover:text-mist-100"
      }`}
    >
      {label}
      <span className="ml-2 text-xs text-mist-600">{count}</span>
    </button>
  );
}
