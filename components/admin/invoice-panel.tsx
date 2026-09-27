"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  deleteDeliveryFileAction,
  refreshInvoicePaymentStatusAction,
  saveInvoiceDraftAction,
  sendDeliveryAction,
  sendPaymentRequestAction,
  setRevisionRequestStatusAction,
} from "@/app/actions/admin";
import { formatAmountCents } from "@/lib/currency";
import { emptyActionState, type ActionState } from "@/lib/form-state";
import { formatTimestamp } from "@/lib/time";
import type { Invoice, InvoiceFile, InvoiceStatus, RevisionRequest } from "@/lib/types";

type UploadResult = { ok: boolean; error?: string; cancelled?: boolean; networkError?: boolean };

/**
 * Letterlijk dezelfde tekst als de catch-fout in lib/deliveries.ts
 * (saveDeliveryFileStream). Komt deze terug, dan is de schrijf-stream
 * halverwege afgebroken — dat rekenen we bij het automatisch opnieuw
 * proberen tot dezelfde categorie als een kale netwerkfout.
 */
const GENERIC_SERVER_ERROR = "Uploaden is mislukt. Probeer het nog eens.";

/**
 * Uploadt rechtstreeks naar de streaming-route (zie
 * app/api/admin/opleverbestand/route.ts) via XMLHttpRequest in plaats van
 * fetch, puur om de voortgang te kunnen tonen bij een grote video — fetch
 * geeft daar geen voortgangsevents voor.
 *
 * `registerXhr` geeft de aanroeper de xhr terug zodra hij bestaat, zodat een
 * lopende upload geannuleerd kan worden (zie cancelItem in InvoicePanel).
 */
function uploadDeliveryFile(
  invoiceId: number,
  file: File,
  onProgress: (percent: number) => void,
  registerXhr: (xhr: XMLHttpRequest) => void,
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/opleverbestand?invoiceId=${invoiceId}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch {
        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          error: "Onverwacht antwoord van de server.",
        });
      }
    };
    // Een verbroken verbinding (bijv. door een trage of wegvallende upload)
    // komt hier binnen zonder antwoord van de server — dat onderscheiden we
    // van een fout die de server wél expliciet teruggaf, zodat alleen deze
    // categorie automatisch opnieuw geprobeerd wordt.
    xhr.onerror = () =>
      resolve({ ok: false, error: "Uploaden mislukt door een netwerkfout.", networkError: true });
    xhr.onabort = () => resolve({ ok: false, cancelled: true });
    registerXhr(xhr);
    xhr.send(file);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type DeliveryInfo = {
  invoice: Invoice | null;
  files: InvoiceFile[];
  revisions: RevisionRequest[];
};

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Concept",
  sent: "Verstuurd",
  paid: "Betaald",
  cancelled: "Geannuleerd",
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Hoeveel keer een upload die op een netwerkfout stukliep automatisch opnieuw geprobeerd wordt. */
const MAX_ATTEMPTS = 3;

type QueueStatus = "queued" | "uploading" | "done" | "error" | "cancelled";

type QueueItem = {
  id: string;
  file: File;
  percent: number;
  status: QueueStatus;
  error?: string;
  attempts: number;
};

/**
 * Sectie binnen een bevestigde boeking om de eindproducten en de factuur op
 * te leveren. Zie components/admin/bookings-manager.tsx voor waar dit wordt
 * ingevoegd.
 */
