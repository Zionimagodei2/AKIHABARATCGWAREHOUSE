/* DA Card World scraper — stealth Playwright session
   Passes Cloudflare managed challenge, then dumps category HTML. */
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");
const fs = require("fs");

const OUT_DIR = "/home/z/my-project/scripts/dw-out";
fs.mkdirSync(OUT_DIR, { recursive: true });

const TARGET = process.argv[2] || "https://www.dacardworld.com/trading-cards/one-piece-card-game";
const NAME = process.argv[3] || "page";

(async () => {
  const browser = await chromium.launch({
    channel: "chromium", // full chromium new-headless: far less detectable
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1366,768",
    ],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "America/New_York",
    deviceScaleFactor: 1,
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    Object.defineProperty(navigator, "plugins", {
      get: () => [{ name: "Chrome PDF Viewer" }, { name: "Chrome PDF Plugin" }],
    });
    window.chrome = { runtime: {}, loadTimes: () => ({}), csi: () => ({}) };
    const origQuery = window.navigator.permissions?.query;
    if (origQuery) {
      window.navigator.permissions.query = (p) =>
        p.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : origQuery(p);
    }
  });

  const page = await context.newPage();
  console.error("goto:", TARGET);
  await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });

  // Wait out the Cloudflare challenge; click the Turnstile checkbox if it appears
  for (let i = 0; i < 30; i++) {
    const title = await page.title();
    if (!/just a moment|attention required|security/i.test(title)) {
      console.error("challenge passed at attempt", i);
      break;
    }
    if (i === 3) {
      try {
        const frame = page.frames().find((f) =>
          f.url().includes("challenges.cloudflare.com")
        );
        if (frame) {
          const cb = await frame.$('input[type="checkbox"]');
          if (cb) {
            await cb.click({ timeout: 5000 }).catch(() => {});
            console.error("clicked turnstile checkbox");
          }
        }
      } catch (e) {
        console.error("turnstile click failed:", e.message);
      }
    }
    await page.waitForTimeout(5000);
  }

  const title = await page.title();
  const url = page.url();
  console.error("TITLE:", title);
  console.error("URL:", url);

  if (/just a moment|attention required|security/i.test(title)) {
    fs.writeFileSync(`${OUT_DIR}/${NAME}-blocked.html`, await page.content());
    await page.screenshot({ path: `${OUT_DIR}/${NAME}-blocked.png` });
    console.error("STILL BLOCKED — dumped blocked state");
    await browser.close();
    process.exit(2);
  }

  // Scrolling to trigger lazy-loaded product grids
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 800) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2000);

  const html = await page.content();
  fs.writeFileSync(`${OUT_DIR}/${NAME}.html`, html);
  await page.screenshot({ path: `${OUT_DIR}/${NAME}.png`, fullPage: false });

  // Extract product tiles generically: links + images + prices
  const data = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const img = a.querySelector("img");
      if (!img) return;
      const src = img.currentSrc || img.src || "";
      if (!src || src.startsWith("data:")) return;
      const alt = img.alt || "";
      const text = (a.innerText || "").trim();
      if (!alt && !text) return;
      items.push({ href: a.href, img: src, alt, text: text.slice(0, 300) });
    });
    return {
      items,
      title: document.title,
      h1s: Array.from(document.querySelectorAll("h1,h2")).map((h) =>
        h.textContent.trim()
      ).slice(0, 40),
    };
  });
  fs.writeFileSync(
    `${OUT_DIR}/${NAME}.json`,
    JSON.stringify(data, null, 2)
  );
  console.error("products/tiles found:", data.items.length);
  console.log(JSON.stringify(data, null, 2).slice(0, 4000));

  await browser.close();
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
