/* DA Card World — scrape all pages of the Bandai TCGs category,
   extract English One Piece booster boxes & sealed cases with prices + images.
   Parsing done in Node (regex) on the fetched HTML. */
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");
const fs = require("fs");

const OUT = "/home/z/my-project/scripts/dw-out";
fs.mkdirSync(OUT, { recursive: true });

function unesc(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/* Parse product tiles from a category listing HTML (server-rendered). */
function parseProducts(html) {
  const items = [];
  // li blocks
  const liRe = /<li class="text-center">([\s\S]*?)<\/li>/g;
  let m;
  while ((m = liRe.exec(html))) {
    const block = m[1];
    const aRe = /<a href="(https:\/\/www\.dacardworld\.com\/gaming\/[^"]+)"[^>]*title="([^"]*)"[^>]*class="th"/;
    const a = block.match(aRe) || block.match(/<a href="(https:\/\/www\.dacardworld\.com\/[^"]+)"[^>]*class="th"[^>]*title="([^"]*)"/);
    if (!a) continue;
    const href = unesc(a[1]);
    const title = unesc(a[2]);
    const imgM =
      block.match(/data-src="(https:\/\/dacardworld1\.imgix\.net\/[^"]+)"/) ||
      block.match(/src="(https:\/\/dacardworld1\.imgix\.net\/[^"]+)"/);
    if (!imgM) continue;
    const img = unesc(imgM[1]);
    const priceM = block.match(/data-itemprice="([\d.]+)"/);
    const price = priceM ? parseFloat(priceM[1]) : null;
    const subM = block.match(/data-itemsubcategory="([^"]*)"/);
    const subcategory = subM ? unesc(subM[1]) : null;
    const stockM = block.match(/data-itemqty="[^"]*"[\s\S]*?/);
    const outOfStock = /class="[^"]*out-of-stock|Out of Stock|Sold Out/i.test(block);
    const preOrder = /Pre-?Order|Presell/i.test(block);
    items.push({ href, title, img, price, subcategory, outOfStock, preOrder });
  }
  return items;
}

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

  const allProducts = [];
  const seen = new Set();
  let pageNum = 1;

  while (pageNum <= 15) {
    const url =
      pageNum === 1
        ? "https://www.dacardworld.com/gaming/bandai-tcgs"
        : `https://www.dacardworld.com/gaming/bandai-tcgs?Page=${pageNum}`;
    process.stderr.write(`goto page ${pageNum}\n`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

    for (let i = 0; i < 24; i++) {
      const t = await page.title();
      if (!/just a moment|attention required/i.test(t)) break;
      await page.waitForTimeout(5000);
    }
    await page.waitForTimeout(1200);

    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 900) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    }).catch(() => {});
    await page.waitForTimeout(1000);

    const html = await page.content();
    fs.writeFileSync(`${OUT}/bandai-p${pageNum}.html`, html);

    const products = parseProducts(html);
    let newCount = 0;
    for (const p of products) {
      if (p.href && p.title && !seen.has(p.href)) {
        seen.add(p.href);
        allProducts.push(p);
        newCount++;
      }
    }
    process.stderr.write(
      `page ${pageNum}: ${products.length} tiles, ${newCount} new (total ${allProducts.length})\n`
    );

    if (!new RegExp(`Page=${pageNum + 1}`).test(html)) {
      process.stderr.write("no next page — done\n");
      break;
    }
    pageNum++;
  }

  fs.writeFileSync(`${OUT}/all-bandai.json`, JSON.stringify(allProducts, null, 2));

  const onePiece = allProducts.filter(
    (p) =>
      /one[- ]piece/i.test(p.title) &&
      !/japanese|psa|bikkura|tamashi|figure|starter deck|bath bomb|don!!/i.test(p.title)
  );
  fs.writeFileSync(
    `${OUT}/one-piece-english.json`,
    JSON.stringify(onePiece, null, 2)
  );
  process.stderr.write(`\nEnglish One Piece products: ${onePiece.length}\n`);

  await browser.close();
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
