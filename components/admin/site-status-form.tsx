"use client";

import { useActionState } from "react";

import { setSiteStatusAction } from "@/app/actions/admin";
import { emptyActionState, type ActionState } from "@/lib/form-state";

/**
 * Knop om de site open of dicht te zetten.
 *
 * Bewust één knop die de stand omzet, met daarboven in gewone taal wat er nu
 * aan de hand is. Twee radioknoppen zouden je laten kiezen tussen twee dingen
 * die je allebei niet kunt zien.
 */
export function SiteStatusForm({ status }: { status: "soon" | "live" }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    setSiteStatusAction,
    emptyActionState,
  );

  const open = status === "live";

  return (
    <form action={action} className="space-y-5">
      {state.status !== "idle" && (
        <p
          className={`notice ${state.status === "error" ? "notice-error" : "notice-success"}`}
          role="status"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-4 rounded-xl border border-ink-700 bg-ink-900 p-5">
        <span
          aria-hidden="true"
          className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
            open ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {open ? "De site staat open" : "De site staat dicht"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-mist-500">
            {open
              ? "Iedereen kan de volledige website zien en zoekmachines mogen hem opnemen."
              : "Bezoekers zien alleen de pagina “binnenkort online”. Jij ziet als ingelogde beheerder nog de hele site, en zoekmachines wordt gevraagd weg te blijven."}
          </p>
        </div>
      </div>

      {/* De gewenste stand is het tegenovergestelde van de huidige. */}
      <input type="hidden" name="status" value={open ? "soon" : "live"} />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={`btn ${open ? "btn-ghost" : "btn-primary"}`}
        >
          {pending
            ? "Bezig…"
            : open
              ? "Site dichtzetten"
              : "Site openzetten"}
        </button>
        <p className="text-xs leading-relaxed text-mist-600">
          Werkt direct. Je hoeft er niets voor uit te rollen.
        </p>
      </div>
    </form>
  );
}