export function InvoicePanel({
  bookingId,
  info,
  mollieReady,
}: {
  bookingId: number;
  info: DeliveryInfo;
  mollieReady: boolean;
}) {
  const { invoice, files, revisions } = info;
  const router = useRouter();

  const [draftState, draftAction, draftPending] = useActionState<ActionState, FormData>(
    saveInvoiceDraftAction,
    emptyActionState,
  );
  const [paymentState, paymentAction, paymentPending] = useActionState<ActionState, FormData>(
    sendPaymentRequestAction,
    emptyActionState,
  );
  const [deliveryState, deliveryAction, deliveryPending] = useActionState<ActionState, FormData>(
    sendDeliveryAction,
    emptyActionState,
  );

  // Wachtrij van uploads: meerdere bestanden tegelijk kiezen mag, maar ze
  // gaan één voor één omhoog — bij een trage verbinding maakt gelijktijdig
  // versturen het alleen maar trager en foutgevoeliger. `itemsRef` is de
  // bron van waarheid voor processQueue (een lopende while-lus, die de
  // laatste stand synchroon moet kunnen lezen); `items`-state bestaat enkel
  // om te renderen en wordt bij elke wijziging meteen mee bijgewerkt. Een
  // `useEffect` om itemsRef te spiegelen zou hier niet werken: die loopt pas
  // ná de eerstvolgende render, terwijl processQueue direct na het in de
  // wachtrij zetten van een bestand al de actuele lijst nodig heeft.
  const [items, setItems] = useState<QueueItem[]>([]);
  const itemsRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);
  const xhrByIdRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  function commitItems(next: QueueItem[]) {
    itemsRef.current = next;
    setItems(next);
  }

  function updateItem(id: string, patch: Partial<QueueItem>) {
    commitItems(itemsRef.current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function processQueue(invoiceId: number) {
    if (processingRef.current) return;
    processingRef.current = true;
    let uploadedAny = false;
    try {
      while (true) {
        const next = itemsRef.current.find((item) => item.status === "queued");
        if (!next) break;
        updateItem(next.id, { status: "uploading", percent: 0, error: undefined });
        const result = await uploadDeliveryFile(
          invoiceId,
          next.file,
          (percent) => updateItem(next.id, { percent }),
          (xhr) => xhrByIdRef.current.set(next.id, xhr),
        );
        xhrByIdRef.current.delete(next.id);

        if (result.cancelled) {
          updateItem(next.id, { status: "cancelled" });
          continue;
        }
        if (result.ok) {
          updateItem(next.id, { status: "done", percent: 100 });
          uploadedAny = true;
          continue;
        }
        const attempts = (itemsRef.current.find((item) => item.id === next.id)?.attempts ?? 0) + 1;
        // Naast een echte netwerkfout (geen antwoord van de server) tellen we
        // ook de generieke serverfout als tijdelijk: die betekent dat de
        // schrijf-stream halverwege is afgebroken, wat bij een trage
        // verbinding vaker gebeurt en bij een nieuwe poging vaak wél lukt. De
        // specifieke foutmeldingen (bestand te groot, type niet ondersteund)
        // zijn wél definitief en worden niet automatisch herhaald.
        const isTransient = result.networkError || result.error === GENERIC_SERVER_ERROR;
        if (isTransient && attempts < MAX_ATTEMPTS) {
          // Terug de wachtrij in, met een oplopende pauze — een wegvallende
          // verbinding herstelt zich meestal na een paar seconden.
          updateItem(next.id, { status: "queued", attempts, percent: 0 });
          await sleep(attempts * 1500);
          continue;
        }
        updateItem(next.id, {
          status: "error",
          attempts,
          error: result.error ?? GENERIC_SERVER_ERROR,
        });
      }
    } finally {
      processingRef.current = false;
    }
    if (uploadedAny) {
      commitItems(itemsRef.current.filter((item) => item.status !== "done"));
      router.refresh();
    }
  }

  function enqueueFiles(fileList: FileList) {
    if (!invoice) return;
    const newItems: QueueItem[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      percent: 0,
      status: "queued",
      attempts: 0,
    }));
    if (newItems.length === 0) return;
    commitItems([...itemsRef.current, ...newItems]);
    void processQueue(invoice.id);
  }

  function cancelItem(id: string) {
    xhrByIdRef.current.get(id)?.abort();
  }

  function removeItem(id: string) {
    commitItems(itemsRef.current.filter((item) => item.id !== id));
  }

  function retryItem(id: string) {
    if (!invoice) return;
    updateItem(id, { status: "queued", percent: 0, error: undefined, attempts: 0 });
    void processQueue(invoice.id);
  }

  const amountDefault = invoice ? (invoice.amountCents / 100).toFixed(2).replace(".", ",") : "";

  return (
    <div className="border-t border-ink-700 pt-6">
      <h3 className="text-sm font-semibold text-mist-100">Oplevering & factuur</h3>

      {!mollieReady && (
        <p className="notice notice-warning mt-3">
          Mollie is nog niet ingesteld: er kan geen betaallink worden aangemaakt. Zet
          MOLLIE_API_KEY in je omgeving (zie .env.example).
        </p>
      )}

      {/* Bedrag & omschrijving --------------------------------------------- */}
      <form action={draftAction} className="mt-4 space-y-3">
        <input type="hidden" name="bookingId" value={bookingId} />
        {draftState.status !== "idle" && (
          <p
            className={`notice ${draftState.status === "error" ? "notice-error" : "notice-success"}`}
            role="status"
          >
            {draftState.message}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor={`amount-${bookingId}`} className="field-label">
              Bedrag (€)
            </label>
            <input
              id={`amount-${bookingId}`}
              name="amount"
              defaultValue={amountDefault}
              placeholder="250,00"
              inputMode="decimal"
              className="field-input w-32"
            />
          </div>
          <div className="min-w-[16rem] flex-1">
            <label htmlFor={`desc-${bookingId}`} className="field-label">
              Omschrijving
            </label>
            <input
              id={`desc-${bookingId}`}
              name="description"
              defaultValue={invoice?.description ?? ""}
              placeholder="Bijv. Dronefotografie — pakket compleet"
              className="field-input"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-mist-300">
          <input
            type="checkbox"
            name="payBeforeDownload"
            defaultChecked={invoice?.payBeforeDownload ?? true}
          />
          Bestanden pas beschikbaar na betaling (paywall)
        </label>
        <button type="submit" className="btn btn-quiet" disabled={draftPending}>
          {draftPending ? "Bezig…" : "Opslaan"}
        </button>
        {invoice?.invoiceNumber && (
          <p className="field-hint">
            Deze factuur is al verstuurd onder nummer {invoice.invoiceNumber}. Wijzig je het
            bedrag naar aanleiding van een gesprek met de klant, verstuur dan hieronder opnieuw
            een betaalverzoek of oplevering — anders klopt wat je eerder stuurde niet meer met
            het nieuwe bedrag.
          </p>
        )}
      </form>

      {invoice && (
        <>
          {/* Betaalstatus ------------------------------------------------- */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                invoice.status === "paid"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-ink-600 text-mist-500"
              }`}
            >
              {INVOICE_STATUS_LABELS[invoice.status]} · {formatAmountCents(invoice.amountCents, "nl")}
            </span>
            {invoice.invoiceNumber && (
              <>
                <span className="text-mist-500">Factuurnummer {invoice.invoiceNumber}</span>
                <a
                  href={`/api/oplevering/${invoice.token}/factuur`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-haze-300 hover:underline"
                >
                  Bekijk factuur (PDF)
                </a>
              </>
            )}
            {invoice.paidUtc && (
              <span className="text-mist-500">Betaald op {formatTimestamp(invoice.paidUtc)}</span>
            )}
            {invoice.molliePaymentId && invoice.status !== "paid" && (
              <form action={refreshInvoicePaymentStatusAction}>
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <button type="submit" className="btn btn-quiet text-xs">
                  Status verversen
                </button>
              </form>
            )}
          </div>

          {/* Betaalverzoek -------------------------------------------------- */}
          <form action={paymentAction} className="mt-4">
            <input type="hidden" name="bookingId" value={bookingId} />
            {paymentState.status !== "idle" && (
              <p
                className={`notice mt-2 ${paymentState.status === "error" ? "notice-error" : "notice-success"}`}
                role="status"
              >
                {paymentState.message}
              </p>
            )}
            <button
              type="submit"
              className="btn btn-ghost"
              disabled={paymentPending || !mollieReady || invoice.amountCents <= 0}
            >
              {paymentPending ? "Bezig…" : "Betaalverzoek versturen"}
            </button>
            <p className="field-hint">
              Stuurt nu al een betaallink naar de klant, los van de oplevering — zo kan er
              direct na bevestiging betaald worden in plaats van pas bij oplevering.
            </p>
          </form>

          {/* Bestanden ------------------------------------------------------ */}
          <div className="mt-6">
            <h4 className="field-label">Bestanden</h4>
            {files.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-sm">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-ink-700 px-3 py-2"
                  >
                    <span className="min-w-0 truncate">
                      {file.originalName}{" "}
                      <span className="text-mist-600">({formatSize(file.sizeBytes)})</span>
                    </span>
                    <form action={deleteDeliveryFileAction}>
                      <input type="hidden" name="id" value={file.id} />
                      <button type="submit" className="shrink-0 text-xs text-rose-300 hover:underline">
                        Verwijderen
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-mist-500">Nog geen bestanden toegevoegd.</p>
            )}

            {/* Wachtrij: bestanden die net gekozen zijn, bezig zijn of zijn
                stukgelopen. Een gelukte upload verdwijnt hieruit zodra de
                pagina ververst is — dan staat hij in de lijst hierboven. */}
            {items.length > 0 && (
              <ul className="mt-2 space-y-1.5 text-sm">
                {items.map((item) => (
                  <li key={item.id} className="rounded-lg border border-ink-700 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate">
                        {item.file.name}{" "}
                        <span className="text-mist-600">({formatSize(item.file.size)})</span>
                      </span>
                      <div className="flex shrink-0 items-center gap-3 text-xs">
                        {item.status === "uploading" && (
                          <>
                            <span className="numeric text-mist-400">{item.percent}%</span>
                            <button
                              type="button"
                              onClick={() => cancelItem(item.id)}
                              className="text-rose-300 hover:underline"
                            >
                              Annuleren
                            </button>
                          </>
                        )}
                        {item.status === "queued" && (
                          <>
                            <span className="text-mist-500">Wacht op vorige upload</span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-rose-300 hover:underline"
                            >
                              Annuleren
                            </button>
                          </>
                        )}
                        {item.status === "cancelled" && (
                          <>
                            <span className="text-mist-500">Geannuleerd</span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-mist-400 hover:underline"
                            >
                              Wissen
                            </button>
                          </>
                        )}
                        {item.status === "error" && (
                          <>
                            <button
                              type="button"
                              onClick={() => retryItem(item.id)}
                              className="text-haze-300 hover:underline"
                            >
                              Opnieuw proberen
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-mist-400 hover:underline"
                            >
                              Wissen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {(item.status === "uploading" || item.status === "queued") && (
                      <div
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700"
                        role="progressbar"
                        aria-valuenow={item.status === "uploading" ? item.percent : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Voortgang van ${item.file.name}`}
                      >
                        <div
                          className="h-full rounded-full bg-haze-300 transition-[width] duration-200"
                          style={{ width: `${item.status === "uploading" ? item.percent : 0}%` }}
                        />
                      </div>
                    )}
                    {item.status === "error" && item.error && (
                      <p className="mt-1.5 text-xs text-rose-300">{item.error}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3">
              <label className="btn btn-quiet inline-flex cursor-pointer items-center">
                + Bestanden toevoegen
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files && event.target.files.length > 0) {
                      enqueueFiles(event.target.files);
                    }
                    event.target.value = "";
                  }}
                />
              </label>
              <p className="field-hint">
                Meerdere bestanden mag: ze gaan één voor één omhoog. Een upload die door de
                verbinding stukloopt, wordt automatisch een paar keer opnieuw geprobeerd.
              </p>
            </div>
          </div>

          {/* Oplevering versturen -------------------------------------------- */}
          <form action={deliveryAction} className="mt-6 border-t border-ink-700 pt-4">
            <input type="hidden" name="bookingId" value={bookingId} />
            {deliveryState.status !== "idle" && (
              <p
                className={`notice mt-2 ${deliveryState.status === "error" ? "notice-error" : "notice-success"}`}
                role="status"
              >
                {deliveryState.message}
              </p>
            )}
            <button
              type="submit"
              className="btn btn-quiet border-emerald-500/40 text-emerald-300"
              disabled={deliveryPending || files.length === 0}
            >
              {deliveryPending
                ? "Bezig…"
                : invoice.deliverySentUtc
                  ? "Oplevering opnieuw versturen"
                  : "Project afronden & opleveren"}
            </button>
            <p className="field-hint">
              Verstuurt de opleveringslink naar de klant.{" "}
              {invoice.payBeforeDownload
                ? "De bestanden blijven op slot totdat de factuur betaald is."
                : "De bestanden zijn direct te downloaden."}
            </p>
          </form>

          {/* Wijzigingsverzoeken ---------------------------------------------- */}
          {revisions.length > 0 && (
            <div className="mt-6 border-t border-ink-700 pt-4">
              <h4 className="field-label">Wijzigingsverzoeken</h4>
              <ul className="mt-2 space-y-2">
                {revisions.map((revision) => (
                  <li
                    key={revision.id}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      revision.status === "open"
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-ink-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-mist-500">
                        {formatTimestamp(revision.createdUtc)}
                      </span>
                      <form action={setRevisionRequestStatusAction}>
                        <input type="hidden" name="id" value={revision.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={revision.status === "open" ? "done" : "open"}
                        />
                        <button type="submit" className="text-xs text-haze-300 hover:underline">
                          {revision.status === "open" ? "Markeer als afgehandeld" : "Heropenen"}
                        </button>
                      </form>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-mist-200">{revision.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
