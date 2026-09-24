import Link from "next/link";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";
import { requireOpenSite } from "@/lib/site-status";

/** Wat er op deze voorbeeldwebsite verzonnen is en wat er echt werkt. */
const TEKST = {
  nl: {
    eyebrow: "Voorbeeldwebsite",
    title: "Wat hier verzonnen is, en wat niet.",
    intro:
      "Deze website is opgezet met fictieve gegevens, zodat je kunt zien hoe " +
      "alles werkt voordat er echte inhoud in staat. Hieronder staat precies " +
      "wat wat is.",
    fakeTitle: "Verzonnen",
    fake: [
      "Alle zes portfolioprojecten, inclusief de locaties en de verhalen erbij.",
      "De prijsindicaties bij de diensten.",
      "De afbeeldingen: dat zijn tijdelijke, automatisch gegenereerde beelden en geen echte dronefoto's.",
    ],
    fakeNoteBefore: "Er staan bewust",
    fakeNoteStrong: "geen",
    fakeNoteAfter:
      "verzonnen klantreviews, certificeringen of vergunningen op deze site.",
    realTitle: "Wel echt",
    real: (email: string) => [
      `De bedrijfsnaam en het contactadres ${email}: die zijn echt, en berichten komen ook echt aan.`,
      "De boekingsmodule werkt volledig: aanvragen worden opgeslagen en een gekozen tijdslot is daarna bezet voor anderen.",
      "De beschikbaarheid, de tijdzone Europe/Amsterdam en de omgang met zomer- en wintertijd kloppen.",
      "De website staat in twee talen online: Nederlands en Engels, met dezelfde boekingsmodule.",
      "Het contactformulier slaat berichten echt op, met validatie en spambeveiliging.",
      "De beheeromgeving is afgeschermd en werkt.",
    ],
    mailNotice:
      "Let op: het versturen van e-mail moet nog worden ingesteld. Tot die tijd " +
      "wordt je aanvraag wél opgeslagen, maar ontvang je géén bevestigingsmail. " +
      "Dat staat ook bij het bevestigingsscherm zelf.",
    back: "Terug naar de homepage",
    portfolio: "Bekijk de voorbeeldprojecten",
    metaTitle: "Over deze voorbeeldwebsite",
    metaDescription:
      "Uitleg over de fictieve gegevens op deze website: wat er verzonnen is en wat er wél echt werkt.",
  },
  en: {
    eyebrow: "Example website",
    title: "What's made up here, and what isn't.",
    intro:
      "This website has been set up with fictional data, so you can see how " +
      "everything works before the real content goes in. Below is exactly " +
      "what's what.",
    fakeTitle: "Made up",
    fake: [
      "All six portfolio projects, including the locations and the stories with them.",
      "The price indications for the services.",
      "The images: they are temporary, automatically generated pictures, not real aerial photos.",
    ],
    fakeNoteBefore: "There are deliberately",
    fakeNoteStrong: "no",
    fakeNoteAfter:
      "invented customer reviews, certifications or permits on this site.",
    realTitle: "Genuinely working",
    real: (email: string) => [
      `The company name and the contact address ${email}: those are real, and messages do arrive.`,
      "The booking module works in full: requests are stored and a chosen slot is then taken for everyone else.",
      "The availability, the Europe/Amsterdam time zone and the handling of daylight saving are correct.",
      "The site is online in two languages, Dutch and English, with the same booking module.",
      "The contact form really stores messages, with validation and spam protection.",
      "The admin area is protected and works.",
    ],
    mailNotice:
      "Please note: sending e-mail still has to be set up. Until then your " +
      "request is saved, but you will not receive a confirmation e-mail. That " +
      "is also stated on the confirmation screen itself.",
    back: "Back to the homepage",
    portfolio: "See the example projects",
    metaTitle: "About this example website",
    metaDescription:
      "What the fictional data on this website is: what has been made up, and what genuinely works.",
  },
} as const;

export function demoMeta(locale: Locale) {
  return TEKST[locale];
}

export async function DemoPage({ locale }: { locale: Locale }) {
  await requireOpenSite();

  const t = copy(locale);
  const d = TEKST[locale];

  return (
    <div className="container-page py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">{d.eyebrow}</p>
        <h1 className="display-1 mt-4 text-balance">{d.title}</h1>
        <p className="lede mt-6">{d.intro}</p>

        <section className="mt-14" aria-labelledby="verzonnen">
          <h2 id="verzonnen" className="display-2">
            {d.fakeTitle}
          </h2>
          <ul className="mt-5 space-y-3">
            {d.fake.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4 text-sm text-mist-300"
              >
                <span aria-hidden="true" className="text-amber-300">
                  ●
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-mist-500">
            {d.fakeNoteBefore}{" "}
            <strong className="text-mist-300">{d.fakeNoteStrong}</strong>{" "}
            {d.fakeNoteAfter}
          </p>
        </section>

        <section className="mt-14" aria-labelledby="echt">
          <h2 id="echt" className="display-2">
            {d.realTitle}
          </h2>
          <ul className="mt-5 space-y-3">
            {d.real(site.email).map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4 text-sm text-mist-300"
              >
                <span aria-hidden="true" className="text-emerald-300">
                  ●
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="notice notice-warning mt-6">{d.mailNotice}</p>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href={href("/", locale)} className="btn btn-primary">
            {d.back}
          </Link>
          <Link href={href("/portfolio", locale)} className="btn btn-ghost">
            {d.portfolio}
          </Link>
        </div>
        <p className="sr-only">{t.demoBanner.label}</p>
      </div>
    </div>
  );
}
