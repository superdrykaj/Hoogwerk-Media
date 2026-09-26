"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { reorderProjectsAction } from "@/app/actions/admin";
import { copy } from "@/content/copy";
import { DEFAULT_LOCALE } from "@/lib/locale";
import type { Project } from "@/lib/types";

/**
 * Projectenoverzicht met drag & drop. Slepen past alleen de volgorde in het
 * scherm aan; pas op "Volgorde opslaan" gaat de nieuwe volgorde naar de
 * server. Werkt met de muis (HTML5 drag & drop); op een touchscreen kan de
 * volgorde nog altijd per project via het cijferveld op het bewerkformulier.
 */
export function ProjectReorderList({ projects }: { projects: Project[] }) {
  const [items, setItems] = useState(projects);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const t = copy(DEFAULT_LOCALE);

  function verplaats(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    setItems((current) => {
      const fromIndex = current.findIndex((p) => p.id === dragId);
      const toIndex = current.findIndex((p) => p.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const next = current.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDirty(true);
    setSaved(false);
  }

  function opslaan() {
    startTransition(async () => {
      await reorderProjectsAction(items.map((p) => p.id));
      setDirty(false);
      setSaved(true);
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mist-500">
          Sleep de kaarten om de volgorde op de website te bepalen.
        </p>
        <div className="flex items-center gap-3">
          {saved && !dirty && (
            <span className="text-sm text-emerald-300">Volgorde opgeslagen.</span>
          )}
          <button
            type="button"
            onClick={opslaan}
            disabled={!dirty || pending}
            className="btn btn-primary"
          >
            {pending ? "Bezig met opslaan…" : "Volgorde opslaan"}
          </button>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((project) => (
          <li
            key={project.id}
            draggable
            onDragStart={() => setDragId(project.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => verplaats(project.id)}
            onDragEnd={() => setDragId(null)}
            className={`card cursor-grab select-none overflow-hidden transition-opacity active:cursor-grabbing ${
              dragId === project.id ? "opacity-40" : ""
            }`}
          >
            <Link href={`/admin/projecten/${project.id}`} className="block">
              <div className="relative aspect-[4/3] bg-ink-800">
                {project.coverUrl ? (
                  <Image
                    src={project.coverUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-mist-600">
                    Geen omslagbeeld
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="chip">
                    {t.portfolio.categories[project.category] ?? project.category}
                  </span>
                  {project.published ? (
                    <span className="chip border-emerald-500/40 text-emerald-300">
                      Gepubliceerd
                    </span>
                  ) : (
                    <span className="chip border-amber-500/40 text-amber-300">
                      Concept
                    </span>
                  )}
                </div>
                <h2 className="mt-3 font-semibold">{project.title}</h2>
                {project.location && (
                  <p className="mt-1 text-sm text-mist-500">{project.location}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
