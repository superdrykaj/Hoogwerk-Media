/**
 * De regel achter de schakelaar, los van de database.
 *
 * Staat apart omdat lib/site-status.ts alleen op de server mag draaien: dat
 * bestand leest de database en het sessiecookie. Deze regel is pure rekenwerk
 * en is daardoor te testen.
 */

export type SiteStatus = "soon" | "live";

/**
 * Welke stand geldt er, gegeven wat er in de database staat en wat de omgeving
 * zegt?
 *
 * De database wint altijd: die zet jij met de knop in de beheeromgeving. De
 * omgevingsvariabele telt alleen zolang er nog nooit op die knop is gedrukt,
 * dus bij een verse installatie. Alles wat niet exact "live" is, houdt de site
 * dicht — bij twijfel liever op slot dan per ongeluk open.
 */
export function bepaalStatus(
  uitDatabase: string | undefined,
  uitOmgeving: string | undefined,
): SiteStatus {
  const waarde = uitDatabase ?? uitOmgeving;
  return waarde === "live" ? "live" : "soon";
}
