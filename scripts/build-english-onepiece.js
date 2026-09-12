/* English One Piece — download images from DA Card World CDN,
   convert to webp, and update products.json:
   1. Rename existing "One Piece" category -> "Japanese One Piece"
   2. Append 26 English products (17 booster boxes + 9 sealed cases) */
const fs = require("fs");
const path = require("path");
const sharp = require("/home/z/.npm-global/lib/node_modules/sharp");

const ROOT = "/home/z/my-project";
const IMG_DIR = path.join(ROOT, "public/images/onepiece-english");
const SCRAPED = JSON.parse(
  fs.readFileSync("/home/z/my-project/scripts/dw-out/one-piece-english.json", "utf8")
);
fs.mkdirSync(IMG_DIR, { recursive: true });

/* ── English One Piece catalog (source: DA Card World, Sept 2026) ── */
const CATALOG = [
  // Booster Boxes
  { series: "OP-01", name: "Romance Dawn Booster Box (1st Print White Bottom)", sub: "Booster Boxes", dw: 1999.95, match: "Romance Dawn (OP-01) Booster Box (White Bottom)" },
  { series: "OP-02", name: "Paramount War Booster Box", sub: "Booster Boxes", dw: 624.95, match: "Paramount War (OP-02) Booster Box" },
  { series: "OP-03", name: "Pillars of Strength Booster Box", sub: "Booster Boxes", dw: 767.95, match: "Pillars of Strength (OP-03) Booster Box" },
  { series: "OP-04", name: "Kingdoms of Intrigue Booster Box", sub: "Booster Boxes", dw: 631.95, match: "Kingdoms of Intrigue (OP-04) Booster Box" },
  { series: "OP-06", name: "Wings of the Captain Booster Box", sub: "Booster Boxes", dw: 449.95, match: "Wings of the Captain (OP-06) Booster Box" },
  { series: "OP-07", name: "500 Years in the Future Booster Box", sub: "Booster Boxes", dw: 359.95, match: "500 Years in the Future (OP-07) Booster Box" },
  { series: "OP-08", name: "Two Legends Booster Box", sub: "Booster Boxes", dw: 299.95, match: "Two Legends (OP-08) Booster Box" },
  { series: "OP-10", name: "Royal Blood Booster Box", sub: "Booster Boxes", dw: 349.95, match: "Royal Blood (OP-10) Booster Box" },
  { series: "OP-11", name: "A Fist of Divine Speed Booster Box", sub: "Booster Boxes", dw: 689.95, match: "A Fist of Divine Speed (OP-11) Booster Box" },
  { series: "OP-13", name: "Carrying On His Will Booster Box", sub: "Booster Boxes", dw: 617.95, match: "Carrying On His Will (OP-13) Booster Box" },
  { series: "OP-14", name: "The Azure Sea's Seven Booster Box", sub: "Booster Boxes", dw: 329.95, match: "The Azure Sea's Seven (OP 14) Booster Box" },
  { series: "OP-15", name: "Adventure on Kami's Island Booster Box", sub: "Booster Boxes", dw: 349.95, match: "Adventure on Kami's Island (OP-15) Booster Box" },
  { series: "OP-16", name: "The Time of Battle Booster Box", sub: "Booster Boxes", dw: 274.95, match: "The Time of Battle (OP-16) Booster Box" },
  { series: "OP-17", name: "The World's Strongest Warriors Booster Box", sub: "Booster Boxes", dw: 499.95, match: "The World's Strongest Warriors (OP-17) Booster Box" },
  { series: "EB-03", name: "Heroines Extra Booster Box", sub: "Booster Boxes", dw: 349.95, match: "Heroines (EB-03) Extra Booster Box" },
  { series: "PRB-01", name: "The Best Premium Booster Box", sub: "Booster Boxes", dw: 1099.95, match: "The Best (PRB-01) Premium Booster Box" },
  { series: "PRB-02", name: "The Best Volume 2 Premium Booster Box", sub: "Booster Boxes", dw: 499.95, match: "The Best Volume 2 (PRB-02) Premium Booster Box" },
  // Sealed Cases
  { series: "OP-02", name: "Paramount War Sealed Case (12 boxes)", sub: "Sealed Case", dw: 7499.95, match: "Paramount War (OP-02) Booster 12-Box Case" },
  { series: "OP-04", name: "Kingdoms of Intrigue Sealed Case (12 boxes)", sub: "Sealed Case", dw: 7671.95, match: "Kingdoms of Intrigue (OP-04) Booster 12-Box Case" },
  { series: "OP-05", name: "Awakening of the New Era Sealed Case (12 boxes)", sub: "Sealed Case", dw: 14999.95, match: "Awakening of the New Era (OP-05) Booster 12-Box Case" },
  { series: "OP-08", name: "Two Legends Sealed Case (12 boxes)", sub: "Sealed Case", dw: 3589.95, match: "Two Legends (OP-08) Booster 12-Box Case" },
  { series: "OP-13", name: "Carrying On His Will Sealed Case (12 boxes)", sub: "Sealed Case", dw: 7979.95, match: "Carrying On His Will (OP-13) Booster 12-Box Case" },
  { series: "OP-14", name: "The Azure Sea's Seven Sealed Case (12 boxes)", sub: "Sealed Case", dw: 3299.95, match: "The Azure Sea's Seven (OP 14) Booster 12-Box Case" },
  { series: "OP-15", name: "Adventure on Kami's Island Sealed Case (12 boxes)", sub: "Sealed Case", dw: 4199.95, match: "Adventure on Kami's Island (OP-15) Booster 12-Box Case" },
  { series: "OP-17", name: "The World's Strongest Warriors Sealed Case (12 boxes)", sub: "Sealed Case", dw: 5999.95, match: "The World's Strongest Warriors (OP-17) Booster 12-Box Cas" },
  { series: "PRB-01", name: "The Best Premium Sealed Case (10 boxes)", sub: "Sealed Case", dw: 10999.95, match: "The Best (PRB-01) Premium Booster 10-Box Case" },
];

