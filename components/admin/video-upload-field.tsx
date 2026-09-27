"use client";

import { useState } from "react";

/**
 * Video-upload voor een project, met daarnaast de bestaande YouTube-/
 * Vimeo-link. De upload gaat buiten het formulier om, rechtstreeks naar
 * app/api/admin/project-video/route.ts via XMLHttpRequest (net als de
 * opleverbestanden in components/admin/invoice-panel.tsx) — dat streamt naar
 * schijf i.p.v. het bestand in het geheugen van een Server Action te
 * bufferen. Zodra de upload klaar is, komt de geretourneerde url gewoon in
 * het gewone tekstveld "videoUrl" te staan, dat wél via het formulier gaat.
 */
export function VideoUploadField({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  const [videoUrl, setVideoUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");

  function upload(file: File) {
    setStatus("uploading");
    setMessage("");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/project-video");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.onload = () => {
      let data: { ok: boolean; url?: string; error?: string } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // val hieronder terug op de foutmelding
      }
      if (data?.ok && data.url) {
        setVideoUrl(data.url);
        setStatus("idle");
      } else {
        setStatus("error");
        setMessage(data?.error ?? "Uploaden is mislukt. Probeer het nog eens.");
      }
    };
    xhr.onerror = () => {
      setStatus("error");
      setMessage("Uploaden is mislukt. Probeer het nog eens.");
    };
    xhr.send(file);
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="videoFileInput" className="field-label">
          Video uploaden
        </label>
        <input
          id="videoFileInput"
          type="file"
          accept="video/mp4,video/webm"
          disabled={status === "uploading"}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) upload(file);
          }}
          className="field-input file:mr-3 file:rounded file:border-0 file:bg-ink-700 file:px-3 file:py-1.5 file:text-sm file:text-mist-100"
          aria-describedby="videoFileInput-hint"
        />
        <p id="videoFileInput-hint" className="field-hint">
          MP4 of WebM. Wordt meteen geüpload; de link hiernaast wordt
          automatisch ingevuld zodra dat klaar is.
        </p>
        {status === "uploading" && <p className="field-hint">Bezig met uploaden…</p>}
        {status === "error" && <p className="field-error">{message}</p>}
      </div>
      <div>
        <label htmlFor="videoUrl" className="field-label">
          Of: YouTube-/Vimeo-link
        </label>
        <input
          id="videoUrl"
          name="videoUrl"
          type="text"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          className="field-input"
          aria-describedby={error ? "videoUrl-error" : "videoUrl-hint"}
        />
        {error ? (
          <p id="videoUrl-error" className="field-error">
            {error}
          </p>
        ) : (
          <p id="videoUrl-hint" className="field-hint">
            Laat leeg als er nog geen video is.
          </p>
        )}
      </div>
    </div>
  );
}
