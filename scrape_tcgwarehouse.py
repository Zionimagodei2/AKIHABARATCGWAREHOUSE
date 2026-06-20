#!/usr/bin/env python3
"""Scrape tcgcardswarehousejapanese.com for general content."""

import json
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-8cde4750199b4e8ab8f1d144f1feef99")

# Scrape the main site
print("Scraping tcgcardswarehousejapanese.com...")
result = app.scrape_url("https://tcgcardswarehousejapanese.com/", params={
    "formats": ["markdown", "html", "links"],
    "onlyMainContent": True
})

with open("/home/z/my-project/scraped-data/tcgwarehouse_main.json", "w") as f:
    json.dump(result, f, indent=2, default=str)

print("Main page scraped!")

# Crawl the whole site
print("\nCrawling tcgcardswarehousejapanese.com for all pages...")
try:
    crawl_result = app.crawl_url("https://tcgcardswarehousejapanese.com/", params={
        "limit": 50,
        "scrapeOptions": {
            "formats": ["markdown", "html"],
            "onlyMainContent": True
        }
    })
    with open("/home/z/my-project/scraped-data/tcgwarehouse_crawl.json", "w") as f:
        json.dump(crawl_result, f, indent=2, default=str)
    print("Crawl completed!")
except Exception as e:
    print(f"Crawl error: {e}")

# Scrape key pages
key_urls = [
    "https://tcgcardswarehousejapanese.com/collections/all",
    "https://tcgcardswarehousejapanese.com/collections",
    "https://tcgcardswarehousejapanese.com/pages/about-us",
    "https://tcgcardswarehousejapanese.com/pages/shipping",
    "https://tcgcardswarehousejapanese.com/pages/contact",
]

for url in key_urls:
    try:
        print(f"Scraping: {url}")
        page_result = app.scrape_url(url, params={
            "formats": ["markdown", "html", "links"],
            "onlyMainContent": True
        })
        slug = url.rstrip("/").split("/")[-1].replace("-", "_")
        with open(f"/home/z/my-project/scraped-data/tcgwarehouse_{slug}.json", "w") as f:
            json.dump(page_result, f, indent=2, default=str)
        print(f"Scraped {url}")
    except Exception as e:
        print(f"Error scraping {url}: {e}")

print("Done with tcgcardswarehousejapanese.com!")
