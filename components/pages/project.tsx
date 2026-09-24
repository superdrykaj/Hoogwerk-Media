import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectGallery } from "@/components/project-gallery";
import { copy } from "@/content/copy";
import { href, type Locale } from "@/lib/locale";
import { projectText } from "@/lib/localised";
import { getProjectBySlug, listProjectImages, listProjects } from "@/lib/projects";
import { requireOpenSite } from "@/lib/site-status";

export async function ProjectPage({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  await requireOpenSite();

  const t = copy(locale);
  const project = getProjectBySlug(slug);
  if (!project || !project.published) notFound();

  const tekst = projectText(project, locale);
  const images = listProjectImages(project.id);
  const others = listProjects({ onlyPublished: true })
    .filter((p) => p.id !== project.id)
    .slice(0, 3);

  const videoEmbed = toEmbedUrl(project.videoUrl);

  return (
    <article className="pb-8">
      <div className="relative isolate -mt-[4.5rem] flex min-h-[62svh] items-end overflow-hidden pt-[4.5rem]">
        {project.coverUrl && (
          <Image
            src={project.coverUrl}
            alt={tekst.coverAlt || t.project.coverAlt(tekst.title)}
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/80 via-ink-950/50 to-ink-950"
        />
        <div className="container-page pb-14 pt-24">
          <nav aria-label={t.project.breadcrumb} className="mb-6 text-sm text-mist-500">
            <Link href={href("/portfolio", locale)} className="hover:text-mist-100">
              {t.nav.portfolio}
            </Link>
            <span aria-hidden="true" className="mx-2 text-ink-600">
              /
            </span>
            <span className="text-mist-300">
              {t.portfolio.categories[project.category] ?? project.category}
            </span>
          </nav>
          <h1 className="display-1 max-w-4xl text-balance">{tekst.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="chip">
              {t.portfolio.categories[project.category] ?? project.category}
            </span>
            {tekst.location && <span className="chip">{tekst.location}</span>}
            <span className="chip border-haze-500/40 text-haze-300">
              {t.project.exampleChip}
            </span>
          </div>
        </div>
      </div>

      <div className="container-page">
        <div className="grid gap-14 py-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {tekst.summary && <p className="lede">{tekst.summary}</p>}
            {tekst.body && (
              <div className="prose-body mt-8">
                {tekst.body.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-ink-700 bg-ink-900 p-6">
            <h2 className="display-3 text-base">{t.project.asideTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist-500">
              {t.project.asideBody}
            </p>
            <Link
              href={`${href("/", locale)}#boeken`}
              className="btn btn-primary mt-6 w-full"
            >
              {t.nav.book}
            </Link>
            <Link
              href={href("/contact", locale)}
              className="btn btn-quiet mt-3 w-full"
            >
              {t.project.asideAsk}
            </Link>
          </aside>
        </div>

        {/* Video ------------------------------------------------------------ */}
        <section aria-labelledby="video-titel" className="pb-4">
          <h2 id="video-titel" className="display-2 mb-6">
            {t.project.videoTitle}
          </h2>
          {videoEmbed ? (
            <div className="aspect-video overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
              <iframe
                src={videoEmbed}
                title={t.project.videoOf(tekst.title)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-ink-600 bg-ink-900/50 px-6 text-center">
              <div>
                <p className="text-mist-300">{t.project.videoEmpty}</p>
                <p className="mt-2 text-sm text-mist-500">
                  {t.project.videoEmptyHint}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Galerij ---------------------------------------------------------- */}
        <section aria-labelledby="galerij-titel" className="py-16">
          <h2 id="galerij-titel" className="display-2 mb-6">
            {t.project.galleryTitle}
          </h2>
          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-600 px-6 py-16 text-center">
              <p className="text-mist-300">{t.project.galleryEmpty}</p>
            </div>
          ) : (
            <ProjectGallery images={images} title={tekst.title} locale={locale} />
          )}
        </section>

        {/* Andere projecten ------------------------------------------------- */}
        {others.length > 0 && (
          <section aria-labelledby="meer-titel" className="border-t border-ink-700 py-16">
            <h2 id="meer-titel" className="display-2 mb-8">
              {t.project.moreTitle}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={href(`/portfolio/${other.slug}`, locale)}
                    className="group flex items-center gap-4 rounded-xl border border-ink-700 bg-ink-900 p-4 transition-colors hover:border-haze-500/60"
                  >
                    {other.coverUrl && (
                      <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={other.coverUrl}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                    )}
                    <span>
                      <span className="block text-sm font-semibold group-hover:text-haze-300">
                        {projectText(other, locale).title}
                      </span>
                      <span className="mt-1 block text-xs text-mist-500">
                        {t.portfolio.categories[other.category] ?? other.category}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

/** Zet een YouTube- of Vimeo-link om naar een insluitbare URL. */
function toEmbedUrl(input: string): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname.startsWith("/embed/")) return url.toString();
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") return url.toString();
    return null;
  } catch {
    return null;
  }
}
