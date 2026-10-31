import type { Metadata } from "next";

import { startInvoicePaymentAction, submitRevisionRequestAction } from "@/app/actions/invoice";
import { getBooking } from "@/lib/bookings";
import { copy } from "@/content/copy";
import { formatAmountCents } from "@/lib/currency";
import { canDownloadOriginals, getInvoiceByToken, listInvoiceFiles } from "@/lib/invoices";
import { downloadLinks } from "@/lib/delivery-access";
import { syncInvoicePayment } from "@/lib/payments";
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

  const found = getInvoiceByToken(token);
  const booking = found ? getBooking(found.bookingId) : null;

  // Terug van Mollie: vraag de status zelf op in plaats van op de webhook te
  // wachten, zodat de klant meteen zijn bestanden ziet. Mollie wordt alleen
  // gevraagd als er een betaling openstaat.
  const invoice = found ? (await syncInvoicePayment(found)).invoice : null;

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
  const canDownload = canDownloadOriginals(invoice);
  const locked = !canDownload;
  const closed = invoice.status === "refunded" || invoice.status === "cancelled";
  // Ook zonder betaalmuur moet de klant kunnen betalen zolang er iets openstaat.
  // Na een terugbetaling of annulering is er niets meer te betalen: de beheerder beslist wat er dan gebeurt.
  const unpaid = !["paid", "cancelled", "refunded"].includes(invoice.status) && invoice.amountCents > 0;
  const allFiles = listInvoiceFiles(invoice.id);
  // Originelen: alleen als de betaling is bevestigd. Voorbeelden: altijd.
  const files = canDownload ? allFiles : [];
  const links = canDownload ? downloadLinks(invoice, files.map((f) => f.id)) : null;

  return (
    <main className="container-page max-w-lg py-16">
      <div className="card p-8">
        <h1 className="display-2 text-xl">{t.heading(booking.reference)}</h1>

        {invoice.invoiceNumber && (
          <p className="mt-2 text-sm text-mist-500">
            {t.invoiceNumberLabel}: {invoice.invoiceNumber}
            {" · "}
            <a
              href={`/api/oplevering/${token}/factuur`}
              target="_blank"
              rel="noreferrer"
              className="text-haze-300 hover:underline"
            >
              {t.viewInvoiceLabel}
            </a>
          </p>
        )}

        {fout === "verlopen" && <p className="notice notice-success mt-4">{t.linkExpiredNotice}</p>}

        {invoice.status === "refunded" && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-mist-100">{t.refundedTitle}</h2>
            <p className="mt-2 text-sm text-mist-300">{t.refundedBody}</p>
          </div>
        )}
        {invoice.status === "cancelled" && (
          <p className="mt-6 text-sm text-mist-300">{t.cancelledBody}</p>
        )}

        {allFiles.length > 0 && !closed && (
          canDownload ? (
            // Na betaling zijn de originelen het belangrijkste; de voorbeelden met watermerk blijven op te vragen.
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-mist-100">
                {t.previewTitle}
              </summary>
              <PreviewList files={allFiles} token={token} locked={false} t={t} />
            </details>
          ) : (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-mist-100">{t.previewTitle}</h2>
              <p className="mt-2 text-sm text-mist-500">{t.previewIntroLocked}</p>
              <PreviewList files={allFiles} token={token} locked t={t} />
            </div>
          )
        )}

        {unpaid && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-mist-100">
              {locked ? t.payTitle : t.payTitleOpen}
            </h2>
            <p className="mt-2 text-sm text-mist-300">
              {(locked ? t.payIntro : t.payIntroOpen)(
                formatAmountCents(invoice.amountCents, locale),
              )}
            </p>
            {invoice.description && (
              <p className="mt-2 text-sm text-mist-500">{invoice.description}</p>
            )}
            {fout === "1" && <p className="notice notice-error mt-4">{t.payError}</p>}
            <form action={startInvoicePaymentAction} className="mt-5">
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn btn-quiet min-h-11 border-emerald-500/40 text-emerald-300">
                {t.payButton}
              </button>
            </form>
          </div>
        )}

        {canDownload && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-mist-100">{t.filesTitle}</h2>
            {invoice.status === "paid" && invoice.paidUtc && (
              <p className="mt-1 text-xs text-emerald-300">
                {t.paidNotice(formatTimestamp(invoice.paidUtc, locale))}
              </p>
            )}
            {links ? (
              <>
                <p className="mt-2 text-sm text-mist-500">{t.filesIntro}</p>
                {files.length > 1 && (
                  <div className="mt-4">
                    <a href={links.zip} className="btn btn-quiet min-h-11 border-emerald-500/40 text-emerald-300">
                      {t.zipButton(files.length)}
                    </a>
                    <p className="field-hint mt-2">{t.zipHint}</p>
                  </div>
                )}
                <ul className="mt-4 space-y-2">
                  {files.map((file) => (
                    <li key={file.id}>
                      <a href={links.files[file.id]} className="btn btn-ghost w-full justify-between">
                        <span className="truncate">{file.originalName}</span>
                        <span className="shrink-0 text-xs text-mist-500">{t.downloadLabel}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="field-hint mt-3">{t.linkValidNote(links.minutes)}</p>
              </>
            ) : (
              <p className="notice notice-error mt-3">{t.downloadsUnavailable}</p>
            )}
          </div>
        )}

        {canDownload && (
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
              <button type="submit" className="btn btn-quiet mt-3 min-h-11">
                {t.revisionSubmit}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

type DeliveryText = ReturnType<typeof copy>["delivery"];

/** De voorbeelden met watermerk: foto's als afbeelding, video's met speler. */
function PreviewList({
  files,
  token,
  locked,
  t,
}: {
  files: ReturnType<typeof listInvoiceFiles>;
  token: string;
  locked: boolean;
  t: DeliveryText;
}) {
  return (
    <ul className="mt-4 space-y-4">
      {files.map((file) => {
        const src = `/api/oplevering/${token}/voorbeeld/${file.id}`;
        return (
          <li key={file.id} className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
            {file.previewFilename && file.previewType === "video/mp4" ? (
              <video
                // #t=0.1: zo toont ook Safari op iPhone een beeld in plaats van een zwart vlak.
                src={`${src}#t=0.1`}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                playsInline
                preload="metadata"
                aria-label={file.originalName}
                className="aspect-video w-full bg-ink-950"
              />
            ) : file.previewFilename ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={file.originalName} loading="lazy" decoding="async" className="h-auto w-full" />
            ) : (
              <p className="p-4 text-sm text-mist-500">
                <span className="text-mist-300">{file.originalName}</span>
                <br />
                {locked ? t.previewMissing : t.previewNone}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
