"use client";

import { useMemo, useState } from "react";

import {
  dateKeyOf,
  formatMinutes,
  minutesOfDayOf,
  todayKey,
} from "@/lib/time";
import { STATUS_LABELS, type Booking } from "@/lib/types";

export type BookingView = "list" | "calendar";

/**
 * Knoppen om te wisselen tussen de lijst en de agenda. Staat hier zodat de
 * boekingenpagina en het overzicht er precies hetzelfde uitzien.
 */
export function ViewToggle({
  view,
  onChange,
}: {
  view: BookingView;
  onChange: (view: BookingView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Weergave"
      className="flex shrink-0 gap-1 rounded-full border border-ink-600 p-1"
    >
      <ViewButton
        active={view === "list"}
        onClick={() => onChange("list")}
        label="Lijst"
      />
      <ViewButton
        active={view === "calendar"}
        onClick={() => onChange("calendar")}
        label="Agenda"
      />
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
        active ? "bg-ink-800 font-semibold text-mist-100" : "text-mist-500"
      }`}
    >
      {label}
    </button>
  );
}


/**
 * Maandagenda met de boekingen erin.
 *
 * Staat apart omdat twee plekken hem gebruiken: de boekingenpagina, waar een
 * klik de afspraak in de lijst eronder opent, en het overzicht, waar een klik
 * doorgaat naar die pagina. Wat er bij een klik gebeurt, geeft de aanroeper
 * mee via `onPick`.
 */
export function BookingCalendar({
  bookings,
  onPick,
}: {
  bookings: Booking[];
  onPick: (id: number) => void;
}) {
  const [monthStart, setMonthStart] = useState(() => {
    const today = todayKey();
    return `${today.slice(0, 7)}-01`;
  });

  const [year, month] = monthStart.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Maandag als eerste kolom.
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const key = dateKeyOf(booking.startUtc);
      map.set(key, [...(map.get(key) ?? []), booking]);
    }
    return map;
  }, [bookings]);

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1));
    setMonthStart(
      `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`,
    );
  }

  const today = todayKey();

  return (
    <div className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <button type="button" className="btn btn-quiet" onClick={() => shiftMonth(-1)}>
          ← Vorige maand
        </button>
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
          {new Intl.DateTimeFormat("nl-NL", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(Date.UTC(year, month - 1, 1)))}
        </p>
        <button type="button" className="btn btn-quiet" onClick={() => shiftMonth(1)}>
          Volgende maand →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-mist-600">
        {["ma", "di", "wo", "do", "vr", "za", "zo"].map((day) => (
          <div key={day} className="pb-1 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const items = (byDate.get(dateKey) ?? []).sort(
            (a, b) => a.startUtc - b.startUtc,
          );
          return (
            <div
              key={dateKey}
              className={`min-h-24 rounded-lg border p-1.5 text-left ${
                dateKey === today
                  ? "border-haze-500/60 bg-haze-600/5"
                  : "border-ink-700 bg-ink-900/60"
              }`}
            >
              <span className="block text-xs tabular-nums text-mist-500">{i + 1}</span>
              <ul className="mt-1 space-y-1">
                {items.map((booking) => (
                  <li key={booking.id}>
                    <button
                      type="button"
                      onClick={() => onPick(booking.id)}
                      className={`w-full truncate rounded px-1.5 py-1 text-left text-[11px] leading-tight ${
                        booking.status === "confirmed"
                          ? "bg-emerald-500/15 text-emerald-200"
                          : booking.status === "pending"
                            ? "bg-amber-500/15 text-amber-200"
                            : "bg-ink-800 text-mist-500 line-through"
                      }`}
                      title={`${booking.name} — ${STATUS_LABELS[booking.status]}`}
                    >
                      {formatMinutes(minutesOfDayOf(booking.startUtc))} {booking.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-mist-600">
        Klik op een afspraak om de details in de lijst te openen. Tijden in
        Europe/Amsterdam.
      </p>
    </div>
  );
}
