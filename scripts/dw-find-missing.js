/* DA Card World — search for the missing English One Piece products
   (OP-09, OP-12, EB-01, EB-02, EB-04, OP-05 BB, PRB-02 case).
   Stealth Playwright + regex tile parsing (same as dw-scrape-all.js). */
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");
const fs = require("fs");

const OUT = "/home/z/my-project/scripts/dw-out";
fs.mkdirSync(OUT, { recursive: true });

function unesc(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-");
}

/* Parse product tiles from a category listing HTML (server-rendered). */
function parseProducts(html) {
  const items = [];
  const liRe = /<li class="text-center">([\s\S]*?)<\/li>/g;
  let m;
  while ((m = liRe.exec(html))) {
    const block = m[1];
    const aRe = /<a href="(https:\/\/www\.dacardworld\.com\/gaming\/[^"]+)"[^>]*title="([^"]*)"/;
    const a = block.match(aRe) || block.match(/<a href="(https:\/\/www\.dacardworld\.com\/[^"]+)"[^>]*title="([^"]*)"/);
    if (!a) continue;
    const href = unesc(a[1]);
    const title = unesc(a[2]);
    const imgM =
      block.match(/data-src="(https:\/\/dacardworld1\.imgix\.net\/[^"]+)"/) ||
      block.match(/src="(https:\/\/dacardworld1\.imgix\.net\/[^"]+)"/) ||
      block.match(/src="(https:\/\/assets\.dacw\.co\/itemimages\/[^"]+)"/);
    if (!imgM) continue;
    const img = unesc(imgM[1]);
    const priceM = block.match(/data-itemprice="([\d.]+)"/);
    const price = priceM ? parseFloat(priceM[1]) : null;
    const outOfStock = /class="[^"]*out-of-stock|Out of Stock|Sold Out/i.test(block);
    const preOrder = /Pre-?Order|Presell/i.test(block);
    items.push({ href, title, img, price, outOfStock, preOrder });
  }
  return items;
}

const QUERIES = [
  "one piece OP-09",
  "one piece legacy of the master",
  "one piece memorial collection",
  "one piece anime 25th",
  "one piece egghead",
  "one piece awakening of the new era booster box",
  "one piece the best volume 2 case",
];

(async () => {
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 900 },
    locale: "en-US",
    timezoneId: "America/New_York",
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    window.chrome = { runtime: {} };
  });
  const page = await context.newPage();

  const results = {};
  for (const q of QUERIES) {
    const url = `https://www.dacardworld.com/search?Search=${encodeURIComponent(q)}`;
    process.stderr.write(`goto ${url}\n`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

    for (let i = 0; i < 24; i++) {
      const t = await page.title();
      if (!/just a moment|attention required/i.test(t)) break;
      await page.waitForTimeout(5000);
    }
    await page.waitForTimeout(1500);
    const html = await page.content();
    const items = parseProducts(html);
    results[q] = items;
    process.stderr.write(`  -> ${items.length} tiles\n`);
    items.slice(0, 12).forEach((p) =>
      process.stderr.write(`     ${p.title} | $${p.price} | oos=${p.outOfStock}\n`)
    );
  }

  fs.writeFileSync(`${OUT}/missing-search.json`, JSON.stringify(results, null, 2));
  process.stderr.write("saved missing-search.json\n");
  await browser.close();
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
