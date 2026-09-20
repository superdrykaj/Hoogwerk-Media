"use client";

import { useState } from "react";

import { formatMinutes, WEEKDAY_LABELS } from "@/lib/time";
import type { WeeklyWindow } from "@/lib/types";
import {
  leesPeriode,
  periodeMelding,
  PERIODES_PER_DAG,
} from "@/lib/week-schedule";

/** Maandag eerst; de database telt vanaf zondag. */
const WEEK_VOLGORDE = [1, 2, 3, 4, 5, 6, 0];
const WERKDAGEN = [1, 2, 3, 4, 5];

type Periode = { van: string; tot: string };
type Schema = Record<number, Periode[]>;

function naarSchema(vensters: WeeklyWindow[]): Schema {
  const schema: Schema = {};
  for (const weekday of WEEK_VOLGORDE) {
    schema[weekday] = vensters
      .filter((w) => w.weekday === weekday)
      .slice(0, PERIODES_PER_DAG)
      .map((w) => ({
        van: formatMinutes(w.startMinute),
        tot: formatMinutes(w.endMinute),
      }));
  }
  return schema;
}

/** Korte samenvatting van een dag: hoeveel uur er open staat. */
function dagTotaal(periodes: Periode[]): string {
  let minuten = 0;
  for (const p of periodes) {
    const gelezen = leesPeriode(p.van, p.tot);
    if (gelezen.soort === "ok") minuten += gelezen.eind - gelezen.start;
  }
  if (minuten === 0) return "Niet boekbaar";
  const uren = Math.floor(minuten / 60);
  const rest = minuten % 60;
  if (rest === 0) return `${uren} uur open`;
  return `${uren} uur ${rest} min open`;
}

