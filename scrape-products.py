#!/usr/bin/env python3
"""
Scrape products from fujicardshop.com via the Wayback Machine.
Uses subprocess curl for reliable redirect handling.
"""

import json
import re
import subprocess
from html import unescape

TIMESTAMP = "20250608105837"
BASE_WAYBACK = f"https://web.archive.org/web/{TIMESTAMP}"

CATEGORY_MAP = {
    "pokemon": "Pokemon",
    "one-piece": "One Piece",
    "dragon-ball": "Dragon Ball",
    "weiss-schwarz": "Weiss Schwarz",
    "gundam": "Gundam",
    "union-arena": "Union Arena",
    "disney-lorcana": "Disney Lorcana",
}

SUBCATEGORY_MAP = {
    "booster-boxes-pokemon": "Booster Boxes",
    "booster-packs-pokemon": "Booster Packs",
    "elite-trainer-box-pokemon": "Elite Trainer Box",
    "sealed-case-pokemon": "Sealed Case",
    "deck-starter-pokemon": "Deck Starter",
    "special-collection-pokemon": "Special Collection",
    "tins-promo-pokemon": "Tins & Promo",
}

JPY_TO_USD = 1 / 150
DISCOUNT = 0.88


def fetch_url(url, timeout=25):
    try:
        result = subprocess.run(
            ["curl", "-s", "-L", "--max-time", str(timeout), url],
            capture_output=True, timeout=timeout + 10
        )
        return result.stdout.decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  Fetch error: {e}", flush=True)
        return ""


def parse_products(html):
    if not html:
        return []
    products = []
    blocks = html.split('<div class="product-small ')
    for block in blocks[1:]:
        product = {}
        url_match = re.search(r'href="([^"]*fujicardshop\.com/product/[^"]*)"', block)
        if not url_match:
            continue
        product["url"] = url_match.group(1)
        original_url = re.sub(r'^https?://web\.archive\.org/web/\d+/', '', product["url"])
        product["original_url"] = original_url

        title_match = re.search(r'<p class="name product-title[^"]*"[^>]*><a[^>]*>(.*?)</a></p>', block, re.DOTALL)
        if title_match:
            product["title"] = unescape(re.sub(r'<[^>]+>', '', title_match.group(1)).strip())
        if not product.get("title"):
            aria_match = re.search(r'aria-label="([^"]*)"', block)
            if aria_match:
                product["title"] = unescape(aria_match.group(1))
        if not product.get("title"):
            continue

        # Get the first real image src
        img_matches = re.findall(r'<img[^>]*?src="([^"]*)"[^>]*?/', block)
        for img_src in img_matches:
            if 'data:image' not in img_src and 'logo' not in img_src.lower() and 'icon' not in img_src.lower():
                product["image"] = img_src
                break
        if not product.get("image"):
            img_match = re.search(r'data-src="([^"]*)"', block)
            if img_match:
                product["image"] = img_match.group(1)

        price_match = re.search(r'<bdi>(.*?)</bdi>', block, re.DOTALL)
        if price_match:
            price_text = re.sub(r'<[^>]+>', '', price_match.group(1)).replace("¥", "").replace("￥", "").replace(",", "").strip()
            if price_text and re.match(r'^\d+$', price_text):
                product["raw_price_jpy"] = int(price_text)

        cat_match = re.search(r'product_cat-([a-z-]+)', block)
        if cat_match:
            product["cat_slug"] = cat_match.group(1)

        cat_text_match = re.search(r'<p class="category[^"]*"[^>]*>\s*(.*?)\s*</p>', block, re.DOTALL)
        if cat_text_match:
            product["cat_text"] = re.sub(r'<[^>]+>', '', cat_text_match.group(1)).strip()

        products.append(product)
    return products


def determine_category(product):
    cat_slug = product.get("cat_slug", "")
    cat_text = product.get("cat_text", "").lower()
    url = product.get("original_url", product.get("url", "")).lower()
    title = product.get("title", "").lower()
    for slug, cat_name in CATEGORY_MAP.items():
        if slug.replace("-", " ") in cat_text or slug in url:
            return cat_name
    if "one piece" in title: return "One Piece"
    if "dragon ball" in title: return "Dragon Ball"
    if "weiss" in title or "schwarz" in title: return "Weiss Schwarz"
    if "gundam" in title: return "Gundam"
    if "union arena" in title: return "Union Arena"
    if "lorcana" in title or "disney" in title: return "Disney Lorcana"
    return "Pokemon"


