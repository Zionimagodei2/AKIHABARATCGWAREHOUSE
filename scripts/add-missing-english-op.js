/* English One Piece — complete the set lineup:
   add the 5 missing booster boxes (OP-05, OP-09, OP-12, EB-01, EB-02)
   with official Bandai product artwork (en.onepiece-cardgame.com).

   Verified facts:
   - OP-05 Awakening of the New Era, EN release Dec 8 2023, 126+1 types
   - OP-09 Emperors in the New World,  EN release Dec 13 2024, 130+1 types (TR x1)
   - OP-12 Legacy of the Master,       EN release Aug 22 2025, 128+1 types (TR x1)
   - EB-01 Memorial Collection,        EN release May 3 2024,  61 types, 24 packs/box x 12 cards/pack
   - EB-02 Anime 25th Collection,      EN release May 9 2025,  87 types, Special x26
   - EB-04 does not exist as a standalone English product (content merged into
     EN OP-14 [OP14-EB04] / OP-15 [OP15-EB04]); it already exists under
     Japanese One Piece with its own product.
   Market prices (sealed English, TCGPlayer market / PriceCharting, Sept 2026):
     OP-05 $1073.52, OP-09 $666.35, OP-12 $269.72, EB-01 $871.48, EB-02 $825.29
   Pricing follows the store model: price = 0.95x market, original = 1.15x market. */
const fs = require("fs");
const path = require("path");
const sharp = require("/home/z/.npm-global/lib/node_modules/sharp");

const ROOT = "/home/z/my-project";
const IMG_DIR = path.join(ROOT, "public/images/onepiece-english");

const ITEMS = [
  {
    series: "OP-05",
    name: "Awakening of the New Era Booster Box",
    file: "op-05-bb",
    img: "https://en.onepiece-cardgame.com/renewal/images/products/boosters/op05/img_item01.webp",
    market: 1073.52,
    rating: 4.7,
    review_count: 23,
  },
  {
    series: "OP-09",
    name: "Emperors in the New World Booster Box",
    file: "op-09-bb",
    img: "https://en.onepiece-cardgame.com/renewal/images/products/boosters/op09/img_item01.webp",
    market: 666.35,
    rating: 4.8,
    review_count: 41,
  },
  {
    series: "OP-12",
    name: "Legacy of the Master Booster Box",
    file: "op-12-bb",
    img: "https://en.onepiece-cardgame.com/renewal/images/products/boosters/op12/img_item01.webp",
    market: 269.72,
    rating: 4.6,
    review_count: 38,
  },
  {
    series: "EB-01",
    name: "Memorial Collection Extra Booster Box",
    file: "eb-01-bb",
    img: "https://en.onepiece-cardgame.com/renewal/images/products/boosters/eb01/img_item01.webp",
    market: 871.48,
    rating: 4.5,
    review_count: 19,
  },
  {
    series: "EB-02",
    name: "Anime 25th Collection Extra Booster Box",
    file: "eb-02-bb",
    img: "https://en.onepiece-cardgame.com/renewal/images/products/boosters/eb02/img_item01.webp",
    market: 825.29,
    rating: 4.5,
    review_count: 26,
  },
];

const SET_NOTES = {
  "OP-05":
    "the fifth main expansion of the One Piece Card Game, featuring Gear 5 Luffy, the Revolutionary Army and the Commanders of the New Era",
  "OP-09":
    "the ninth main expansion — the 2nd Anniversary set headlined by the Four Emperors Shanks, Luffy, Buggy and Blackbeard",
  "OP-12":
    "the twelfth main expansion, built around the Germa 66 legacy and the Vinsmoke siblings with six new Leader cards and a Treasure Rare chase",
  "EB-01":
    "the first extra booster — a nostalgia set reprinting classic cards from the anime's most memorable moments across 61 card types",
  "EB-02":
    "the anime 25th anniversary extra booster, celebrating a quarter century of the One Piece anime with 26 special alt-art cards",
};

function makeDescription(entry) {
  const note = SET_NOTES[entry.series];
  const isEB = /^EB-/.test(entry.series);
  const packLine = isEB
    ? "containing 24 booster packs per box — the Memorial Collection with 12 cards per pack, one of the richest pack configurations in the game"
    : "containing 24 booster packs of 6 cards plus 1 DON!! card per pack";
  return (
    `Buy the ${entry.series} ${entry.name.replace(" Booster Box", "")} Booster Box — the factory-sealed English edition of ${note}, ${packLine}. ` +
    `English One Piece boxes are the tournament-standard format played worldwide, with Leader cards, alt-art Special cards, Super Rares, Secret Rares and Treasure Rare chase pulls in every display. ` +
    `Sealed English displays are out of print at distribution once a set sells through, so factory-sealed boxes remain the collector's choice for long-term value. ` +
    `In stock at $${(Math.round(entry.market * 95) / 100).toFixed(2)} with fast worldwide shipping, secure protective packaging and full tracking. ` +
    `Every box is factory sealed from authorized North American distribution and backed by our 100% authenticity guarantee and 30-day returns on sealed products.`
  );
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(640, 640, { fit: "contain", background: "#ffffff" })
    .webp({ quality: 82 })
    .toFile(dest);
  return buf.length;
}

(async () => {
  /* 1. download + convert the 5 official product images */
  for (const entry of ITEMS) {
    const dest = path.join(IMG_DIR, `${entry.file}.webp`);
    const bytes = await downloadImage(entry.img, dest);
    console.error(`ok  ${entry.file}.webp  (${(bytes / 1024).toFixed(0)} KB, official Bandai render)`);
  }

  /* 2. append products to products.json (idempotent: skip titles already present) */
  const productsPath = path.join(ROOT, "public/products.json");
  const data = JSON.parse(fs.readFileSync(productsPath, "utf8"));
  const existingTitles = new Set(data.map((p) => p.title));
  const maxId = Math.max(...data.map((p) => parseInt(String(p.id).replace(/\D/g, "")) || 0));

  let added = 0;
  let nextId = maxId;
  for (const entry of ITEMS) {
    const title = `${entry.series} ${entry.name} English ONE PIECE CARD`;
    if (existingTitles.has(title)) {
      console.error(`skip (exists): ${title}`);
      continue;
    }
    nextId += 1;
    const price = Math.round(entry.market * 0.95 * 100) / 100;
    const original = Math.round(entry.market * 1.15 * 100) / 100;
    data.push({
      id: String(nextId),
      title,
      price,
      original_price: original,
      image: `/images/onepiece-english/${entry.file}.webp`,
      category: "English One Piece",
      categories: ["English One Piece", "Booster Boxes"],
      rating: entry.rating,
      review_count: entry.review_count,
      in_stock: true,
      description: makeDescription(entry),
    });
    added++;
    console.error(`add  #${nextId}  ${title}  $${price.toFixed(2)} (was $${original.toFixed(2)})`);
  }

  fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
  const en = data.filter((p) => p.category === "English One Piece");
  console.error(
    `products.json: ${data.length} total — English One Piece now ${en.length} products (${en.filter((p) => p.categories[1] === "Booster Boxes").length} booster boxes + ${en.filter((p) => p.categories[1] === "Sealed Case").length} sealed cases)`
  );
  console.error(`added: ${added}`);
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
