/**
 * buildCategoryTabs test — extracts the REAL function from tcg-store.tsx
 * and verifies tab visibility across catalog states.
 *
 *   npx tsx scripts/test-category-tabs.ts
 */
import { readFileSync, writeFileSync, rmSync } from "fs";

const src = readFileSync("src/components/tcg-store.tsx", "utf8");

// Pull CATEGORY_TABS and buildCategoryTabs verbatim out of the source
const tabsMatch = src.match(/const CATEGORY_TABS = \[[\s\S]*?\n\];/);
const fnMatch = src.match(/function buildCategoryTabs\([\s\S]*?\n\}/);
if (!tabsMatch || !fnMatch) {
  console.error("FAIL  could not extract CATEGORY_TABS / buildCategoryTabs from source");
  process.exit(1);
}
// Drop the `typeof CATEGORY_TABS` return annotation (private type alias) and
// the Product type import — plain JS is enough for this logic test.
const fnSrc = fnMatch[0]
  .replace(/: typeof CATEGORY_TABS/, "")
  .replace(/: Product\[\]/, "")
  .replace(/new Set<string>\(\)/, "new Set()");
writeFileSync("scripts/.tmp-tabs.mjs", `${tabsMatch[0]}\n${fnSrc}\nexport { buildCategoryTabs };\n`);
const { buildCategoryTabs } = await import("./.tmp-tabs.mjs");
rmSync("scripts/.tmp-tabs.mjs");
type Tab = { key: string; label: string; gradient?: string; sectionGradient?: string };
const typedBuild = buildCategoryTabs as (products: { category: string }[], loading?: boolean) => Tab[];

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n      expected ${JSON.stringify(expected)}\n      actual   ${JSON.stringify(actual)}`}`);
};
const keys = (products: { category: string }[], loading = false) =>
  typedBuild(products, loading).map((t) => t.key);

console.log("── current catalog (all defaults populated) ──");
const full = [
  { category: "Pokemon" }, { category: "Pokemon" },
  { category: "English One Piece" },
  { category: "Japanese One Piece" },
  { category: "Other TCG" }, { category: "Other TCG" },
];
check("all default tabs present, fresh ones inserted before Other TCG", keys(full),
  ["all", "Pokemon", "English One Piece", "Japanese One Piece", "Other TCG"]);

console.log("── loading / empty catalog keeps defaults (no flash) ──");
check("loading=true → full defaults", keys([], true),
  ["all", "Pokemon", "English One Piece", "Japanese One Piece", "Other TCG"]);
check("empty catalog → full defaults", keys([]),
  ["all", "Pokemon", "English One Piece", "Japanese One Piece", "Other TCG"]);

console.log("── renamed/deleted default category disappears ──");
const noPokemon = [
  { category: "Pokemon TCG" }, { category: "English One Piece" }, { category: "Other TCG" },
];
check("Pokemon renamed away → no ghost tab, new name appears", keys(noPokemon),
  ["all", "English One Piece", "Pokemon TCG", "Other TCG"]);

const noOther = [
  { category: "Pokemon" }, { category: "English One Piece" }, { category: "Japanese One Piece" },
];
check("Other TCG deleted → catch-all tab hidden too", keys(noOther),
  ["all", "Pokemon", "English One Piece", "Japanese One Piece"]);

console.log("── edge: single category left ──");
check("only Pokemon survives", keys([{ category: "Pokemon" }]), ["all", "Pokemon"]);

console.log("── fresh (admin-created) categories keep working ──");
const withFresh = [
  { category: "Pokemon" }, { category: "Digimon" }, { category: "Lorcana" }, { category: "Other TCG" },
];
check("fresh categories sorted, before Other TCG", keys(withFresh),
  ["all", "Pokemon", "Digimon", "Lorcana", "Other TCG"]);

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
