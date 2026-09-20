/**
 * Maakt uit het originele logo de varianten die de website nodig heeft.
 *
 *   node scripts/generate-logo.mjs
 *
 * Bron:  brand/logo-origineel.png   (donker beeldmerk op een witte achtergrond)
 * Maakt: public/logo-mark.png       (beeldmerk, licht, doorzichtig, voor de kop)
 *        app/icon.png               (pictogram voor het browsertabblad)
 *        app/apple-icon.png         (pictogram voor iOS-snelkoppelingen)
 *
 * Waarom dit nodig is: het originele logo is donker op wit, en de site is
 * donker. Zonder bewerking valt het beeldmerk weg. Dit script snijdt het
 * beeldmerk los van de woordmerk en keert de tinten om, zodat de vorm licht
 * op donker staat met behoud van de onderlinge grijswaarden.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BRON = "brand/logo-origineel.png";

/** Kleur van het beeldmerk in de kop (zelfde als --color-mist-100). */
const LICHT = { r: 0xe8, g: 0xec, b: 0xf2 };
/** Achtergrond van het pictogram (zelfde als --color-ink-900). */
const DONKER = { r: 0x08, g: 0x0b, b: 0x12 };

/** Alles lichter dan dit telt als achtergrond. */
const ACHTERGROND_DREMPEL = 245;

/**
 * Zoekt de aaneengesloten blokken met inhoud, van boven naar beneden.
 * Het logo bestaat uit drie blokken: beeldmerk, woordmerk en de tagline.
 */
function vindBlokken(grijs, breedte, hoogte) {
  const rijHeeftInhoud = [];
  for (let y = 0; y < hoogte; y++) {
    let inhoud = false;
    for (let x = 0; x < breedte; x++) {
      if (grijs[y * breedte + x] < ACHTERGROND_DREMPEL) {
        inhoud = true;
        break;
      }
    }
    rijHeeftInhoud.push(inhoud);
  }

  const blokken = [];
  let start = null;
  for (let y = 0; y <= hoogte; y++) {
    if (rijHeeftInhoud[y]) {
      if (start === null) start = y;
    } else if (start !== null) {
      blokken.push({ top: start, bottom: y - 1 });
      start = null;
    }
  }
  return blokken;
}

/** Linker- en rechtergrens van de inhoud binnen een rijenbereik. */
function vindKolommen(grijs, breedte, top, bottom) {
  let links = breedte;
  let rechts = 0;
  for (let y = top; y <= bottom; y++) {
    for (let x = 0; x < breedte; x++) {
      if (grijs[y * breedte + x] < ACHTERGROND_DREMPEL) {
        if (x < links) links = x;
        if (x > rechts) rechts = x;
      }
    }
  }
  return { links, rechts };
}

/**
 * Zet een donker-op-wit uitsnede om naar een lichte vorm met doorzichtige
 * achtergrond. Hoe donkerder de bronpixel, hoe dekkender het resultaat.
 */
async function naarLichteVorm(uitsnede, kleur) {
  const { data, info } = await sharp(uitsnede)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let donkerste = 255;
  for (const v of data) if (v < donkerste) donkerste = v;
  const bereik = Math.max(1, ACHTERGROND_DREMPEL - donkerste);

  const alfa = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    const waarde = Math.round(((ACHTERGROND_DREMPEL - data[i]) * 255) / bereik);
    alfa[i] = Math.min(255, Math.max(0, waarde));
  }

  const vlak = await sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: kleur,
    },
  })
    .raw()
    .toBuffer();

  return sharp(vlak, {
    raw: { width: info.width, height: info.height, channels: 3 },
  })
    .joinChannel(alfa, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
    .png()
    .toBuffer();
}

/* -------------------------------------------------------------------------- */

const bron = sharp(BRON);
const meta = await bron.metadata();
const { data: grijs } = await sharp(BRON)
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const blokken = vindBlokken(grijs, meta.width, meta.height);
if (blokken.length === 0) throw new Error("Geen inhoud gevonden in het logo.");

const merk = blokken[0];
const { links, rechts } = vindKolommen(grijs, meta.width, merk.top, merk.bottom);

const marge = Math.round(meta.width * 0.01);
const vak = {
  left: Math.max(0, links - marge),
  top: Math.max(0, merk.top - marge),
  width: Math.min(meta.width, rechts - links + 1 + marge * 2),
  height: Math.min(meta.height, merk.bottom - merk.top + 1 + marge * 2),
};

console.log(
  `Blokken gevonden: ${blokken.length}. Beeldmerk: ${vak.width}x${vak.height} ` +
    `op (${vak.left}, ${vak.top}).`,
);

const uitsnede = await sharp(BRON).extract(vak).png().toBuffer();
const licht = await naarLichteVorm(uitsnede, LICHT);

await fs.mkdir("public", { recursive: true });
await sharp(licht)
  .resize({ width: 160, height: 160, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join("public", "logo-mark.png"));
console.log("geschreven: public/logo-mark.png (160x160)");

// Pictogram: hetzelfde beeldmerk, met lucht eromheen, op een donker vlak.
async function pictogram(bestand, maat) {
  const binnen = Math.round(maat * 0.64);
  const merkKlein = await sharp(licht)
    .resize({ width: binnen, height: binnen, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const hoek = Math.round(maat * 0.22);
  const masker = Buffer.from(
    `<svg width="${maat}" height="${maat}"><rect width="${maat}" height="${maat}" rx="${hoek}" ry="${hoek}" fill="#fff"/></svg>`,
  );
  const vlak = await sharp({
    create: { width: maat, height: maat, channels: 4, background: { ...DONKER, alpha: 1 } },
  })
    .composite([{ input: merkKlein, gravity: "center" }])
    .png()
    .toBuffer();
  await sharp(vlak)
    .composite([{ input: masker, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toFile(bestand);
  console.log(`geschreven: ${bestand} (${maat}x${maat})`);
}

await pictogram(path.join("app", "icon.png"), 512);
await pictogram(path.join("app", "apple-icon.png"), 180);
