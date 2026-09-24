"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Laat de inhoud rustig verschijnen zodra die in beeld komt.
 * Respecteert de systeeminstelling voor minder beweging (zie globals.css).
 *
 * Twee dingen zijn hier bewust zo geregeld:
 *
 * 1. De beginwaarde is "zichtbaar", en op de server én in de browser dezelfde.
 *    Stond er verschil tussen die twee, dan klaagt React over de hydratie en
 *    laat het de waarde staan zoals hij is. Bovendien staat de tekst nu in de
 *    HTML zelf: een zoekmachine of een bezoeker zonder JavaScript ziet de
 *    pagina gewoon.
 *
 * 2. Het verbergen gebeurt in een layout-effect, dus vóórdat de browser tekent.
 *    Met een gewoon effect zou alles eerst even zichtbaar zijn en daarna
 *    wegspringen. Wat al in beeld staat, laten we met rust: dat hoeft niet
 *    alsnog te komen aanvliegen.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    // Staat het al (bijna) in beeld? Laten staan.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    setVisible(false);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}
