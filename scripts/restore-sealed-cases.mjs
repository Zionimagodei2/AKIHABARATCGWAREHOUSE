import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Restore the 43 missing Pokémon Sealed Case products + give every sealed
 * case (Pokémon AND One Piece) a visually distinct image.
 *
 * Background: the repo's public/products.json (202 products, the catalog the
 * original site shipped) dropped all Pokémon sealed cases that still exist
 * in public/products_intermediate.json (the pre-final data file kept in the
 * original repo). One Piece sealed cases survived, but share the exact same
 * images as their booster-box counterparts, which makes the two sections
 * look like duplicated products.
 *
 * What this script does:
 *  1. Extracts the 43 Pokémon sealed cases from products_intermediate.json
 *     (price > 0, sealed-case products only — the rest of the "missing" file
 *     entries are known duplicates of retitled products or price-0 junk).
 *  2. Maps each sealed case to the LOCAL image of the same series (every
 *     series has a booster-box counterpart with a local fujicards webp).
 *  3. Renders a "SEALED CASE · N BOXES" badge overlay onto a copy of that
 *     image → public/images/fujicards/sc-<series>.webp
 *  4. Does the same for the 23 existing One Piece sealed cases so they no
 *     longer look identical to booster boxes.
 *  5. Appends the 43 restored products (ids 203+) to public/products.json.
 */
const ROOT = "/home/z/my-project";
const FINAL = path.join(ROOT, "public/products.json");
const INTER = path.join(ROOT, "repo-preview/public/products_intermediate.json");
const IMG_DIR = path.join(ROOT, "public/images/fujicards");

const finalProducts = JSON.parse(fs.readFileSync(FINAL, "utf-8"));
const interProducts = JSON.parse(fs.readFileSync(INTER, "utf-8"));

/* ── series code extraction (e.g. "SV4a Shiny Treasure ex Sealed Case…" → "SV4a") ── */
function seriesCode(title) {
  const t = title.replace(/^\[?[Pp]re-?[Oo]rder[^\]]*\]?\s*/, "").trim();
  const m = t.match(/^([A-Za-z]+[-]?\d+[a-zA-Z]?)\b/);
  return m ? m[1] : null;
}

