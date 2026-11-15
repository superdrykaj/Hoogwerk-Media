import Image from "next/image";

import { site } from "@/content/site";

/**
 * ============================================================================
 *  LAADSCHERM BIJ HET EERSTE BEZOEK
 * ============================================================================
 *  Staat in de HTML zelf, niet in React. Een React-component kan pas iets
 *  tonen nadat de scripts zijn binnengehaald; dit scherm is er vanaf de eerste
 *  verfbeurt. De uiterlijke vormgeving staat in globals.css (.hb-loader).
 *
 *  Wat het wel en niet doet, bewust:
 *
 *  - Er is geen minimale tijd. Het scherm verdwijnt op het moment dat de
 *    pagina klaar is, en niet een fractie later.
 *  - Het verschijnt pas na 300 ms (CSS-vertraging). Laadt de pagina sneller,
 *    dan is het nooit zichtbaar geweest: geen flits bij een snelle verbinding
 *    of een terugkerend bezoek met alles in de cache.
 *  - "Klaar" betekent: de pagina is ingelezen, de lettertypen die al worden
 *    opgehaald zijn binnen en het belangrijkste beeld (het element met
 *    fetchpriority="high", op de voorpagina het posterbeeld) is binnen. Niet:
 *    alle scripts zijn gehydrateerd. De tekst staat al in de HTML en hoeft
 *    daar niet op te wachten; wachten zou het scherm alleen onnodig laten
 *    staan.
 *  - Het scherm vangt geen klikken op (pointer-events: none) en staat voor
 *    schermlezers uit (aria-hidden). De pagina eronder is gewoon bruikbaar.
 *  - Is de stylesheet door een netwerkprobleem niet binnengekomen, dan is het
 *    element geen vast scherm maar gewone inhoud; het script verbergt het dan.
 *  - Vastgelopen? Na 6 seconden sluit het script het scherm. Draait het
 *    script helemaal niet, dan doet de CSS dat na 7 seconden. Zonder
 *    JavaScript verschijnt het scherm niet (@media (scripting: none)).
 *
 *  Een trage serverrespons (bijvoorbeeld een machine die net wakker wordt)
 *  vangt dit niet op: zolang de HTML er niet is, is er niets om te tonen. Dat
 *  los je op bij de server, zie fly.toml (min_machines_running).
 *
 *  Het script verandert data-state en style op het element vóórdat React
 *  hydrateert, vandaar suppressHydrationWarning. React raakt die attributen
 *  daarna niet meer aan, want de props veranderen niet.
 * ============================================================================
 */

/** Hoe lang het script wacht voordat het scherm hoe dan ook sluit. */
const NOODSLUIT_MS = 6000;

/**
 * Het script staat als tekst in de HTML en wordt uitgevoerd terwijl de browser
 * de pagina leest. Houd het klein: elke byte staat in elk bezoek.
 */
const SCRIPT = `(function(){
var el=document.getElementById("hb-loader");
if(!el)return;
var klaar=false;
function sluit(){
if(klaar)return;
klaar=true;
if(getComputedStyle(el).position!=="fixed"){el.style.display="none";return}
var o=parseFloat(getComputedStyle(el).opacity)||0;
if(o<0.02){el.setAttribute("data-state","skip");return}
el.style.setProperty("--hb-o",String(o));
el.setAttribute("data-state","done");
}
el.addEventListener("animationend",function(e){
if(e.animationName==="hb-out")el.setAttribute("data-state","gone");
});
setTimeout(sluit,${NOODSLUIT_MS});
window.addEventListener("pageshow",function(e){if(e.persisted)sluit()});
function wacht(img){
return new Promise(function(ok){
if(img.complete)return ok();
img.addEventListener("load",ok);
img.addEventListener("error",ok);
});
}
function gereed(){
var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
var beelden=[].slice.call(document.querySelectorAll('img[fetchpriority="high"]')).map(wacht);
Promise.all([fonts].concat(beelden)).then(sluit,sluit);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",gereed);
else gereed();
})();`;

export function PageLoader() {
  return (
    <>
      <div
        id="hb-loader"
        className="hb-loader"
        data-state="loading"
        aria-hidden="true"
        suppressHydrationWarning
      >
        <div className="hb-loader__inner">
          {site.logo && (
            <Image
              src={site.logo.src}
              alt=""
              width={site.logo.width}
              height={site.logo.height}
              priority
              className="hb-loader__mark"
            />
          )}
          <span className="hb-loader__word">{site.name}</span>

          {/*
            Een dronevlucht in één lijn: de horizon, de baan die de drone
            vliegt, en een lichtpunt met staart dat die baan volgt. De baan en
            de horizon zijn stilstaande SVG; het lichtpunt beweegt met alleen
            transform en opacity, zodat de animatie door de videokaart wordt
            gedaan en niet stilvalt terwijl de scripts van de pagina draaien.
          */}
          <div className="hb-loader__flight">
            <svg
              viewBox="0 0 320 44"
              focusable="false"
              className="hb-loader__lines"
            >
              <defs>
                <linearGradient
                  id="hb-horizon"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  x2="320"
                  y1="0"
                  y2="0"
                >
                  <stop offset="0" className="hb-stop-edge" />
                  <stop offset="0.5" className="hb-stop-mid" />
                  <stop offset="1" className="hb-stop-edge" />
                </linearGradient>
              </defs>
              <line
                className="hb-loader__horizon"
                x1="0"
                y1="34"
                x2="320"
                y2="34"
                stroke="url(#hb-horizon)"
              />
              <path className="hb-loader__track" d="M8.0 34.0 L23.2 30.4 L38.4 26.9 L53.6 23.6 L68.8 20.5 L84.0 17.7 L99.2 15.4 L114.4 13.5 L129.6 12.1 L144.8 11.3 L160.0 11.0 L175.2 11.3 L190.4 12.1 L205.6 13.5 L220.8 15.4 L236.0 17.7 L251.2 20.5 L266.4 23.6 L281.6 26.9 L296.8 30.4 L312.0 34.0" />
            </svg>
            <div className="hb-drone-x">
              <div className="hb-drone-y">
                <span className="hb-drone" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </>
  );
}
