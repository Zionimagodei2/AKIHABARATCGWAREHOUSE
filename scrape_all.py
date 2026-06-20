#!/usr/bin/env python3
"""Scrape all 4 TCG sites using Firecrawl v4 API."""

import json
import os
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-8cde4750199b4e8ab8f1d144f1feef99")
DATA_DIR = "/home/z/my-project/scraped-data"
os.makedirs(DATA_DIR, exist_ok=True)

def save_json(filename, data):
    with open(os.path.join(DATA_DIR, filename), "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  Saved {filename}")

def scrape_site(name, url, extra_pages=None):
    print(f"\n{'='*60}")
    print(f"SCRAPING: {name} - {url}")
    print(f"{'='*60}")
    
    # Scrape main page
    try:
        print("  Scraping main page...")
        result = app.scrape(url, formats=["markdown", "html"], only_main_content=False)
        save_json(f"{name}_main.json", result.model_dump() if hasattr(result, 'model_dump') else result)
        print("  Main page scraped!")
    except Exception as e:
        print(f"  Error scraping main page: {e}")
    
    # Scrape extra pages
    if extra_pages:
        for page_url in extra_pages:
            try:
                slug = page_url.rstrip("/").split("/")[-1].replace("-", "_") or "index"
                print(f"  Scraping: {page_url} ...")
                page_result = app.scrape(page_url, formats=["markdown", "html"], only_main_content=False)
                save_json(f"{name}_{slug}.json", page_result.model_dump() if hasattr(page_result, 'model_dump') else page_result)
            except Exception as e:
                print(f"  Error scraping {page_url}: {e}")

    # Crawl the site
    try:
        print(f"  Crawling {url} ...")
        crawl_result = app.crawl_url(url, limit=30, scrapeOptions={
            "formats": ["markdown", "html"],
            "onlyMainContent": True
        })
        save_json(f"{name}_crawl.json", crawl_result.model_dump() if hasattr(crawl_result, 'model_dump') else crawl_result)
        print("  Crawl completed!")
    except Exception as e:
        print(f"  Crawl error: {e}")

# ── 1. United Cards Warehouse (About content) ──
scrape_site("unitedcards", "https://unitedcardswarehousejapanese.com/", [
    "https://unitedcardswarehousejapanese.com/pages/about-us",
    "https://unitedcardswarehousejapanese.com/pages/about",
    "https://unitedcardswarehousejapanese.com/pages/shipping",
    "https://unitedcardswarehousejapanese.com/pages/contact",
    "https://unitedcardswarehousejapanese.com/collections/all",
])

# ── 2. Fuji Card Shop (Product images) ──
scrape_site("fujicards", "https://www.fujicardshop.com/", [
    "https://www.fujicardshop.com/collections/all",
    "https://www.fujicardshop.com/collections",
    "https://www.fujicardshop.com/pages/about-us",
    "https://www.fujicardshop.com/pages/shipping",
    "https://www.fujicardshop.com/pages/contact",
])

# ── 3. TCG Cards Warehouse Japanese (General) ──
scrape_site("tcgwarehouse", "https://tcgcardswarehousejapanese.com/", [
    "https://tcgcardswarehousejapanese.com/collections/all",
    "https://tcgcardswarehousejapanese.com/pages/about-us",
    "https://tcgcardswarehousejapanese.com/pages/shipping",
    "https://tcgcardswarehousejapanese.com/pages/contact",
    "https://tcgcardswarehousejapanese.com/pages/faq",
])

# ── 4. Kuro Card Shop (Additional) ──
scrape_site("kurocards", "https://kurocardshop.com/", [
    "https://kurocardshop.com/collections/all",
    "https://kurocardshop.com/pages/about-us",
    "https://kurocardshop.com/pages/shipping",
    "https://kurocardshop.com/pages/contact",
    "https://kurocardshop.com/pages/faq",
])

print("\n\n✅ ALL SCRAPING COMPLETE!")
