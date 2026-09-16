import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Over deze voorbeeldwebsite",
  description:
    "Uitleg over de fictieve gegevens op deze website: wat er verzonnen is en wat er wél echt werkt.",
  robots: { index: false },
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <div className="container-page py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Voorbeeldwebsite</p>
        <h1 className="display-1 mt-4 text-balance">
          Wat hier verzonnen is, en wat niet.
        </h1>
        <p className="lede mt-6">
          Deze website is opgezet met fictieve gegevens, zodat je kunt zien hoe
          alles werkt voordat er echte inhoud in staat. Hieronder staat precies
          wat wat is.
        </p>

        <section className="mt-14" aria-labelledby="verzonnen">
          <h2 id="verzonnen" className="display-2">
            Verzonnen
          </h2>
          <ul className="mt-5 space-y-3">
            {[
              `De bedrijfsnaam ${site.name} en het e-mailadres ${site.email}.`,
              "Alle zes portfolioprojecten, inclusief de locaties en de verhalen erbij.",
              "De prijsindicaties bij de diensten.",
              "De afbeeldingen: dat zijn tijdelijke, automatisch gegenereerde beelden en geen echte dronefoto's.",
            ].map((item) => (
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
            Er staan bewust <strong className="text-mist-300">geen</strong> verzonnen
            klantreviews, certificeringen of vergunningen op deze site.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="echt">
          <h2 id="echt" className="display-2">
            Wel echt
          </h2>
          <ul className="mt-5 space-y-3">
            {[
              "De boekingsmodule werkt volledig: aanvragen worden opgeslagen en een gekozen tijdslot is daarna bezet voor anderen.",
              "De beschikbaarheid, de tijdzone Europe/Amsterdam en de omgang met zomer- en wintertijd kloppen.",
              "Het contactformulier slaat berichten echt op, met validatie en spambeveiliging.",
              "De beheeromgeving is afgeschermd en werkt.",
            ].map((item) => (
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
          <p className="notice notice-warning mt-6">
            Let op: het versturen van e-mail moet nog worden ingesteld. Tot die
            tijd wordt je aanvraag wél opgeslagen, maar ontvang je géén
            bevestigingsmail. Dat staat ook bij het bevestigingsscherm zelf.
          </p>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Terug naar de homepage
          </Link>
          <Link href="/portfolio" className="btn btn-ghost">
            Bekijk de voorbeeldprojecten
          </Link>
        </div>
      </div>
    </div>
  );
}
