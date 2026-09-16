import { getDb } from "@/lib/db";

/**
 * Controlepunt voor de hosting: geeft 200 zodra de server draait en de
 * database bereikbaar is. Bevat geen gegevens van klanten.
 */
export const dynamic = "force-dynamic";

export function GET() {
  try {
    getDb().prepare("SELECT 1").get();
    return Response.json(
      { status: "ok", time: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ status: "database-fout" }, { status: 503 });
  }
}
