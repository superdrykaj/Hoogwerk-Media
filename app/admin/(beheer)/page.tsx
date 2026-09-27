import Link from "next/link";

import { ActionRequired } from "@/components/admin/action-required";
import { DashboardBookings } from "@/components/admin/dashboard-bookings";
import { PageHeading, Panel } from "@/components/admin/ui";
import { conflictingBookings } from "@/lib/availability";
import { countBookings, listBookings } from "@/lib/bookings";
import { isMailConfigured, recentMailLog } from "@/lib/mail";
import { countUnhandledMessages, listMessages } from "@/lib/messages";
import { listProjects } from "@/lib/projects";
import { countOpenRevisionRequests } from "@/lib/revisions";
import { formatTimestamp } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const {
    pending,
    confirmed,
    unread,
    openRevisions,
    published,
    all,
    upcoming,
    conflicts,
    mailReady,
    mailLog,
    pendingBookings,
    unreadMessages,
  } = await loadDashboard();
  return renderDashboard({
    pending,
    confirmed,
    unread,
    openRevisions,
    published,
    all,
    upcoming,
    conflicts,
    mailReady,
    mailLog,
    pendingBookings,
    unreadMessages,
  });
}

/** Alle gegevens voor het overzicht ophalen. */
async function loadDashboard() {
  const now = Date.now();
  const pending = countBookings("pending");
  const confirmed = countBookings("confirmed");
  const unread = countUnhandledMessages();
  const openRevisions = countOpenRevisionRequests();
  const projects = listProjects();
  const published = projects.filter((p) => p.published).length;

  // De agenda laat ook eerdere maanden zien, dus die heeft alles nodig.
  const all = listBookings();
  const upcoming = listBookings({ fromUtc: now })
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .slice(0, 6);

  const conflicts = conflictingBookings(now);
  const mailReady = isMailConfigured();
  const mailLog = recentMailLog(5);

  // Oudste eerst: dat is degene die het langst op een reactie wacht.
  const pendingBookings = listBookings({ status: "pending" }).sort(
    (a, b) => a.createdUtc - b.createdUtc,
  );
  const unreadMessages = listMessages()
    .filter((m) => !m.handled)
    .sort((a, b) => a.createdUtc - b.createdUtc);

  return {
    pending,
    confirmed,
    unread,
    openRevisions,
    published,
    all,
    upcoming,
    conflicts,
    mailReady,
    mailLog,
    pendingBookings,
    unreadMessages,
  };
}

function renderDashboard({
  pending,
  confirmed,
  unread,
  openRevisions,
  published,
  all,
  upcoming,
  conflicts,
  mailReady,
  mailLog,
  pendingBookings,
  unreadMessages,
}: Awaited<ReturnType<typeof loadDashboard>>) {
  return (
    <>
      <PageHeading
        title="Overzicht"
        intro="Wat er nu op je bordje ligt, en hoe de website ervoor staat."
      />

      <div className="mb-8">
        <ActionRequired
          pendingBookings={pendingBookings}
          unreadMessages={unreadMessages}
          conflictCount={conflicts.length}
          mailReady={mailReady}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open aanvragen" value={pending} href="/admin/boekingen?status=pending" highlight={pending > 0} />
        <Stat label="Bevestigde afspraken" value={confirmed} href="/admin/boekingen?status=confirmed" />
        <Stat label="Nieuwe berichten" value={unread} href="/admin/berichten?status=open" highlight={unread > 0} />
        <Stat label="Gepubliceerde projecten" value={published} href="/admin/projecten" />
        <Stat
          label="Openstaande wijzigingsverzoeken"
          value={openRevisions}
          href="/admin/boekingen?status=confirmed"
          highlight={openRevisions > 0}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <DashboardBookings upcoming={upcoming} all={all} />
        </Panel>

        <Panel title="Verzonden e-mail" description="De laatste pogingen om e-mail te versturen.">
          {mailLog.length === 0 ? (
            <p className="text-sm text-mist-500">Nog geen e-mailverkeer.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {mailLog.map((entry, index) => (
                <li key={index} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-mist-300">{entry.subject}</span>
                    <span className="block text-xs text-mist-600">
                      {entry.to_address} · {formatTimestamp(entry.created_utc)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-xs ${
                      entry.status === "sent"
                        ? "text-emerald-300"
                        : entry.status === "failed"
                          ? "text-rose-300"
                          : "text-amber-300"
                    }`}
                  >
                    {entry.status === "sent"
                      ? "verzonden"
                      : entry.status === "failed"
                        ? "mislukt"
                        : "niet verstuurd"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card block p-5 transition-colors hover:border-haze-500/60 ${
        highlight ? "border-haze-500/50" : ""
      }`}
    >
      <p className="text-sm text-mist-500">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums">
        {value}
      </p>
    </Link>
  );
}