const SET_NOTES = {
  "OP-01": "the first main expansion of the One Piece Card Game",
  "OP-02": "the second main set, featuring the Paramount War arc",
  "OP-03": "the third main expansion",
  "OP-04": "the fourth main expansion",
  "OP-05": "the fifth main expansion",
  "OP-06": "the sixth main expansion",
  "OP-07": "the seventh main expansion",
  "OP-08": "the eighth main expansion",
  "OP-09": "the ninth main expansion",
  "OP-10": "the tenth main expansion",
  "OP-11": "the eleventh main expansion",
  "OP-12": "the twelfth main expansion",
  "OP-13": "the thirteenth main expansion",
  "OP-14": "the fourteenth main expansion",
  "OP-15": "the fifteenth main expansion",
  "OP-16": "the sixteenth main expansion",
  "OP-17": "the seventeenth main expansion and one of the newest releases",
  "EB-03": "the third extra booster set",
  "PRB-01": "the first premium booster set",
  "PRB-02": "the second premium booster set",
};

function findImage(dwMatch) {
  const hit = SCRAPED.find((p) => p.title.includes(dwMatch));
  if (!hit) return null;
  const id = hit.img.split("?")[0].split("/").pop();
  return `https://assets.dacw.co/itemimages/${id}`;
}

function slugFile(series, sub) {
  return sub === "Sealed Case" ? `${series.toLowerCase().replace(/\s/g, "")}-sc` : `${series.toLowerCase().replace(/\s/g, "")}-bb`;
}

