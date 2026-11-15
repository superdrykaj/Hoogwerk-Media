import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Plant de dagelijkse back-up (scripts/onderhoud/back-up.cjs) in het serverproces.
 *
 * Fly kent geen cron op de machine, en met min_machines_running = 1 draait de
 * server toch al de hele dag. Elk half uur kijkt dit of er vandaag (tijd van
 * Amsterdam) na 03:00 al een back-up is; zo niet, dan start het script in een
 * apart proces. Is de machine om 03:00 uit of herstart, dan haalt de eerstvolgende
 * controle het in. Uitzetten kan met DAGELIJKSE_BACKUP="uit".
 */

const INTERVAL_MS = 30 * 60 * 1000;
const EERSTE_CONTROLE_MS = 2 * 60 * 1000;
const VANAF_UUR = 3;

function amsterdam(nu: Date): { datum: string; uur: number } {
  const delen = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).format(nu);
  const [datum, uur] = delen.split(" ");
  return { datum, uur: Number(uur) };
}

/** Is er nu een back-up nodig? `bestaand` zijn de mapnamen zoals 2026-10-25T0300. */
export function backupNodig(nu: Date, bestaand: string[]): boolean {
  const { datum, uur } = amsterdam(nu);
  if (uur < VANAF_UUR) return false;
  return !bestaand.some((naam) => naam.startsWith(`${datum}T`));
}

export function startBackupPlanner(): void {
  const script = path.join(process.cwd(), "scripts", "onderhoud", "back-up.cjs");
  const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
  const map = path.join(dataDir, "backups", "dagelijks");
  let bezig = false;

  const controleer = () => {
    if (bezig) return;
    let bestaand: string[] = [];
    try {
      bestaand = fs.existsSync(map) ? fs.readdirSync(map) : [];
    } catch {
      return;
    }
    if (!backupNodig(new Date(), bestaand)) return;
    if (!fs.existsSync(script)) {
      console.error(`[back-up] ${script} ontbreekt; geen dagelijkse back-up.`);
      return;
    }
    bezig = true;
    execFile(process.execPath, [script, "maak"], { timeout: 10 * 60 * 1000, env: process.env }, (error, stdout, stderr) => {
      bezig = false;
      if (error) console.error(`[back-up] mislukt: ${stderr || error.message}`);
      else console.log(`[back-up] ${stdout.trim().split("\n")[0]}`);
    });
  };

  setTimeout(controleer, EERSTE_CONTROLE_MS).unref();
  setInterval(controleer, INTERVAL_MS).unref();
}
