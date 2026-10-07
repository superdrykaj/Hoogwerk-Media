import { Reveal } from "@/components/reveal";

/**
 * Vragen in twee kolommen, niet als uitklapmenu: alles staat er meteen, en wie
 * zich afvraagt of dit wel mag, hoeft niet te klikken om het antwoord te zien.
 * Gedeeld door de homepage en de dienstpagina's.
 */
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <dl className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
      {/* Eén <div> per vraag-en-antwoord, en niet dieper: een <dl> mag een
          <div> om elke groep hebben, maar geen <div> in een <div>. Reveal is
          die ene laag, dus de opmaak gaat mee in zijn className. */}
      {items.map((item, index) => (
        <Reveal
          key={item.question}
          delay={(index % 2) * 70}
          className="border-t border-ink-700 pt-5"
        >
          <dt className="display-3">{item.question}</dt>
          <dd className="mt-2.5 max-w-prose text-sm leading-relaxed text-mist-500">
            {item.answer}
          </dd>
        </Reveal>
      ))}
    </dl>
  );
}
