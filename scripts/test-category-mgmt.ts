/**
 * Category management test — verifies renameCategory / deleteCategory
 * against a stubbed baseline (no browser, no network).
 *
 *   npx tsx scripts/test-category-mgmt.ts
 */
// Stub localStorage before the store module loads
const mem: Record<string, string> = {};
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (k in mem ? mem[k] : null),
  setItem: (k: string, v: string) => { mem[k] = String(v); },
  removeItem: (k: string) => { delete mem[k]; },
  clear: () => { for (const k of Object.keys(mem)) delete mem[k]; },
};

// Stub fetch: serve a fixed products.json / content.json baseline
const BASELINE = [
  { id: "p1", title: "A", price: 10, image: "a.jpg", category: "Pokemon", categories: ["Pokemon", "Booster Boxes"], created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "p2", title: "B", price: 20, image: "b.jpg", category: "Pokemon", categories: ["Pokemon"], created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "p3", title: "C", price: 30, image: "c.jpg", category: "Other TCG", categories: ["Other TCG", "Weiss Schwarz"], created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "p4", title: "D", price: 40, image: "d.jpg", category: "Other TCG", categories: ["Other TCG"], created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "p5", title: "E", price: 50, image: "e.jpg", category: "Lorcana", categories: ["Lorcana"], created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "p6", title: "F", price: 60, image: "f.jpg", category: "Pokemon", categories: ["Pokemon", "Booster Boxes", "Promo"], created_at: "2026-01-01", updated_at: "2026-01-01" },
];
(globalThis as Record<string, unknown>).fetch = async (url: string) => {
  if (String(url).includes("products.json")) {
    return { ok: true, json: async () => BASELINE } as Response;
  }
  if (String(url).includes("content.json")) {
    return { ok: true, json: async () => ({}) } as Response;
  }
  return { ok: false, json: async () => ({}), text: async () => "" } as unknown as Response;
};

