/**
 * Draait één keer bij het starten van de server. Alleen de Node-server, alleen
 * in productie: lokaal ontwikkelen en bouwen maken geen back-ups.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.DAGELIJKSE_BACKUP === "uit") return;
  const { startBackupPlanner } = await import("./lib/backup-planner");
  startBackupPlanner();
}
