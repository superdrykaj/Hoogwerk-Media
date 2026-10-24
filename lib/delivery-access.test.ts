import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { signedQuery } from "./delivery-links";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-toegang-"));
process.env.DATA_DIR = tmp;
process.env.SEED_ON_EMPTY = "false";
process.env.AUTH_SECRET = "test-geheim-van-minstens-zestien-tekens";

type M = {
  access: typeof import("./delivery-access");
  invoices: typeof import("./invoices");
  payments: typeof import("./payments");
  db: typeof import("./db");
};
let m: M;
beforeAll(async () => {
  m = {
    access: await import("./delivery-access"),
    invoices: await import("./invoices"),
    payments: await import("./payments"),
    db: await import("./db"),
  };
});
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("parseRange", () => {
  it("leest gewone, open en suffix-bereiken", () => {
    expect(m.access.parseRange("bytes=0-99", 1000)).toEqual({ start: 0, end: 99 });
    expect(m.access.parseRange("bytes=900-", 1000)).toEqual({ start: 900, end: 999 });
    expect(m.access.parseRange("bytes=-100", 1000)).toEqual({ start: 900, end: 999 });
    expect(m.access.parseRange("bytes=0-99999", 1000)).toEqual({ start: 0, end: 999 });
    expect(m.access.parseRange("bytes=-5000", 1000)).toEqual({ start: 0, end: 999 });
  });
  it("geeft null zonder Range en bij meerdere bereiken (dan het hele bestand)", () => {
    expect(m.access.parseRange(null, 1000)).toBeNull();
    expect(m.access.parseRange("bytes=0-1,5-9", 1000)).toBeNull();
  });
  it("meldt onbevredigbare bereiken", () => {
    for (const h of ["bytes=1000-", "bytes=500-100", "bytes=-0", "bytes=-", "bytes=abc"]) {
      expect(m.access.parseRange(h, 1000), h).toBe("onbevredigend");
    }
    expect(m.access.parseRange("bytes=0-10", 0)).toBe("onbevredigend");
  });
});

function maakFactuur(n: number, patch: Record<string, unknown> = {}) {
  const db = m.db.getDb();
  db.prepare(`INSERT OR IGNORE INTO services (id, slug, name, duration_minutes) VALUES (1, 'foto', 'Fotografie', 60)`).run();
  const b = db
    .prepare(
      `INSERT INTO bookings (reference, service_id, start_utc, end_utc, status, name, email, created_utc, updated_utc)
       VALUES (?, 1, 0, 1, 'confirmed', 'Klant', 'k@example.test', 0, 0)`,
    )
    .run(`HM-TO${n}`);
  const inv = m.invoices.saveInvoiceDraft(Number(b.lastInsertRowid), {
    amountCents: 25000,
    description: "x",
    payBeforeDownload: true,
    customer: { name: "K", address: "a", postcode: "1000 AA", city: "c", country: "Nederland", vatId: "" },
    deliveryDate: "2026-10-20",
    paymentTermDays: 14,
  }).invoice;
  for (const [k, v] of Object.entries(patch)) {
    db.prepare(`UPDATE invoices SET ${k} = ? WHERE id = ?`).run(v, inv.id);
  }
  return m.invoices.getInvoice(inv.id)!;
}

describe("wie mag de originelen downloaden", () => {
  it("alleen na betaling, en niet na terugbetaling of annulering", () => {
    const c = m.invoices.canDownloadOriginals;
    expect(c({ status: "draft", payBeforeDownload: true })).toBe(false);
    expect(c({ status: "sent", payBeforeDownload: true })).toBe(false);
    expect(c({ status: "paid", payBeforeDownload: true })).toBe(true);
    expect(c({ status: "refunded", payBeforeDownload: true })).toBe(false);
    expect(c({ status: "cancelled", payBeforeDownload: true })).toBe(false);
  });
  it("zonder betaalmuur kan het, behalve na terugbetaling of annulering", () => {
    const c = m.invoices.canDownloadOriginals;
    expect(c({ status: "sent", payBeforeDownload: false })).toBe(true);
    expect(c({ status: "refunded", payBeforeDownload: false })).toBe(false);
    expect(c({ status: "cancelled", payBeforeDownload: false })).toBe(false);
  });
});

