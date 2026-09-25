"use client";

import { useActionState, useState } from "react";

import { sendTestMailAction } from "@/app/actions/admin";
import { emptyActionState, type ActionState } from "@/lib/form-state";

/**
 * Stuurt een proefbericht naar een zelf gekozen adres. Zo zie je meteen of de
 * SMTP-gegevens kloppen, zonder dat je daarvoor een aanvraag hoeft te doen.
 */
export function TestMailForm({ defaultTo }: { defaultTo: string }) {
  const [state, formAction, bezig] = useActionState<ActionState, FormData>(
    sendTestMailAction,
    emptyActionState,
  );
  const [to, setTo] = useState(defaultTo);

  return (
    <form action={formAction} className="mt-5">
      <label htmlFor="testmail-to" className="field-label">
        Proefbericht sturen naar
      </label>
      <div className="mt-1 flex flex-wrap items-start gap-3">
        <input
          id="testmail-to"
          name="to"
          type="email"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="field-input sm:max-w-sm"
          autoComplete="email"
        />
        <button type="submit" className="btn btn-ghost" disabled={bezig}>
          {bezig ? "Bezig met versturen…" : "Versturen"}
        </button>
      </div>

      {state.status !== "idle" && (
        <div
          role="status"
          className={`notice mt-4 ${
            state.status === "success"
              ? "notice-success"
              : state.status === "warning"
                ? "notice-warning"
                : "notice-error"
          }`}
        >
          <p className="whitespace-pre-line">{state.message}</p>
          {state.details && state.details.length > 0 && (
            <>
              <p className="mt-4 font-semibold">Wat je eraan kunt doen</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                {state.details.map((regel) => (
                  <li key={regel}>{regel}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </form>
  );
}
