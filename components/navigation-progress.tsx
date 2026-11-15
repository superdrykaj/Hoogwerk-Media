"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/**
 * Dunne lichtstreep bovenaan het scherm terwijl een volgende pagina wordt
 * opgehaald.
 *
 * Alle pagina's worden bij elk bezoek op de server opgebouwd. Na een klik
 * blijft de oude pagina daarom staan tot de nieuwe binnen is, en bij een
 * trage verbinding lijkt de klik niets te doen. Deze streep laat zien dat er
 * iets gebeurt, zonder de pagina te vervangen of te laten verspringen: het is
 * een vaste strook van 2 px die de inhoud niet verschuift.
 *
 * De streep verschijnt pas na 250 ms (zie .hb-nav in globals.css). Een snelle
 * navigatie, of een die al in de cache zit, laat dus niets zien.
 *
 * Er is geen React-state: het element krijgt alleen een attribuut, zodat een
 * klik niet voor een extra render van de hele pagina zorgt.
 */

/** Als de pagina niet komt, gaat de streep hierna toch weg. */
const NOODSLUIT_MS = 10_000;

function Streep() {
  const pad = usePathname();
  const zoek = useSearchParams().toString();
  const sleutel = `${pad}?${zoek}`;

  const element = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Het adres waar de bezoeker nu echt is, voor het herkennen van terug/vooruit.
  const huidig = useRef(sleutel);

  useEffect(() => {
    huidig.current = sleutel;
    clearTimeout(timer.current);
    if (element.current) element.current.dataset.active = "false";
  }, [sleutel]);

  useEffect(() => {
    const start = () => {
      if (!element.current) return;
      element.current.dataset.active = "true";
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (element.current) element.current.dataset.active = "false";
      }, NOODSLUIT_MS);
    };

    const stop = () => {
      clearTimeout(timer.current);
      if (element.current) element.current.dataset.active = "false";
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const doel = e.target instanceof Element ? e.target.closest("a") : null;
      if (!doel || !doel.href) return;
      if (doel.target && doel.target !== "_self") return;
      if (doel.hasAttribute("download")) return;

      const url = new URL(doel.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Bestanden en API-routes zijn geen paginanavigatie.
      if (url.pathname.startsWith("/api/")) return;
      // Dezelfde pagina (bijvoorbeeld #boeken) laadt niets.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      start();
    };

    // Terug en vooruit in de browser: het adres is al veranderd, de pagina nog
    // niet. Alleen als het adres echt anders is dan wat we tonen.
    const onPopState = () => {
      const zoekNu = new URLSearchParams(window.location.search).toString();
      const nu = `${window.location.pathname}?${zoekNu}`;
      if (nu !== huidig.current) start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", stop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", stop);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <div ref={element} className="hb-nav" data-active="false" aria-hidden="true">
      <div className="hb-nav__streak" />
    </div>
  );
}

export function NavigationProgress() {
  // useSearchParams vraagt om een Suspense-grens; zonder fallback, want er valt
  // niets te tonen voordat de streep zelf er is.
  return (
    <Suspense fallback={null}>
      <Streep />
    </Suspense>
  );
}
