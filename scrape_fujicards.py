#!/usr/bin/env python3
"""Scrape fujicardshop.com for product images and data."""

import json
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-8cde4750199b4e8ab8f1d144f1feef99")

# Scrape the main site
print("Scraping fujicardshop.com...")
result = app.scrape_url("https://www.fujicardshop.com/", params={
    "formats": ["markdown", "html", "links"],
    "onlyMainContent": True
})

with open("/home/z/my-project/scraped-data/fujicards_main.json", "w") as f:
    json.dump(result, f, indent=2, default=str)

print("Main page scraped!")

# Crawl the whole site for products
print("\nCrawling fujicardshop.com for all product pages...")
try:
    crawl_result = app.crawl_url("https://www.fujicardshop.com/", params={
        "limit": 50,
        "scrapeOptions": {
            "formats": ["markdown", "html"],
            "onlyMainContent": True
        }
    })
    with open("/home/z/my-project/scraped-data/fujicards_crawl.json", "w") as f:
        json.dump(crawl_result, f, indent=2, default=str)
    print("Crawl completed!")
except Exception as e:
    print(f"Crawl error: {e}")

# Try to scrape shop/collection pages
shop_urls = [
    "https://www.fujicardshop.com/collections/all",
    "https://www.fujicardshop.com/collections",
    "https://www.fujicardshop.com/shop",
    "https://www.fujicardshop.com/products",
]

for url in shop_urls:
    try:
        print(f"Scraping: {url}")
        shop_result = app.scrape_url(url, params={
            "formats": ["markdown", "html", "links"],
            "onlyMainContent": True
        })
        with open(f"/home/z/my-project/scraped-data/fujicards_{url.split('/')[-1] or 'shop'}.json", "w") as f:
            json.dump(shop_result, f, indent=2, default=str)
        print(f"Scraped {url}")
    except Exception as e:
        print(f"Error scraping {url}: {e}")

print("Done with fujicardshop.com!")
