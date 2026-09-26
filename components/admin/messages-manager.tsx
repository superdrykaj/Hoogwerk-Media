"use client";

import { useMemo, useState } from "react";

import { deleteMessageAction, toggleMessageAction } from "@/app/actions/admin";
import { EmptyState } from "@/components/admin/ui";
import { formatTimestamp } from "@/lib/time";
import type { ContactMessage } from "@/lib/types";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Alles" },
  { key: "open", label: "Open" },
  { key: "handled", label: "Afgehandeld" },
];

export function MessagesManager({
  messages,
  initialStatus,
}: {
  messages: ContactMessage[];
  initialStatus: string;
}) {
  const [filter, setFilter] = useState(initialStatus);

  const shown = useMemo(() => {
    if (filter === "open") return messages.filter((m) => !m.handled);
    if (filter === "handled") return messages.filter((m) => m.handled);
    return messages;
  }, [messages, filter]);

  if (messages.length === 0) {
    return (
      <EmptyState
        title="Nog geen berichten"
        body="Zodra iemand het contactformulier invult, verschijnt het bericht hier."
        href="/contact"
        linkLabel="Bekijk de contactpagina"
      />
    );
  }

  return (
    <div>
      <div role="group" aria-label="Filter op status" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const count =
            item.key === "all"
              ? messages.length
              : messages.filter((m) => (item.key === "open" ? !m.handled : m.handled)).length;
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

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-600 px-6 py-14 text-center">
          <p className="font-semibold">Geen berichten in deze weergave</p>
          <p className="mt-2 text-sm text-mist-500">Pas het filter aan.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((message) => (
            <li
              key={message.id}
              className={`card p-5 ${message.handled ? "opacity-70" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold">{message.subject}</h2>
                  <p className="mt-1 text-sm text-mist-500">
                    {message.name} ·{" "}
                    <a
                      href={`mailto:${message.email}`}
                      className="text-haze-300 hover:underline"
                    >
                      {message.email}
                    </a>{" "}
                    · {formatTimestamp(message.createdUtc)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleMessageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <input
                      type="hidden"
                      name="handled"
                      value={message.handled ? "false" : "true"}
                    />
                    <button type="submit" className="btn btn-quiet">
                      {message.handled ? "Markeer als open" : "Markeer als afgehandeld"}
                    </button>
                  </form>
                  <form action={deleteMessageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <button type="submit" className="btn btn-quiet text-rose-300">
                      Verwijderen
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-lg border border-ink-700 bg-ink-900 p-4 text-sm text-mist-300">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
