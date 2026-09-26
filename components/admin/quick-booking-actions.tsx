"use client";

import { useActionState } from "react";

import { updateBookingStatusAction } from "@/app/actions/admin";
import { emptyActionState, type ActionState } from "@/lib/form-state";

/**
 * Bevestigen/afwijzen zonder eerst naar de boekingenpagina te hoeven: de
 * aanvraag zelf blijft daar de plek voor alle details, dit is alleen de
 * snelle route voor de twee acties die vrijwel altijd volgen.
 */
export function QuickBookingActions({ id }: { id: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateBookingStatusAction,
    emptyActionState,
  );

  if (state.status === "success" || state.status === "warning") {
    return (
      <p className="text-xs text-mist-500" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {state.status === "error" && (
        <p className="w-full text-xs text-rose-300" role="status">
          {state.message}
        </p>
      )}
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="confirmed" />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-quiet border-emerald-500/40 text-emerald-300"
        >
          Bevestigen
        </button>
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="rejected" />
        <button type="submit" disabled={pending} className="btn btn-quiet text-rose-300">
          Afwijzen
        </button>
      </form>
    </div>
  );
}
