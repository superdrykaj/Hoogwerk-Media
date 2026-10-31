import { StorageRefreshButton } from "@/components/admin/storage-refresh-button";
import {
  URGENT_PERCENT,
  WARN_PERCENT,
  defaultReserveBytes,
  formatBytes,
  usageLevel,
  type StorageLevel,
} from "@/lib/storage-level";
import type { StoragePart, StorageReport } from "@/lib/storage-usage";

const BAR_COLOR: Record<StorageLevel, string> = {
  ok: "bg-emerald-400",
  warn: "bg-amber-400",
  urgent: "bg-rose-500",
};

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(ts));
}

/**
 * Het opslagoverzicht van het datavolume. Toont alleen wat gemeten is; waar een
 * meting niet lukt, staat de fout in beeld en geen getal. Er wordt niets
 * automatisch verwijderd of vergroot.
 */
export function StorageOverview({ report }: { report: StorageReport }) {
  const { volume } = report;
  const level: StorageLevel | null = volume ? usageLevel(volume.percent) : null;
  const percent = volume ? Math.min(100, Math.max(0, volume.percent)) : 0;

  return (
    <div className="space-y-6">
      {report.volumeError && (
        <p className="notice notice-error" role="alert">
          {report.volumeError} De gebruiksbalk kan daarom niet worden getoond. De
          onderdelen hieronder zijn wel afzonderlijk gemeten, voor zover dat lukte.
        </p>
      )}

      {report.separateVolume === false && (
        <p className="notice notice-warning" role="status">
          De gegevensmap ({report.dataDir}) staat niet op een eigen volume, maar op de
          systeemschijf van de machine. De cijfers hieronder gelden voor die schijf. Op
          de live site hoort dit een gekoppeld Fly-volume te zijn.
        </p>
      )}

      {level === "urgent" && volume && (
        <p className="notice notice-error" role="alert">
          <strong>Dringend: het volume is voor {Math.round(volume.percent)}% vol.</strong> Er is nog{" "}
          {formatBytes(volume.freeBytes)} vrij. Nieuwe opleverbestanden worden geweigerd zodra
          de vrije ruimte onder de reserve van {formatBytes(defaultReserveBytes(volume.usableBytes))}{" "}
          komt, omdat een vol volume ook boekingen en facturen kan blokkeren. Verwijder oude
          opleverbestanden (Beheer → Boekingen) of vergroot het volume. Dit gebeurt niet
          automatisch.
        </p>
      )}
      {level === "warn" && volume && (
        <p className="notice notice-warning" role="status">
          <strong>Let op: het volume is voor {Math.round(volume.percent)}% vol</strong> (meer dan{" "}
          {WARN_PERCENT}%). Er is nog {formatBytes(volume.freeBytes)} vrij. Ruim opleverbestanden
          op die de klant al heeft gedownload, of vergroot het volume. Er wordt niets
          automatisch verwijderd.
        </p>
      )}

      {volume && level && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-mist-300">
              <span className="text-2xl font-semibold text-mist-100">{formatBytes(volume.usedBytes)}</span>{" "}
              gebruikt van {formatBytes(volume.usableBytes)}
            </p>
            <p className="text-sm text-mist-300">
              <span className="font-semibold text-mist-100">{formatBytes(volume.freeBytes)}</span> vrij ·{" "}
              {volume.percent.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}%
            </p>
          </div>
          <div
            role="meter"
            aria-label="Gebruikte ruimte op het datavolume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            aria-valuetext={`${Math.round(percent)} procent gebruikt, ${formatBytes(volume.freeBytes)} vrij`}
            className="relative mt-3 h-4 overflow-hidden rounded-full bg-ink-700"
          >
            <div className={`h-full ${BAR_COLOR[level]}`} style={{ width: `${percent}%` }} />
            {/* Streepjes bij de drempels van 80% en 90%. */}
            <span aria-hidden="true" className="absolute inset-y-0 w-px bg-ink-950/70" style={{ left: `${WARN_PERCENT}%` }} />
            <span aria-hidden="true" className="absolute inset-y-0 w-px bg-ink-950/70" style={{ left: `${URGENT_PERCENT}%` }} />
          </div>
          <p className="field-hint mt-2">
            Waarschuwing vanaf {WARN_PERCENT}%, dringend vanaf {URGENT_PERCENT}%.
            {volume.reservedBytes > volume.usableBytes * 0.02 &&
              ` Daarnaast houdt het bestandssysteem ${formatBytes(volume.reservedBytes)} voor zichzelf.`}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-mist-100">Waar de ruimte aan opgaat</h3>
        <ul className="mt-3 divide-y divide-ink-700 rounded-xl border border-ink-700">
          {[...report.parts, otherAsPart(report)].map((p) => (
            <PartRow key={p.key} part={p} usable={volume?.usableBytes ?? null} />
          ))}
        </ul>
        <p className="field-hint mt-2">
          Gemeten zoals het bestandssysteem de ruimte echt toekent (net als <code>du</code>).
          Back-ups staan op hetzelfde volume en beschermen dus niet tegen verlies van het
          volume zelf; zie docs/BACKUP.md.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <StorageRefreshButton />
        <p className="text-xs text-mist-500">Gemeten op {formatTime(report.measuredAt)}</p>
      </div>
    </div>
  );
}

function otherAsPart(report: StorageReport): StoragePart {
  return {
    key: "other",
    label: "Overig",
    where: "",
    bytes: report.other.bytes,
    note: report.other.bytes === null ? undefined : report.other.note,
    error: report.other.bytes === null ? report.other.note : undefined,
  };
}

function PartRow({ part, usable }: { part: StoragePart; usable: number | null }) {
  const share = part.bytes !== null && usable ? Math.min(100, (part.bytes / usable) * 100) : null;
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="text-sm text-mist-100">{part.label}</p>
          {part.where && <p className="text-xs text-mist-600">{part.where}</p>}
        </div>
        <p className="text-sm tabular-nums text-mist-100">
          {part.bytes === null ? (
            <span className="text-rose-300">niet gemeten</span>
          ) : (
            <>
              {part.partial && <span className="text-amber-300">minstens </span>}
              {formatBytes(part.bytes)}
              {share !== null && (
                <span className="ml-2 text-xs text-mist-500">
                  {share < 0.1 && part.bytes > 0 ? "<0,1" : share.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}%
                </span>
              )}
            </>
          )}
        </p>
      </div>
      {share !== null && (
        <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
          <div className="h-full bg-haze-400/70" style={{ width: `${Math.max(share, part.bytes ? 0.5 : 0)}%` }} />
        </div>
      )}
      {part.error && (
        <p className="mt-1.5 text-xs text-rose-300" role="status">
          {part.bytes === null ? "Meetfout" : "Meting niet volledig"}: {part.error}
        </p>
      )}
      {part.note && <p className="mt-1.5 text-xs text-mist-500">{part.note}</p>}
    </li>
  );
}
