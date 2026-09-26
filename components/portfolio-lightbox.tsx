"use client";

import { useEffect, useRef } from "react";

import { ProjectVideo } from "@/components/project-video";
import type { Dictionary } from "@/content/copy";
import { toEmbedUrl } from "@/lib/video-embed";
import type { Project } from "@/lib/types";

/**
 * Snel voorbeeld van de video bij een project, zonder naar de projectpagina
 * te navigeren. Sluit met Escape, met de knop, of door naast de video te
 * klikken.
 */
export function PortfolioLightbox({
  project,
  title,
  t,
  onClose,
}: {
  project: Project;
  title: string;
  t: Dictionary;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const vorigeOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = vorigeOverflow;
    };
  }, [onClose]);

  const eigenVideo = project.videoUrl.trim().startsWith("/")
    ? project.videoUrl.trim()
    : null;
  const videoEmbed = eigenVideo ? null : toEmbedUrl(project.videoUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="truncate text-lg font-semibold text-mist-100">{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="btn btn-quiet shrink-0"
          >
            {t.portfolio.previewClose}
          </button>
        </div>
        {eigenVideo ? (
          <ProjectVideo
            src={eigenVideo}
            poster={project.coverUrl}
            ariaLabel={t.project.videoOf(title)}
            fallbackText={t.project.videoFallback}
          />
        ) : videoEmbed ? (
          <div className="aspect-video overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
            <iframe
              src={videoEmbed}
              title={t.project.videoOf(title)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-ink-600 bg-ink-900/50 px-6 py-16 text-center text-mist-300">
            {t.project.videoEmpty}
          </p>
        )}
      </div>
    </div>
  );
}
