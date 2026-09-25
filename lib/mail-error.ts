/**
 * ============================================================================
 *  FOUTMELDINGEN VAN DE MAILSERVER IN GEWONE TAAL
 * ============================================================================
 *  Een mailserver antwoordt met codes als "535 5.7.3 Authentication
 *  unsuccessful". Daar staat wel in wat er mis is, maar niet wat je eraan doet.
 *  Deze module vertaalt de bekende gevallen naar een oorzaak en een lijstje
 *  stappen, zodat de beheeromgeving verder helpt dan "er ging iets mis".
 *
 *  Herkent de module de melding niet, dan komt de tekst van de server zelf
 *  terug. Nooit verzwijgen dus: de ruwe melding blijft altijd zichtbaar.
 *
 *  Hier staat bewust geen "server-only" en wordt geen database of omgeving
 *  gelezen, zodat dit met een gewone test te controleren is.
 * ============================================================================
 */

export type MailFoutUitleg = {
  /** Eén zin: wat er aan de hand is. */
  oorzaak: string;
  /** Wat je achter elkaar kunt nalopen om het op te lossen. */
  stappen: string[];
};

/** Microsoft 365 weigert de aanmelding. Verreweg het meest voorkomende geval. */
const MICROSOFT_AANMELDING: MailFoutUitleg = {
  oorzaak:
    "De mailserver van Microsoft 365 accepteert de aanmelding niet. Dat ligt bijna nooit aan de website: Microsoft zet SMTP-verzending per postvak standaard uit.",
  stappen: [
    "Zet SMTP aan voor het postvak: Microsoft 365-beheercentrum → Gebruikers → Actieve gebruikers → het account → tabblad E-mail → E-mail-apps beheren → vink Geverifieerde SMTP aan.",
    "Staat de schakelaar er niet, dan is SMTP voor de hele organisatie uit. Zet hem aan in het Exchange-beheercentrum, of met PowerShell: Set-TransportConfig -SmtpClientAuthenticationDisabled $false.",
    "Gebruikt het account tweestapsverificatie, dan werkt het gewone wachtwoord nooit. Maak een app-wachtwoord aan en zet dat in SMTP_PASSWORD.",
    "SMTP_USER moet het volledige aanmeldadres van een postvak met licentie zijn, niet een alias. Een gedeeld postvak zonder eigen wachtwoord kan zich niet aanmelden.",
    "Blijft het hangen, neem dan een verzenddienst als Resend, Postmark of Brevo. Die geven SMTP-gegevens die het meteen doen en komen beter door spamfilters heen.",
  ],
};

const REGELS: { test: RegExp; uitleg: MailFoutUitleg }[] = [
  {
    // 5.7.139 is de Microsoft-code voor "SMTP staat uit voor dit postvak".
    test: /5\.7\.139|SmtpClientAuthentication|basic authentication is disabled/i,
    uitleg: MICROSOFT_AANMELDING,
  },
  {
    test: /5\.7\.3|535|invalid login|authentication unsuccessful|EAUTH/i,
    uitleg: MICROSOFT_AANMELDING,
  },
  {
    test: /5\.7\.60|SendAsDenied|not allowed to send as/i,
    uitleg: {
      oorzaak:
        "De aanmelding lukt, maar het postvak mag niet versturen namens het adres in MAIL_FROM.",
      stappen: [
        "Zet in MAIL_FROM hetzelfde adres als in SMTP_USER. Dat mag een postvak altijd.",
        "Wil je van een ander adres versturen, geef het aanmeldende account dan de rechten Verzenden als voor dat postvak.",
      ],
    },
  },
  {
    test: /ENOTFOUND|EAI_AGAIN|getaddrinfo/i,
    uitleg: {
      oorzaak: "De naam van de mailserver in SMTP_HOST is niet te vinden.",
      stappen: [
        "Controleer SMTP_HOST op een typefout; voor Microsoft 365 is dat smtp.office365.com.",
      ],
    },
  },
  {
    test: /ETIMEDOUT|ECONNREFUSED|ECONNECTION|ESOCKET|EDNS|Connection timeout|Greeting never received/i,
    uitleg: {
      oorzaak: "De website kreeg geen verbinding met de mailserver.",
      stappen: [
        "Controleer SMTP_PORT: 587 met STARTTLS is gebruikelijk, 465 is de beveiligde variant.",
        "Blokkeert de hosting uitgaand verkeer op die poort, neem dan een verzenddienst die poort 587 of 2525 aanbiedt.",
      ],
    },
  },
  {
    test: /5\.7\.1|relay access denied|unable to relay/i,
    uitleg: {
      oorzaak:
        "De server wil het bericht niet doorsturen naar de opgegeven ontvanger.",
      stappen: [
        "Controleer of SMTP_USER en SMTP_PASSWORD echt zijn meegestuurd; zonder aanmelding stuurt bijna geen server door.",
        "Controleer of het ontvangende adres klopt.",
      ],
    },
  },
];

/**
 * Zoekt de uitleg bij de melding van de server. Geeft `null` terug als de
 * melding niet herkend wordt; laat dan alleen de ruwe tekst zien.
 */
export function verklaarMailFout(detail: string): MailFoutUitleg | null {
  if (!detail) return null;
  for (const { test, uitleg } of REGELS) {
    if (test.test(detail)) return uitleg;
  }
  return null;
}
