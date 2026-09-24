import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";
import { isMailConfigured } from "@/lib/mail";

export function ContactPage({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const mailReady = isMailConfigured();

  return (
    <div className="container-page py-20">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="eyebrow">{t.contact.eyebrow}</p>
          <h1 className="display-1 mt-4 text-balance">{t.contact.title}</h1>
          <p className="lede mt-6">{t.contact.intro}</p>

          <dl className="mt-10 space-y-6">
            <div>
              <dt className="text-sm text-mist-500">{t.contact.emailLabel}</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${site.email}`}
                  className="text-lg font-medium text-azure-300 hover:underline"
                >
                  {site.email}
                </a>
              </dd>
            </div>
            {site.phone && (
              <div>
                <dt className="text-sm text-mist-500">{t.contact.phoneLabel}</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {site.phone}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-mist-500">{t.contact.areaLabel}</dt>
              <dd className="mt-1 text-lg font-medium">{t.region.short}</dd>
              <dd className="mt-2 text-sm leading-relaxed text-mist-500">
                {t.region.detail}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-mist-500">{t.contact.bookLabel}</dt>
              <dd className="mt-3">
                <Link href={`${href("/", locale)}#boeken`} className="btn btn-primary">
                  {t.nav.book}
                </Link>
              </dd>
            </div>
          </dl>

          <p className="mt-10 text-xs leading-relaxed text-mist-600">
            {t.contact.privacyBefore}{" "}
            <Link href={href("/privacy", locale)} className="text-mist-500 underline">
              {t.contact.privacyLink}
            </Link>{" "}
            {t.contact.privacyAfter}
          </p>
        </div>

        <div>
          <div className="card p-6 sm:p-8">
            <h2 className="display-3">{t.contact.formTitle}</h2>
            <p className="mt-2 text-sm text-mist-500">{t.contact.formIntro}</p>
            <div className="mt-7">
              <ContactForm mailReady={mailReady} locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
