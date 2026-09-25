"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  BookingCalendar,
  ViewToggle,
  type BookingView,
} from "@/components/admin/booking-calendar";
import { EmptyState, StatusBadge } from "@/components/admin/ui";
import { formatTimestamp } from "@/lib/time";
import { STATUS_LABELS, type Booking } from "@/lib/types";

/**
 * De afspraken op het overzicht, als lijst of als agenda.
 *
 * De lijst toont wat er als eerste aankomt; de agenda laat de hele maand zien,
 * inclusief wat al geweest is. Een klik op een afspraak gaat naar de
 * boekingenpagina en opent hem daar meteen.
 */
export function DashboardBookings({
  upcoming,
  all,
}: {
  upcoming: Booking[];
  all: Booking[];
}) {
  const [view, setView] = useState<BookingView>("list");
  const router = useRouter();

  const openen = (id: number) => router.push(`/admin/boekingen?open=${id}`);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          {view === "list" ? "Eerstvolgende afspraken" : "Agenda"}
        </h2>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "calendar" ? (
        <BookingCalendar bookings={all} onPick={openen} />
      ) : upcoming.length === 0 ? (
        <EmptyState
          title="Nog niets gepland"
          body="Zodra iemand een afspraak aanvraagt, verschijnt die hier."
          href="/admin/beschikbaarheid"
          linkLabel="Beschikbaarheid instellen"
        />
      ) : (
        <ul className="divide-y divide-ink-700">
          {upcoming.map((booking) => (
            <li key={booking.id}>
              <button
                type="button"
                onClick={() => openen(booking.id)}
                className="flex w-full flex-wrap items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-ink-800"
              >
                <span className="w-48 shrink-0 text-sm tabular-nums text-mist-300">
                  {formatTimestamp(booking.startUtc)}
                </span>
                <span className="flex-1 text-sm">
                  <span className="font-medium">{booking.name}</span>
                  <span className="text-mist-500"> — {booking.serviceName}</span>
                </span>
                <StatusBadge
                  status={booking.status}
                  label={STATUS_LABELS[booking.status]}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
