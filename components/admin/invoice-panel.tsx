"use client";

import { useActionState } from "react";

import {
  addDeliveryFileAction,
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

  const [draftState, draftAction, draftPending] = useActionState<ActionState, FormData>(
    saveInvoiceDraftAction,
    emptyActionState,
  );
  const [paymentState, paymentAction, paymentPending] = useActionState<ActionState, FormData>(
    sendPaymentRequestAction,
    emptyActionState,
  );
  const [fileState, fileAction, filePending] = useActionState<ActionState, FormData>(
    addDeliveryFileAction,
    emptyActionState,
  );
  const [deliveryState, deliveryAction, deliveryPending] = useActionState<ActionState, FormData>(
    sendDeliveryAction,
    emptyActionState,
  );

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
            <form action={fileAction} className="mt-3 flex flex-wrap items-center gap-3">
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="file" name="file" required className="text-sm text-mist-300" />
              <button type="submit" className="btn btn-quiet" disabled={filePending}>
                {filePending ? "Bezig…" : "Toevoegen"}
              </button>
            </form>
            {fileState.status !== "idle" && (
              <p
                className={`notice mt-2 ${fileState.status === "error" ? "notice-error" : "notice-success"}`}
                role="status"
              >
                {fileState.message}
              </p>
            )}
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
