/**
 * Controleert dat twee gelijktijdige aanvragen voor hetzelfde tijdslot niet
 * allebei kunnen slagen. Draai dit terwijl de server niet schrijft.
 *
 *   npx tsx scripts/test-concurrency.ts <startUtc>
 */
import { createBooking } from "../lib/bookings";
import { LEGE_SCOPE } from "../lib/project-scope";

const startUtc = Number(process.argv[2]);
const label = process.argv[3] ?? "?";

const result = createBooking({
  serviceId: 2,
  startUtc,
  name: `Gelijktijdig ${label}`,
  email: `gelijktijdig-${label}@voorbeeld.test`,
  phone: "",
  location: "DEMOGEGEVENS: testlocatie",
  description: "DEMOGEGEVENS: gelijktijdigheidstest",
  scope: LEGE_SCOPE,
  locale: "nl",
});

console.log(
  JSON.stringify({ label, ok: result.ok, detail: result.ok ? result.booking.reference : JSON.stringify(result.problem) }),
);
