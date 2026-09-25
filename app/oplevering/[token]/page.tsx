import type { Metadata } from "next";

import { startInvoicePaymentAction, submitRevisionRequestAction } from "@/app/actions/invoice";
import { getBooking } from "@/lib/bookings";
import { copy } from "@/content/copy";
import { formatAmountCents } from "@/lib/currency";
import { getInvoiceByToken, listInvoiceFiles } from "@/lib/invoices";
import { formatTimestamp } from "@/lib/time";

/**
 * De opleveringspagina: alleen bereikbaar via de link uit de e-mail, dus
 * bewust buiten de (site)-routegroep — die vraagt requireOpenSite() en zou
 * deze link laten stuklopen zolang de site nog op "binnenkort online" staat.
 * Een bestaande klant met een gemailde link mag altijd bij zijn oplevering
 * kunnen, ook als de rest van de site nog dicht is.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oplevering",
  robots: { index: false, follow: false },
};

export default async function DeliveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ fout?: string; verzonden?: string }>;
}) {
  const { token } = await params;
  const { fout, verzonden } = await searchParams;

  const invoice = getInvoiceByToken(token);
  const booking = invoice ? getBooking(invoice.bookingId) : null;

  if (!invoice || !booking) {
    const t = copy("nl").delivery;
    return (
      <main className="container-page max-w-lg py-16">
        <div className="card p-8 text-center">
          <h1 className="display-2 text-xl">{t.invalidTitle}</h1>
          <p className="mt-3 text-sm text-mist-500">{t.invalidBody}</p>
        </div>
      </main>
    );
  }

  const locale = booking.locale;
  const t = copy(locale).delivery;
  const locked = invoice.payBeforeDownload && invoice.status !== "paid";
  const files = locked ? [] : listInvoiceFiles(invoice.id);

  return (
    <main className="container-page max-w-lg py-16">
      <div className="card p-8">
        <h1 className="display-2 text-xl">{t.heading(booking.reference)}</h1>

        {locked ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-mist-100">{t.payTitle}</h2>
            <p className="mt-2 text-sm text-mist-300">
              {t.payIntro(formatAmountCents(invoice.amountCents, locale))}
            </p>
            {invoice.description && (
              <p className="mt-2 text-sm text-mist-500">{invoice.description}</p>
            )}
            {fout === "1" && <p className="notice notice-error mt-4">{t.payError}</p>}
            <form action={startInvoicePaymentAction} className="mt-5">
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn btn-quiet border-emerald-500/40 text-emerald-300">
                {t.payButton}
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-mist-100">{t.filesTitle}</h2>
            {invoice.status === "paid" && invoice.paidUtc && (
              <p className="mt-1 text-xs text-emerald-300">
                {t.paidNotice(formatTimestamp(invoice.paidUtc, locale))}
              </p>
            )}
            <p className="mt-2 text-sm text-mist-500">{t.filesIntro}</p>
            <ul className="mt-4 space-y-2">
              {files.map((file) => (
                <li key={file.id}>
                  <a
                    href={`/api/oplevering/${token}/${file.id}`}
                    className="btn btn-ghost w-full justify-between"
                  >
                    <span className="truncate">{file.originalName}</span>
                    <span className="shrink-0 text-xs text-mist-500">{t.downloadLabel}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!locked && (
          <div className="mt-8 border-t border-ink-700 pt-6">
            <h2 className="text-sm font-semibold text-mist-100">{t.revisionTitle}</h2>
            <p className="mt-2 text-sm text-mist-500">{t.revisionIntro}</p>

            {verzonden === "1" && <p className="notice notice-success mt-4">{t.revisionSuccess}</p>}
            {fout === "wijziging" && <p className="notice notice-error mt-4">{t.revisionError}</p>}

            <form action={submitRevisionRequestAction} className="mt-4">
              <input type="hidden" name="token" value={token} />
              <textarea
                name="message"
                rows={4}
                minLength={10}
                required
                placeholder={t.revisionPlaceholder}
                className="field-input"
              />
              <button type="submit" className="btn btn-quiet mt-3">
                {t.revisionSubmit}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
