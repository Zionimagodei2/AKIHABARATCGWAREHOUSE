#!/usr/bin/env node
/**
 * Pin every dependency in package.json to the exact version currently
 * installed in node_modules/. This guarantees that a fresh `npm install`
 * on a CI/host (e.g. Render) resolves the exact same versions the site
 * was developed and tested with, instead of floating to newer releases
 * inside the ^ ranges.
 *
 * Idempotent: re-running produces the same result.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const pkgPath = join(ROOT, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

function installedVersion(name) {
  for (const p of [join(ROOT, "node_modules", name), join(ROOT, "node_modules", ".pnpm", name)]) {
    const manifest = join(p, "package.json");
    if (existsSync(manifest)) {
      try { return JSON.parse(readFileSync(manifest, "utf8")).version; } catch {}
    }
  }
  return null;
}

let pinned = 0, already = 0, missing = [];
for (const section of ["dependencies", "devDependencies"]) {
  const deps = pkg[section];
  if (!deps) continue;
  for (const name of Object.keys(deps)) {
    const cur = deps[name];
    const ver = installedVersion(name);
    if (!ver) { missing.push(name); continue; }
    if (cur === ver) { already++; continue; }
    deps[name] = ver; // exact pin: no ^ ~ range
    pinned++;
  }
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`Pinned ${pinned} ranges to exact versions (${already} already exact)`);
if (missing.length) {
  console.log("Not found in node_modules (left untouched):");
  for (const m of missing) console.log("  - " + m);
}