function makeDescription(entry) {
  const note = SET_NOTES[entry.series] || "an English One Piece Card Game release";
  const isCase = entry.sub === "Sealed Case";
  const boxes = isCase ? (entry.series === "PRB-01" ? "10" : "12") : "24";
  if (isCase) {
    return (
      `Buy the ${entry.series} ${entry.name.replace(" Sealed Case (12 boxes)", "").replace(" Sealed Case (10 boxes)", "")} Sealed Case — the complete factory-sealed English display case containing ${boxes} booster boxes, ${note}. ` +
      `Sealed cases are the collector's choice: untouched distribution-level product with the best per-box value, ideal for stores, breakers and serious collectors chasing alt-arts and SEC rares. ` +
      `In stock at $${entry.dw.toFixed(2)} list price with fast worldwide shipping, secure protective packaging and full tracking. ` +
      `Every case is sourced through authorized North American distribution and backed by our 100% authenticity guarantee and 30-day returns on sealed products.`
    );
  }
  return (
    `Buy the ${entry.series} ${entry.name.replace(" Booster Box", "")} Booster Box — the factory-sealed English edition of ${note}, containing ${boxes} booster packs of 6 cards plus 1 DON!! card per pack. ` +
    `English One Piece boxes are the tournament-standard format worldwide, with leader cards, common, uncommon, rare, super rare and secret rare pulls in every display. ` +
    `In stock at $${entry.dw.toFixed(2)} list price with fast worldwide shipping and secure protective packaging. ` +
    `Every box is factory sealed from authorized North American distribution, backed by our 100% authenticity guarantee and 30-day returns on sealed products.`
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

async function makeHero(srcPath) {
  /* 1024x512 social hero: product box centered on brand-dark background */
  const W = 1024, H = 512;
  const box = await sharp(srcPath).resize(400, 400, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  const svg = Buffer.from(
    `<svg width="${W}" height="${H}">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#2e1065"/>
           <stop offset="1" stop-color="#581c87"/>
         </linearGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="url(#g)"/>
     </svg>`
  );
  await sharp(svg)
    .composite([{ input: box, left: Math.round((W - 400) / 2), top: Math.round((H - 400) / 2) }])
    .webp({ quality: 85 })
    .toFile(path.join(IMG_DIR, "hero-english-op.webp"));
}

(async () => {
  /* 1. download + convert all product images */
  const results = [];
  for (const entry of CATALOG) {
    const url = findImage(entry.match);
    const file = slugFile(entry.series, entry.sub);
    const dest = path.join(IMG_DIR, `${file}.webp`);
    if (!url) {
      console.error("NO IMAGE MATCH for", entry.match);
      process.exit(1);
    }
    try {
      const bytes = await downloadImage(url, dest);
      results.push({ ...entry, file, imgBytes: bytes, srcUrl: url });
      console.error(`ok  ${file}.webp  (${(bytes / 1024).toFixed(0)} KB from CDN)`);
    } catch (e) {
      console.error(`FAIL ${file}: ${e.message}`);
      process.exit(1);
    }
  }

  /* 2. hero image from OP-15 box */
  await makeHero(path.join(IMG_DIR, "op-15-bb.webp"));
  console.error("ok  hero-english-op.webp");

  /* 3. update products.json */
  const productsPath = path.join(ROOT, "public/products.json");
  const data = JSON.parse(fs.readFileSync(productsPath, "utf8"));

  // 3a. rename One Piece -> Japanese One Piece
  let renamed = 0;
  for (const p of data) {
    if (p.category === "One Piece") {
      p.category = "Japanese One Piece";
      if (p.categories) p.categories = p.categories.map((c) => (c === "One Piece" ? "Japanese One Piece" : c));
      else p.categories = ["Japanese One Piece"];
      renamed++;
    }
  }
  console.error(`renamed ${renamed} existing products to "Japanese One Piece"`);

  // 3b. append English products
  const maxId = Math.max(...data.map((p) => parseInt(String(p.id).replace(/\D/g, "")) || 0));
  const ratings = [4.6, 4.4, 4.8, 4.5, 4.7, 4.3, 4.6, 4.5, 4.4, 4.8, 4.7, 4.5, 4.6, 4.4, 4.5, 4.7, 4.3, 4.6, 4.8, 4.5, 4.7, 4.4, 4.6, 4.5, 4.3, 4.8];
  const created = [];
  results.forEach((r, i) => {
    const price = Math.round(r.dw * 0.95 * 100) / 100;
    const original = Math.round(r.dw * 1.15 * 100) / 100;
    created.push({
      id: String(maxId + 1 + i),
      title: `${r.series} ${r.name} English ONE PIECE CARD`,
      price,
      original_price: original,
      image: `/images/onepiece-english/${r.file}.webp`,
      category: "English One Piece",
      categories: ["English One Piece", r.sub],
      rating: ratings[i % ratings.length],
      in_stock: true,
      description: makeDescription(r),
    });
  });
  data.push(...created);

  fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
  console.error(`products.json: ${data.length} total (${created.length} English One Piece added)`);

  /* 4. summary */
  const summary = {
    boosterBoxes: created.filter((p) => p.categories[1] === "Booster Boxes").length,
    sealedCases: created.filter((p) => p.categories[1] === "Sealed Case").length,
    images: results.map((r) => `/images/onepiece-english/${r.file}.webp`),
    hero: "/images/onepiece-english/hero-english-op.webp",
  };
  fs.writeFileSync(path.join(ROOT, "scripts/dw-out", "english-summary.json"), JSON.stringify(summary, null, 2));
  console.error(JSON.stringify({ total: data.length, ...summary }, null, 2));
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
