import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-voorbeeld-"));
process.env.DATA_DIR = tmp;
process.env.SEED_ON_EMPTY = "false";

type M = {
  previews: typeof import("./previews");
  invoices: typeof import("./invoices");
  db: typeof import("./db");
  deliveries: typeof import("./deliveries");
};
let m: M;

beforeAll(async () => {
  m = {
    previews: await import("./previews"),
    invoices: await import("./invoices"),
    db: await import("./db"),
    deliveries: await import("./deliveries"),
  };
});
afterAll(() => {
  m?.db.getDb().close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

/** Een egaal lichtgrijze foto: elk afwijkend pixel is dus van het watermerk. */
async function testFoto(width = 4000, height = 3000, achtergrond = "#c8c8c8"): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: achtergrond } })
    .jpeg({ quality: 92 })
    .withExif({ IFD0: { Copyright: "geheim" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "52/1 22/1 0/1" } })
    .toBuffer();
}

/** Aandeel pixels dat afwijkt van de achtergrondkleur. */
async function afwijkendAandeel(jpeg: Buffer, grijs: number): Promise<number> {
  const { data, info } = await sharp(jpeg).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let afwijkend = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (Math.abs(data[i] - grijs) > 12) afwijkend++;
  }
  return afwijkend / (data.length / info.channels);
}

describe("voorbeeld met watermerk", () => {
  it("is verkleind, zonder metagegevens en heeft een watermerk over het hele beeld", async () => {
    const origineel = await testFoto();
    expect((await sharp(origineel).metadata()).exif).toBeTruthy(); // uitgangspunt: de foto heeft GPS-gegevens

    const voorbeeld = await m.previews.buildWatermarkedJpeg(origineel);
    const meta = await sharp(voorbeeld).metadata();
    expect(meta.format).toBe("jpeg");
    expect(Math.max(meta.width!, meta.height!)).toBeLessThanOrEqual(1280);
    expect(meta.exif).toBeUndefined();
    expect(voorbeeld.length).toBeLessThan(origineel.length);

    // Het watermerk is aanwezig en niet slechts in één hoek: elk kwart van het beeld heeft afwijkende pixels.
    const aandeel = await afwijkendAandeel(voorbeeld, 0xc8);
    expect(aandeel).toBeGreaterThan(0.015);
    const { width, height } = meta as { width: number; height: number };
    for (const [l, t] of [[0, 0], [width / 2, 0], [0, height / 2], [width / 2, height / 2]]) {
      const kwart = await sharp(voorbeeld)
        .extract({ left: Math.floor(l), top: Math.floor(t), width: Math.floor(width / 2), height: Math.floor(height / 2) })
        .toBuffer();
      expect(await afwijkendAandeel(kwart, 0xc8)).toBeGreaterThan(0.005);
    }
  });

  it("is leesbaar op een zeer licht én op een zeer donker beeld", async () => {
    for (const [kleur, grijs] of [["#fafafa", 0xfa], ["#050505", 0x05]] as const) {
      const v = await m.previews.buildWatermarkedJpeg(await testFoto(1600, 1200, kleur));
      expect(await afwijkendAandeel(v, grijs)).toBeGreaterThan(0.01);
    }
  });

  it("vergroot kleine beelden niet en volgt de staande stand", async () => {
    const klein = await m.previews.buildWatermarkedJpeg(await testFoto(600, 400));
    expect((await sharp(klein).metadata()).width).toBe(600);
    const staand = await m.previews.buildWatermarkedJpeg(await testFoto(3000, 4000));
    const meta = await sharp(staand).metadata();
    expect(meta.height).toBe(1280);
    expect(meta.width).toBe(960);
  });

  it("maakt zonder logo geen voorbeeld (nooit terugvallen op een onbewerkt beeld)", async () => {
    process.env.WATERMARK_LOGO = path.join(tmp, "bestaat-niet.png");
    try {
      await expect(m.previews.buildWatermarkedJpeg(await testFoto(800, 600))).rejects.toThrow();
    } finally {
      delete process.env.WATERMARK_LOGO;
    }
  });
});