async function main() {
  const { adminStore } = await import("../src/lib/admin-store");
  await adminStore.ready();

  const cat = (id: string) => {
    const p = adminStore.getEffectiveProducts().find((x) => x.id === id)!;
    return `${p.category} | ${(p.categories || []).join(" ▸ ")}`;
  };
  let failures = 0;
  const check = (label: string, actual: unknown, expected: unknown) => {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n      expected ${JSON.stringify(expected)}\n      actual   ${JSON.stringify(actual)}`}`);
  };

  console.log("── renameCategory ──");
  const n1 = adminStore.renameCategory("Pokemon", "Pokémon TCG");
  check("returns affected count", n1, 3);
  check("p1 category+cats[0] updated, subs kept", cat("p1"), "Pokémon TCG | Pokémon TCG ▸ Booster Boxes");
  check("p2 (no subs) updated", cat("p2"), "Pokémon TCG | Pokémon TCG");
  check("other categories untouched", cat("p3"), "Other TCG | Other TCG ▸ Weiss Schwarz");
  const n1b = adminStore.renameCategory("Pokemon", "X"); // old name gone
  check("renaming the old (now empty) name affects 0", n1b, 0);

  console.log("── rename onto existing name = merge ──");
  const n2 = adminStore.renameCategory("Lorcana", "Other TCG");
  check("returns affected count", n2, 1);
  check("p5 merged into Other TCG", cat("p5"), "Other TCG | Other TCG");

  console.log("── rename same name / empty = no-op ──");
  check("same name → 0", adminStore.renameCategory("Other TCG", "Other TCG"), 0);
  check("empty target → 0", adminStore.renameCategory("Other TCG", "   "), 0);

  console.log("── deleteCategory: move, keep as subcategory ──");
  // Rebuild: p5 is now in Other TCG; make a fresh standalone category again
  adminStore.upsertProduct({ id: "p5", title: "E", price: 50, image: "e.jpg", category: "Digimon", categories: ["Digimon"] });
  const n3 = adminStore.deleteCategory("Digimon", { deleteProducts: false, moveTo: "Other TCG", keepAsSubcategory: true });
  check("returns affected count", n3, 1);
  check("p4-style: product without sub keeps old name as sub", cat("p5"), "Other TCG | Other TCG ▸ Digimon");

  console.log("── deleteCategory: move, keep existing subs ──");
  adminStore.upsertProduct({ id: "p6", title: "F", price: 60, image: "f.jpg", category: "Digimon", categories: ["Digimon", "Starter Decks"] });
  const n4 = adminStore.deleteCategory("Digimon", { deleteProducts: false, moveTo: "Other TCG", keepAsSubcategory: true });
  check("returns affected count", n4, 1);
  check("product WITH a sub keeps its own sub", cat("p6"), "Other TCG | Other TCG ▸ Starter Decks");

  console.log("── deleteCategory: delete products ──");
  const before = adminStore.getEffectiveProducts().length;
  const n5 = adminStore.deleteCategory("Pokémon TCG", { deleteProducts: true });
  check("returns affected count", n5, 2);
  check("products removed from catalog", adminStore.getEffectiveProducts().length, before - 2);

  console.log("── publish pipeline sees the changes ──");
  check("unpublished changes recorded", adminStore.getUnpublishedCount() > 0, true);
  const published = JSON.parse(adminStore.exportCatalog());
  check("no product left on deleted category", published.filter((p: { category: string }) => p.category === "Pokémon TCG" || p.category === "Digimon").length, 0);

  console.log("── renameSubcategory ──");
  // Fresh store (reset overlay via import) for clean sub tests
  adminStore.importCatalog(JSON.stringify(BASELINE));
  const s1 = adminStore.renameSubcategory("Pokemon", "Booster Boxes", "Booster Box");
  check("returns affected count (p1 + p6)", s1, 2);
  check("p1 sub renamed in place", cat("p1"), "Pokemon | Pokemon ▸ Booster Box");
  check("p6 first sub renamed, second kept", cat("p6"), "Pokemon | Pokemon ▸ Booster Box ▸ Promo");
  check("product without that sub untouched", cat("p2"), "Pokemon | Pokemon");
  const s1b = adminStore.renameSubcategory("Pokemon", "Booster Boxes", "X");
  check("renaming the old (now empty) sub affects 0", s1b, 0);
  const s1c = adminStore.renameSubcategory("Other TCG", "Weiss Schwarz", "Weiss");
  check("other categories untouched", s1c, 1);

  console.log("── renameSubcategory onto existing = merge (no duplicate) ──");
  const s2 = adminStore.renameSubcategory("Pokemon", "Promo", "Booster Box");
  check("returns affected count", s2, 1);
  check("p6 merged, no duplicate entries", cat("p6"), "Pokemon | Pokemon ▸ Booster Box");

  console.log("── renameSubcategory same/empty = no-op ──");
  check("same name → 0", adminStore.renameSubcategory("Pokemon", "Booster Box", "Booster Box"), 0);
  check("empty target → 0", adminStore.renameSubcategory("Pokemon", "Booster Box", "  "), 0);

  console.log("── deleteSubcategory: strip (products stay in category) ──");
  adminStore.importCatalog(JSON.stringify(BASELINE));
  const s3 = adminStore.deleteSubcategory("Pokemon", "Promo", { mode: "strip" });
  check("returns affected count", s3, 1);
  check("p6 loses only that sub, keeps the rest", cat("p6"), "Pokemon | Pokemon ▸ Booster Boxes");
  const s3b = adminStore.deleteSubcategory("Pokemon", "Booster Boxes", { mode: "strip" });
  check("strip last sub → product stays, category-only", cat("p1"), "Pokemon | Pokemon");
  check("category itself never dropped", cat("p6"), "Pokemon | Pokemon");

  console.log("── deleteSubcategory: move to sibling ──");
  adminStore.importCatalog(JSON.stringify(BASELINE));
  const s4 = adminStore.deleteSubcategory("Pokemon", "Promo", { mode: "move", moveTo: "Booster Boxes" });
  check("returns affected count", s4, 1);
  check("p6 sub replaced in place", cat("p6"), "Pokemon | Pokemon ▸ Booster Boxes");
  const s4b = adminStore.deleteSubcategory("Pokemon", "Booster Boxes", { mode: "move", moveTo: "Promo" });
  check("p6 keeps existing Promo, no duplicate", cat("p6"), "Pokemon | Pokemon ▸ Promo");

  console.log("── deleteSubcategory: delete products ──");
  adminStore.importCatalog(JSON.stringify(BASELINE));
  const before2 = adminStore.getEffectiveProducts().length;
  const s5 = adminStore.deleteSubcategory("Other TCG", "Weiss Schwarz", { mode: "delete" });
  check("returns affected count", s5, 1);
  check("product removed, others stay", adminStore.getEffectiveProducts().length, before2 - 1);
  check("p4 (same category, no sub) untouched", cat("p4"), "Other TCG | Other TCG");

  console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
