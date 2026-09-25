import { CompanySettingsForm } from "@/components/admin/company-settings-form";
import { PageHeading, Panel } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { SiteStatusForm } from "@/components/admin/site-status-form";
import { TestMailForm } from "@/components/admin/test-mail-form";
import { site } from "@/content/site";
import { isMailConfigured, mailRecipients } from "@/lib/mail";
import { getInvoiceSettings, getSettings } from "@/lib/settings";
import { siteStatus } from "@/lib/site-status";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const settings = getSettings();
  const invoiceSettings = getInvoiceSettings();
  const status = siteStatus();
  const mailReady = isMailConfigured();
  const naartoe = mailRecipients();
  // Microsoft 365 heeft één weigering die zo vaak voorkomt dat de uitleg
  // erbij hoort te staan, ook als er op dit moment niets misgaat.
  const viaMicrosoft = /office365|outlook\.com/i.test(process.env.SMTP_HOST ?? "");

  return (
    <>
      <PageHeading
        title="Instellingen"
        intro="Boekingsregels en de koppelingen die nog ingesteld moeten worden."
      />

      <div className="space-y-8">
        <Panel
          title="Zichtbaarheid van de site"
          description="Staat de website open voor bezoekers, of alleen voor jou?"
        >
          <SiteStatusForm status={status} />
        </Panel>

        <Panel
          title="Bedrijfsgegevens voor facturen"
          description="Komen op elke factuur te staan. Standaard fictief — vul aan zodra je KvK- en BTW-nummer bekend zijn."
        >
          <CompanySettingsForm settings={invoiceSettings} />
        </Panel>

        <Panel
          title="Boekingsregels"
          description="Deze regels gelden voor alle diensten in de boekingsmodule."
        >
          <SettingsForm settings={settings} />
        </Panel>

        <Panel
          title="E-mail"
          description="Bevestigingsmails naar klanten en meldingen naar jou."
        >
          {mailReady ? (
            <p className="notice notice-success">
              E-mail is ingesteld. De site verstuurt via{" "}
              <code>{process.env.SMTP_HOST}</code> als{" "}
              <code>{process.env.MAIL_FROM}</code>.
            </p>
          ) : (
            <p className="notice notice-warning">
              E-mail is nog niet ingesteld. Aanvragen en berichten worden wél
              opgeslagen, maar er gaan geen e-mails uit. De website belooft
              bezoekers dan ook geen bevestigingsmail.
            </p>
          )}

          <h3 className="mt-6 text-sm font-semibold text-mist-100">
            Welk bericht gaat waarheen
          </h3>
          <dl className="mt-3 divide-y divide-ink-700 rounded-xl border border-ink-700">
            <Regel
              label="Nieuwe aanvraag"
              value={naartoe.bookings}
              hint="Melding aan jou. Antwoorden gaat rechtstreeks naar de klant."
            />
            <Regel
              label="Contactformulier"
              value={naartoe.contact}
              hint="Melding aan jou. Antwoorden gaat rechtstreeks naar de afzender."
            />
            <Regel
              label="Bevestiging aan de klant"
              value={site.bookingEmail}
              hint="Staat als antwoordadres in de mail aan de klant."
            />
            <Regel
              label="Antwoord op een contactbericht"
              value={site.email}
              hint="Staat als antwoordadres in de mail aan de afzender."
            />
            <Regel
              label="Agenda-uitnodiging"
              value={naartoe.calendar}
              hint="Bij een bevestigde afspraak gaat hier een .ics-uitnodiging heen. Verplaats of annuleer je de afspraak, dan schuift die in je agenda mee."
            />
          </dl>
          <p className="field-hint">
            De adressen komen uit <code>content/site.ts</code>. Wil je de
            meldingen ergens anders hebben, zet dan{" "}
            <code>MAIL_TO_BOOKINGS</code> en <code>MAIL_TO_CONTACT</code> op de
            server (of <code>MAIL_TO</code> voor allebei tegelijk). De
            agenda-uitnodiging volgt <code>MAIL_TO</code> bewust niet; die heeft
            een eigen instelling: <code>MAIL_TO_CALENDAR</code>.
          </p>

          {mailReady ? (
            <>
              <TestMailForm defaultTo={naartoe.bookings} />
              {viaMicrosoft && (
                <details className="mt-5 rounded-xl border border-ink-700 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-mist-100">
                    Weigert Microsoft 365 de aanmelding?
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300">
                    Bij <code>535 5.7.3 Authentication unsuccessful</code> ligt
                    het vrijwel nooit aan de website. Microsoft zet verzenden
                    via SMTP per postvak standaard uit. Zet in het Microsoft
                    365-beheercentrum bij Gebruikers → Actieve gebruikers → het
                    account → E-mail → E-mail-apps beheren de optie{" "}
                    <strong>Geverifieerde SMTP</strong> aan. Staat die er niet,
                    dan is SMTP voor de hele organisatie uit; dat zet je aan met{" "}
                    <code>Set-TransportConfig -SmtpClientAuthenticationDisabled $false</code>.
                  </p>
                  <p className="field-hint">
                    Met tweestapsverificatie op het account werkt het gewone
                    wachtwoord nooit: maak een app-wachtwoord en zet dat in{" "}
                    <code>SMTP_PASSWORD</code>. Lukt het niet, dan is een
                    verzenddienst als Resend, Postmark of Brevo het rustigste
                    alternatief: die geeft SMTP-gegevens die het meteen doen.
                  </p>
                </details>
              )}
            </>
          ) : (
            <>
              <h3 className="mt-6 text-sm font-semibold text-mist-100">
                Wat er nog moet gebeuren
              </h3>
              <p className="mt-2 text-sm text-mist-300">
                Zet deze waarden op de server. Op Fly.io gaat dat met{" "}
                <code>fly secrets set …</code>, lokaal in{" "}
                <code>.env.local</code>. Daarna verschijnt hier een knop om een
                proefbericht te sturen.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-ink-700 bg-ink-900 p-4 text-xs text-mist-300">
{`SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_USER="${site.personalEmail}"
SMTP_PASSWORD="het wachtwoord van dat postvak"
MAIL_FROM="${site.name} <${site.personalEmail}>"`}
              </pre>
              <p className="field-hint">
                Deze waarden staan alleen op de server en komen nooit in de
                frontend terecht. <code>MAIL_FROM</code> moet een adres zijn dat
                het postvak mag gebruiken; bij Microsoft 365 is dat standaard
                alleen het hoofdadres.
              </p>
            </>
          )}
        </Panel>

        <Panel title="Bedrijfsgegevens en teksten">
          <p className="text-sm leading-relaxed text-mist-300">
            Bedrijfsnaam, e-mailadres, werkgebied en alle vaste teksten staan in
            één bestand: <code className="text-mist-100">content/site.ts</code>.
            Pas dat bestand aan en de wijziging is direct overal op de site
            zichtbaar.
          </p>
          <p className="field-hint">
            Tijdelijke afbeeldingen staan in <code>public/images/</code>. Vervang
            de bestanden en houd dezelfde namen aan.
          </p>
        </Panel>
      </div>
    </>
  );
}

function Regel({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <dt className="text-sm text-mist-500">{label}</dt>
        <dd className="text-sm font-medium text-mist-100">{value}</dd>
      </div>
      <p className="mt-1 text-xs text-mist-600">{hint}</p>
    </div>
  );
}
