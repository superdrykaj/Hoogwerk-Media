/**
 * Gedeelde vorm van formulierantwoorden.
 * Staat los van de server actions, omdat een bestand met "use server"
 * alleen async functies mag exporteren.
 */

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: Record<string, string>;
  /**
   * Wat de bezoeker had ingevuld. Nodig bij een foutmelding: React maakt een
   * formulier na het versturen leeg, dus zonder deze waarden begint iemand die
   * één veld verkeerd invulde weer helemaal opnieuw. De velden zetten ze terug
   * via defaultValue.
   */
  values?: Record<string, string>;
  /** Extra gegevens bij een geslaagde aanvraag. */
  result?: {
    reference: string;
    when: string;
    serviceName: string;
    /** Is de bevestigingsmail daadwerkelijk de deur uit gegaan? */
    mailSent: boolean;
    /** Staan de SMTP-gegevens ingesteld? Zo niet, dan is er niets geprobeerd. */
    mailConfigured: boolean;
  };
};

export const emptyFormState: FormState = {
  status: "idle",
  message: "",
  errors: {},
};

export type ActionState = {
  status: "idle" | "success" | "error" | "warning";
  message: string;
  errors?: Record<string, string>;
  /**
   * Toelichting onder de melding, regel voor regel. Gebruikt waar één zin niet
   * genoeg is: bij een weigerende mailserver hoort naast de oorzaak ook het
   * lijstje van wat je eraan kunt doen.
   */
  details?: string[];
};

export const emptyActionState: ActionState = { status: "idle", message: "" };
