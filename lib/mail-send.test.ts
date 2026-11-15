import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/**
 * Een piepkleine SMTP-server voor de test. Met `weiger` antwoordt hij op de
 * aanmelding zoals Microsoft 365 doet als SMTP AUTH uitstaat; anders neemt hij
 * elk bericht aan en bewaart hij de ruwe tekst, zodat de test kan nagaan wat
 * er werkelijk de deur uit ging.
 */
type FakeSmtp = { port: number; berichten: string[]; sluit: () => Promise<void> };

function startSmtp(weiger: boolean): Promise<FakeSmtp> {
  const berichten: string[] = [];
  const server = net.createServer((socket) => {
    let inData = false;
    let data = "";
    let buffer = "";
    socket.write("220 test ESMTP\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      let eind: number;
      while ((eind = buffer.indexOf("\r\n")) >= 0) {
        const regel = buffer.slice(0, eind);
        buffer = buffer.slice(eind + 2);
        if (inData) {
          if (regel === ".") {
            inData = false;
            berichten.push(data);
            data = "";
            socket.write(`250 2.0.0 OK <test-${berichten.length}@fake> [Hostname=fake]\r\n`);
          } else {
            data += regel + "\n";
          }
          continue;
        }
        const opdracht = regel.toUpperCase();
        if (opdracht.startsWith("EHLO")) {
          socket.write("250-test\r\n250 AUTH PLAIN LOGIN\r\n");
        } else if (opdracht.startsWith("AUTH")) {
          socket.write(
            weiger
              ? "535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant. Visit https://aka.ms/smtp_auth_disabled\r\n"
              : "235 2.7.0 Authentication successful\r\n",
          );
        } else if (opdracht.startsWith("MAIL") || opdracht.startsWith("RCPT")) {
          socket.write("250 2.1.0 OK\r\n");
        } else if (opdracht === "DATA") {
          inData = true;
          socket.write("354 Start mail input\r\n");
        } else if (opdracht === "QUIT") {
          socket.end("221 bye\r\n");
        } else {
          socket.write("250 OK\r\n");
        }
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as net.AddressInfo).port;
      resolve({
        port,
        berichten,
        sluit: () => new Promise((klaar) => server.close(() => klaar())),
      });
    });
  });
}

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hoogbeeld-mailtest-"));

beforeAll(() => {
  process.env.DATA_DIR = dataDir;
  process.env.SMTP_HOST = "127.0.0.1";
  process.env.SMTP_USER = "verzender@example.test";
  process.env.SMTP_PASSWORD = "test-wachtwoord";
  process.env.MAIL_FROM = "Hoogbeeld Media <verzender@example.test>";
  process.env.MAIL_TO = "eigenaar@example.test";
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });
});

/** Verse modules per test: de SMTP-verbinding wordt in lib/mail.ts bewaard. */
async function laadModules(port: number) {
  process.env.SMTP_PORT = String(port);
  vi.resetModules();
  const mail = await import("./mail");
  const messages = await import("./messages");
  return { mail, messages };
}

const klant = {
  name: "Testpersoon Synthetisch",
  email: "klant-synthetisch@example.test",
  subject: "Dronebeelden testonderwerp",
  message: "Inhoud die nooit in de serverlog mag komen.",
};

describe("melding van een contactbericht", () => {
  it("bewaart het bericht en logt de fout met kenmerk als de mailserver weigert", async () => {
    const smtp = await startSmtp(true);
    const { mail, messages } = await laadModules(smtp.port);
    const fouten = vi.spyOn(console, "error").mockImplementation(() => {});

    const id = messages.createMessage(klant);
    const status = await mail.sendContactMails({
      id,
      ...klant,
      handled: false,
      createdUtc: Date.now(),
    });

    expect(status).toEqual({ customer: "failed", owner: "failed" });
    // Het bericht staat er nog, ook al ging de melding mis.
    expect(messages.listMessages().some((m) => m.id === id)).toBe(true);
    // Niets verstuurd, dus ook niets wat later dubbel kan aankomen.
    expect(smtp.berichten).toHaveLength(0);

    const regels = fouten.mock.calls.map((args) => String(args[0]));
    const melding = regels.find((r) => r.includes("soort=contact-melding"));
    expect(melding).toBeDefined();
    expect(melding).toContain(`ref=bericht-${id}`);
    expect(melding).toContain("status=failed");
    expect(melding).toContain("5.7.139");
    // Geen persoonsgegevens of inhoud in de serverlog.
    for (const regel of regels) {
      expect(regel).not.toContain(klant.name);
      expect(regel).not.toContain(klant.email);
      expect(regel).not.toContain(klant.subject);
      expect(regel).not.toContain(klant.message);
      expect(regel).not.toContain("example.test");
    }

    // De fout staat ook in de database, voor de beheeromgeving.
    const log = mail.recentMailLog(2);
    expect(log.every((r) => r.status === "failed")).toBe(true);
    await smtp.sluit();
  });

  it("stuurt precies één melding met het juiste onderwerp en Reply-To", async () => {
    const smtp = await startSmtp(false);
    const { mail, messages } = await laadModules(smtp.port);
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const id = messages.createMessage(klant);
    const status = await mail.sendContactMails({
      id,
      ...klant,
      handled: false,
      createdUtc: Date.now(),
    });

    expect(status).toEqual({ customer: "sent", owner: "sent" });
    const naarEigenaar = smtp.berichten.filter((b) => /^To: eigenaar@example\.test$/m.test(b));
    expect(naarEigenaar).toHaveLength(1);
    expect(naarEigenaar[0]).toMatch(/^Subject: Contactformulier: Dronebeelden testonderwerp$/m);
    expect(naarEigenaar[0]).toMatch(/^Reply-To: klant-synthetisch@example\.test$/m);
    expect(naarEigenaar[0]).toMatch(/^From: Hoogbeeld Media <verzender@example\.test>$/m);

    // Het bericht-ID van de server komt in de log, voor de Message Trace.
    const regels = info.mock.calls.map((args) => String(args[0]));
    expect(regels.some((r) => r.includes(`ref=bericht-${id}`) && r.includes("status=sent"))).toBe(true);
    const log = mail.recentMailLog(2);
    expect(log.every((r) => r.status === "sent" && r.detail.includes("250 2.0.0 OK"))).toBe(true);
    await smtp.sluit();
  });
});