describe("voorbeeld bij een opleverbestand", () => {
  function bestand(): number {
    const db = m.db.getDb();
    db.prepare(`INSERT OR IGNORE INTO services (id, slug, name, duration_minutes) VALUES (1, 'foto', 'Fotografie', 60)`).run();
    db.prepare(
      `INSERT INTO bookings (reference, service_id, start_utc, end_utc, status, name, email, created_utc, updated_utc)
       VALUES ('HM-VB1', 1, 0, 1, 'confirmed', 'Klant', 'k@example.test', 0, 0)`,
    ).run();
    const inv = m.invoices.saveInvoiceDraft(1, {
      amountCents: 100,
      description: "x",
      payBeforeDownload: true,
      customer: { name: "K", address: "a", postcode: "1000 AA", city: "c", country: "Nederland", vatId: "" },
      deliveryDate: "2026-10-20",
      paymentTermDays: 14,
    }).invoice;
    fs.mkdirSync(m.deliveries.DELIVERY_DIR, { recursive: true });
    fs.writeFileSync(path.join(m.deliveries.DELIVERY_DIR, "orig-1.jpg"), "placeholder");
    return m.invoices.addInvoiceFile(inv.id, { filename: "orig-1.jpg", originalName: "IMG_0001.jpg", contentType: "image/jpeg", sizeBytes: 11 });
  }

  it("bewaart het voorbeeld apart van het origineel, onder een andere naam", async () => {
    const id = bestand();
    const origineel = await testFoto(3000, 2000);
    fs.writeFileSync(path.join(m.deliveries.DELIVERY_DIR, "orig-1.jpg"), origineel);

    const r = await m.previews.createImagePreview(id);
    expect(r.ok).toBe(true);
    const file = m.invoices.getInvoiceFile(id)!;
    expect(file.previewFilename).toMatch(/\.jpg$/);
    expect(file.previewFilename).not.toBe(file.filename);
    expect(file.previewType).toBe("image/jpeg");

    const pad = m.previews.resolvePreviewPath(file.previewFilename)!;
    expect(pad.startsWith(m.previews.PREVIEW_DIR)).toBe(true);
    const bytes = fs.readFileSync(pad);
    // Wat geserveerd wordt, is niet het origineel, en is kleiner.
    expect(Buffer.compare(bytes, origineel)).not.toBe(0);
    expect(bytes.length).toBeLessThan(origineel.length);
    expect((await sharp(bytes).metadata()).width).toBe(1280);
    // Het origineel is onaangeroerd.
    expect(Buffer.compare(fs.readFileSync(path.join(m.deliveries.DELIVERY_DIR, "orig-1.jpg")), origineel)).toBe(0);
  });

  it("vervangt een eerder voorbeeld en ruimt het oude bestand op", async () => {
    const id = bestand2();
    function bestand2() {
      return m.invoices.listInvoiceFiles(1)[0].id;
    }
    const eerst = m.invoices.getInvoiceFile(id)!.previewFilename;
    await m.previews.createImagePreview(id);
    const daarna = m.invoices.getInvoiceFile(id)!.previewFilename;
    expect(daarna).not.toBe(eerst);
    expect(fs.existsSync(path.join(m.previews.PREVIEW_DIR, eerst))).toBe(false);
    expect(fs.existsSync(path.join(m.previews.PREVIEW_DIR, daarna))).toBe(true);
  });

  it("weigert paden buiten de voorbeeldmap", () => {
    for (const naam of ["../orig-1.jpg", "..%2f", "a/b.jpg", "", "/etc/passwd"]) {
      expect(m.previews.resolvePreviewPath(naam)).toBeNull();
    }
  });

  it("voorziet video's niet automatisch van een voorbeeld", async () => {
    const db = m.db.getDb();
    db.prepare(`INSERT INTO invoice_files (invoice_id, filename, original_name, content_type, size_bytes, created_utc) VALUES (1, 'v.mp4', 'film.mp4', 'video/mp4', 5, 0)`).run();
    const id = m.invoices.listInvoiceFiles(1).find((f) => f.contentType === "video/mp4")!.id;
    const r = await m.previews.createImagePreview(id);
    expect(r.ok).toBe(false);
    expect(m.invoices.getInvoiceFile(id)!.previewFilename).toBe("");
  });
});

