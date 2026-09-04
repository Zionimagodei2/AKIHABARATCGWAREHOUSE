#!/usr/bin/env node
/* Simulate the Render rebuild landing — v2: proper UTF-8 decoding of the
   base64 PUT bodies captured from the browser publish flow. */

import { execSync } from "node:child_process";
import fs from "node:fs";

function getPageVar(expr) {
  const raw = execSync(`agent-browser eval "JSON.stringify(${expr})"`, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  const line = raw.trim().split("\n").filter((l) => !l.startsWith("[agent-browser]") && l.length > 0).pop();
  return JSON.parse(JSON.parse(line));
}

// 1. Capture the RAW base64 of the PUT bodies from the page
const productsB64 = getPageVar("window.__ghB64['public/products.json']");
const contentB64 = getPageVar("window.__ghB64['public/content.json']");

// 2. Decode as UTF-8 (what the real GitHub/rebuild would produce)
const products = Buffer.from(productsB64, "base64").toString("utf8");
const content = Buffer.from(contentB64, "base64").toString("utf8");

fs.writeFileSync("/home/z/my-project/out/products.json", products);
fs.writeFileSync("/home/z/my-project/out/content.json", content);

// 3. Report + sanity
console.log("Wrote out/products.json:", Buffer.byteLength(products), "bytes,", products.length, "chars");
console.log("Wrote out/content.json:", Buffer.byteLength(content), "bytes");

const data = JSON.parse(products);
console.log("Product count:", data.length);
const first = data.find((p) => p.id === "2");
console.log("Product '2': price", first.price, "original", first.original_price, "in_stock", first.in_stock);

// fnv1a over the file text — must equal the store's pending hash
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
console.log("File hash (should match store pending):", fnv1a(products.trim()));
