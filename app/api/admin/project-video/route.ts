import { isSignedIn } from "@/lib/auth";
import { saveVideoUploadStream } from "@/lib/uploads";

/**
 * Uploadt een projectvideo door de binnenkomende stream rechtstreeks naar
 * schijf te schrijven (zie lib/uploads.ts). Bewust een gewone route en geen
 * Server Action: die laatste buffert de hele upload in het geheugen van de
 * machine, wat voor een video van een paar honderd megabyte niet houdbaar is
 * — zie ook app/api/admin/opleverbestand/route.ts, dat om dezelfde reden zo
 * is gebouwd.
 *
 * De klant stuurt het ruwe bestand als body mee (geen multipart/form-data);
 * zie components/admin/video-upload-field.tsx.
 */
export async function POST(request: Request) {
  if (!(await isSignedIn())) {
    return Response.json({ ok: false, error: "Niet ingelogd." }, { status: 401 });
  }

  if (!request.body) {
    return Response.json({ ok: false, error: "Geen bestand ontvangen." }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") ?? "application/octet-stream";
  const result = await saveVideoUploadStream(request.body, contentType);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true, url: result.url });
}