describe("authorizeDownload", () => {
  const req = (url: string) => new Request(`http://localhost${url}`);
  const secret = process.env.AUTH_SECRET!;

  it("weigert zonder ondertekening (403) en met een verlopen link (303 naar de pagina)", () => {
    const inv = maakFactuur(1);
    const zonder = m.access.authorizeDownload(req(`/api/oplevering/${inv.token}/1`), inv.token, { kind: "file", fileId: 1 });
    expect(!zonder.ok && zonder.response.status).toBe(403);

    const oud = signedQuery(inv.token, { kind: "file", fileId: 1 }, secret, 30, Date.now() - 3 * 3600_000);
    const verlopen = m.access.authorizeDownload(req(`/api/oplevering/${inv.token}/1?${oud}`), inv.token, { kind: "file", fileId: 1 });
    expect(!verlopen.ok && verlopen.response.status).toBe(303);
    expect(!verlopen.ok && verlopen.response.headers.get("location")).toBe(`/oplevering/${inv.token}?fout=verlopen`);
  });

  it("geeft bij een geldige link 402 vóór betaling en toegang erna", () => {
    const inv = maakFactuur(2);
    const q = signedQuery(inv.token, { kind: "zip" }, secret);
    const url = `/api/oplevering/${inv.token}/alles?${q}`;
    const voor = m.access.authorizeDownload(req(url), inv.token, { kind: "zip" });
    expect(!voor.ok && voor.response.status).toBe(402);

    m.invoices.markPaid(inv.id, "mollie");
    const na = m.access.authorizeDownload(req(url), inv.token, { kind: "zip" });
    expect(na.ok).toBe(true);
  });

  it("trekt de toegang direct in bij een terugbetaling, ook met een nog geldige link", () => {
    const inv = maakFactuur(3);
    m.invoices.markPaid(inv.id, "mollie");
    const q = signedQuery(inv.token, { kind: "file", fileId: 5 }, secret);
    const url = `/api/oplevering/${inv.token}/5?${q}`;
    expect(m.access.authorizeDownload(req(url), inv.token, { kind: "file", fileId: 5 }).ok).toBe(true);
    m.invoices.markRefunded(inv.id);
    const na = m.access.authorizeDownload(req(url), inv.token, { kind: "file", fileId: 5 });
    expect(!na.ok && na.response.status).toBe(410);
  });

  it("geeft zonder AUTH_SECRET nooit toegang", () => {
    const inv = maakFactuur(4);
    m.invoices.markPaid(inv.id, "mollie");
    const q = signedQuery(inv.token, { kind: "zip" }, secret);
    delete process.env.AUTH_SECRET;
    try {
      const r = m.access.authorizeDownload(req(`/api/oplevering/${inv.token}/alles?${q}`), inv.token, { kind: "zip" });
      expect(!r.ok && r.response.status).toBe(403);
      expect(m.access.downloadLinks(inv, [1])).toBeNull();
    } finally {
      process.env.AUTH_SECRET = secret;
    }
  });

  it("maakt oude links ongeldig als het token wordt vernieuwd", () => {
    const inv = maakFactuur(5);
    m.invoices.markPaid(inv.id, "mollie");
    const oudToken = inv.token;
    const nieuw = m.invoices.rotateInvoiceToken(inv.id);
    expect(nieuw).not.toBe(oudToken);
    const q = signedQuery(oudToken, { kind: "zip" }, secret);
    // handtekening klopt nog voor het oude token, maar dat hoort bij geen factuur meer
    const r = m.access.authorizeDownload(req(`/api/oplevering/${oudToken}/alles?${q}`), oudToken, { kind: "zip" });
    expect(!r.ok && r.response.status).toBe(404);
    expect(m.invoices.getInvoiceByToken(oudToken)).toBeNull();
    expect(m.invoices.getInvoiceByToken(nieuw)?.id).toBe(inv.id);
  });
});

describe("handmatig betaald, terugbetaling", () => {
  it("handmatig boeken vraagt een toelichting en kan niet op een concept of betaalde factuur", async () => {
    const inv = maakFactuur(10);
    expect(m.invoices.markPaidManually(inv.id, "iets").ok).toBe(false); // nog niet uitgegeven
    m.db.getDb().prepare("UPDATE invoices SET issued_utc = 1 WHERE id = ?").run(inv.id);
    expect(m.invoices.markPaidManually(inv.id, "  ").ok).toBe(false); // geen toelichting
    expect(m.invoices.markPaidManually(inv.id, "overgemaakt op 12-11").ok).toBe(true);
    const nu = m.invoices.getInvoice(inv.id)!;
    expect(nu).toMatchObject({ status: "paid", paymentMethod: "manual", paymentNote: "overgemaakt op 12-11" });
    expect(m.invoices.markPaidManually(inv.id, "nog eens").ok).toBe(false); // al betaald
  });

  it("een terugbetaling raakt een handmatig geboekte betaling niet", () => {
    const inv = maakFactuur(11, { issued_utc: 1 });
    m.invoices.markPaidManually(inv.id, "contant");
    m.invoices.markRefunded(inv.id);
    expect(m.invoices.getInvoice(inv.id)!.status).toBe("paid");
  });

  it("na een terugbetaling kan de beheerder de factuur opnieuw als betaald boeken", () => {
    const inv = maakFactuur(12, { issued_utc: 1 });
    m.invoices.markPaid(inv.id, "mollie");
    m.invoices.markRefunded(inv.id);
    expect(m.invoices.getInvoice(inv.id)!.status).toBe("refunded");
    expect(m.invoices.markPaidManually(inv.id, "opnieuw betaald").ok).toBe(true);
    const nu = m.invoices.getInvoice(inv.id)!;
    expect(nu.status).toBe("paid");
    expect(nu.refundedUtc).toBeNull();
  });
});
