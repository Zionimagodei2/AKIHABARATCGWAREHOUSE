/* PriceCharting stealth scrape — find One Piece sealed product pages + images.
   Usage: node scripts/pc-scrape.js <url> <outname> [extractMode] */
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");
const fs = require("fs");

const TARGET = process.argv[2];
const NAME = process.argv[3] || "page";
const MODE = process.argv[4] || "console"; // console | product

(async () => {
  const browser = await chromium.launch({
    channel: "chromium", headless: true,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 900 }, locale: "en-US", timezoneId: "America/New_York",
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    window.chrome = { runtime: {} };
  });
  const page = await context.newPage();
  process.stderr.write("goto: " + TARGET + "\n");
  await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });

  for (let i = 0; i < 30; i++) {
    const t = await page.title();
    if (!/just a moment|attention required|checking your browser/i.test(t)) break;
    if (i === 3) {
      try {
        const frame = page.frames().find((f) => f.url().includes("challenges.cloudflare.com"));
        if (frame) {
          const cb = await frame.$('input[type="checkbox"]');
          if (cb) { await cb.click({ timeout: 5000 }).catch(() => {}); process.stderr.write("clicked turnstile\n"); }
        }
      } catch (e) {}
    }
    await page.waitForTimeout(5000);
  }
  process.stderr.write("TITLE: " + (await page.title()) + "\n");
  await page.waitForTimeout(2500);
  const html = await page.content();
  fs.writeFileSync(`/tmp/pc-${NAME}.html`, html);

  if (MODE === "product") {
    // Extract product image + price data
    const data = await page.evaluate(() => {
      const og = document.querySelector('meta[property="og:image"]')?.content || null;
      const title = document.title;
      const h1 = document.querySelector("h1")?.textContent?.trim() || "";
      // price table rows
      const rows = [];
      document.querySelectorAll("table#price_data tr, table tr").forEach((tr) => {
        const tds = Array.from(tr.querySelectorAll("td")).map((td) => td.textContent.trim());
        if (tds.length >= 2) rows.push(tds.slice(0, 3));
      });
      // product images (full-size)
      const imgs = [];
      document.querySelectorAll("img").forEach((img) => {
        const src = img.currentSrc || img.src || "";
        if (src && !src.includes("sprite") && (img.width > 150 || img.naturalWidth > 150)) imgs.push(src);
      });
      return { title, h1, og, imgs: [...new Set(imgs)].slice(0, 8), rows: rows.slice(0, 15) };
    });
    fs.writeFileSync(`/tmp/pc-${NAME}.json`, JSON.stringify(data, null, 2));
    console.log(JSON.stringify(data, null, 2));
  } else {
    // console mode: extract set links
    const data = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll("a[href*='/game/one-piece-card-game/']").forEach((a) => {
        links.push({ href: a.href, text: (a.textContent || "").trim().slice(0, 80) });
      });
      return links;
    });
    fs.writeFileSync(`/tmp/pc-${NAME}.json`, JSON.stringify(data, null, 2));
    console.log(JSON.stringify([...new Map(data.map((x) => [x.href, x])).values()], null, 2).slice(0, 6000));
  }
  await page.screenshot({ path: `/tmp/pc-${NAME}.png`, fullPage: false });
  await browser.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
