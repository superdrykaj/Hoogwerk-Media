import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Arrow } from "@/components/arrow";
import { ProjectGallery } from "@/components/project-gallery";
import { ProjectVideo } from "@/components/project-video";
import { copy } from "@/content/copy";
import { isSignedIn } from "@/lib/auth";
import { href, type Locale } from "@/lib/locale";
import { projectText } from "@/lib/localised";
import { getProjectBySlug, listProjectImages, listProjects } from "@/lib/projects";
import { requireOpenSite } from "@/lib/site-status";
import { siteOrigin } from "@/lib/site-url";
import { toEmbedUrl } from "@/lib/video-embed";
import { videoObjectJsonLd } from "@/lib/video-schema";

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
  /**
   * Let op: zet geen `loading.tsx` boven deze route. Dat maakt een
   * Suspense-grens, en dan stuurt Next de HTTP-status al weg voordat hier
   * bekend is dat het project niet bestaat. De 404-pagina verschijnt dan wél,
   * maar met status 200 — en zo'n "soft 404" wordt gewoon geïndexeerd.
   *
   * Een beheerder die is ingelogd mag een conceptproject wél zien, om het te
   * kunnen voorvertonen voordat het live gaat. Iedereen die niet is ingelogd
   * krijgt gewoon de 404.
   */
  const previewAlsBeheerder = Boolean(project) && !project?.published && (await isSignedIn());
  if (!project || (!project.published && !previewAlsBeheerder)) notFound();

  const tekst = projectText(project, locale);
  const images = listProjectImages(project.id);
  const others = listProjects({ onlyPublished: true })
    .filter((p) => p.id !== project.id)
    .slice(0, 3);

  const eigenVideo = project.videoUrl.trim().startsWith("/")
    ? project.videoUrl.trim()
    : null;
  const videoEmbed = eigenVideo ? null : toEmbedUrl(project.videoUrl);

  const origin = await siteOrigin();
  const jsonLd = videoObjectJsonLd({
    name: tekst.title,
    description: tekst.summary || tekst.body,
    thumbnailUrl: project.coverUrl ? `${origin}${project.coverUrl}` : "",
    uploadDate: project.createdUtc,
    contentUrl: eigenVideo ? `${origin}${eigenVideo}` : null,
    embedUrl: videoEmbed,
  });

  return (
    <article className="pb-8">
      {previewAlsBeheerder && (
        <p className="container-page mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
          Concept — dit project is nog niet gepubliceerd. Deze pagina is alleen
          voor jou als beheerder zichtbaar.
        </p>
      )}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
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
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/80 via-ink-950/50 to-ink-950" />
        <div className="container-page pb-14 pt-24">
          <nav aria-label={t.project.breadcrumb} className="mb-6 text-sm text-mist-500">
            <Link href={href("/portfolio", locale)} className="hover:text-mist-100">
              {t.nav.portfolio}
            </Link>
            <span aria-hidden="true" className="mx-2 text-ink-600">/</span>
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
            {project.isExample && (
              <span className="text-xs uppercase tracking-wider text-mist-600">
                {t.project.exampleChip}
              </span>
            )}
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
            <p className="mt-3 text-sm leading-relaxed text-mist-500">{t.project.asideBody}</p>
            <Link href={`${href("/", locale)}#boeken`} className="btn btn-primary mt-6 w-full">
              {t.nav.book}
              <Arrow />
            </Link>
            <Link href={href("/contact", locale)} className="btn btn-quiet mt-3 w-full">
              {t.project.asideAsk}
            </Link>
          </aside>
        </div>

        <section aria-labelledby="video-titel" className="pb-4">
          <h2 id="video-titel" className="display-2 mb-6">{t.project.videoTitle}</h2>
          {eigenVideo ? (
            <ProjectVideo
              src={eigenVideo}
              poster={project.coverUrl}
              ariaLabel={t.project.videoOf(tekst.title)}
              fallbackText={t.project.videoFallback}
            />
          ) : videoEmbed ? (
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
                <p className="mt-2 text-sm text-mist-500">{t.project.videoEmptyHint}</p>
              </div>
            </div>
          )}
        </section>

        {images.length > 0 && (
          <section aria-labelledby="galerij-titel" className="py-16">
            <h2 id="galerij-titel" className="display-2 mb-6">{t.project.galleryTitle}</h2>
            <ProjectGallery images={images} title={tekst.title} locale={locale} />
          </section>
        )}

        {others.length > 0 && (
          <section aria-labelledby="meer-titel" className="border-t border-ink-700 py-16">
            <h2 id="meer-titel" className="display-2 mb-8">{t.project.moreTitle}</h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={href(`/portfolio/${other.slug}`, locale)}
                    className="group flex items-center gap-4 rounded-xl border border-ink-700 bg-ink-900 p-4 transition-colors hover:border-haze-500/60"
                  >
                    {other.coverUrl && (
                      <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                        <Image src={other.coverUrl} alt="" fill sizes="80px" className="object-cover" />
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
