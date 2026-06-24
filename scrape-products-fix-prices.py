#!/usr/bin/env python3
"""
Re-process products.json to fix prices.
Re-fetches individual product pages to get accurate prices.
"""

import json
import re
import subprocess
from html import unescape

JPY_TO_USD = 1 / 150
DISCOUNT = 0.88

def fetch_url(url, timeout=20):
    try:
        result = subprocess.run(
            ["curl", "-s", "-L", "--max-time", str(timeout), url],
            capture_output=True, timeout=timeout + 10
        )
        return result.stdout.decode("utf-8", errors="replace")
    except:
        return ""


def reparse_prices_from_listing():
    """Re-parse all products from listing pages with fixed price parsing."""
    
    output_path = "/home/z/my-project/public/products.json"
    with open(output_path, "r") as f:
        products = json.load(f)
    
    print(f"Loaded {len(products)} products", flush=True)
    
    # Build a map of original URLs to products
    url_to_product = {}
    for p in products:
        original_url = re.sub(r'^https?://web\.archive\.org/web/\d+/', '', p.get("url", ""))
        url_to_product[original_url] = p
    
    # Now re-fetch pages and extract prices with fixed parsing
    for timestamp in ["20250608105837", "20260117035451"]:
        base = f"https://web.archive.org/web/{timestamp}"
        for page in range(1, 11):
            if page == 1:
                url = f"{base}/https://www.fujicardshop.com/store/"
            else:
                url = f"{base}/https://www.fujicardshop.com/store/page/{page}/"
            
            html = fetch_url(url)
            if not html:
                continue
            
            blocks = html.split('<div class="product-small ')
            for block in blocks[1:]:
                url_match = re.search(r'href="([^"]*fujicardshop\.com/product/[^"]*)"', block)
                if not url_match:
                    continue
                original_url = re.sub(r'^https?://web\.archive\.org/web/\d+/', '', url_match.group(1))
                
                # Extract price with fixed parsing
                price_match = re.search(r'<bdi>(.*?)</bdi>', block, re.DOTALL)
                if price_match:
                    raw = price_match.group(1)
                    # First unescape HTML entities, then strip tags
                    clean = unescape(re.sub(r'<[^>]+>', '', raw))
                    clean = clean.replace("¥", "").replace("￥", "").replace(",", "").strip()
                    if clean and re.match(r'^\d+$', clean):
                        jpy = int(clean)
                        usd = round(jpy * JPY_TO_USD, 2)
                        discounted = round(usd * DISCOUNT, 2)
                        
                        if original_url in url_to_product:
                            url_to_product[original_url]["price"] = discounted
                            url_to_product[original_url]["original_price"] = usd
            
            print(f"  {timestamp} page {page} done", flush=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"Updated {len(products)} products", flush=True)
    
    # Price stats
    prices = [p["price"] for p in products]
    unique_prices = len(set(prices))
    print(f"Unique prices: {unique_prices}")
    print(f"Price range: ${min(prices):.2f} - ${max(prices):.2f}")


if __name__ == "__main__":
    reparse_prices_from_listing()