function boxCount(title) {
  const m = title.match(/\(?(\d+)\s*box/i);
  return m ? parseInt(m[1], 10) : null;
}

/* ── find local image for a series among existing products ── */
function findLocalImage(code, category, subcategoryPreference) {
  const re = new RegExp(`\\b${code.replace(/[-]/g, "[-\\s]?")}\\b`, "i");
  const pool = finalProducts.filter(
    (p) => p.category === category && re.test(p.title)
  );
  const preferred = pool.filter((p) =>
    subcategoryPreference.some((s) => (p.categories || []).includes(s))
  );
  const chosen = preferred.length ? preferred : pool;
  if (!chosen.length) return null;
  // Prefer an in-stock, higher-rated product's image
  chosen.sort((a, b) => (b.in_stock ? 1 : 0) - (a.in_stock ? 1 : 0) || (b.rating ?? 0) - (a.rating ?? 0));
  return chosen[0].image;
}

/* ── badge overlay SVG ── */
function badgeSvg(boxes) {
  const line2 = boxes ? `${boxes} BOXES` : "";
  const h = line2 ? 64 : 46;
  const w = 204;
  const texts = [
    `<text x="${w / 2}" y="27" font-family="DejaVu Sans" font-weight="bold" font-size="19" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">SEALED CASE</text>`,
  ];
  if (line2) {
    texts.push(
      `<text x="${w / 2}" y="50" font-family="DejaVu Sans" font-size="14" fill="#ddd6fe" text-anchor="middle" letter-spacing="1.2">${line2}</text>`
    );
  }
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${w}" height="${h}" rx="9" fill="#4c1d95" fill-opacity="0.93" stroke="#ffffff" stroke-opacity="0.92" stroke-width="1.5"/>
      ${texts.join("\n")}
    </svg>`
  );
}

/* ── generate a sealed-case image from a source local image ── */
async function makeSealedCaseImage(srcImage, series, boxes) {
  const slug = series.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const out = `sc-${slug}.webp`;
  const outPath = path.join(IMG_DIR, out);
  await sharp(path.join(ROOT, "public", srcImage))
    .composite([{ input: badgeSvg(boxes), top: 12, left: 12 }])
    .webp({ quality: 82, effort: 6 })
    .toFile(outPath);
  return `/images/fujicards/${out}`;
}

/* ══ 1) Restore the missing Pokémon sealed cases ══ */
const finalTitles = new Set(finalProducts.map((p) => p.title.trim().toLowerCase()));
const sealedCaseRe = /sealed case/i;
const restored = [];
const problems = [];

for (const p of interProducts) {
  const cats = p.categories || [];
  const isPokemon =
    (cats[0] === "Pokemon" || p.category === "Pokemon") &&
    (sealedCaseRe.test(p.title) || cats.some((c) => /sealed case/i.test(c)));
  if (!isPokemon) continue;
  if (!p.title || !(p.price > 0)) continue;
  if (finalTitles.has(p.title.trim().toLowerCase())) continue; // already present

  const code = seriesCode(p.title);
  if (!code) {
    problems.push(`no series code: ${p.title}`);
    continue;
  }
  const srcImage = findLocalImage(code, "Pokemon", ["Booster Boxes", "Special Set & Promo"]);
  if (!srcImage) {
    problems.push(`no local image for ${code}: ${p.title}`);
    continue;
  }
  const image = await makeSealedCaseImage(srcImage, code, boxCount(p.title));
  restored.push({
    id: null, // assigned after
    title: p.title.trim(),
    price: p.price,
    original_price: p.original_price && p.original_price > 0 ? p.original_price : null,
    image,
    category: "Pokemon",
    categories: ["Pokemon", "Sealed Case"],
    rating: p.rating ?? 4.5,
    in_stock: !!p.in_stock,
  });
}

// Dedupe by title (paranoia) and assign ids after the current max
const seen = new Set();
const unique = restored.filter((p) => {
  const k = p.title.toLowerCase();
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});
let nextId = Math.max(...finalProducts.map((p) => parseInt(p.id, 10))) + 1;
for (const p of unique) p.id = String(nextId++);

/* ══ 2) Distinct images for the 23 existing One Piece sealed cases ══ */
let opUpdated = 0;
const opProblems = [];
for (const p of finalProducts) {
  if (p.category !== "One Piece") continue;
  if (!(p.categories || []).includes("Sealed Case")) continue;
  const code = seriesCode(p.title);
  if (!code) {
    opProblems.push(`no series code: ${p.title}`);
    continue;
  }
  const srcImage = findLocalImage(code, "One Piece", ["Booster Boxes"]);
  if (!srcImage) {
    opProblems.push(`no source image for ${code}`);
    continue;
  }
  // Source = the booster-box image (currently identical to the SC image);
  // overlay the badge so the SC card is visually distinct.
  p.image = await makeSealedCaseImage(srcImage, code, boxCount(p.title));
  opUpdated++;
}

/* ══ 2b) "SV9 Collection File Set Lillie" is a special-set case, not a BB
     case — give it the SV9 special-set art instead of the booster box art,
     so it doesn't collide with the SV9 Battle Partners case image ══ */
const lillie = unique.find((p) => /lillie/i.test(p.title));
if (lillie) {
  const specialSetSrc = finalProducts.find((p) =>
    p.category === "Pokemon" &&
    (p.categories || []).includes("Special Set & Promo") &&
    /SV9\b/i.test(p.title)
  );
  if (specialSetSrc) {
    const files = (lillie.title.match(/\(?(\d+)\s*files?/i) || [])[1];
    lillie.image = await makeSealedCaseImage(specialSetSrc.image, "sv9-lillie", files ? parseInt(files, 10) : null);
  }
}

/* ══ 3) Write the updated catalog ══ */
const updated = [...finalProducts, ...unique];
fs.writeFileSync(FINAL, JSON.stringify(updated));

console.log(`✓ Restored ${unique.length} Pokémon sealed cases (ids ${unique[0]?.id}–${unique[unique.length - 1]?.id})`);
console.log(`✓ Regenerated images for ${opUpdated} One Piece sealed cases`);
console.log(`✓ Total products: ${updated.length}`);
if (problems.length) {
  console.log("\n⚠ Pokémon restore problems:");
  problems.forEach((x) => console.log("  -", x));
}
if (opProblems.length) {
  console.log("\n⚠ One Piece image problems:");
  opProblems.forEach((x) => console.log("  -", x));
}

/* ── summary table ── */
const counts = {};
for (const p of updated) {
  const key = `${p.category} / ${(p.categories || [])[1] || "?"}`;
  counts[key] = (counts[key] || 0) + 1;
}
console.log("\n=== final catalog structure ===");
for (const [k, v] of Object.entries(counts).sort()) console.log(`  ${k}: ${v}`);