describe("eigen voorbeeld (video) aanleveren", () => {
  function stream(buf: Buffer): ReadableStream<Uint8Array> {
    return new ReadableStream({ start(c) { c.enqueue(new Uint8Array(buf)); c.close(); } });
  }
  function mp4(extra = 100): Buffer {
    return Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from("ftypisom"), Buffer.alloc(extra)]);
  }
  function videoBestand(naam: string, inhoud: Buffer): number {
    fs.writeFileSync(path.join(m.deliveries.DELIVERY_DIR, naam), inhoud);
    const db = m.db.getDb();
    db.prepare(`INSERT INTO invoice_files (invoice_id, filename, original_name, content_type, size_bytes, created_utc) VALUES (1, ?, ?, 'video/mp4', ?, 0)`).run(naam, naam, inhoud.length);
    return m.invoices.listInvoiceFiles(1).find((f) => f.filename === naam)!.id;
  }

  it("bewaart een geldige MP4 als voorbeeld, apart van het origineel", async () => {
    const origineel = mp4(5000);
    const id = videoBestand("film-a.mp4", origineel);
    const r = await m.previews.saveManualPreview(id, stream(mp4(300)), "video/mp4");
    expect(r.ok).toBe(true);
    const f = m.invoices.getInvoiceFile(id)!;
    expect(f.previewType).toBe("video/mp4");
    expect(f.previewFilename).not.toBe(f.filename);
    expect(fs.existsSync(path.join(m.previews.PREVIEW_DIR, f.previewFilename))).toBe(true);
  });

  it("weigert het origineel zelf als voorbeeld", async () => {
    const origineel = mp4(7000);
    const id = videoBestand("film-b.mp4", origineel);
    const r = await m.previews.saveManualPreview(id, stream(origineel), "video/mp4");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/origine/);
    expect(m.invoices.getInvoiceFile(id)!.previewFilename).toBe("");
    // en laat geen restanten in de voorbeeldmap achter
    expect(fs.readdirSync(m.previews.PREVIEW_DIR).filter((n) => n.endsWith(".upload"))).toEqual([]);
  });

  it("weigert bytes die geen MP4 zijn", async () => {
    const id = videoBestand("film-c.mp4", mp4(900));
    const r = await m.previews.saveManualPreview(id, stream(Buffer.from("dit is geen video, gewoon tekst")), "video/mp4");
    expect(r.ok).toBe(false);
    expect(m.invoices.getInvoiceFile(id)!.previewFilename).toBe("");
  });

  it("zet een aangeleverde foto alsnog door het watermerk van de server", async () => {
    const id = videoBestand("film-d.mp4", mp4(800));
    const foto = await sharp({ create: { width: 2000, height: 1500, channels: 3, background: "#c8c8c8" } }).jpeg().toBuffer();
    const r = await m.previews.saveManualPreview(id, stream(foto), "image/jpeg");
    expect(r.ok).toBe(true);
    const bytes = fs.readFileSync(path.join(m.previews.PREVIEW_DIR, m.invoices.getInvoiceFile(id)!.previewFilename));
    expect((await sharp(bytes).metadata()).width).toBe(1280);
    expect(await afwijkendAandeel(bytes, 0xc8)).toBeGreaterThan(0.015);
  });

  it("weigert andere bestandstypen", async () => {
    const id = videoBestand("film-e.mp4", mp4(100));
    expect((await m.previews.saveManualPreview(id, stream(mp4(50)), "application/zip")).ok).toBe(false);
  });
});
