#!/usr/bin/env python3
"""Scrape unitedcardswarehousejapanese.com for About content and site structure."""

import json
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-8cde4750199b4e8ab8f1d144f1feef99")

# Scrape the main site
print("Scraping unitedcardswarehousejapanese.com...")
result = app.scrape_url("https://unitedcardswarehousejapanese.com/", params={
    "formats": ["markdown", "html", "links"],
    "onlyMainContent": True
})

with open("/home/z/my-project/scraped-data/unitedcards_main.json", "w") as f:
    json.dump(result, f, indent=2, default=str)

print("Main page scraped. Extracting links...")

# Try to find and scrape the About page
links = result.get("metadata", {}).get("links", []) or result.get("links", [])
about_links = [l for l in links if "about" in str(l).lower()]

print(f"Found {len(about_links)} about-related links: {about_links}")

# Scrape about page if found
about_content = None
for link in about_links[:3]:
    try:
        print(f"Scraping about page: {link}")
        about_result = app.scrape_url(link, params={
            "formats": ["markdown", "html"],
            "onlyMainContent": True
        })
        about_content = about_result
        break
    except Exception as e:
        print(f"Error scraping {link}: {e}")

if about_content:
    with open("/home/z/my-project/scraped-data/unitedcards_about.json", "w") as f:
        json.dump(about_content, f, indent=2, default=str)
    print("About page scraped successfully!")

# Also crawl the whole site for more pages
print("\nCrawling unitedcardswarehousejapanese.com for all pages...")
try:
    crawl_result = app.crawl_url("https://unitedcardswarehousejapanese.com/", params={
        "limit": 20,
        "scrapeOptions": {
            "formats": ["markdown"],
            "onlyMainContent": True
        }
    })
    with open("/home/z/my-project/scraped-data/unitedcards_crawl.json", "w") as f:
        json.dump(crawl_result, f, indent=2, default=str)
    print(f"Crawled {len(crawl_result.get('data', crawl_result) if isinstance(crawl_result, dict) else crawl_result)} pages")
except Exception as e:
    print(f"Crawl error: {e}")

print("Done with unitedcardswarehousejapanese.com!")
