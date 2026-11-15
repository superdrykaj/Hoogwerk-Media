import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// De verversknop gebruikt de router van Next; in een weergavetest is die er niet.
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));

import { StorageOverview } from "@/components/admin/storage-overview";
import type { StorageReport } from "./storage-usage";

const GB = 1_000_000_000;

function rapport(percent: number, patch: Partial<StorageReport> = {}): StorageReport {
  const usable = 1 * GB;
  const used = Math.round((usable * percent) / 100);
  return {
    measuredAt: Date.UTC(2026, 10, 1, 10, 0, 0),
    dataDir: "/data",
    volume: { usableBytes: usable, usedBytes: used, freeBytes: usable - used, percent, reservedBytes: 0 },
    separateVolume: true,
    parts: [
      { key: "deliveries", label: "Opleverbestanden (originelen)", where: "deliveries/", bytes: Math.round(used * 0.7) },
      { key: "previews", label: "Voorbeelden met watermerk", where: "deliveries/previews/", bytes: Math.round(used * 0.1) },
      { key: "invoices", label: "Facturen (PDF)", where: "invoices/", bytes: 40_000 },
      { key: "database", label: "Database", where: "kai-aerials.db", bytes: 150_000 },
      { key: "backups", label: "Back-ups", where: "backups/", bytes: 300_000 },
    ],
    other: { bytes: 1_000_000, note: "Bestandssysteem en rest." },
    ...patch,
  };
}
const html = (r: StorageReport) => renderToStaticMarkup(createElement(StorageOverview, { report: r }));

describe("opslagoverzicht", () => {
  it("toont totaal, gebruikt, vrij en een toegankelijke gebruiksbalk", () => {
    const h = html(rapport(42));
    expect(h).toMatch(/420 MB/); // gebruikt
    expect(h).toMatch(/gebruikt van (<!-- -->)?1 GB/);
    expect(h).toMatch(/580 MB<\/span> vrij/);
    expect(h).toMatch(/role="meter"/);
    expect(h).toMatch(/aria-valuenow="42"/);
    expect(h).toMatch(/aria-valuetext="42 procent gebruikt, 580 MB vrij"/);
    expect(h).toMatch(/Meting vernieuwen/);
  });

  it("toont alle vijf onderdelen plus de overige ruimte", () => {
    const h = html(rapport(42));
    for (const t of ["Opleverbestanden (originelen)", "Voorbeelden met watermerk", "Facturen (PDF)", "Database", "Back-ups", "Overig"]) {
      expect(h).toContain(t);
    }
  });

  it("geeft onder 80% geen melding", () => {
    const h = html(rapport(79.9));
    expect(h).not.toMatch(/Let op: het volume/);
    expect(h).not.toMatch(/Dringend/);
    expect(h).toMatch(/bg-emerald-400/);
  });

  it("waarschuwt vanaf 80% (geel), nog niet dringend", () => {
    const h = html(rapport(80));
    expect(h).toMatch(/Let op: het volume is voor 80% vol/);
    expect(h).not.toMatch(/Dringend/);
    expect(h).toMatch(/bg-amber-400/);
    expect(h).toMatch(/Er wordt niets\s+automatisch verwijderd/);
  });

  it("blijft op 89,9% een waarschuwing", () => {
    const h = html(rapport(89.9));
    expect(h).toMatch(/Let op/);
    expect(h).not.toMatch(/Dringend/);
  });

  it("meldt vanaf 90% dringend (rood) en legt de uploadreserve uit", () => {
    const h = html(rapport(90));
    expect(h).toMatch(/Dringend: het volume is voor 90% vol/);
    expect(h).toMatch(/bg-rose-500/);
    expect(h).toMatch(/reserve van 100 MB/);
    expect(h).toMatch(/Dit gebeurt niet\s+automatisch/);
    expect(h).toMatch(/role="alert"/);
  });

  it("blijft werken op een volledig volume (100%)", () => {
    const h = html(rapport(100));
    expect(h).toMatch(/Dringend/);
    expect(h).toMatch(/aria-valuenow="100"/);
  });

  it("toont een meetfout als fout en niet als getal", () => {
    const r = rapport(30);
    r.parts[0] = { ...r.parts[0], bytes: null, error: "EACCES (permission denied)" };
    r.other = { bytes: null, note: "Niet te bepalen: niet alle onderdelen zijn volledig gemeten." };
    const h = html(r);
    expect(h).toMatch(/niet gemeten/);
    expect(h).toMatch(/Meetfout: EACCES/);
    expect(h).toMatch(/Niet te bepalen: niet alle onderdelen/);
  });

  it("markeert een onderbroken meting als 'minstens'", () => {
    const r = rapport(30);
    r.parts[0] = { ...r.parts[0], bytes: 5_000_000, partial: true, error: "te veel bestanden om te tellen" };
    const h = html(r);
    expect(h).toMatch(/minstens/);
    expect(h).toMatch(/Meting niet volledig: te veel bestanden/);
  });

  it("toont geen balk en geen percentage als het volume zelf niet te meten is", () => {
    const r = rapport(10, { volume: null, volumeError: "Het volume is niet uit te lezen: ENOENT", separateVolume: null });
    const h = html(r);
    expect(h).toMatch(/Het volume is niet uit te lezen/);
    expect(h).not.toMatch(/role="meter"/);
    expect(h).not.toMatch(/% vol/);
  });

  it("waarschuwt als de map niet op een eigen volume staat", () => {
    const h = html(rapport(20, { separateVolume: false }));
    expect(h).toMatch(/niet op een eigen volume/);
  });
});
