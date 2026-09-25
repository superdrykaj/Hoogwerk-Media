import Link from "next/link";

import { toggleMessageAction } from "@/app/actions/admin";
import { QuickBookingActions } from "@/components/admin/quick-booking-actions";
import { Panel } from "@/components/admin/ui";
import { formatTimestamp } from "@/lib/time";
import { STATUS_LABELS, type Booking, type ContactMessage } from "@/lib/types";

/**
 * Eén plek voor alles wat nu actie vraagt, in plaats van dat verspreid over
 * losse meldingen en tellers op het overzicht. Oudste aanvraag/bericht
 * bovenaan: dat is meestal degene die het langst wacht op een reactie.
 */
export function ActionRequired({
  pendingBookings,
  unreadMessages,
  conflictCount,
  mailReady,
}: {
  pendingBookings: Booking[];
  unreadMessages: ContactMessage[];
  conflictCount: number;
  mailReady: boolean;
}) {
  const total = pendingBookings.length + unreadMessages.length + conflictCount + (mailReady ? 0 : 1);

  if (total === 0) {
    return (
      <Panel title="Actie vereist">
        <p className="text-sm text-mist-500">
          Niets dat op je wacht. Nieuwe aanvragen en berichten verschijnen hier
          vanzelf.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Actie vereist"
      description={`${total} ${total === 1 ? "item vraagt" : "items vragen"} nu je aandacht.`}
    >
      <ul className="space-y-3">
        {!mailReady && (
          <li className="notice notice-warning flex flex-wrap items-center justify-between gap-3">
            <span>E-mail is nog niet ingesteld: aanvragen sturen geen bevestiging.</span>
            <Link href="/admin/instellingen" className="btn btn-quiet shrink-0">
              Instellen
            </Link>
          </li>
        )}

        {conflictCount > 0 && (
          <li className="notice notice-warning flex flex-wrap items-center justify-between gap-3">
            <span>
              {conflictCount} {conflictCount === 1 ? "boeking valt" : "boekingen vallen"} buiten je
              huidige beschikbaarheid.
            </span>
            <Link href="/admin/boekingen" className="btn btn-quiet shrink-0">
              Bekijken
            </Link>
          </li>
        )}

        {pendingBookings.map((booking) => (
          <li
            key={`booking-${booking.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {booking.name} — {booking.serviceName}
              </p>
              <p className="mt-0.5 text-xs text-mist-500">
                {STATUS_LABELS[booking.status]} sinds {formatTimestamp(booking.createdUtc)}
              </p>
            </div>
            <QuickBookingActions id={booking.id} />
          </li>
        ))}

        {unreadMessages.map((message) => (
          <li
            key={`message-${message.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{message.subject}</p>
              <p className="mt-0.5 text-xs text-mist-500">
                {message.name} · {formatTimestamp(message.createdUtc)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href="/admin/berichten?status=open" className="btn btn-quiet">
                Bekijken
              </Link>
              <form action={toggleMessageAction}>
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="handled" value="true" />
                <button type="submit" className="btn btn-quiet">
                  Afgehandeld
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
