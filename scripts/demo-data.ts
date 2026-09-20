/** Vult de database met duidelijk herkenbare DEMO-gegevens voor een preview. */
import { createBooking, setBookingStatus } from "../lib/bookings";
import { listServices } from "../lib/services";
import { createMessage } from "../lib/messages";
import { LEGE_SCOPE, type ProjectScope } from "../lib/project-scope";
import { addDays, todayKey, zonedToUtc } from "../lib/time";

const day = (n: number) => addDays(todayKey(), n);

const services = listServices({ onlyActive: true });
const bySlug = (slug: string) => {
  const found = services.find((s) => s.slug === slug);
  if (!found) throw new Error(`Dienst niet gevonden: ${slug}`);
  return found.id;
};

type DemoItem = {
  serviceId: number;
  dateKey: string;
  minutes: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  confirm: boolean;
  scope?: ProjectScope;
};

const items: DemoItem[] = [
  { serviceId: bySlug("dronefotografie"), dateKey: day(2), minutes: 9 * 60, name: "DEMO — Sanne de Wit", email: "demo-sanne@voorbeeld.test", phone: "06 12 34 56 78", location: "DEMO: Westzijde 12, Zaandam", description: "DEMOGEGEVENS. Luchtfoto's van een herenhuis voor de verkoopbrochure. Graag in het laatste uur voor zonsondergang.", confirm: true },
  { serviceId: bySlug("dronevideo"), dateKey: day(5), minutes: 10 * 60, name: "DEMO — Bouwbedrijf Van Leeuwen", email: "demo-bouw@voorbeeld.test", phone: "", location: "DEMO: Bedrijfsweg 40, Purmerend", description: "DEMOGEGEVENS. Video van het terrein voor de nieuwe website. Circa twee minuten montage.", confirm: false },
  { serviceId: bySlug("kennismaking"), dateKey: day(3), minutes: 11 * 60, name: "DEMO — Marijke Bos", email: "demo-marijke@voorbeeld.test", phone: "06 87 65 43 21", location: "DEMO: online", description: "DEMOGEGEVENS. Kort gesprek over een reeks opnames van een recreatieterrein.", confirm: false },
  {
    serviceId: bySlug("project-op-maat"),
    dateKey: day(4),
    minutes: 14 * 60,
    name: "DEMO — Gemeente Voorbeeldstad",
    email: "demo-gemeente@voorbeeld.test",
    phone: "075 123 45 67",
    location: "DEMO: Dam 1, Zaandam",
    description: "DEMOGEGEVENS. Reeks opnames van drie locaties voor een campagne over de Zaanstreek.",
    confirm: false,
    scope: {
      extraLocations: ["DEMO: Zaanse Schans, Zaandijk", "DEMO: Noordzeekanaal bij Zaandam"],
      sessionCount: "3plus",
      periodWish: "DEMOGEGEVENS: in de tweede helft van mei",
      timePreferences: ["ochtend", "gouden-uur", "doordeweeks"],
    },
  },
];

for (const item of items) {
  const result = createBooking({
    serviceId: item.serviceId,
    startUtc: zonedToUtc(item.dateKey, item.minutes),
    name: item.name,
    email: item.email,
    phone: item.phone,
    location: item.location,
    description: item.description,
    scope: item.scope ?? LEGE_SCOPE,
  });
  if (result.ok && item.confirm) setBookingStatus(result.booking.id, "confirmed");
  console.log(item.name, result.ok ? "aangemaakt" : `mislukt: ${result.error}`);
}

createMessage({
  name: "DEMO — Joris Hendriks",
  email: "demo-joris@voorbeeld.test",
  subject: "DEMO: vraag over opnames bij een evenement",
  message:
    "DEMOGEGEVENS. Hoi Kai, we organiseren in juni een festival in het park. " +
    "Is het mogelijk om daar een overzichtsbeeld van te maken? Ik hoor graag wat er kan.",
});
console.log("Demobericht toegevoegd.");
