import { BookingsManager } from "@/components/admin/bookings-manager";
import { PageHeading } from "@/components/admin/ui";
import { conflictingBookings } from "@/lib/availability";
import { listBookings } from "@/lib/bookings";
import { isMailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; open?: string }>;
}) {
  const { status, open } = await searchParams;
  const bookings = listBookings();
  const conflicts = conflictingBookings();

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
      />
    </>
  );
}
