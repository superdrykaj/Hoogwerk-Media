import Link from "next/link";

import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";

/** Plek die je zelf nog moet invullen. */
function Fill({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-400/15 px-1.5 py-0.5 font-medium text-amber-300">
      [{locale === "en" ? "to fill in" : "in te vullen"}: {children}]
    </mark>
  );
}

export function PrivacyPage({ locale }: { locale: Locale }) {
  const t = copy(locale);
  return (
    <div className="container-page py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">{locale === "en" ? "Draft" : "Concept"}</p>
        <h1 className="display-1 mt-4 text-balance">
          {locale === "en" ? "Privacy statement" : "Privacyverklaring"}
        </h1>

        <p className="notice notice-warning mt-8">
          {locale === "en" ? (
            <>
              This is a <strong>draft</strong>. The highlighted parts still need
              to be filled in or checked before the website goes live. This text
              is not legal advice.
            </>
          ) : (
            <>
              Dit is een <strong>concept</strong>. De gemarkeerde plekken moet je
              zelf invullen of laten controleren voordat je de website
              publiceert. Deze tekst is geen juridisch advies.
            </>
          )}
        </p>

        {locale === "en" ? <EnglishBody /> : <DutchBody />}

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href={href("/contact", locale)} className="btn btn-ghost">
            {locale === "en" ? "Go to the contact page" : "Naar de contactpagina"}
          </Link>
          <Link href={href("/", locale)} className="btn btn-quiet">
            {t.notFound.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

function DutchBody() {
  return (
        <div className="prose-body mt-12 space-y-10">
          <section>
            <h2 className="display-3 mb-3">Wie is verantwoordelijk?</h2>
            <p>
              {site.name}, gevestigd in <Fill locale="nl">vestigingsplaats</Fill>, is
              verantwoordelijk voor de verwerking van persoonsgegevens via deze
              website.
            </p>
            <p>
              KvK-nummer: <Fill locale="nl">KvK-nummer</Fill>. Btw-nummer:{" "}
              <Fill locale="nl">btw-identificatienummer</Fill>. Contact:{" "}
              <a href={`mailto:${site.email}`} className="text-azure-300 hover:underline">
                {site.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="display-3 mb-3">Welke gegevens worden verwerkt?</h2>
            <p>Via deze website worden de volgende gegevens verwerkt:</p>
            <ul className="ml-5 list-disc space-y-2 text-mist-300">
              <li>
                <strong>Afspraakaanvragen:</strong> naam, e-mailadres, eventueel
                telefoonnummer, opnamelocatie, projectomschrijving en het gekozen
                tijdstip.
              </li>
              <li>
                <strong>Contactformulier:</strong> naam, e-mailadres, onderwerp en
                bericht.
              </li>
              <li>
                <strong>Technische gegevens:</strong> het IP-adres wordt kortdurend
                in het werkgeheugen gebruikt om formulierspam af te remmen. Het
                wordt niet in de database opgeslagen.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="display-3 mb-3">Waarvoor worden ze gebruikt?</h2>
            <p>
              Uitsluitend om je aanvraag of bericht te beantwoorden, de afspraak in
              te plannen en de opdracht uit te voeren. Je gegevens zijn nooit
              zichtbaar voor andere bezoekers van de website.
            </p>
          </section>

          <section>
            <h2 className="display-3 mb-3">Grondslag en bewaartermijn</h2>
            <p>
              De verwerking is nodig om je verzoek te beantwoorden en om een
              overeenkomst voor te bereiden of uit te voeren. Gegevens van
              afspraken en berichten worden bewaard gedurende{" "}
              <Fill locale="nl">bewaartermijn, bijvoorbeeld 24 maanden</Fill>. Facturen worden
              bewaard zolang de wettelijke bewaarplicht geldt.
            </p>
          </section>

          <section>
            <h2 className="display-3 mb-3">Delen met anderen</h2>
            <p>
              Gegevens worden niet verkocht. Ze worden alleen gedeeld met partijen
              die nodig zijn om de website te laten werken:{" "}
              <Fill locale="nl">hostingpartij</Fill> en <Fill locale="nl">e-maildienst</Fill>. Met deze
              partijen sluit je een verwerkersovereenkomst.
            </p>
          </section>

          <section>
            <h2 className="display-3 mb-3">Cookies</h2>
            <p>
              Deze website plaatst geen trackingcookies. Er wordt één technisch
              noodzakelijk cookie gebruikt, en alleen voor de beheerder: het
              cookie dat de beheerder ingelogd houdt. Gebruik je later statistieken
              of ingesloten video&apos;s, vul dan hier aan welke cookies dat plaatst:{" "}
              <Fill locale="nl">eventuele statistiek- of videocookies</Fill>.
            </p>
          </section>

          <section>
            <h2 className="display-3 mb-3">Beeldmateriaal</h2>
            <p>
              Bij dronefoto&apos;s en dronevideo&apos;s kunnen personen of panden
              herkenbaar in beeld komen. Afspraken over publicatie van beeld
              worden per opdracht vastgelegd:{" "}
              <Fill locale="nl">afspraken over publicatie en portretrecht</Fill>.
            </p>
          </section>

          <section>
            <h2 className="display-3 mb-3">Jouw rechten</h2>
            <p>
              Je mag je gegevens inzien, laten corrigeren of laten verwijderen, en
              je kunt bezwaar maken tegen de verwerking. Stuur daarvoor een mail
              naar{" "}
              <a href={`mailto:${site.email}`} className="text-azure-300 hover:underline">
                {site.email}
              </a>
              . Kom je er samen niet uit, dan kun je een klacht indienen bij de
              Autoriteit Persoonsgegevens.
            </p>
          </section>

          <section>
            <h2 className="display-3 mb-3">Wijzigingen</h2>
            <p>
              Deze verklaring kan worden aangepast. Laatst bijgewerkt:{" "}
              <Fill locale="nl">datum</Fill>.
            </p>
          </section>
        </div>
  );
}

function EnglishBody() {
  return (
    <div className="prose-body mt-12 space-y-10">
      <section>
        <h2 className="display-3 mb-3">Who is responsible?</h2>
        <p>
          {site.name}, established in <Fill locale="en">place of business</Fill>,
          is responsible for the processing of personal data through this
          website.
        </p>
        <p>
          Chamber of Commerce number: <Fill locale="en">KvK number</Fill>. VAT
          number: <Fill locale="en">VAT identification number</Fill>. Contact:{" "}
          <a href={`mailto:${site.email}`} className="text-azure-300 hover:underline">
            {site.email}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="display-3 mb-3">What data is processed?</h2>
        <p>This website processes the following data:</p>
        <ul className="ml-5 list-disc space-y-2 text-mist-300">
          <li>
            <strong>Booking requests:</strong> name, e-mail address, phone number
            if given, shoot location, project description and the chosen time.
          </li>
          <li>
            <strong>Contact form:</strong> name, e-mail address, subject and
            message.
          </li>
          <li>
            <strong>Technical data:</strong> your IP address is held briefly in
            memory to slow down form spam. It is not stored in the database.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="display-3 mb-3">What is it used for?</h2>
        <p>
          Only to answer your request or message, to plan the appointment and to
          carry out the work. Your data is never visible to other visitors of
          this website.
        </p>
      </section>

      <section>
        <h2 className="display-3 mb-3">Legal basis and retention</h2>
        <p>
          The processing is necessary to answer your request and to prepare or
          perform an agreement. Data from appointments and messages is kept for{" "}
          <Fill locale="en">retention period, for example 24 months</Fill>.
          Invoices are kept for as long as the statutory retention obligation
          applies.
        </p>
      </section>

      <section>
        <h2 className="display-3 mb-3">Sharing with others</h2>
        <p>
          Data is never sold. It is only shared with the parties needed to run
          the website: <Fill locale="en">hosting provider</Fill> and{" "}
          <Fill locale="en">e-mail service</Fill>. A data processing agreement is
          concluded with these parties.
        </p>
      </section>

      <section>
        <h2 className="display-3 mb-3">Cookies</h2>
        <p>
          This website sets no tracking cookies. One technically necessary cookie
          is used, and only for the site owner: the cookie that keeps the admin
          signed in. If you later add statistics or embedded video, add here
          which cookies that places:{" "}
          <Fill locale="en">any statistics or video cookies</Fill>.
        </p>
      </section>

      <section>
        <h2 className="display-3 mb-3">Images</h2>
        <p>
          In aerial photos and video, people or buildings may be recognisable.
          Agreements about publishing images are recorded per assignment:{" "}
          <Fill locale="en">agreements on publication and portrait rights</Fill>.
        </p>
      </section>

      <section>
        <h2 className="display-3 mb-3">Your rights</h2>
        <p>
          You may view your data, have it corrected or deleted, and you can
          object to the processing. Send an e-mail to{" "}
          <a href={`mailto:${site.email}`} className="text-azure-300 hover:underline">
            {site.email}
          </a>
          . If we cannot work it out together, you can file a complaint with the
          Dutch Data Protection Authority (Autoriteit Persoonsgegevens).
        </p>
      </section>

      <section>
        <h2 className="display-3 mb-3">Changes</h2>
        <p>
          This statement may be updated. Last updated:{" "}
          <Fill locale="en">date</Fill>.
        </p>
      </section>
    </div>
  );
}
