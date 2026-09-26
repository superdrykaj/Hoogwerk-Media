"use client";

import { useActionState, useMemo, useState } from "react";

import {
  deleteBookingAction,
  rescheduleBookingAction,
  saveBookingNoteAction,
  updateBookingStatusAction,
} from "@/app/actions/admin";
import { emptyActionState, type ActionState } from "@/lib/form-state";
import { copy } from "@/content/copy";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { scopeLines } from "@/lib/project-scope";
import {
  BookingCalendar,
  ViewToggle,
  type BookingView,
} from "@/components/admin/booking-calendar";
import { InvoicePanel, type DeliveryInfo } from "@/components/admin/invoice-panel";
import { StatusBadge } from "@/components/admin/ui";
import {
  dateKeyOf,
  formatDateLong,
  formatMinutes,
  formatTimestamp,
  minutesOfDayOf,
} from "@/lib/time";
import { STATUS_LABELS, type Booking, type BookingStatus } from "@/lib/types";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Alles" },
  { key: "pending", label: "Aangevraagd" },
  { key: "confirmed", label: "Bevestigd" },
  { key: "rejected", label: "Afgewezen" },
  { key: "cancelled", label: "Geannuleerd" },
];

export function BookingsManager({
  bookings,
  initialStatus,
  initialOpenId = null,
  conflictIds,
  mailReady,
  mollieReady,
  deliveryByBooking,
}: {
  bookings: Booking[];
  initialStatus: string;
  /** Meteen openklappen, voor een link vanaf het overzicht. */
  initialOpenId?: number | null;
  conflictIds: number[];
  mailReady: boolean;
  mollieReady: boolean;
  deliveryByBooking: Record<number, DeliveryInfo>;
}) {
  const [view, setView] = useState<BookingView>("list");
  const [filter, setFilter] = useState(initialStatus);
  const [openId, setOpenId] = useState<number | null>(initialOpenId);

  const shown = useMemo(
    () =>
      filter === "all" ? bookings : bookings.filter((b) => b.status === filter),
    [bookings, filter],
  );

  const conflictSet = useMemo(() => new Set(conflictIds), [conflictIds]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter op status" className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const count =
              item.key === "all"
                ? bookings.length
                : bookings.filter((b) => b.status === item.key).length;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                aria-pressed={filter === item.key}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  filter === item.key
                    ? "border-haze-500 bg-haze-600/15 text-haze-300"
                    : "border-ink-600 text-mist-500 hover:text-mist-100"
                }`}
              >
                {item.label}
                <span className="ml-2 text-xs text-mist-600">{count}</span>
              </button>
            );
          })}
        </div>

        <ViewToggle view={view} onChange={setView} />
      </div>

      {!mailReady && (
        <p className="notice notice-warning mb-5">
          E-mail is niet ingesteld: als je bevestigt of annuleert, krijgt de klant
          géén automatisch bericht. Neem zelf contact op.
        </p>
      )}

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-600 px-6 py-16 text-center">
          <p className="font-semibold">Geen boekingen in deze weergave</p>
          <p className="mt-2 text-sm text-mist-500">
            Pas het filter aan of wacht op nieuwe aanvragen.
          </p>
        </div>
      ) : view === "list" ? (
        <ul className="space-y-3">
          {shown.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              open={openId === booking.id}
              onToggle={() => setOpenId(openId === booking.id ? null : booking.id)}
              conflict={conflictSet.has(booking.id)}
              mollieReady={mollieReady}
              delivery={deliveryByBooking[booking.id]}
            />
          ))}
        </ul>
      ) : (
        <BookingCalendar
          bookings={shown}
          onPick={(id) => {
            setView("list");
            setOpenId(id);
          }}
        />
      )}
    </div>
  );
}
function BookingRow({
  booking,
  open,
  onToggle,
  conflict,
  mollieReady,
  delivery,
}: {
  booking: Booking;
  open: boolean;
  onToggle: () => void;
  conflict: boolean;
  mollieReady: boolean;
  delivery?: DeliveryInfo;
}) {
  return (
    <li className={`card overflow-hidden ${conflict ? "border-amber-500/50" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left hover:bg-ink-800/50"
      >
        <span className="w-48 shrink-0 text-sm tabular-nums text-mist-300">
          {formatTimestamp(booking.startUtc)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{booking.name}</span>
          <span className="block truncate text-sm text-mist-500">
            {booking.serviceName} · {booking.location || "geen locatie"}
            {booking.scope.extraLocations.length > 0 &&
              ` + ${booking.scope.extraLocations.length} locatie${
                booking.scope.extraLocations.length === 1 ? "" : "s"
              }`}
          </span>
        </span>
        {booking.locale !== "nl" && (
          <span className="chip" title="Aangevraagd op de Engelse versie">
            EN
          </span>
        )}
        <StatusBadge status={booking.status} label={STATUS_LABELS[booking.status]} />
        <span className="font-mono text-xs text-mist-600">{booking.reference}</span>
        <span aria-hidden="true" className="text-mist-600">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {conflict && (
        <p className="border-t border-amber-500/30 bg-amber-500/5 px-4 py-2 text-xs text-amber-300">
          Deze afspraak valt buiten je huidige beschikbaarheid.
        </p>
      )}

      {open && <BookingDetail booking={booking} mollieReady={mollieReady} delivery={delivery} />}
    </li>
  );
}

function BookingDetail({
  booking,
  mollieReady,
  delivery,
}: {
  booking: Booking;
  mollieReady: boolean;
  delivery?: DeliveryInfo;
}) {
  const [statusState, statusAction, statusPending] = useActionState<ActionState, FormData>(
    updateBookingStatusAction,
    emptyActionState,
  );
  const [moveState, moveAction, movePending] = useActionState<ActionState, FormData>(
    rescheduleBookingAction,
    emptyActionState,
  );
  const [noteState, noteAction, notePending] = useActionState<ActionState, FormData>(
    saveBookingNoteAction,
    emptyActionState,
  );

  const dateKey = dateKeyOf(booking.startUtc);
  const time = formatMinutes(minutesOfDayOf(booking.startUtc));
  const scope = scopeLines(
    booking.scope,
    booking.location,
    copy(DEFAULT_LOCALE).scope,
  );

  return (
    <div className="border-t border-ink-700 bg-ink-900/60 p-5">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-mist-100">Gegevens</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Kenmerk" value={booking.reference} />
            <Row label="Dienst" value={booking.serviceName} />
            <Row label="Wanneer" value={`${formatDateLong(dateKey)}, ${time}`} />
            <Row
              label="Duur"
              value={`${Math.round((booking.endUtc - booking.startUtc) / 60000)} minuten`}
            />
            <Row label="Naam" value={booking.name} />
            <Row
              label="E-mail"
              value={
                <a href={`mailto:${booking.email}`} className="text-haze-300 hover:underline">
                  {booking.email}
                </a>
              }
            />
            <Row label="Telefoon" value={booking.phone || "—"} />
            <Row label="Locatie" value={booking.location || "—"} />
            <Row label="Aangevraagd op" value={formatTimestamp(booking.createdUtc)} />
            <Row
              label="Taal"
              value={
                booking.locale === "en"
                  ? "Engels — bevestigingen gaan in het Engels"
                  : "Nederlands"
              }
            />
          </dl>

          {scope.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-mist-100">
                Over het project
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                {scope.map((line) => (
                  <Row
                    key={line.label}
                    label={line.label}
                    value={
                      <span className="whitespace-pre-wrap">{line.value}</span>
                    }
                  />
                ))}
              </dl>
            </>
          )}

          <h3 className="mt-6 text-sm font-semibold text-mist-100">Projectomschrijving</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-lg border border-ink-700 bg-ink-900 p-3 text-sm text-mist-300">
            {booking.description || "—"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Status wijzigen ------------------------------------------------ */}
          <div>
            <h3 className="text-sm font-semibold text-mist-100">Status</h3>
            {statusState.status !== "idle" && (
              <p
                className={`notice mt-3 ${
                  statusState.status === "error" ? "notice-error" : "notice-success"
                }`}
                role="status"
              >
                {statusState.message}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {(["confirmed", "rejected", "cancelled", "pending"] as BookingStatus[])
                .filter((s) => s !== booking.status)
                .map((status) => (
                  <form key={status} action={statusAction}>
                    <input type="hidden" name="id" value={booking.id} />
                    <input type="hidden" name="status" value={status} />
                    <button
                      type="submit"
                      disabled={statusPending}
                      className={`btn btn-quiet ${
                        status === "confirmed" ? "border-emerald-500/40 text-emerald-300" : ""
                      }`}
                    >
                      {status === "confirmed" && "Bevestigen"}
                      {status === "rejected" && "Afwijzen"}
                      {status === "cancelled" && "Annuleren"}
                      {status === "pending" && "Terug naar aangevraagd"}
                    </button>
                  </form>
                ))}
            </div>
            <p className="field-hint">
              Bij afwijzen of annuleren komt het tijdslot weer vrij voor anderen.
            </p>
          </div>

          {/* Verplaatsen ---------------------------------------------------- */}
          <form action={moveAction}>
            <h3 className="text-sm font-semibold text-mist-100">Verplaatsen</h3>
            {moveState.status !== "idle" && (
              <p
                className={`notice mt-3 ${
                  moveState.status === "error" ? "notice-error" : "notice-success"
                }`}
                role="status"
              >
                {moveState.message}
              </p>
            )}
            <input type="hidden" name="id" value={booking.id} />
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor={`date-${booking.id}`} className="field-label">
                  Datum
                </label>
                <input
                  id={`date-${booking.id}`}
                  name="dateKey"
                  type="date"
                  defaultValue={dateKey}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor={`time-${booking.id}`} className="field-label">
                  Tijd
                </label>
                <input
                  id={`time-${booking.id}`}
                  name="time"
                  type="time"
                  defaultValue={time}
                  className="field-input"
                />
              </div>
              <button type="submit" className="btn btn-ghost" disabled={movePending}>
                {movePending ? "Bezig…" : "Verplaatsen"}
              </button>
            </div>
            <p className="field-hint">
              Als beheerder mag je buiten je openingstijden plannen. Botsingen met
              andere afspraken worden wel tegengehouden.
            </p>
          </form>

          {/* Notitie -------------------------------------------------------- */}
          <form action={noteAction}>
            <label htmlFor={`note-${booking.id}`} className="field-label">
              Interne notitie
            </label>
            <textarea
              id={`note-${booking.id}`}
              name="note"
              rows={3}
              defaultValue={booking.adminNote}
              className="field-input"
            />
            <input type="hidden" name="id" value={booking.id} />
            <div className="mt-3 flex items-center gap-3">
              <button type="submit" className="btn btn-quiet" disabled={notePending}>
                Notitie opslaan
              </button>
              {noteState.status === "success" && (
                <span className="text-xs text-emerald-300" role="status">
                  {noteState.message}
                </span>
              )}
            </div>
          </form>

          {booking.status === "confirmed" && delivery && (
            <InvoicePanel bookingId={booking.id} info={delivery} mollieReady={mollieReady} />
          )}

          <form action={deleteBookingAction} className="border-t border-ink-700 pt-4">
            <input type="hidden" name="id" value={booking.id} />
            <button type="submit" className="btn btn-quiet text-rose-300">
              Definitief verwijderen
            </button>
            <p className="field-hint">
              Verwijderen kan niet ongedaan worden gemaakt. Annuleren is meestal
              genoeg.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-32 shrink-0 text-mist-500">{label}</dt>
      <dd className="min-w-0 break-words text-mist-200">{value}</dd>
    </div>
  );
}
