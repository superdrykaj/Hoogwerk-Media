import { BookingsManager } from "@/components/admin/bookings-manager";
import { PageHeading } from "@/components/admin/ui";
import { conflictingBookings } from "@/lib/availability";
import { listBookings } from "@/lib/bookings";
import { getInvoiceByBookingId, listInvoiceFiles } from "@/lib/invoices";
import { isMailConfigured } from "@/lib/mail";
import { isMollieConfigured } from "@/lib/mollie";
import { listRevisionRequests } from "@/lib/revisions";
import type { DeliveryInfo } from "@/components/admin/invoice-panel";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; open?: string }>;
}) {
  const { status, open } = await searchParams;
  const bookings = listBookings();
  const conflicts = conflictingBookings();

  // Alleen bevestigde boekingen kunnen worden opgeleverd; voor de rest is dit
  // altijd leeg, dus geen onnodige databasequery's.
  const deliveryByBooking: Record<number, DeliveryInfo> = {};
  for (const booking of bookings) {
    if (booking.status !== "confirmed") continue;
    const invoice = getInvoiceByBookingId(booking.id);
    deliveryByBooking[booking.id] = {
      invoice,
      files: invoice ? listInvoiceFiles(invoice.id) : [],
      revisions: invoice ? listRevisionRequests(invoice.id) : [],
    };
  }

  return (
    <>
      <PageHeading
        title="Boekingen"
        intro="Bekijk aanvragen in een lijst of in de agenda. Bevestig, wijs af, annuleer of verplaats een afspraak."
      />
      <BookingsManager
        bookings={bookings}
        initialStatus={status ?? "all"}
        initialOpenId={Number(open) || null}
        conflictIds={conflicts.map((c) => c.id)}
        mailReady={isMailConfigured()}
        mollieReady={isMollieConfigured()}
        deliveryByBooking={deliveryByBooking}
      />
    </>
  );
}
