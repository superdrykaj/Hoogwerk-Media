"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Meet het volume opnieuw door de pagina opnieuw op te bouwen; er verandert niets aan de bestanden. */
export function StorageRefreshButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-quiet min-h-11"
      disabled={pending}
      onClick={() => start(() => router.refresh())}
    >
      {pending ? "Bezig met meten…" : "Meting vernieuwen"}
    </button>
  );
}