export function WeekScheduleEditor({
  weekly,
  bezig,
}: {
  weekly: WeeklyWindow[];
  bezig: boolean;
}) {
  const [schema, setSchema] = useState<Schema>(() => naarSchema(weekly));

  // Na een geslaagde opslag komt er een nieuw weekschema binnen; dan volgen we
  // de server. Na een mislukte poging verandert er niets aan de server-kant,
  // zodat de ingevulde waarden blijven staan.
  const vanServer = JSON.stringify(weekly);
  const [laatsteServer, setLaatsteServer] = useState(vanServer);
  if (vanServer !== laatsteServer) {
    setLaatsteServer(vanServer);
    setSchema(naarSchema(weekly));
  }

  function pas(weekday: number, index: number, kant: "van" | "tot", waarde: string) {
    setSchema((vorig) => {
      const dag = [...(vorig[weekday] ?? [])];
      dag[index] = { ...dag[index], [kant]: waarde };
      return { ...vorig, [weekday]: dag };
    });
  }

  function voegToe(weekday: number) {
    setSchema((vorig) => {
      const dag = vorig[weekday] ?? [];
      if (dag.length >= PERIODES_PER_DAG) return vorig;
      return { ...vorig, [weekday]: [...dag, { van: "", tot: "" }] };
    });
  }

  function verwijder(weekday: number, index: number) {
    setSchema((vorig) => ({
      ...vorig,
      [weekday]: (vorig[weekday] ?? []).filter((_, i) => i !== index),
    }));
  }

  function naarWerkdagen(weekday: number) {
    setSchema((vorig) => {
      const bron = (vorig[weekday] ?? []).map((p) => ({ ...p }));
      const volgend = { ...vorig };
      for (const dag of WERKDAGEN) {
        volgend[dag] = bron.map((p) => ({ ...p }));
      }
      return volgend;
    });
  }

  // Alle fouten opsporen, zodat opslaan pas kan als het schema klopt.
  const fouten: { weekday: number; index: number; tekst: string }[] = [];
  for (const weekday of WEEK_VOLGORDE) {
    (schema[weekday] ?? []).forEach((periode, index) => {
      const gelezen = leesPeriode(periode.van, periode.tot);
      if (gelezen.soort === "fout") {
        fouten.push({ weekday, index, tekst: periodeMelding(gelezen.reden) });
      }
    });
  }

  const foutOp = (weekday: number, index: number) =>
    fouten.find((f) => f.weekday === weekday && f.index === index)?.tekst;

  return (
    <div>
      {fouten.length > 0 && (
        <p className="notice notice-error mb-5" role="status">
          {fouten.length === 1
            ? "Er staat nog een fout in je schema. Die is hieronder rood gemarkeerd."
            : `Er staan nog ${fouten.length} fouten in je schema. Die zijn hieronder rood gemarkeerd.`}
        </p>
      )}

      <div className="divide-y divide-ink-700 rounded-xl border border-ink-700">
        {WEEK_VOLGORDE.map((weekday) => {
          const periodes = schema[weekday] ?? [];
          return (
            <div key={weekday} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-sm font-semibold">{WEEKDAY_LABELS[weekday]}</h3>
                <p className="text-xs text-mist-500">{dagTotaal(periodes)}</p>
              </div>

              {periodes.length === 0 ? (
                <p className="mt-2 text-sm text-mist-600">
                  Geen tijden ingesteld, dus deze dag is niet te boeken.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {periodes.map((periode, index) => {
                    const fout = foutOp(weekday, index);
                    const idVan = `d${weekday}-from-${index}`;
                    const idTot = `d${weekday}-to-${index}`;
                    return (
                      <li key={index}>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="sr-only" htmlFor={idVan}>
                            {WEEKDAY_LABELS[weekday]}, periode {index + 1}, begintijd
                          </label>
                          <input
                            id={idVan}
                            name={idVan}
                            type="time"
                            value={periode.van}
                            onChange={(e) => pas(weekday, index, "van", e.target.value)}
                            aria-invalid={fout ? "true" : undefined}
                            aria-describedby={fout ? `${idVan}-fout` : undefined}
                            className="field-input w-32"
                          />
                          <span aria-hidden="true" className="text-mist-600">
                            tot
                          </span>
                          <label className="sr-only" htmlFor={idTot}>
                            {WEEKDAY_LABELS[weekday]}, periode {index + 1}, eindtijd
                          </label>
                          <input
                            id={idTot}
                            name={idTot}
                            type="time"
                            value={periode.tot}
                            onChange={(e) => pas(weekday, index, "tot", e.target.value)}
                            aria-invalid={fout ? "true" : undefined}
                            aria-describedby={fout ? `${idVan}-fout` : undefined}
                            className="field-input w-32"
                          />
                          <button
                            type="button"
                            onClick={() => verwijder(weekday, index)}
                            className="btn btn-quiet"
                          >
                            <span className="sr-only">
                              Periode {index + 1} van {WEEKDAY_LABELS[weekday]} verwijderen
                            </span>
                            <span aria-hidden="true">Verwijderen</span>
                          </button>
                        </div>
                        {fout && (
                          <p id={`${idVan}-fout`} className="field-error">
                            {fout}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {periodes.length < PERIODES_PER_DAG && (
                  <button
                    type="button"
                    onClick={() => voegToe(weekday)}
                    className="btn btn-quiet"
                  >
                    + Periode
                  </button>
                )}
                {periodes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => naarWerkdagen(weekday)}
                    className="btn btn-quiet"
                    title="Deze tijden overnemen voor maandag tot en met vrijdag"
                  >
                    Overnemen voor ma t/m vr
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="field-hint mt-3">
        Een dag zonder periodes is niet te boeken. Per dag kunnen maximaal{" "}
        {PERIODES_PER_DAG} periodes.
      </p>

      <SubmitKnop geblokkeerd={fouten.length > 0} bezig={bezig} />
    </div>
  );
}

function SubmitKnop({
  geblokkeerd,
  bezig,
}: {
  geblokkeerd: boolean;
  bezig: boolean;
}) {
  return (
    <button
      type="submit"
      className="btn btn-primary mt-5"
      disabled={geblokkeerd || bezig}
    >
      {bezig ? "Bezig met opslaan…" : "Weekschema opslaan"}
    </button>
  );
}