def determine_subcategory(product):
    cat_slug = product.get("cat_slug", "")
    cat_text = product.get("cat_text", "").lower()
    url = product.get("original_url", product.get("url", "")).lower()
    title = product.get("title", "").lower()
    for slug, subcat_name in SUBCATEGORY_MAP.items():
        if slug in cat_slug or slug.replace("-", " ") in cat_text or slug in url:
            return subcat_name
    if "booster box" in title: return "Booster Boxes"
    if "booster pack" in title: return "Booster Packs"
    if "elite trainer" in title or "etb" in title: return "Elite Trainer Box"
    if "sealed case" in title or "case 12" in title: return "Sealed Case"
    if "deck" in title and "starter" in title: return "Deck Starter"
    if "special collection" in title or "premium collection" in title: return "Special Collection"
    if "tin" in title or "promo" in title: return "Tins & Promo"
    return None


def format_product(raw, product_id):
    category = determine_category(raw)
    subcategory = determine_subcategory(raw)
    raw_price_jpy = raw.get("raw_price_jpy")
    if raw_price_jpy and raw_price_jpy > 100:
        price_usd = round(raw_price_jpy * JPY_TO_USD, 2)
        discounted_price = round(price_usd * DISCOUNT, 2)
    else:
        price_usd = 49.99
        discounted_price = round(price_usd * DISCOUNT, 2)
    categories = [category]
    if subcategory:
        categories.append(subcategory)
    return {
        "id": str(product_id),
        "title": raw.get("title", "Unknown Product"),
        "price": discounted_price,
        "original_price": price_usd,
        "image": raw.get("image", ""),
        "description": "Authentic Japanese TCG product.",
        "category": category,
        "categories": categories,
        "rating": round(4.5 + (hash(raw.get("title", "")) % 30) / 100, 1),
        "in_stock": True,
        "source": "fujicards",
        "url": raw.get("url", ""),
    }


def main():
    all_products = []
    seen_urls = set()
    product_id = 1

    def add_products(products):
        nonlocal product_id
        added = 0
        for p in products:
            original_url = p.get("original_url", p.get("url", ""))
            if original_url and original_url not in seen_urls:
                seen_urls.add(original_url)
                all_products.append(format_product(p, product_id))
                product_id += 1
                added += 1
        return added

    # Store pages 1-10
    print("=== Store pages ===", flush=True)
    for page in range(1, 11):
        if page == 1:
            url = f"{BASE_WAYBACK}/https://www.fujicardshop.com/store/"
        else:
            url = f"{BASE_WAYBACK}/https://www.fujicardshop.com/store/page/{page}/"
        print(f"  Page {page}...", end=" ", flush=True)
        html = fetch_url(url)
        products = parse_products(html)
        added = add_products(products)
        print(f"{len(products)} found, {added} new (total: {len(all_products)})", flush=True)
        if len(products) == 0:
            break

    # Category pages
    print("\n=== Category pages ===", flush=True)
    for slug, cat_name in CATEGORY_MAP.items():
        for page in range(1, 6):
            if page == 1:
                url = f"{BASE_WAYBACK}/https://www.fujicardshop.com/product-category/{slug}/"
            else:
                url = f"{BASE_WAYBACK}/https://www.fujicardshop.com/product-category/{slug}/page/{page}/"
            print(f"  {cat_name} p{page}...", end=" ", flush=True)
            html = fetch_url(url)
            products = parse_products(html)
            added = add_products(products)
            print(f"{len(products)} found, {added} new", flush=True)
            if len(products) == 0:
                break

    # Pokemon sub-categories
    print("\n=== Pokemon sub-categories ===", flush=True)
    for slug, subcat_name in SUBCATEGORY_MAP.items():
        for page in range(1, 4):
            if page == 1:
                url = f"{BASE_WAYBACK}/https://www.fujicardshop.com/product-category/pokemon/{slug}/"
            else:
                url = f"{BASE_WAYBACK}/https://www.fujicardshop.com/product-category/pokemon/{slug}/page/{page}/"
            print(f"  {subcat_name} p{page}...", end=" ", flush=True)
            html = fetch_url(url)
            products = parse_products(html)
            added = add_products(products)
            print(f"{len(products)} found, {added} new", flush=True)
            if len(products) == 0:
                break

    print(f"\n=== Total: {len(all_products)} products ===", flush=True)
    output_path = "/home/z/my-project/public/products.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    print(f"Saved to {output_path}", flush=True)

    cat_counts = {}
    for p in all_products:
        cat_counts[p["category"]] = cat_counts.get(p["category"], 0) + 1
    print("\nBreakdown:")
    for cat, count in sorted(cat_counts.items()):
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()
