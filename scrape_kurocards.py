#!/usr/bin/env python3
"""Scrape kurocardshop.com for additional content."""

import json
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-8cde4750199b4e8ab8f1d144f1feef99")

# Scrape the main site
print("Scraping kurocardshop.com...")
result = app.scrape_url("https://kurocardshop.com/", params={
    "formats": ["markdown", "html", "links"],
    "onlyMainContent": True
})

with open("/home/z/my-project/scraped-data/kurocards_main.json", "w") as f:
    json.dump(result, f, indent=2, default=str)

print("Main page scraped!")

# Crawl the whole site
print("\nCrawling kurocardshop.com for all pages...")
try:
    crawl_result = app.crawl_url("https://kurocardshop.com/", params={
        "limit": 50,
        "scrapeOptions": {
            "formats": ["markdown", "html"],
            "onlyMainContent": True
        }
    })
    with open("/home/z/my-project/scraped-data/kurocards_crawl.json", "w") as f:
        json.dump(crawl_result, f, indent=2, default=str)
    print("Crawl completed!")
except Exception as e:
    print(f"Crawl error: {e}")

# Scrape key pages
key_urls = [
    "https://kurocardshop.com/collections/all",
    "https://kurocardshop.com/collections",
    "https://kurocardshop.com/pages/about-us",
    "https://kurocardshop.com/pages/shipping",
    "https://kurocardshop.com/pages/contact",
    "https://kurocardshop.com/pages/faq",
]

for url in key_urls:
    try:
        print(f"Scraping: {url}")
        page_result = app.scrape_url(url, params={
            "formats": ["markdown", "html", "links"],
            "onlyMainContent": True
        })
        slug = url.rstrip("/").split("/")[-1].replace("-", "_")
        with open(f"/home/z/my-project/scraped-data/kurocards_{slug}.json", "w") as f:
            json.dump(page_result, f, indent=2, default=str)
        print(f"Scraped {url}")
    except Exception as e:
        print(f"Error scraping {url}: {e}")

print("Done with kurocardshop.com!")
