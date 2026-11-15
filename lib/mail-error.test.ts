import { describe, expect, it } from "vitest";

import { mailLogRegel, verklaarMailFout } from "./mail-error";

/** De melding die Microsoft 365 teruggaf toen het misging op de echte site. */
const MICROSOFT_535 =
  "Error: Invalid login: 535 5.7.3 Authentication unsuccessful " +
  "[AS4P189CA0053.EURP189.PROD.OUTLOOK.COM 2026-09-25T10:18:36.967Z 08DF1A665DE9D70F]";

describe("uitleg bij een weigerende mailserver", () => {
  it("herkent de aanmeldweigering van Microsoft 365", () => {
    const uitleg = verklaarMailFout(MICROSOFT_535);
    expect(uitleg).not.toBeNull();
    expect(uitleg!.oorzaak).toMatch(/Microsoft 365/);
    expect(uitleg!.stappen.length).toBeGreaterThan(2);
    // De eerste stap moet de daadwerkelijke oplossing zijn, niet een omweg.
    expect(uitleg!.stappen[0]).toMatch(/Geverifieerde SMTP/);
  });

  it("herkent de code voor SMTP dat uitstaat op het postvak", () => {
    const uitleg = verklaarMailFout(
      "535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant",
    );
    expect(uitleg?.oorzaak).toMatch(/Microsoft 365/);
  });

  it("onderscheidt een geweigerd afzenderadres van een mislukte aanmelding", () => {
    const uitleg = verklaarMailFout("550 5.7.60 SMTP; Client does not have permissions to send as this sender");
    expect(uitleg?.oorzaak).toMatch(/MAIL_FROM/);
    expect(uitleg?.stappen[0]).toMatch(/SMTP_USER/);
  });

  it("herkent een onbereikbare server", () => {
    expect(verklaarMailFout("Error: connect ETIMEDOUT 52.96.0.1:587")?.oorzaak).toMatch(
      /geen verbinding/,
    );
    // Zoals nodemailer het meldt als de tijdslimiet verstrijkt.
    expect(verklaarMailFout("ETIMEDOUT Error: Connection timeout")?.oorzaak).toMatch(
      /geen verbinding/,
    );
    expect(verklaarMailFout("Error: getaddrinfo ENOTFOUND smtp.offce365.com")?.oorzaak).toMatch(
      /niet te vinden/,
    );
  });

  it("verzint niets bij een melding die we niet kennen", () => {
    expect(verklaarMailFout("452 4.3.1 Insufficient system storage")).toBeNull();
    expect(verklaarMailFout("")).toBeNull();
  });
});

describe("regel voor de serverlog", () => {
  it("noemt soort en kenmerk en poetst e-mailadressen weg", () => {
    const regel = mailLogRegel(
      "failed",
      { soort: "aanvraag-melding", ref: "HB-TEST1" },
      "EENVELOPE 550 5.1.1 <iemand@voorbeeld.nl>: Recipient address rejected",
    );
    expect(regel).toContain("status=failed");
    expect(regel).toContain("soort=aanvraag-melding");
    expect(regel).toContain("ref=HB-TEST1");
    expect(regel).toContain("550 5.1.1");
    expect(regel).not.toContain("iemand@voorbeeld.nl");
  });
});
