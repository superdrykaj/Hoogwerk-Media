/**
 * Redenen waarom een aangevraagd tijdstip niet kan.
 *
 * De controle op de server geeft een reden terug in plaats van een zin, zodat
 * dezelfde controle een Nederlandse melding in de beheeromgeving en een
 * Engelse melding op /en kan opleveren.
 */
import type { Dictionary } from "@/content/copy";

export type BookingProblem =
  | { reason: "service-unavailable" }
  | { reason: "invalid-moment" }
  | { reason: "lead"; hours: number }
  | { reason: "advance"; days: number }
  | { reason: "outside" }
  | { reason: "taken" }
  | { reason: "booking-not-found" }
  | { reason: "service-not-found" };

export function describeProblem(
  problem: BookingProblem,
  t: Dictionary["slots"],
): string {
  switch (problem.reason) {
    case "service-unavailable":
      return t.serviceUnavailable;
    case "invalid-moment":
      return t.invalidMoment;
    case "lead":
      return t.lead(problem.hours);
    case "advance":
      return t.advance(problem.days);
    case "outside":
      return t.outside;
    case "taken":
      return t.taken;
    case "booking-not-found":
      return t.bookingNotFound;
    case "service-not-found":
      return t.serviceNotFound;
  }
}
