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
        <p
          role="status"
          className={`notice mt-4 ${
            state.status === "success"
              ? "notice-success"
              : state.status === "warning"
                ? "notice-warning"
                : "notice-error"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
